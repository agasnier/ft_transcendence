COMPOSE     = docker compose -f srcs/docker-compose.yml
COMPOSE_DEV = $(COMPOSE) -f srcs/docker-compose.dev.yml

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
	@echo "  clean     Stop and remove volumes"
	@echo "  fclean    clean + prune Docker images and cache"
	@echo "  re        fclean then start production"
	@echo ""

up:
	mkdir -p srcs/data/mariadb
	$(COMPOSE) up --build -d

down:
	$(COMPOSE) down

logs:
	$(COMPOSE) logs -f

dev:
	mkdir -p srcs/data/mariadb-dev
	$(COMPOSE_DEV) up --build

dev-down:
	$(COMPOSE_DEV) down

clean:
	$(COMPOSE) down --volumes

fclean: clean
	docker system prune -af

re: fclean up

.PHONY: all help up down logs dev dev-down clean fclean re
