#!/bin/bash
set -e

# LIST
# curl -sk https://127.0.0.1:8443/api/users

# GET
# curl -sk https://127.0.0.1:8443/api/users/**id**

# CREATE
# curl -sk -X POST https://127.0.0.1:8443/api/users \
#   -H "Content-Type: application/json" \
#   -d '{"pseudo": "pseudo", "password": "password123"}'

# UPDATE
# curl -sk -X PUT https://127.0.0.1:8443/api/users/**id** \
#   -H "Content-Type: application/json" \
#   -d '{"pseudo": "pseudo"}'

# DELETE
# curl -sk -X DELETE https://127.0.0.1:8443/api/users/**id**

list_users() {
  curl -sk https://127.0.0.1:8443/api/users
}

seed_users() {
  for ((i = 1; i <= 5; i++)); do
    curl -sk -X POST https://127.0.0.1:8443/api/users \
      -H "Content-Type: application/json" \
      -d "{\"pseudo\": \"pseudo_$i\", \"password\": \"password123\"}"
  done
}

del_users() {
  list_users
  echo -e "\n\nQuels ids ? "
  read -p "séparé par espaces : " ids
  for id in $ids; do
    curl -sk -X DELETE https://127.0.0.1:8443/api/users/$id
  done
}

list_api_keys() {
  curl -sk https://127.0.0.1:8443/api/api_keys
}

seed_api_keys() {
  for ((i = 1; i <= 5; i++)); do
    curl -sk -X POST https://127.0.0.1:8443/api/api_keys \
      -H "Content-Type: application/json" \
      -d "{\"owner_id\": $i}"
  done
}

del_api_keys() {
  list_users
  echo -e "\n\nQuels ids ? "
  read -p "séparé par espaces : " ids
  for id in $ids; do
    curl -sk -X DELETE https://127.0.0.1:8443/api/api_keys/$id
  done
}

echo -e "\n"
PS3=$'\nQuelle database : '
select database in "users" "api_keys"; do
  if [ "$database" = "users" ]; then
    break
  elif [ "$database" = "api_keys" ]; then
    break
  else
    exit 0
  fi
done

echo -e "\n"
PS3=$'\nQuelle action : '
select action in "list" "seed" "del"; do
  if [ "$action" = "list" ]; then
    break
  elif [ "$action" = "seed" ]; then
    break
  elif [ "$action" = "del" ]; then
    break
  else
    exit 0
  fi
done

echo -e "\n"
if [ "$database" = "users" ]; then
  if [ "$action" = "list" ]; then
    list_users
  elif [ "$action" = "seed" ]; then
    seed_users
  elif [ "$action" = "del" ]; then
    del_users
  fi

elif [ "$database" = "api_keys" ]; then
  if [ "$action" = "list" ]; then
    list_api_keys
  elif [ "$action" = "seed" ]; then
    seed_api_keys
  elif [ "$action" = "del" ]; then
    del_api_keys
  fi
fi
echo -e "\n"
