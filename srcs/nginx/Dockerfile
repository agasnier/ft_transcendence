FROM 	nginx:alpine

# openssl for the certificate
RUN		apk add --no-cache openssl

# generate self signed certificate
RUN		mkdir -p /etc/nginx/certs && \
		openssl req -x509 -nodes -days 365 \
		-newkey rsa:2048 \
		-keyout /etc/nginx/certs/server.key \
		-out /etc/nginx/certs/server.crt \
		-subj "/C=FR/ST=Nouvelle-Aquitaine/L=Angouleme/O=42/CN=localhost"

COPY	nginx.conf /etc/nginx/nginx.conf