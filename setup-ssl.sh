#!/bin/bash

echo "Setting up SSL certificates for afmdelivery.lk..."

# Check if domain resolves to this server
echo "Checking DNS resolution..."
DOMAIN_IP=$(dig +short afmdelivery.lk)
SERVER_IP=$(curl -s ifconfig.me)

echo "Domain afmdelivery.lk resolves to: $DOMAIN_IP"
echo "This server's public IP: $SERVER_IP"

if [ "$DOMAIN_IP" != "$SERVER_IP" ]; then
    echo "WARNING: Domain does not resolve to this server!"
    echo "Please ensure your domain DNS A record points to $SERVER_IP"
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Create necessary directories
mkdir -p ./nginx
mkdir -p ./certbot/www
mkdir -p ./certbot/conf

echo "Created directories for nginx and certbot"

# Check if certificates already exist
if [ -d "./certbot/conf/live/afmdelivery.lk" ]; then
    echo "SSL certificates already exist. Skipping certificate generation."
    echo "Starting services with existing certificates..."
    docker-compose up -d
    exit 0
fi

# Create a temporary nginx config for initial certificate acquisition
cat > ./nginx/nginx-temp.conf << 'EOF'
events {
    worker_connections 1024;
}

http {
    server {
        listen 80 default_server;
        server_name _;

        location /.well-known/acme-challenge/ {
            root /var/www/certbot;
            try_files $uri =404;
        }

        location / {
            return 200 'Server is running - Ready for SSL setup';
            add_header Content-Type text/plain;
        }
    }
}
EOF

echo "Created temporary nginx configuration"

# Stop any existing containers
echo "Stopping existing containers..."
docker-compose down 2>/dev/null || true

# Start nginx with temporary config for certificate acquisition
echo "Starting nginx with temporary configuration..."
docker run --rm -d \
    --name nginx-temp \
    -p 80:80 \
    -v $(pwd)/nginx/nginx-temp.conf:/etc/nginx/nginx.conf:ro \
    -v $(pwd)/certbot/www:/var/www/certbot \
    nginx:latest

echo "Waiting for nginx to start..."
sleep 5

# Test if the challenge directory is accessible
echo "Testing nginx accessibility..."
curl -f http://localhost/.well-known/acme-challenge/ 2>/dev/null && echo "Nginx is accessible" || echo "Warning: Nginx may not be accessible"

# Get SSL certificates - First try with staging to test
echo "Testing with Let's Encrypt staging environment..."
docker run --rm \
    -v $(pwd)/certbot/www:/var/www/certbot:rw \
    -v $(pwd)/certbot/conf:/etc/letsencrypt:rw \
    certbot/certbot:latest \
    certonly --webroot --webroot-path=/var/www/certbot \
    --email groupathukorala@gmail.com \
    --agree-tos --no-eff-email \
    --staging \
    -d afmdelivery.lk \
    --verbose

if [ $? -eq 0 ]; then
    echo "Staging test successful! Now getting production certificates..."
    # Remove staging certificates
    docker run --rm \
        -v $(pwd)/certbot/conf:/etc/letsencrypt:rw \
        certbot/certbot:latest \
        delete --cert-name afmdelivery.lk --non-interactive
    
    # Get production certificates
    docker run --rm \
        -v $(pwd)/certbot/www:/var/www/certbot:rw \
        -v $(pwd)/certbot/conf:/etc/letsencrypt:rw \
        certbot/certbot:latest \
        certonly --webroot --webroot-path=/var/www/certbot \
        --email groupathukorala@gmail.com \
        --agree-tos --no-eff-email \
        -d afmdelivery.lk \
        --verbose
else
    echo "Certificate acquisition failed. Please check:"
    echo "1. Domain DNS is pointing to this server"
    echo "2. Port 80 is accessible from the internet"
    echo "3. No firewall is blocking HTTP traffic"
    echo ""
    echo "You can manually test with:"
    echo "curl http://afmdelivery.lk/.well-known/acme-challenge/"
fi

# Stop temporary nginx
echo "Stopping temporary nginx..."
docker stop nginx-temp 2>/dev/null || true

# Check if certificates were created
if [ -d "./certbot/conf/live/afmdelivery.lk" ]; then
    echo "SSL certificates obtained successfully!"
    echo "Starting all services with SSL..."
    docker-compose up -d
else
    echo "Certificate generation failed. Starting without SSL for troubleshooting..."
    # Create a basic nginx config without SSL
    cat > ./nginx/nginx-basic.conf << 'EOF'
events {
    worker_connections 1024;
}

http {
    upstream backend {
        server backend:3000;
    }

    server {
        listen 80;
        server_name afmdelivery.lk www.afmdelivery.lk;

        location /.well-known/acme-challenge/ {
            root /var/www/certbot;
        }

        location / {
            proxy_pass http://backend/;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
EOF
    
    # Temporarily use basic config
    cp ./nginx/nginx-basic.conf ./nginx/nginx.conf
    docker-compose up -d
    cp ./nginx/nginx-basic.conf ./nginx/nginx.conf # Restore original
fi

echo "Setup complete!"
if [ -d "./certbot/conf/live/afmdelivery.lk" ]; then
    echo "Your site should now be available at:"
    echo "- http://afmdelivery.lk (redirects to HTTPS)"
    echo "- https://afmdelivery.lk (with SSL certificate)"
else
    echo "Your site is available at:"
    echo "- http://afmdelivery.lk (HTTP only - SSL setup failed)"
    echo ""
    echo "To retry SSL setup after fixing DNS/firewall issues, run this script again."
fi
echo ""
echo "To renew certificates, run:"
echo "docker-compose exec certbot-sp certbot renew"