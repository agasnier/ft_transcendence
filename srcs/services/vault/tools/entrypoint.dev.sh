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
			allowed_roles="auth_service" \
			username="vault" \
			password="${DB_ROOT_PASSWORD}" >/dev/null 2>&1; do
		sleep 1
	done

	# define config for auth_service rôle
	vault write database/roles/auth_service \
		db_name=mariadb \
		creation_statements="CREATE USER '{{name}}'@'%' IDENTIFIED BY '{{password}}'; GRANT ALL PRIVILEGES ON \`db_name\`.* TO '{{name}}'@'%';" \
		default_ttl="24h" \
		max_ttl="72h"
} &

exec docker-entrypoint.sh "$@"
