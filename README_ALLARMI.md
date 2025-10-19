# 🔔 Sistema Allarmi Intelligente - README

## 🎯 Cosa è Stato Creato

È stato sviluppato un **sistema completo di allarmi automatici intelligenti** per l'applicazione Rapport Consegne, con le seguenti caratteristiche:

### ✅ Funzionalità Principali

1. **Allarmi Personalizzati per Utente**
   - Ogni operatore ha orari di allarme personalizzati
   - Configurazione turni (mattina/pomeriggio/giornaliero)
   - Giorni lavorativi personalizzabili

2. **Logica Settimanale Avanzata**
   - ⏰ Lunedì-Venerdì: allarme alle 15:00 (o altro orario configurato)
   - ⏰ Sabato: allarme alle 15:00 (preparazione weekend)
   - ⏰ Lunedì post-weekend: allarme alle 17:00 (orario speciale)
   - ❌ Domenica: NESSUN allarme (giorno non lavorativo)

3. **Controlli Intelligenti**
   - ✅ Invia solo se rapporto NON ancora inviato
   - ✅ NON invia dopo le 18:00 (fuori orario)
   - ✅ NON invia se già inviato oggi
   - ✅ NON invia se non è giorno lavorativo

4. **Sistema PWA Completo**
   - 📱 Installabile come app nativa su Android/iOS
   - 🔔 Notifiche push reali (anche con app chiusa)
   - 💾 Funzionalità offline
   - 🚀 Service Worker per performance

5. **Pannello Admin Avanzato**
   - ⚙️ Configurazione visuale allarmi per ogni utente
   - 📊 Statistiche in tempo reale
   - 🧪 Test manuali
   - 📝 Log completo di tutti gli invii

## 📁 File Creati

### Backend / Database
```
database/
└── advanced_alarms_schema.sql     ← Schema completo database
```

**Tabelle create:**
- `allarmi_operatori` - Configurazioni allarmi personalizzate
- `log_allarmi` - Storico di tutti gli allarmi inviati
- `stato_rapporti_giornalieri` - Tracking veloce rapporti

### Frontend / Componenti
```
components/
├── AlarmInitializer.tsx           ← Inizializzatore background
├── AlarmConfigPanel.tsx           ← Pannello configurazione admin
├── AlarmStats.tsx                 ← Widget statistiche
└── InstallPWA.tsx                 ← Prompt installazione app
```

### Services / Logic
```
lib/
├── advancedAlarmService.ts        ← Logica business allarmi
└── notificationService.ts         ← (aggiornato) Gestione notifiche
```

### API Endpoints
```
pages/api/alarms/
├── check.ts                       ← Controlla e invia allarmi
├── stats.ts                       ← Statistiche giornaliere
├── config/[userId].ts             ← GET/PUT configurazione utente
├── logs/[userId].ts               ← Log allarmi utente
└── force/[userId].ts              ← Test manuale allarme
```

### PWA / Service Worker
```
public/
├── sw.js                          ← Service Worker per notifiche
└── manifest.json                  ← (aggiornato) Manifest PWA
```

### Documentazione
```
docs/
├── QUICK_START.md                 ← 🚀 Guida rapida (5 minuti)
├── SISTEMA_ALLARMI.md             ← 📚 Documentazione completa
├── ANDROID_STUDIO_GUIDE.md        ← 📱 Conversione app Android
└── INTEGRATION_EXAMPLE.md         ← 🔌 Esempi integrazione
```

### Configurazione
```
vercel.json                        ← (aggiornato) Cron job automatico
```

## 🚀 Come Iniziare (3 Steps)

### Step 1: Database Setup (2 minuti)

```bash
# 1. Vai su Supabase Dashboard → SQL Editor
# 2. Copia il contenuto di database/advanced_alarms_schema.sql
# 3. Esegui
```

### Step 2: Avvia l'App (1 minuto)

```bash
npm install
npm run dev
```

Apri: http://localhost:3000

### Step 3: Test (2 minuti)

1. Login come admin: `bertuola@tecnotablet.it`
2. Vai su **Pannello Admin** → **Allarmi**
3. Seleziona un utente
4. Clicca **"Test Allarme"**
5. ✅ Dovresti ricevere una notifica!

## 📖 Documentazione Completa

### Per Iniziare Subito
👉 **[QUICK_START.md](./QUICK_START.md)** - Guida rapida 5 minuti

