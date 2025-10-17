# Guida Installazione WhatsApp su Server Remoto

Questa guida spiega come installare e configurare il sistema con integrazione WhatsApp su un server remoto.

## Prerequisiti Server

### 1. Sistema Operativo
- Ubuntu 20.04+ (raccomandato)
- CentOS 8+
- Debian 11+

### 2. Dipendenze di Sistema
```bash
# Aggiorna il sistema
sudo apt update && sudo apt upgrade -y

# Installa dipendenze necessarie per WhatsApp Web
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
    libgdk-pixbuf2.0-0

# Installa Chrome/Chromium per Puppeteer
sudo apt install -y chromium-browser

# Installa PM2 per gestione processi
sudo npm install -g pm2
```

### 3. Configurazione Puppeteer
```bash
# Crea directory per le sessioni WhatsApp
sudo mkdir -p /opt/whatsapp-sessions
sudo chown -R $USER:$USER /opt/whatsapp-sessions

# Configura variabili ambiente per Puppeteer
echo 'export PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true' >> ~/.bashrc
echo 'export PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser' >> ~/.bashrc
source ~/.bashrc
```

## Installazione Applicazione

### 1. Clona il Repository
```bash
cd /opt
sudo git clone <repository-url> rapport-consegne
sudo chown -R $USER:$USER rapport-consegne
cd rapport-consegne
```

### 2. Installa Dipendenze
```bash
npm install

# Installa dipendenze specifiche per WhatsApp
npm install whatsapp-web.js qrcode
```

### 3. Configurazione Ambiente
```bash
# Crea file .env.local
cat > .env.local << EOF
NEXT_PUBLIC_SUPABASE_URL=https://yydvltllcqfsrrnfypnf.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl5ZHZsdGxsY3Fmc3JybmZ5cG5mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1NDE5NzQsImV4cCI6MjA3NjExNzk3NH0.z096iysKd0hMcnpK6oyv4FVsNKtaZs8wrm-G1fl0wi4

# Configurazione WhatsApp
WHATSAPP_SESSION_PATH=/opt/whatsapp-sessions
WHATSAPP_HEADLESS=true
WHATSAPP_TIMEOUT=30000

# Configurazione Puppeteer
PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
PUPPETEER_ARGS=--no-sandbox,--disable-setuid-sandbox,--disable-dev-shm-usage
EOF
```

### 4. Build dell'Applicazione
```bash
npm run build
```

## Configurazione Nginx

### 1. Installa Nginx
```bash
sudo apt install -y nginx
```

### 2. Configurazione Virtual Host
```bash
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
sudo ln -s /etc/nginx/sites-available/rapport-consegne /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## Configurazione PM2

### 1. File di Configurazione PM2
```bash
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
    error_file: '/var/log/pm2/rapport-consegne-error.log',
    out_file: '/var/log/pm2/rapport-consegne-out.log',
    log_file: '/var/log/pm2/rapport-consegne.log',
    time: true
  }]
};
EOF
```

### 2. Avvia l'Applicazione
```bash
# Avvia con PM2
pm2 start ecosystem.config.js --env production

# Salva la configurazione PM2
pm2 save

# Configura PM2 per avviarsi al boot
pm2 startup
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u $USER --hp $HOME
```

## Configurazione SSL

### 1. Installa Certbot
```bash
sudo apt install -y certbot python3-certbot-nginx
```

### 2. Ottieni Certificato SSL
```bash
sudo certbot --nginx -d consegne.tecnotablet.it
```

## Configurazione Firewall

### 1. Configura UFW
```bash
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
```

## Monitoraggio e Logs

### 1. Logs PM2
```bash
# Visualizza logs in tempo reale
pm2 logs rapport-consegne

# Visualizza solo errori
pm2 logs rapport-consegne --err

# Riavvia l'applicazione
pm2 restart rapport-consegne
```

### 2. Logs Nginx
```bash
# Logs di accesso
sudo tail -f /var/log/nginx/access.log

