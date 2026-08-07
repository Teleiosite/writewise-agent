#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# WriteWise Oracle Cloud Deployment Script
# Run this ONCE on a fresh Ubuntu 22.04 Oracle A1 instance.
#
# Usage:
#   chmod +x deploy.sh
#   ./deploy.sh
# ─────────────────────────────────────────────────────────────────────────────
set -e

REPO_URL="https://github.com/Teleiosite/writewise-agent.git"
APP_DIR="/opt/writewise"
DOMAIN=""          # Set this to your domain e.g. "writewise.app" for HTTPS

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo " WriteWise — Oracle Cloud Deployment"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# ── 1. System dependencies ────────────────────────────────────────────────────
echo "[1/7] Installing system packages..."
sudo apt-get update -qq
sudo apt-get install -y -qq \
    git curl docker.io docker-compose-plugin \
    certbot python3-certbot-nginx \
    ufw netfilter-persistent iptables-persistent

sudo systemctl enable docker
sudo systemctl start docker
sudo usermod -aG docker "$USER"

# ── 2. Oracle firewall (iptables + UFW) ───────────────────────────────────────
echo "[2/7] Configuring firewall..."
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw --force enable

# Oracle Cloud also blocks at VCN level — add iptables rules for the OS layer
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 80  -j ACCEPT
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 443 -j ACCEPT
sudo netfilter-persistent save

# ── 3. Clone / update repo ────────────────────────────────────────────────────
echo "[3/7] Cloning repository..."
if [ -d "$APP_DIR/.git" ]; then
    echo "  → Repo already exists, pulling latest..."
    git -C "$APP_DIR" pull origin main
else
    sudo git clone "$REPO_URL" "$APP_DIR"
    sudo chown -R "$USER:$USER" "$APP_DIR"
fi

cd "$APP_DIR"

# ── 4. Environment variables ──────────────────────────────────────────────────
echo "[4/7] Setting up environment..."
if [ ! -f "$APP_DIR/.env" ]; then
    cp "$APP_DIR/.env.example" "$APP_DIR/.env"
    echo ""
    echo "  ⚠️  IMPORTANT: Edit $APP_DIR/.env now and add your credentials:"
    echo "     VITE_SUPABASE_URL=https://your-project.supabase.co"
    echo "     VITE_SUPABASE_ANON_KEY=your-anon-key"
    echo ""
    read -rp "  Press ENTER after filling in .env to continue..."
fi

# ── 5. Build and start services ───────────────────────────────────────────────
echo "[5/7] Building Docker images (first build takes 3-5 mins)..."
docker compose build --no-cache

echo "[5/7] Starting services..."
docker compose up -d

# ── 6. Health check ───────────────────────────────────────────────────────────
echo "[6/7] Waiting for services to become healthy..."
sleep 15

API_HEALTH=$(curl -s http://localhost/health || echo "UNREACHABLE")
STATS_HEALTH=$(curl -s http://localhost/stats/health || echo "UNREACHABLE")

echo "  Node API:    $API_HEALTH"
echo "  Python Stats: $STATS_HEALTH"

# ── 7. SSL (optional) ─────────────────────────────────────────────────────────
if [ -n "$DOMAIN" ]; then
    echo "[7/7] Requesting Let's Encrypt certificate for $DOMAIN..."
    docker compose run --rm certbot certonly \
        --webroot -w /var/www/certbot \
        -d "$DOMAIN" \
        --non-interactive --agree-tos \
        -m "admin@$DOMAIN"
    echo "  ✓ Certificate issued. Update nginx.conf to add HTTPS server block."
else
    echo "[7/7] Skipping SSL (DOMAIN not set). Site is live on HTTP."
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo " ✓ WriteWise is running!"
echo ""
echo "  Site:        http://$(curl -s ifconfig.me)"
echo "  API Health:  http://$(curl -s ifconfig.me)/health"
echo "  Stats Health:http://$(curl -s ifconfig.me)/stats/health"
echo ""
echo " To update in future:"
echo "   cd $APP_DIR && git pull && docker compose up -d --build"
echo ""
echo " To view logs:"
echo "   docker compose logs -f"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
