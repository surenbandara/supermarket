#!/bin/bash

echo "Manual SSL Certificate Setup for afmdelivery.lk"
echo "==============================================="

# First, let's check the current DNS setup
echo "1. Checking DNS resolution..."
dig +short afmdelivery.lk
dig +short www.afmdelivery.lk

echo ""
echo "2. Checking current server public IP..."
curl -s ifconfig.me
echo ""

echo "3. Make sure your domain DNS A record points to the IP above"
echo "4. Make sure ports 80 and 443 are open in your firewall"
echo ""

# Create directories
mkdir -p ./nginx
mkdir -p ./certbot/www
mkdir -p ./certbot/conf

# Start with HTTP-only setup first
cat > ./nginx/nginx-http-only.conf << 'EOF'
events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    upstream backend {
        server backend:3000;
    }

    server {
        listen 80;
        server_name afmdelivery.lk www.afmdelivery.lk;

        # Let's Encrypt verification
        location /.well-known/acme-challenge/ {
            root /var/www/certbot;
            try_files $uri =404;
        }

        # Proxy to backend
        location / {
            proxy_pass http://backend/;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
        }
    }
}
EOF

echo "5. Starting services with HTTP-only configuration..."
cp ./nginx/nginx-http-only.conf ./nginx/nginx.conf
docker-compose up -d

echo ""
echo "6. Waiting for services to start..."
sleep 10

echo "7. Testing HTTP access..."
curl -I http://localhost/ 2>/dev/null | head -1

echo ""
echo "8. Now let's try to get SSL certificates..."
echo "   If this fails, check the error messages carefully"

# Try to get certificates
docker run --rm \
    -v $(pwd)/certbot/www:/var/www/certbot:rw \
    -v $(pwd)/certbot/conf:/etc/letsencrypt:rw \
    certbot/certbot:latest \
    certonly --webroot --webroot-path=/var/www/certbot \
    --email groupathukorala@gmail.com \
    --agree-tos --no-eff-email \
    -d afmdelivery.lk \
    --verbose \
    --dry-run

if [ $? -eq 0 ]; then
    echo ""
    echo "Dry run successful! Getting real certificates..."
    docker run --rm \
        -v $(pwd)/certbot/www:/var/www/certbot:rw \
        -v $(pwd)/certbot/conf:/etc/letsencrypt:rw \
        certbot/certbot:latest \
        certonly --webroot --webroot-path=/var/www/certbot \
        --email groupathukorala@gmail.com \
        --agree-tos --no-eff-email \
        -d afmdelivery.lk \
        --verbose

    if [ $? -eq 0 ]; then
        echo "Certificates obtained! Updating nginx configuration..."
        # Copy the SSL-enabled nginx config
        # You should copy the nginx.conf from the artifacts above
        docker-compose restart nginx
        echo "SSL setup complete!"
    else
        echo "Real certificate acquisition failed."
    fi
else
    echo ""
    echo "Certificate dry run failed. Common issues:"
    echo "- Domain doesn't resolve to this server"
    echo "- Port 80 is not accessible from internet"
    echo "- Firewall blocking connections"
    echo "- DNS propagation not complete"
    echo ""
    echo "To debug:"
    echo "1. Test from outside: curl http://afmdelivery.lk/.well-known/acme-challenge/"
    echo "2. Check firewall: sudo ufw status"
    echo "3. Check nginx logs: docker-compose logs nginx"
fi

echo ""
echo "Current status:"
echo "- HTTP site: http://afmdelivery.lk"
if [ -d "./certbot/conf/live/afmdelivery.lk" ]; then
    echo "- HTTPS site: https://afmdelivery.lk"
else
    echo "- HTTPS: Not configured (certificate acquisition failed)"
fi