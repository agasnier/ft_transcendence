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


	# enable transit
	vault secrets enable transit 2>/dev/null || true
	vault write -f transit/keys/api-keys 2>/dev/null || true
	vault write -f transit/keys/passwords 2>/dev/null || true
	vault write -f transit/keys/jwt type=ecdsa-p256 2>/dev/null || true

	# enable transit
	vault secrets enable transit 2>/dev/null || true
	vault write -f transit/keys/api-keys 2>/dev/null || true
	vault write -f transit/keys/passwords 2>/dev/null || true
	vault write -f transit/keys/jwt type=ecdsa-p256 2>/dev/null || true

	# enable secrets database for dynamic credentials
	vault secrets enable database

	# enable AppRole so each service's agent can authenticate to vault
	vault auth enable approle

	# Configure the connexions for vault
	until vault write database/config/mariadb \
			plugin_name=mysql-database-plugin \
			connection_url="{{username}}:{{password}}@tcp(database:3306)/" \
			allowed_roles="*" \
			username="vault" \
			password="${DB_ROOT_PASSWORD}" >/dev/null 2>&1; do
		sleep 1
	done


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
