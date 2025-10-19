# 🚀 Quick Start - Sistema Allarmi Intelligenti

## 📋 Setup Immediato (5 minuti)

### 1. Esegui lo Schema Database su Supabase

```sql
-- Vai su Supabase Dashboard → SQL Editor
-- Copia e incolla il contenuto di: database/advanced_alarms_schema.sql
-- Clicca "Run"
```

Questo creerà:
- ✅ Tabella `allarmi_operatori` (configurazione allarmi personalizzati)
- ✅ Tabella `log_allarmi` (storico invii)
- ✅ Tabella `stato_rapporti_giornalieri` (tracking rapporti)
- ✅ Configurazioni predefinite per Ramadori e Peroni

### 2. Installa Dipendenze (se non l'hai già fatto)

```bash
npm install
```

### 3. Avvia l'Applicazione

```bash
npm run dev
```

L'app sarà disponibile su: http://localhost:3000

## 🔔 Come Funziona il Sistema di Allarmi

### Logica Automatica

Il sistema controlla **ogni 30 secondi** se è necessario inviare allarmi, in base a:

#### Lunedì - Venerdì
- **Ramadori** (Turno Mattina 9:00-15:00)
  - ⏰ Allarme alle **15:00**
  - ✅ Solo se NON ha ancora inviato il rapporto
  - ❌ NON invia dopo le 18:00

- **Peroni** (Turno Pomeriggio 10:00-17:42)
  - ⏰ Allarme alle **17:00**
  - ✅ Solo se NON ha ancora inviato il rapporto
  - ❌ NON invia dopo le 18:00

#### Sabato
- Entrambi ricevono allarme alle **15:00**
- Il sistema si prepara per il cambio allarme del lunedì

#### Lunedì (dopo weekend)
- Allarme speciale alle **17:00** per entrambi
- Messaggio personalizzato "Buon inizio settimana"

#### Domenica
- **NESSUN allarme** (giorno non lavorativo)

### Quando NON Invia Allarmi

Il sistema è intelligente e NON invia allarmi se:
1. ❌ L'utente ha già inviato il rapporto oggi
2. ❌ È dopo le 18:00 (fuori orario)
3. ❌ È domenica
4. ❌ L'allarme è già stato inviato oggi
5. ❌ La configurazione allarme è disattivata

## 🎛️ Pannello Admin

### Accesso
1. Login come admin: `bertuola@tecnotablet.it`
2. Vai su **Configurazione Allarmi**

### Funzionalità
- ⚙️ **Configura orari allarmi** per ogni utente
- 📅 **Imposta giorni lavorativi**
- ⏰ **Definisci orari di lavoro**
- 🔔 **Test allarmi** manuali
- 📊 **Visualizza statistiche** in tempo reale

### Configurazioni Disponibili

Per ogni utente puoi impostare:

```
📍 Orari Lavoro
  - Ora Inizio (es: 09:00)
  - Ora Fine (es: 15:00)

🔔 Orari Allarmi
  - Lunedì-Venerdì (es: 15:00)
  - Sabato (es: 15:00)
  - Lunedì post-weekend (es: 17:00)

📅 Giorni Lavorativi
  ☑️ Lunedì
  ☑️ Martedì
  ☑️ Mercoledì
  ☑️ Giovedì
  ☑️ Venerdì
  ☑️ Sabato
  ☐ Domenica

⚙️ Opzioni Avanzate
  - Allarme Attivo (on/off)
  - Invia anche fuori orario
  - Limite orario invio (18:00)
```

## 🧪 Test del Sistema

### 1. Test Manuale Allarme

```bash
# Chiama l'API per forzare un allarme a un utente
curl -X POST http://localhost:3000/api/alarms/force/[USER_ID]
```

Oppure usa il pulsante "Test Allarme" nel pannello admin.

### 2. Verifica Statistiche

```bash
# Visualizza statistiche allarmi di oggi
curl http://localhost:3000/api/alarms/stats
```

Output esempio:
```json
{
  "totalUsers": 2,
  "alarmsToSend": 2,
  "alarmsSent": 0,
  "reportsSubmitted": 0,
  "usersWithoutReport": 2
}
```

### 3. Simula Invio Rapporto

1. Login come utente (es: `ramadori@tecnotablet.it`)
2. Compila e invia il rapporto
3. Verifica che l'allarme NON venga più inviato

### 4. Controlla Log Allarmi

```bash
# Visualizza log allarmi di un utente
curl http://localhost:3000/api/alarms/logs/[USER_ID]?limit=10
```