### Per Capire il Sistema
👉 **[SISTEMA_ALLARMI.md](./SISTEMA_ALLARMI.md)** - Documentazione tecnica completa

### Per Convertire in App Android
👉 **[ANDROID_STUDIO_GUIDE.md](./ANDROID_STUDIO_GUIDE.md)** - Guida passo-passo

### Per Integrare nell'App Esistente
👉 **[INTEGRATION_EXAMPLE.md](./INTEGRATION_EXAMPLE.md)** - Esempi codice

## 🎯 Esempio Scenario Reale

### Venerdì ore 14:59 - Ramadori (Turno Mattina)

**Sistema controlla:**
```
✅ È venerdì (giorno lavorativo)
✅ Sono le 15:00 (orario allarme)
✅ Ramadori NON ha inviato il rapporto
✅ È prima delle 18:00 (dentro orario)
✅ Allarme NON ancora inviato oggi
```

**Azione:**
```
🔔 Sistema invia notifica push a Ramadori

Messaggio:
"Ciao Riccardo! 👋

È ora di inviare il rapporto del turno mattina!
Orario: 09:00 - 15:00

⏰ Ricorda di inviarlo entro le 18:00"
```

### Sabato ore 15:00

**Sistema:**
```
🔔 Invia allarmi sabato
📅 Prepara cambio orario per lunedì
💾 Salva nel log

Lunedì → allarme speciale alle 17:00
```

### Domenica

**Sistema:**
```
😴 Nessun controllo attivo
❌ Nessun allarme inviato
⏰ Si riattiva lunedì con orario speciale (17:00)
```

## 🎛️ Pannello Admin

### Dashboard Statistiche

```
┌────────────────────────────────────────┐
│ ⏰ Statistiche Allarmi - Oggi          │
├────────────────────────────────────────┤
│  📊     ✅       🔔      ❌            │
│   2      1        1       1             │
│ Totale  Rapporti Allarmi   Da          │
│ Utenti  Inviati  Inviati  Completare   │
└────────────────────────────────────────┘
```

### Configurazione Allarmi

```
┌────────────────────────────────────────┐
│ 🔔 Configurazione Allarmi              │
├────────────────────────────────────────┤
│ Utenti      │ Configurazione           │
│             │                          │
│ ▶ Ramadori  │ 📍 Orari Lavoro         │
│   Peroni    │   Inizio:   [09:00]    │
│             │   Fine:     [15:00]    │
│             │                          │
│             │ 🔔 Orari Allarmi        │
│             │   Lun-Ven:  [15:00]    │
│             │   Sabato:   [15:00]    │
│             │   Lunedì*:  [17:00]    │
│             │                          │
│             │ 📅 Giorni Lavorativi    │
│             │   ☑️ L ☑️ M ☑️ M ☑️ G    │
│             │   ☑️ V ☑️ S ☐ D          │
│             │                          │
│             │ [💾 Salva] [🔔 Test]    │
└────────────────────────────────────────┘
```

## 🧪 Test Rapido

### Test 1: Allarme Manuale

```bash
# Via API
curl -X POST http://localhost:3000/api/alarms/force/USER_ID

# Via UI
Admin Panel → Allarmi → Seleziona utente → "Test Allarme"
```

### Test 2: Statistiche

```bash
curl http://localhost:3000/api/alarms/stats
```

### Test 3: Automatico

1. Configura allarme tra 2 minuti
2. NON inviare rapporto
3. Aspetta
4. ✅ Ricevi notifica automatica!

## 📱 PWA - Installazione

### Android
1. Apri Chrome
2. 3 puntini → **"Installa app"**
3. ✅ App installata in home screen!

### iOS
1. Apri Safari
2. Condividi → **"Aggiungi a Home"**
3. ✅ App installata!

## 🔄 Deploy Produzione

### Vercel

```bash
# 1. Commit
git add .
git commit -m "Add advanced alarm system"
git push

# 2. Deploy
vercel --prod
```

### Cron Job Automatico

Il file `vercel.json` è configurato per chiamare `/api/alarms/check` ogni 5 minuti automaticamente.

```json
{
  "crons": [{
    "path": "/api/alarms/check",
    "schedule": "*/5 * * * *"
  }]
}
```

## 📊 Monitoraggio

### Dashboard Admin

Visualizza in tempo reale:
- 👥 Totale utenti attivi
- ✅ Rapporti inviati oggi
- 🔔 Allarmi inviati oggi
- ⏳ Utenti senza rapporto

