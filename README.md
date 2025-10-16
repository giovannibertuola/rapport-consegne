# Sistema Rapporti Consegne

Sistema web per la gestione dei rapporti giornalieri delle consegne, sviluppato con Next.js, TypeScript e Supabase.

## Caratteristiche

- **Autenticazione**: Sistema di login con ruoli (Admin/Utente)
- **Gestione Utenti**: Pannello amministrativo per gestire utenti e privilegi
- **Rapporti Giornalieri**: Form per inserire dati delle consegne
- **Sistema Turni**: Rotazione automatica settimanale dei turni
- **Allert Automatici**: Notifiche per ricordare l'invio dei rapporti
- **Dashboard Reportistica**: Visualizzazione e filtri per i rapporti
- **Esportazione**: Download dei dati in formato CSV

## Struttura Database

### Tabelle Supabase

1. **utenti**: Gestione degli utenti del sistema
2. **rapporti**: Dati dei rapporti giornalieri
3. **allarmi**: Configurazione degli allert automatici
4. **targhe**: Gestione delle targhe dei veicoli

## Installazione

1. Clona il repository
2. Installa le dipendenze:
   ```bash
   npm install
   ```

3. Configura le variabili d'ambiente:
   ```bash
   cp .env.example .env.local
   ```
   
   Modifica `.env.local` con le tue credenziali Supabase:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Esegui lo schema SQL nel database Supabase (vedi `database/schema.sql`)

5. Avvia l'applicazione:
   ```bash
   npm run dev
   ```

## Configurazione Database

Esegui lo script SQL in `database/schema.sql` nel tuo database Supabase per creare:
- Tabelle con le strutture corrette
- Indici per le performance
- Trigger per aggiornamenti automatici
- Politiche RLS (Row Level Security)
- Dati iniziali di esempio

## Utenti Predefiniti

Il sistema include utenti di esempio:
- **Admin**: bertuola@tecnotablet.it
- **Utente**: ramadori@tecnotablet.it
- **Utente**: peroni@tecnotablet.it

## Funzionalità

### Per Amministratori
- Gestione completa degli utenti
- Configurazione degli allert
- Gestione delle targhe
- Visualizzazione di tutti i rapporti
- Esportazione dati

### Per Utenti
- Inserimento rapporti giornalieri
- Visualizzazione dei propri rapporti
- Accesso limitato alle funzionalità

## Sistema Turni

- **Turno Mattina**: 9:00-15:00 (Lunedì-Sabato)
- **Turno Pomeriggio**: 10:00-17:42 (Lunedì-Venerdì)
- **Rotazione Automatica**: I turni si alternano ogni settimana
- **Esclusione**: L'utente Bertuola è escluso dalla rotazione

## Deployment

Per il deployment su `consegne.tecnotablet.it`:

1. Configura il dominio nel tuo provider di hosting
2. Imposta le variabili d'ambiente di produzione
3. Esegui il build:
   ```bash
   npm run build
   ```
4. Avvia l'applicazione:
   ```bash
   npm start
   ```

## Tecnologie Utilizzate

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Autenticazione**: Supabase Auth
- **Icone**: Lucide React
- **Date**: date-fns
- **Notifiche**: react-hot-toast

## Struttura Progetto

```
├── app/                    # App Router di Next.js
├── components/            # Componenti React
├── lib/                   # Utility e servizi
├── database/              # Schema e migrazioni
├── public/                # File statici
└── README.md
```

## Supporto

Per supporto tecnico o domande, contatta l'amministratore del sistema.
