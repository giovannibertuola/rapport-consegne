# Setup Iniziale del Sistema

Questa guida ti aiuterà a configurare il Sistema Rapporti Consegne per la prima volta.

## Prerequisiti

- Account Supabase
- Node.js 18+ installato
- Git installato

## Passo 1: Setup Database Supabase

### 1.1 Crea un nuovo progetto Supabase

1. Vai su [Supabase](https://supabase.com)
2. Crea un nuovo progetto
3. Salva l'URL e la chiave API anonima

### 1.2 Esegui lo Schema SQL

1. Vai su SQL Editor nel dashboard Supabase
2. Copia e incolla il contenuto di `database/schema.sql`
3. Esegui lo script

Questo creerà:
- Tabelle: `utenti`, `rapporti`, `allarmi`, `targhe`
- Indici per le performance
- Trigger per aggiornamenti automatici
- Politiche RLS per la sicurezza
- Dati iniziali di esempio

### 1.3 Verifica le Tabelle

Controlla che le tabelle siano state create correttamente:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';
```

## Passo 2: Setup Applicazione

### 2.1 Clona e Installa

```bash
git clone <repository-url>
cd rapport-consegne
npm install
```

### 2.2 Configura Variabili d'Ambiente

Crea il file `.env.local`:

```bash
cp .env.example .env.local
```

Modifica `.env.local` con le tue credenziali:

```env
NEXT_PUBLIC_SUPABASE_URL=https://yydvltllcqfsrrnfypnf.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl5ZHZsdGxsY3Fmc3JybmZ5cG5mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1NDE5NzQsImV4cCI6MjA3NjExNzk3NH0.z096iysKd0hMcnpK6oyv4FVsNKtaZs8wrm-G1fl0wi4
```

### 2.3 Avvia l'Applicazione

```bash
npm run dev
```

L'applicazione sarà disponibile su `http://localhost:3000`

## Passo 3: Configurazione Iniziale

### 3.1 Login come Amministratore

Usa le credenziali predefinite:
- **Email**: bertuola@tecnotablet.it
- **Password**: (configura una password sicura)

### 3.2 Configura gli Allarmi

1. Vai su "Amministrazione" > "Allarmi"
2. Imposta l'ora di invio degli allert (es. 18:00)
3. Salva la configurazione

### 3.3 Gestisci gli Utenti

1. Vai su "Amministrazione" > "Gestione Utenti"
2. Verifica che gli utenti di esempio siano presenti:
   - Riccardo Ramadori (utente, turno mattina)
   - Tiziano Peroni (utente, turno pomeriggio)
   - Bertuola Admin (admin, nessun turno)

3. Aggiorna le password degli utenti se necessario

### 3.4 Configura le Targhe

1. Vai su "Amministrazione" > "Gestione Targhe"
2. Verifica le targhe di esempio
3. Aggiungi le targhe reali dei veicoli

## Passo 4: Test del Sistema

### 4.1 Test Login Utenti

Testa il login con tutti gli utenti:
- Admin: bertuola@tecnotablet.it
- Utente: ramadori@tecnotablet.it
- Utente: peroni@tecnotablet.it

### 4.2 Test Inserimento Rapporto

1. Login come utente
2. Vai su "Rapporti"
3. Compila e invia un rapporto di test
4. Verifica che sia salvato correttamente

### 4.3 Test Visualizzazione Rapporti

1. Login come admin
2. Vai su "Visualizza Rapporti"
3. Verifica che il rapporto di test sia visibile
4. Testa i filtri per data e operatore

### 4.4 Test Esportazione

1. Vai su "Visualizza Rapporti"
2. Clicca su "Esporta CSV"
3. Verifica che il file sia scaricato correttamente

## Passo 5: Configurazione Produzione

### 5.1 Aggiorna Password

**IMPORTANTE**: Cambia tutte le password predefinite prima del deployment:

```sql
-- Aggiorna le password degli utenti
UPDATE utenti 
SET password_hash = 'nuova_password_hashata' 
WHERE email = 'bertuola@tecnotablet.it';

UPDATE utenti 
SET password_hash = 'nuova_password_hashata' 
WHERE email = 'ramadori@tecnotablet.it';

UPDATE utenti 
SET password_hash = 'nuova_password_hashata' 
WHERE email = 'peroni@tecnotablet.it';
```

### 5.2 Configura Dominio

Segui la guida in `DEPLOYMENT.md` per configurare il dominio `consegne.tecnotablet.it`.

### 5.3 Configura SSL

Assicurati che HTTPS sia configurato correttamente per la produzione.

## Passo 6: Backup e Monitoraggio

### 6.1 Backup Database

Configura backup automatici su Supabase:
1. Vai su Settings > Database
2. Abilita i backup automatici

### 6.2 Monitoraggio

- Configura alert per errori dell'applicazione
- Monitora le performance del database
- Configura log per audit trail

## Troubleshooting

### Problemi Comuni

1. **Errore di connessione al database**:
   - Verifica le credenziali Supabase
   - Controlla che RLS sia configurato correttamente

2. **Login non funziona**:
   - Verifica che l'utente esista nella tabella `utenti`
   - Controlla che la password sia corretta

3. **Allert non funzionano**:
   - Verifica che l'allarme sia configurato
   - Controlla i logs del browser per errori

4. **Esportazione CSV non funziona**:
   - Verifica che ci siano dati da esportare
   - Controlla i permessi del browser per i download

### Comandi di Debug

```bash
# Verifica la connessione al database
npm run dev
# Apri la console del browser e controlla gli errori

# Verifica le tabelle del database
# Esegui in SQL Editor di Supabase:
SELECT * FROM utenti;
SELECT * FROM rapporti;
SELECT * FROM allarmi;
SELECT * FROM targhe;
```

## Supporto

Per problemi durante il setup:
1. Controlla i logs dell'applicazione
2. Verifica la configurazione del database
3. Contatta l'amministratore di sistema

## Prossimi Passi

Dopo il setup iniziale:
1. Forma gli utenti sull'uso del sistema
2. Configura i backup automatici
3. Imposta il monitoraggio
4. Pianifica la manutenzione regolare
