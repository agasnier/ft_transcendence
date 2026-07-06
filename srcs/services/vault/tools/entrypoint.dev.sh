#!/bin/sh
set -e

export VAULT_ADDR=http://127.0.0.1:8200
export VAULT_TOKEN="${VAULT_DEV_ROOT_TOKEN_ID}"
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
	until vault status >/dev/null 2>&1; do
		sleep 1
	done


	# enable secrets database for dynamic credentials
	vault secrets enable database

	# Configure the connexions for roles
	until vault write database/config/mariadb \
			plugin_name=mysql-database-plugin \
			connection_url="{{username}}:{{password}}@tcp(database:3306)/" \
			allowed_roles="*" \
			username="vault" \
			password="${DB_ROOT_PASSWORD}" >/dev/null 2>&1; do
		sleep 1
	done

	# enable AppRole so each service's agent can authenticate to vault
	vault auth enable approle

	# apply every service's db role / policy / approle role
	for dir in /vault/policies/*/; do
		service=$(basename "$dir")
		vault write database/roles/"$service" @"${dir}db-role.json"
		vault policy write "${service}-policy" "${dir}policy.json"
		vault write auth/approle/role/"$service" @"${dir}approle-role.json"

		# bootstrap creds for this service's agent: role_id is stable, secret_id is generated here
		mkdir -p /vault/approle/"$service"
		vault read -field=role_id auth/approle/role/"$service"/role-id > /vault/approle/"$service"/role_id
		vault write -f -field=secret_id auth/approle/role/"$service"/secret-id > /vault/approle/"$service"/secret_id
		chmod 640 /vault/approle/"$service"/role_id /vault/approle/"$service"/secret_id
	done

	# creating sentinel file for docker healthcheck
	touch /vault/approle/.ready
} &

exec docker-entrypoint.sh "$@"