### Log Database

Ogni allarme è loggato con:
- 📅 Data e ora
- 👤 Utente
- 🎯 Tipo (giornaliero/weekend/manuale)
- ✅/❌ Inviato/Skipped
- 📝 Motivo skip

Query esempio:
```sql
SELECT 
  u.nome,
  u.cognome,
  l.data,
  l.ora_invio,
  l.tipo_allarme,
  l.inviato,
  l.motivo_skip
FROM log_allarmi l
JOIN utenti u ON l.user_id = u.id
ORDER BY l.ora_invio DESC
LIMIT 20;
```

## 🔧 Configurazioni Disponibili

Per ogni utente puoi impostare:

### Orari Lavoro
- Ora Inizio (es: 09:00)
- Ora Fine (es: 15:00)

### Orari Allarmi
- Lunedì-Venerdì (es: 15:00)
- Sabato (es: 15:00)
- Lunedì post-weekend (es: 17:00)

### Giorni Lavorativi
- ☑️ Lunedì, Martedì, Mercoledì, Giovedì, Venerdì
- ☑️ Sabato
- ☐ Domenica (default: non lavorativo)

### Opzioni Avanzate
- Allarme Attivo (on/off)
- Invia anche fuori orario
- Limite orario invio (default: 18:00)

## 📱 Conversione App Android

Per convertire in app nativa Android:

1. Leggi: **[ANDROID_STUDIO_GUIDE.md](./ANDROID_STUDIO_GUIDE.md)**
2. Setup Android Studio
3. Configura TWA (Trusted Web Activity)
4. Build APK/AAB
5. Pubblica su Google Play Store

**Tempo stimato:** 2-3 ore (prima volta)

## 🆘 Problemi Comuni

### Allarmi non arrivano?

1. **Verifica permessi notifiche:**
   - Settings → Notifiche → Consenti

2. **Verifica Service Worker:**
   - F12 → Application → Service Workers
   - Deve essere "activated"

3. **Verifica configurazione:**
   - Admin → Allarmi
   - "Allarme Attivo" deve essere ON

### Database non sincronizzato?

```bash
# Riesegui lo schema
# Supabase Dashboard → SQL Editor → Esegui advanced_alarms_schema.sql
```

### Notifiche su iOS non funzionano?

iOS ha limitazioni sulle PWA. Soluzioni:
- Usa app nativa (vedi guida Android Studio)
- Implementa fallback email/SMS
- Attendi iOS 17+ con supporto migliorato

## 💡 Tips

- 🎯 **Testa con orari ravvicinati** (allarme tra 2 min)
- 📱 **Installa come PWA** per esperienza migliore
- 🔔 **Abilita notifiche** subito
- 📊 **Monitora stats** giornalmente
- 🔧 **Personalizza** per ogni utente

## 🎉 Riepilogo

### Cosa Hai Ora

✅ Sistema allarmi automatici completo
✅ Notifiche push reali
✅ PWA installabile
✅ Pannello admin professionale
✅ Statistiche in tempo reale
✅ Log completo
✅ Pronto per Android/iOS
✅ Documentazione completa

### Cosa Puoi Fare

1. ⚙️ **Configurare** orari personalizzati per ogni utente
2. 📊 **Monitorare** chi ha inviato i rapporti
3. 🔔 **Testare** allarmi manualmente
4. 📱 **Installare** come app nativa
5. 🚀 **Pubblicare** su Google Play Store

## 📚 Link Utili

- **Quick Start:** [QUICK_START.md](./QUICK_START.md)
- **Documentazione:** [SISTEMA_ALLARMI.md](./SISTEMA_ALLARMI.md)
- **Guida Android:** [ANDROID_STUDIO_GUIDE.md](./ANDROID_STUDIO_GUIDE.md)
- **Esempi:** [INTEGRATION_EXAMPLE.md](./INTEGRATION_EXAMPLE.md)

## 🤝 Supporto

Per domande o problemi:

1. Consulta la documentazione
2. Verifica il log database
3. Controlla console browser (F12)
4. Controlla log Vercel

## 🚀 Prossimi Passi

1. ✅ Setup database
2. ✅ Test locale
3. 📱 Installare come PWA
4. 🧪 Test produzione
5. 📊 Monitorare metriche
6. 📱 (Opzionale) App Android Studio

---

**Sviluppato con ❤️ per Rapport Consegne**

Sistema professionale, scalabile e pronto per la produzione! 🎉

