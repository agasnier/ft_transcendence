COMPOSE     = @docker compose -f srcs/docker-compose.yml
COMPOSE_DEV = $(COMPOSE) -f srcs/docker-compose.dev.yml

DB_DATA       = srcs/data/mariadb
DB_DATA_DEV   = srcs/data/mariadb-dev
VAULT_DATA    = srcs/data/vault
VAULT_DATA_DEV = srcs/data/vault-dev
PROM_DATA     = srcs/data/promotheus
PROM_DATA_DEV = srcs/data/promotheus-dev
GRAFANA_DATA  = srcs/data/grafana
GRAFANA_DATA_DEV = srcs/data/grafana-dev

all: help

help:
	@echo ""
	@echo "Production:"
	@echo "  up        Build and start the app in the background"
	@echo "  down      Stop the app"
	@echo "  logs      Follow the app logs"
	@echo ""
	@echo "Development (override):"
	@echo "  dev       Build and start with dev override"
	@echo "  dev-down  Stop the dev environment"
	@echo ""
	@echo "Cleaning:"
	@echo "  clean     Stop and remove volumes except ./data"
	@echo "  fclean    clean + remove built images and DB data"
	@echo "  re        fclean then start production"
	@echo ""

up:
	mkdir -p $(DB_DATA) $(VAULT_DATA) $(PROM_DATA) $(GRAFANA_DATA)
	$(COMPOSE) up --build -d

down:
	$(COMPOSE) down

logs:
	$(COMPOSE) logs -f

ps:
	$(COMPOSE) ps

dev:
	mkdir -p $(DB_DATA_DEV) $(VAULT_DATA_DEV) $(PROM_DATA_DEV) $(GRAFANA_DATA_DEV)
	$(COMPOSE_DEV) up --build

dev-down:
	$(COMPOSE_DEV) down

clean:
	$(COMPOSE) down --volumes

fclean: clean
	$(COMPOSE) down --rmi all
	@echo "Delete the persistant data ? : (y/n)"
	@read ans; if [ "$$ans" = "y" ]; then \
        sudo rm -rf $(DB_DATA) $(DB_DATA_DEV) $(VAULT_DATA) $(VAULT_DATA_DEV) $(PROM_DATA) $(PROM_DATA_DEV) $(GRAFANA_DATA) $(GRAFANA_DATA_DEV); \
		echo "Deleted."; \
    else \
        echo "Persistant data not deleted."; \
    fi

re: fclean up

.PHONY: all help up down logs ps dev dev-down clean fclean re
