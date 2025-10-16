# Guida al Deployment

Questa guida spiega come deployare il Sistema Rapporti Consegne sul dominio `consegne.tecnotablet.it`.

## Opzioni di Deployment

### 1. Vercel (Raccomandato)

Vercel è la piattaforma ideale per applicazioni Next.js.

#### Setup Vercel

1. **Installa Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Login a Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   vercel
   ```

4. **Configura il dominio personalizzato**:
   - Vai su [Vercel Dashboard](https://vercel.com/dashboard)
   - Seleziona il tuo progetto
   - Vai su Settings > Domains
   - Aggiungi `consegne.tecnotablet.it`

#### Variabili d'Ambiente su Vercel

Configura le seguenti variabili d'ambiente nel dashboard Vercel:

```
NEXT_PUBLIC_SUPABASE_URL=https://yydvltllcqfsrrnfypnf.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl5ZHZsdGxsY3Fmc3JybmZ5cG5mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1NDE5NzQsImV4cCI6MjA3NjExNzk3NH0.z096iysKd0hMcnpK6oyv4FVsNKtaZs8wrm-G1fl0wi4
```

### 2. Netlify

#### Setup Netlify

1. **Build Command**:
   ```bash
   npm run build
   ```

2. **Publish Directory**:
   ```
   .next
   ```

3. **Variabili d'Ambiente**:
   Configura le stesse variabili d'ambiente di Vercel.

### 3. Server Proprio (VPS/Dedicated)

#### Prerequisiti

- Node.js 18+
- PM2 (per gestione processi)
- Nginx (come reverse proxy)

#### Setup

1. **Clona il repository**:
   ```bash
   git clone <repository-url>
   cd rapport-consegne
   ```

2. **Installa dipendenze**:
   ```bash
   npm install
   ```

3. **Build dell'applicazione**:
   ```bash
   npm run build
   ```

4. **Configura PM2**:
   ```bash
   npm install -g pm2
   pm2 start npm --name "rapport-consegne" -- start
   pm2 save
   pm2 startup
   ```

5. **Configura Nginx**:
   ```nginx
   server {
       listen 80;
       server_name consegne.tecnotablet.it;

       location / {
           proxy_pass http://localhost:3000;
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
   ```

6. **SSL con Let's Encrypt**:
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d consegne.tecnotablet.it
   ```

## Configurazione Database Supabase

### 1. Esegui lo Schema SQL

Esegui il contenuto di `database/schema.sql` nel tuo database Supabase:

1. Vai su [Supabase Dashboard](https://supabase.com/dashboard)
2. Seleziona il tuo progetto
3. Vai su SQL Editor
4. Incolla e esegui il contenuto di `database/schema.sql`

### 2. Configura RLS (Row Level Security)

Le politiche RLS sono già incluse nello schema SQL, ma verifica che siano attive:

```sql
-- Verifica che RLS sia abilitato
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
```

### 3. Configura Autenticazione

1. Vai su Authentication > Settings
2. Configura i provider di autenticazione se necessario
3. Imposta le URL di redirect per il tuo dominio

## Configurazione DNS

### Record DNS Richiesti

Per il dominio `consegne.tecnotablet.it`:

```
Type: A
Name: consegne
Value: [IP del server o CNAME per Vercel/Netlify]
TTL: 3600
```

### Per Vercel

```
Type: CNAME
Name: consegne
Value: cname.vercel-dns.com
TTL: 3600
```

## Monitoraggio e Manutenzione

### 1. Logs

- **Vercel**: Dashboard > Functions > Logs
- **Netlify**: Dashboard > Functions > Logs
- **Server proprio**: `pm2 logs rapport-consegne`

### 2. Backup Database

Configura backup automatici su Supabase:
1. Vai su Settings > Database
2. Configura i backup automatici

### 3. Monitoraggio Performance

- **Vercel Analytics**: Abilitato automaticamente
- **Google Analytics**: Aggiungi il tracking code se necessario

## Troubleshooting

### Problemi Comuni

1. **Errore 500**: Controlla i logs e le variabili d'ambiente
2. **Database connection failed**: Verifica le credenziali Supabase
3. **CORS errors**: Configura i domini autorizzati in Supabase

### Comandi Utili

```bash
# Verifica lo stato dell'applicazione
pm2 status

# Riavvia l'applicazione
pm2 restart rapport-consegne

# Visualizza i logs
pm2 logs rapport-consegne

# Aggiorna l'applicazione
git pull
npm install
npm run build
pm2 restart rapport-consegne
```

## Sicurezza

### 1. HTTPS

Assicurati che HTTPS sia configurato correttamente:
- Vercel/Netlify: Automatico
- Server proprio: Usa Let's Encrypt

### 2. Variabili d'Ambiente

Non committare mai le variabili d'ambiente sensibili:
- Usa `.env.local` per sviluppo
- Configura le variabili nel dashboard del provider

### 3. Database

- Abilita RLS su tutte le tabelle
- Usa credenziali con privilegi limitati
- Configura backup automatici

## Supporto

Per problemi di deployment, contatta:
- **Vercel**: [Vercel Support](https://vercel.com/support)
- **Supabase**: [Supabase Support](https://supabase.com/support)
- **Server proprio**: Amministratore di sistema
