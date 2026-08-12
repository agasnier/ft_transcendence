vault {
  address = "http://vault:8200"
}

auto_auth {
  method "approle" {
    mount_path = "auth/approle"
    config = {
      role_id_file_path   = "/vault/approle/mysqld_exporter/role_id"
      secret_id_file_path = "/vault/approle/mysqld_exporter/secret_id"
      remove_secret_id_file_after_reading = false
    }
  }

  sink "file" {
    config = {
      path = "/vault/.vault-token"
    }
  }
}

api_proxy {
  use_auto_auth_token = true
}

listener "tcp" {
  address     = "0.0.0.0:8100"
  tls_disable = true
}

template {
  destination = "/vault/secrets/.my.cnf"
  perms       = "0644"
  contents = <<EOT
{{ with secret "database/creds/mysqld_exporter" }}
[client]
user={{ .Data.username }}
password={{ .Data.password }}
host=database
{{ end }}
EOT
}
