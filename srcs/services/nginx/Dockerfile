FROM 	nginx:alpine

# install openssl for generate self signed certificate and delete it
RUN		apk add --no-cache openssl && \
		mkdir -p /etc/nginx/certs && \
		openssl req -x509 -nodes -days 365 \
		-newkey rsa:2048 \
		-keyout /etc/nginx/certs/server.key \
		-out /etc/nginx/certs/server.crt \
		-subj "/C=FR/ST=Nouvelle-Aquitaine/L=Angouleme/O=42/CN=localhost" && \
		apk del openssl

COPY	nginx.conf /etc/nginx/nginx.conf
