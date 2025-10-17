#!/bin/bash

# Script di installazione automatica per server remoto
# Sistema Rapporti Consegne con integrazione WhatsApp

set -e

echo "🚀 Inizio installazione Sistema Rapporti Consegne con WhatsApp..."

# Colori per output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funzione per stampare messaggi colorati
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verifica se è root
if [[ $EUID -eq 0 ]]; then
   print_error "Non eseguire questo script come root. Usa un utente normale con sudo."
   exit 1
fi

# Verifica sistema operativo
if [[ ! -f /etc/os-release ]]; then
    print_error "Sistema operativo non supportato"
    exit 1
fi

source /etc/os-release
print_status "Sistema operativo rilevato: $NAME $VERSION"

# Aggiorna il sistema
print_status "Aggiornamento del sistema..."
sudo apt update && sudo apt upgrade -y

# Installa dipendenze di sistema
print_status "Installazione dipendenze di sistema..."
sudo apt install -y \
    nodejs \
    npm \
    git \
    curl \
    wget \
    unzip \
    xvfb \
    libnss3-dev \
    libatk-bridge2.0-dev \
    libdrm2 \
    libxkbcommon0 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    libgbm1 \
    libxss1 \
    libasound2 \
    libatspi2.0-0 \
    libgtk-3-0 \
    libgdk-pixbuf2.0-0 \
    chromium-browser \
    nginx \
    certbot \
    python3-certbot-nginx \
    htop \
    fail2ban

print_success "Dipendenze di sistema installate"

# Installa PM2 globalmente
print_status "Installazione PM2..."
sudo npm install -g pm2

# Crea directory per l'applicazione
print_status "Creazione directory applicazione..."
sudo mkdir -p /opt/rapport-consegne
sudo chown -R $USER:$USER /opt/rapport-consegne

# Crea directory per sessioni WhatsApp
print_status "Creazione directory sessioni WhatsApp..."
sudo mkdir -p /opt/whatsapp-sessions
sudo chown -R $USER:$USER /opt/whatsapp-sessions

# Crea directory per logs
print_status "Creazione directory logs..."
sudo mkdir -p /var/log/rapport-consegne
sudo chown -R $USER:$USER /var/log/rapport-consegne

# Chiedi URL del repository
echo ""
print_warning "Inserisci l'URL del repository Git:"
read -p "Repository URL: " REPO_URL

if [[ -z "$REPO_URL" ]]; then
    print_error "URL del repository richiesto"
    exit 1
fi

# Clona il repository
print_status "Clonazione repository..."
cd /opt
git clone $REPO_URL rapport-consegne
cd rapport-consegne

# Installa dipendenze Node.js
print_status "Installazione dipendenze Node.js..."
npm install

print_success "Dipendenze Node.js installate"

# Configura variabili ambiente
print_status "Configurazione variabili ambiente..."
cat > .env.local << EOF
# Configurazione Supabase
NEXT_PUBLIC_SUPABASE_URL=https://yydvltllcqfsrrnfypnf.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl5ZHZsdGxsY3Fmc3JybmZ5cG5mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1NDE5NzQsImV4cCI6MjA3NjExNzk3NH0.z096iysKd0hMcnpK6oyv4FVsNKtaZs8wrm-G1fl0wi4

# Configurazione WhatsApp
WHATSAPP_SESSION_PATH=/opt/whatsapp-sessions
WHATSAPP_HEADLESS=true
WHATSAPP_TIMEOUT=30000
WHATSAPP_MAX_SESSIONS=5

# Configurazione Puppeteer
PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
PUPPETEER_ARGS=--no-sandbox,--disable-setuid-sandbox,--disable-dev-shm-usage,--disable-accelerated-2d-canvas,--no-first-run,--no-zygote,--single-process,--disable-gpu

# Configurazione Ambiente
NODE_ENV=production
PORT=3000

# Configurazione Sicurezza
NEXTAUTH_SECRET=$(openssl rand -base64 32)
NEXTAUTH_URL=https://consegne.tecnotablet.it

# Configurazione Logs
LOG_LEVEL=info
LOG_FILE=/var/log/rapport-consegne/app.log
EOF

print_success "Variabili ambiente configurate"

# Build dell'applicazione
print_status "Build dell'applicazione..."
npm run build

print_success "Build completata"

# Configura Nginx
print_status "Configurazione Nginx..."
sudo tee /etc/nginx/sites-available/rapport-consegne << EOF
server {
    listen 80;
    server_name consegne.tecnotablet.it;

    # Aumenta i limiti per le richieste WhatsApp
    client_max_body_size 10M;
    proxy_read_timeout 300s;
    proxy_connect_timeout 75s;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        
        # Timeout specifici per WhatsApp
        proxy_send_timeout 300s;
        proxy_read_timeout 300s;
    }

    # Endpoint specifici per WhatsApp con timeout estesi
    location /api/whatsapp/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        
        # Timeout estesi per operazioni WhatsApp
        proxy_send_timeout 300s;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }
}
EOF