## 📱 Installazione PWA

### Su Android
1. Apri l'app in Chrome
2. Clicca sui 3 puntini → **Installa app**
3. L'app verrà installata nella home screen
4. Notifiche push attive! 🔔

### Su iOS
1. Apri l'app in Safari
2. Clicca su "Condividi" → **Aggiungi a Home**
3. L'app verrà installata (notifiche limitate su iOS)

## 🔧 Configurazione Vercel (per Produzione)

### Setup Cron Job Automatico

Aggiungi in `vercel.json`:

```json
{
  "crons": [{
    "path": "/api/alarms/check",
    "schedule": "*/5 * * * *"
  }]
}
```

Questo chiamerà l'API ogni 5 minuti per controllare gli allarmi.

### Deploy

```bash
vercel --prod
```

### Variabili d'Ambiente

Assicurati di aver configurato su Vercel:
```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

## 🎯 Esempio Scenario Reale

### Scenario: Venerdì ore 14:59

**Utente:** Ramadori (Turno Mattina 9:00-15:00)

**Sistema controlla:**
1. ✅ È venerdì (giorno lavorativo)
2. ✅ Sono le 15:00 (orario allarme)
3. ✅ Ramadori NON ha inviato il rapporto
4. ✅ È prima delle 18:00 (dentro orario)
5. ✅ Allarme NON ancora inviato oggi

**Azione:** 🔔 Sistema invia notifica push a Ramadori

**Messaggio:**
```
🚛 Promemoria Rapporto Consegne

Ciao Riccardo! 👋

È ora di inviare il rapporto del turno mattina!
Orario: 09:00 - 15:00

⏰ Ricorda di inviarlo entro le 18:00
```

### Scenario: Sabato ore 15:00

**Sistema prepara aggiornamento:**
1. 🔔 Invia allarmi sabato alle 15:00
2. 📅 Imposta per lunedì: allarme speciale alle 17:00
3. 💾 Salva nel log

### Scenario: Domenica

**Sistema:**
1. 😴 Nessun controllo attivo
2. ❌ Nessun allarme inviato
3. ⏰ Si riattiva lunedì con orario speciale

## 📊 Monitoraggio

### Dashboard Admin

Visualizza in tempo reale:
- 👥 Totale utenti attivi
- ✅ Rapporti inviati oggi
- 🔔 Allarmi inviati oggi
- ⏳ Utenti senza rapporto

### Log System

Ogni allarme viene loggato con:
- 📅 Data e ora invio
- 👤 Utente destinatario
- 🎯 Tipo allarme (giornaliero/weekend/manuale)
- ✅/❌ Stato (inviato/skipped)
- 📝 Motivo skip (se applicabile)

## 🆘 Troubleshooting

### Allarmi non arrivano?

1. **Verifica permessi notifiche:**
   - Chrome → Impostazioni → Privacy → Notifiche
   - Consenti notifiche per il tuo sito

2. **Controlla Service Worker:**
   ```javascript
   // In Console Chrome (F12)
   navigator.serviceWorker.getRegistrations()
   ```

3. **Verifica configurazione:**
   - Pannello Admin → Configurazione Allarmi
   - Controlla che "Allarme Attivo" sia ON

### Database non sincronizzato?

```bash
# Riesegui lo schema
psql -h [supabase-host] -U postgres -d postgres -f database/advanced_alarms_schema.sql
```

### Service Worker non si registra?

1. Verifica che l'app sia su HTTPS (o localhost)
2. Cancella cache: Chrome → F12 → Application → Clear storage
3. Ricarica: CTRL + SHIFT + R

## 📚 Prossimi Passi

1. ✅ [Configurazione database](#1-esegui-lo-schema-database-su-supabase)
2. ✅ [Test sistema](#-test-del-sistema)
3. 📱 [Conversione Android](./ANDROID_STUDIO_GUIDE.md)
4. 🚀 [Deploy produzione](#-configurazione-vercel-per-produzione)
5. 📊 [Monitoraggio](#-monitoraggio)

## 💡 Tips

- 🎯 **Testa prima con orari ravvicinati** (es: allarme tra 2 minuti)
- 📱 **Installa come PWA** per esperienza migliore
- 🔔 **Abilita notifiche** subito al primo accesso
- 📊 **Monitora statistiche** giornalmente
- 🔧 **Personalizza orari** per ogni utente

---

**Domande?** Controlla la guida completa: [ANDROID_STUDIO_GUIDE.md](./ANDROID_STUDIO_GUIDE.md)

