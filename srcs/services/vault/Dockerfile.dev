
FROM    hashicorp/vault:2.0

USER    root

RUN     apk add --no-cache jq gettext openssl

COPY    config/vault.hcl        /vault/config/vault.hcl

COPY    tools/entrypoint.sh     /tools/entrypoint.sh
RUN     chmod +x /tools/entrypoint.sh

COPY    policies/               /vault/policies/

USER    vault

EXPOSE  8200

ENTRYPOINT ["/tools/entrypoint.sh"]
CMD        ["server"]
