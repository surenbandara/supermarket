#!/bin/bash

echo "Renewing SSL certificates..."

# Renew certificates
docker run --rm \
    -v $(pwd)/certbot/www:/var/www/certbot:rw \
    -v $(pwd)/certbot/conf:/etc/letsencrypt:rw \
    certbot/certbot:latest \
    renew --webroot --webroot-path=/var/www/certbot

# Reload nginx to use new certificates
echo "Reloading nginx..."
docker-compose exec nginx nginx -s reload

echo "Certificate renewal complete!"