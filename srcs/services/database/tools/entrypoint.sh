#!/bin/bash
set -e

DB_ROOT_PASSWORD=$(cat /run/secrets/db_root_password 2>/dev/null) || true
DB_VAULT_PASSWORD=$(cat /run/secrets/db_vault_password 2>/dev/null) || true

# verify if all required variables are defined
if [ -z "$DB_ROOT_PASSWORD" ] || [ -z "$DB_VAULT_PASSWORD" ]; then
	echo "Error: missing required configuration for mariadb"
	exit 1
fi

{
	# Waiting for mariadb root user 
	until mariadb -uroot -p"$DB_ROOT_PASSWORD" -e 'SELECT 1' >/dev/null 2>&1; do
		sleep 1
	done

	# create a Vault user with all privileges
	mariadb -uroot -p"$DB_ROOT_PASSWORD" <<SQL
CREATE USER IF NOT EXISTS 'vault'@'%' IDENTIFIED BY '${DB_VAULT_PASSWORD}';
ALTER USER 'vault'@'%' IDENTIFIED BY '${DB_VAULT_PASSWORD}';
GRANT CREATE USER, PROCESS, REPLICATION CLIENT, SELECT ON *.* TO 'vault'@'%' WITH GRANT OPTION;
GRANT ALL PRIVILEGES ON \`${MARIADB_DATABASE}\`.* TO 'vault'@'%' WITH GRANT OPTION;
FLUSH PRIVILEGES;
SQL
} & 
# '{' and '} &' make that script running in background 

exec docker-entrypoint.sh "$@"
