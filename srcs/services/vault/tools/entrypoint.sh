#!/bin/sh
set -e

export VAULT_ADDR=http://127.0.0.1:8200
DB_ROOT_PASSWORD=$(cat /run/secrets/db_root_password) || true

# verify if all required variables are defined
if [ -z "$DB_ROOT_PASSWORD" ]; then
	echo "Error: missing required configuration for mariadb"
	exit 1
fi

{
	# delete the sentinel for docker healthcheck
	rm -f /vault/approle/.ready

	# Wait thaht api from vault server respond
	until vault status >/dev/null 2>&1 || [ $? -eq 2 ]; do
		sleep 1
	done

	# First boot save unseal key + root token.
	INIT_FILE=/vault/file/init.json
	if ! vault status -format=json | grep -q '"initialized": *true'; then
		vault operator init -key-shares=1 -key-threshold=1 -format=json > "$INIT_FILE"
		chmod 600 "$INIT_FILE"
	fi

	# every boot, unseal file with keys from INIT_FILE
	if vault status -format=json | grep -q '"sealed": *true'; then
		vault operator unseal "$(jq -r '.unseal_keys_b64[0]' "$INIT_FILE")" >/dev/null
	fi

	# root with root_token from INIT FILE
	export VAULT_TOKEN="$(jq -r '.root_token' "$INIT_FILE")"

	# enable database and approle if it's not already 
	if ! vault secrets list | grep -q '^database/'; then
		vault secrets enable database
	fi
	if ! vault auth list | grep -q '^approle/'; then
		vault auth enable approle
	fi

	# if not already done, configure connexion with db and rotate the password
	if ! vault read database/config/mariadb >/dev/null 2>&1; then
		until vault write database/config/mariadb \
				plugin_name=mysql-database-plugin \
				connection_url="{{username}}:{{password}}@tcp(database:3306)/" \
				allowed_roles="*" \
				username="vault" \
				password="${DB_ROOT_PASSWORD}" >/dev/null 2>&1; do
			sleep 1
		done

		# rotate the vault DB now on only Vault knows it
		vault write -f database/rotate-root/mariadb
	fi

	# apply every service's db role / policy / approle role
	for dir in /vault/policies/*/; do
		service=$(basename "$dir")
		envsubst '${MARIADB_DATABASE}' < "${dir}db-role.json" > /tmp/db-role.json
		vault write database/roles/"$service" @/tmp/db-role.json
		vault policy write "${service}-policy" "${dir}policy.json"
		vault write auth/approle/role/"$service" @"${dir}approle-role.json"

		# create appRole credentials for each service 
		mkdir -p /vault/approle/"$service"
		vault read -field=role_id auth/approle/role/"$service"/role-id > /vault/approle/"$service"/role_id
		vault write -f -field=secret_id auth/approle/role/"$service"/secret-id > /vault/approle/"$service"/secret_id
		chmod 640 /vault/approle/"$service"/role_id /vault/approle/"$service"/secret_id
	done

	# creating sentinel file for docker healthcheck
	touch /vault/approle/.ready
} &

exec docker-entrypoint.sh "$@"
