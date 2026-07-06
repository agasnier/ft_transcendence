FROM	mariadb:11.4

COPY    tools/entrypoint.sh /tools/entrypoint.sh
RUN     chmod +x /tools/entrypoint.sh

EXPOSE  3306

ENTRYPOINT ["/tools/entrypoint.sh"]
CMD        ["mariadbd"]