# Logs di errore
sudo tail -f /var/log/nginx/error.log
```

### 3. Monitoraggio Sistema
```bash
# Installa htop per monitoraggio
sudo apt install -y htop

# Monitora risorse
htop
```

## Configurazione WhatsApp

### 1. Prima Configurazione
1. Accedi all'applicazione web
2. Vai alla sezione "Configurazione WhatsApp"
3. Inserisci un `instance_id` univoco (es: "main_instance")
4. Clicca su "Genera QR Code"
5. Scansiona il QR code con WhatsApp sul tuo telefono
6. Attendi la connessione

### 2. Gestione Sessioni
- Le sessioni WhatsApp vengono salvate in `/opt/whatsapp-sessions/`
- Le sessioni rimangono attive per 30 minuti di inattività
- PM2 gestisce automaticamente i restart dell'applicazione

## Troubleshooting

### 1. Problemi Comuni

#### WhatsApp non si connette
```bash
# Verifica che Chrome/Chromium sia installato
which chromium-browser

# Verifica i permessi delle sessioni
ls -la /opt/whatsapp-sessions/

# Riavvia l'applicazione
pm2 restart rapport-consegne
```

#### Errori Puppeteer
```bash
# Installa dipendenze mancanti
sudo apt install -y libnss3-dev libatk-bridge2.0-dev libdrm2 libxkbcommon0

# Verifica la configurazione Puppeteer
echo $PUPPETEER_EXECUTABLE_PATH
```

#### Problemi di Memoria
```bash
# Aumenta la memoria disponibile per PM2
pm2 restart rapport-consegne --max-memory-restart 2G

# Monitora l'uso della memoria
pm2 monit
```

### 2. Comandi Utili

```bash
# Stato dell'applicazione
pm2 status

# Riavvia l'applicazione
pm2 restart rapport-consegne

# Visualizza logs
pm2 logs rapport-consegne --lines 100

# Aggiorna l'applicazione
cd /opt/rapport-consegne
git pull
npm install
npm run build
pm2 restart rapport-consegne

# Verifica connessioni WhatsApp
curl -X POST http://localhost:3000/api/whatsapp/check-status \
  -H "Content-Type: application/json" \
  -d '{"instance_id": "main_instance"}'
```

## Backup e Manutenzione

### 1. Backup Sessioni WhatsApp
```bash
# Crea backup delle sessioni
sudo tar -czf whatsapp-sessions-backup-$(date +%Y%m%d).tar.gz /opt/whatsapp-sessions/

# Ripristina sessioni
sudo tar -xzf whatsapp-sessions-backup-YYYYMMDD.tar.gz -C /
```

### 2. Aggiornamenti
```bash
# Script di aggiornamento
#!/bin/bash
cd /opt/rapport-consegne
git pull
npm install
npm run build
pm2 restart rapport-consegne
echo "Aggiornamento completato"
```

## Sicurezza

### 1. Configurazioni di Sicurezza
- Usa HTTPS per tutte le comunicazioni
- Limita l'accesso SSH solo da IP autorizzati
- Configura fail2ban per proteggere da attacchi
- Mantieni il sistema aggiornato

### 2. Monitoraggio Sicurezza
```bash
# Installa fail2ban
sudo apt install -y fail2ban

# Configura fail2ban per Nginx
sudo tee /etc/fail2ban/jail.local << EOF
[nginx-http-auth]
enabled = true

[nginx-limit-req]
enabled = true
EOF

sudo systemctl restart fail2ban
```

## Supporto

Per problemi specifici:
1. Controlla i logs: `pm2 logs rapport-consegne`
2. Verifica lo stato: `pm2 status`
3. Controlla i logs Nginx: `sudo tail -f /var/log/nginx/error.log`
4. Verifica la connessione WhatsApp: usa l'endpoint `/api/whatsapp/check-status`
