vault {
  address = "http://vault:8200"
}

auto_auth {
  method "approle" {
    mount_path = "auth/approle"
    config = {
      role_id_file_path   = "/vault/approle/auth_service/role_id"
      secret_id_file_path = "/vault/approle/auth_service/secret_id"
      remove_secret_id_file_after_reading = true
    }
  }

  sink "file" {
    config = {
      path = "/vault/.vault-token"
    }
  }
}

template {
  destination = "/vault/secrets/db_creds.json"
  perms       = "0644"
  contents = <<EOT
{{ with secret "database/creds/auth_service" }}
{
  "username": "{{ .Data.username }}",
  "password": "{{ .Data.password }}"
}
{{ end }}
EOT
}
