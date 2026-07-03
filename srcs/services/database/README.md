# Database

## Persistent data

Database data is persisted on the host via a bind mount to `srcs/data` (`db_data` volume in `docker-compose.yml`). This keeps the data across `docker compose down`/`up` cycles, independent of the container's lifecycle.

## Creating tables via ORM

This service only runs a plain MariaDB image. There is nothing to code here: table creation, migrations, and queries are handled by ORMs directly in the backend services, not in this folder.

An ORM (Object-Relational Mapper) is a library that lets code interact with the database through objects and method calls instead of raw SQL. We use `Drizzle` in each backend service. It generates the SQL for you, maps rows to typed objects, and usually provides a migration system to version the schema over time.