# Abilita il sito
sudo ln -sf /etc/nginx/sites-available/rapport-consegne /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx

print_success "Nginx configurato"

# Configura PM2
print_status "Configurazione PM2..."
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'rapport-consegne',
    script: 'npm',
    args: 'start',
    cwd: '/opt/rapport-consegne',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    // Configurazione specifica per WhatsApp
    kill_timeout: 10000,
    wait_ready: true,
    listen_timeout: 10000,
    // Gestione errori WhatsApp
    error_file: '/var/log/rapport-consegne/error.log',
    out_file: '/var/log/rapport-consegne/out.log',
    log_file: '/var/log/rapport-consegne/app.log',
    time: true
  }]
};
EOF

# Avvia l'applicazione con PM2
pm2 start ecosystem.config.js --env production
pm2 save

# Configura PM2 per avviarsi al boot
pm2 startup
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u $USER --hp $HOME

print_success "PM2 configurato e applicazione avviata"

# Configura firewall
print_status "Configurazione firewall..."
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw --force enable

print_success "Firewall configurato"

# Configura fail2ban
print_status "Configurazione fail2ban..."
sudo tee /etc/fail2ban/jail.local << EOF
[nginx-http-auth]
enabled = true

[nginx-limit-req]
enabled = true
EOF

sudo systemctl restart fail2ban

print_success "Fail2ban configurato"

# Chiedi se configurare SSL
echo ""
print_warning "Vuoi configurare SSL con Let's Encrypt? (y/n)"
read -p "Configura SSL: " CONFIGURE_SSL

if [[ "$CONFIGURE_SSL" == "y" || "$CONFIGURE_SSL" == "Y" ]]; then
    print_status "Configurazione SSL..."
    sudo certbot --nginx -d consegne.tecnotablet.it --non-interactive --agree-tos --email admin@tecnotablet.it
    
    if [[ $? -eq 0 ]]; then
        print_success "SSL configurato con successo"
    else
        print_warning "Errore nella configurazione SSL. Configura manualmente con: sudo certbot --nginx -d consegne.tecnotablet.it"
    fi
fi

# Crea script di manutenzione
print_status "Creazione script di manutenzione..."
cat > /opt/rapport-consegne/maintenance.sh << 'EOF'
#!/bin/bash

# Script di manutenzione per Sistema Rapporti Consegne

case "$1" in
    restart)
        echo "Riavvio applicazione..."
        pm2 restart rapport-consegne
        ;;
    update)
        echo "Aggiornamento applicazione..."
        cd /opt/rapport-consegne
        git pull
        npm install
        npm run build
        pm2 restart rapport-consegne
        echo "Aggiornamento completato"
        ;;
    logs)
        echo "Visualizzazione logs..."
        pm2 logs rapport-consegne --lines 100
        ;;
    status)
        echo "Stato applicazione..."
        pm2 status
        ;;
    backup)
        echo "Backup sessioni WhatsApp..."
        sudo tar -czf whatsapp-sessions-backup-$(date +%Y%m%d).tar.gz /opt/whatsapp-sessions/
        echo "Backup completato: whatsapp-sessions-backup-$(date +%Y%m%d).tar.gz"
        ;;
    *)
        echo "Uso: $0 {restart|update|logs|status|backup}"
        exit 1
        ;;
esac
EOF

chmod +x /opt/rapport-consegne/maintenance.sh

print_success "Script di manutenzione creato"

# Verifica installazione
print_status "Verifica installazione..."
sleep 5

if pm2 list | grep -q "rapport-consegne.*online"; then
    print_success "Applicazione avviata correttamente"
else
    print_error "Errore nell'avvio dell'applicazione"
    pm2 logs rapport-consegne --lines 20
fi

# Mostra informazioni finali
echo ""
echo "=========================================="
print_success "INSTALLAZIONE COMPLETATA!"
echo "=========================================="
echo ""
echo "🌐 URL Applicazione: https://consegne.tecnotablet.it"
echo "📱 Configurazione WhatsApp: https://consegne.tecnotablet.it/admin"
echo ""
echo "📋 Comandi utili:"
echo "  - Stato applicazione: pm2 status"
echo "  - Logs applicazione: pm2 logs rapport-consegne"
echo "  - Riavvia applicazione: pm2 restart rapport-consegne"
echo "  - Script manutenzione: /opt/rapport-consegne/maintenance.sh"
echo ""
echo "🔧 Manutenzione:"
echo "  - Aggiorna: /opt/rapport-consegne/maintenance.sh update"
echo "  - Backup: /opt/rapport-consegne/maintenance.sh backup"
echo "  - Logs: /opt/rapport-consegne/maintenance.sh logs"
echo ""
echo "📁 Directory importanti:"
echo "  - Applicazione: /opt/rapport-consegne"
echo "  - Sessioni WhatsApp: /opt/whatsapp-sessions"
echo "  - Logs: /var/log/rapport-consegne"
echo ""
print_warning "IMPORTANTE: Configura il DNS per puntare consegne.tecnotablet.it al tuo server!"
echo ""
print_success "Installazione completata con successo! 🎉"
