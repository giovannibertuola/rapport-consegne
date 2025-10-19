# 🔔 Sistema Allarmi Intelligente - Documentazione Completa

## 📖 Panoramica

Il **Sistema Allarmi Intelligente** è un componente avanzato dell'applicazione Rapport Consegne che gestisce automaticamente l'invio di notifiche push agli operatori che non hanno ancora inviato il rapporto giornaliero.

### Caratteristiche Principali

✅ **Allarmi Personalizzati per Utente**
- Orari diversi per ogni operatore
- Configurazione turni (mattina/pomeriggio)
- Giorni lavorativi personalizzabili

✅ **Logica Settimanale Avanzata**
- Orari diversi Lunedì-Venerdì
- Orario speciale per il Sabato
- Orario speciale per Lunedì post-weekend
- Nessun allarme la Domenica

✅ **Controlli Intelligenti**
- Non invia se rapporto già inviato
- Non invia fuori orario lavorativo
- Non invia dopo le 18:00 (configurabile)
- Non invia allarmi duplicati

✅ **Sistema PWA e Notifiche Push**
- Installabile su Android/iOS
- Notifiche push reali (anche con app chiusa)
- Service Worker per funzionalità offline

✅ **Pannello Admin Completo**
- Configurazione visuale degli allarmi
- Statistiche in tempo reale
- Test manuali
- Log completo di tutti gli invii

## 🏗️ Architettura del Sistema

```
┌─────────────────────────────────────────────────────┐
│                   Frontend (React)                   │
│  ┌──────────────┐  ┌─────────────┐  ┌────────────┐ │
│  │AlarmInitiali-││  │AlarmConfig  │  │AlarmStats  │ │
│  │zer           ││  │Panel        │  │            │ │
│  └──────────────┘  └─────────────┘  └────────────┘ │
└─────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────┐
│                 API Endpoints (Next.js)              │
│  /api/alarms/check    - Controlla e invia allarmi   │
│  /api/alarms/stats    - Statistiche                 │
│  /api/alarms/config   - Configurazione utente       │
│  /api/alarms/logs     - Log allarmi                 │
│  /api/alarms/force    - Test manuale                │
└─────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────┐
│              Service Layer (TypeScript)              │
│  advancedAlarmService.ts - Logica business allarmi  │
│  notificationService.ts  - Gestione notifiche       │
└─────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────┐
│                Database (Supabase/PostgreSQL)        │
│  allarmi_operatori          - Config allarmi        │
│  log_allarmi                - Storico invii         │
│  stato_rapporti_giornalieri - Tracking rapporti     │
└─────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────┐
│                Service Worker (PWA)                  │
│  sw.js - Gestione notifiche push e cache            │
└─────────────────────────────────────────────────────┘
```

## 📊 Schema Database

### Tabella: `allarmi_operatori`

Contiene la configurazione degli allarmi per ogni utente.

```sql
CREATE TABLE allarmi_operatori (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES utenti(id),
    turno VARCHAR(20),                      -- 'mattina', 'pomeriggio', 'giornaliero'
    
    -- Orari di lavoro
    ora_inizio TIME,                        -- Es: 09:00:00
    ora_fine TIME,                          -- Es: 15:00:00
    
    -- Orari allarmi
    orario_allarme_lun_ven TIME,           -- Es: 15:00:00
    orario_allarme_sabato TIME,            -- Es: 15:00:00
    orario_allarme_lunedi_successivo TIME, -- Es: 17:00:00
    
    -- Giorni lavorativi
    lavora_lunedi BOOLEAN DEFAULT true,
    lavora_martedi BOOLEAN DEFAULT true,
    lavora_mercoledi BOOLEAN DEFAULT true,
    lavora_giovedi BOOLEAN DEFAULT true,
    lavora_venerdi BOOLEAN DEFAULT true,
    lavora_sabato BOOLEAN DEFAULT true,
    lavora_domenica BOOLEAN DEFAULT false,
    
    -- Configurazione
    attivo BOOLEAN DEFAULT true,
    invia_dopo_orario BOOLEAN DEFAULT false,
    limite_orario_invio TIME DEFAULT '18:00:00'
);
```

### Tabella: `log_allarmi`

Storico di tutti gli allarmi inviati o skipped.

```sql
CREATE TABLE log_allarmi (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES utenti(id),
    data DATE,                             -- Data dell'allarme
    ora_invio TIMESTAMP,                   -- Ora esatta invio
    tipo_allarme VARCHAR(50),              -- 'giornaliero', 'weekend', 'manuale'
    inviato BOOLEAN,                       -- true/false
    motivo_skip VARCHAR(255)               -- Se non inviato, perché
);
```

### Tabella: `stato_rapporti_giornalieri`

Tracking rapido dello stato dei rapporti.

```sql
CREATE TABLE stato_rapporti_giornalieri (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES utenti(id),
    data DATE,
    rapporto_inviato BOOLEAN DEFAULT false,
    ora_invio TIMESTAMP,
    allarme_inviato BOOLEAN DEFAULT false,
    
    UNIQUE(user_id, data)
);
```

## 🔄 Flusso di Esecuzione

### 1. Inizializzazione (all'avvio dell'app)

```javascript
// AlarmInitializer.tsx viene montato in _app.tsx
useEffect(() => {
  // 1. Registra Service Worker
  notificationService.registerServiceWorker()
  
  // 2. Richiede permessi notifiche
  notificationService.requestNotificationPermission()
  
  // 3. Avvia controllo periodico (ogni 60 secondi)
  setInterval(async () => {
    await fetch('/api/alarms/check', { method: 'POST' })
  }, 60000)
}, [])
```

### 2. Check Allarmi (ogni 60 secondi)

```javascript
// advancedAlarmService.ts
async checkAndSendAlarms() {
  const now = new Date()
  const currentTime = format(now, 'HH:mm:ss')
  const currentDay = getDay(now) // 0-6
  
  // Ottieni tutte le configurazioni attive
  const configs = await getActiveAlarmConfigs()
  
  for (const config of configs) {
    // 1. Verifica giorno lavorativo
    if (!isWorkingDay(config, currentDay)) continue
    
    // 2. Verifica orario
    if (isAfterWorkHours(config, currentTime)) continue
    
    // 3. Determina orario allarme da usare
    const alarmTime = getAlarmTime(config, currentDay)
    
    // 4. Verifica se è ora esatta
    if (!isAlarmTime(currentTime, alarmTime)) continue
    
    // 5. Verifica se rapporto già inviato
    if (await hasUserSubmittedToday(config.user_id)) continue
    
    // 6. Verifica se allarme già inviato
    if (await hasAlarmBeenSentToday(config.user_id)) continue
    
    // 7. INVIA ALLARME!
    await sendAlarmToUser(config)
    await logAlarm(config.user_id, 'giornaliero', true, null)
  }
}
```

### 3. Invio Notifica Push

```javascript
async sendAlarmToUser(user, config, dayOfWeek) {
  const message = buildMessage(user, config, dayOfWeek)
  
  // Invia notifica push
  await notificationService.sendPushNotification(
    '🚛 Promemoria Rapporto Consegne',
    message,
    {
      userId: user.id,
      type: 'warning',
      action: 'open_form',
      url: '/dashboard'
    }
  )
}
```

### 4. Ricezione Notifica (Service Worker)

```javascript
// sw.js
self.addEventListener('push', (event) => {
  const data = event.data.json()
  
  const options = {
    body: data.body,
    icon: '/icon-192x192.png',
    vibrate: [200, 100, 200],
    requireInteraction: true,
    actions: [
      { action: 'open', title: 'Apri App' },
      { action: 'dismiss', title: 'Dopo' }
    ]
  }
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  )
})
```

## 🎯 Esempio Configurazione: Ramadori

### Scenario Reale

**Utente:** Riccardo Ramadori
**Turno:** Mattina (9:00 - 15:00)

### Configurazione Database

```sql
INSERT INTO allarmi_operatori (
    user_id,
    turno,
    ora_inizio,
    ora_fine,
    orario_allarme_lun_ven,
    orario_allarme_sabato,
    orario_allarme_lunedi_successivo,
    lavora_domenica,
    limite_orario_invio
) VALUES (
    'uuid-ramadori',
    'mattina',
    '09:00:00',
    '15:00:00',
    '15:00:00',  -- Lun-Ven: allarme alle 15:00
    '15:00:00',  -- Sabato: allarme alle 15:00
    '17:00:00',  -- Lunedì post-weekend: alle 17:00
    false,       -- Non lavora domenica
    '18:00:00'   -- Non invia dopo le 18:00
);
```

### Timeline Settimanale

#### Lunedì
```
09:00 → Ramadori inizia turno
15:00 → 🔔 Sistema controlla: rapporto inviato? No → ALLARME!
15:05 → Ramadori invia rapporto
15:06 → Sistema controlla: rapporto inviato? Sì → Skip
18:01 → Sistema non invia più (fuori orario)
```

#### Martedì-Venerdì
```
Stesso comportamento del lunedì
Allarme alle 15:00 se rapporto non inviato
```

#### Sabato
```
09:00 → Ramadori inizia turno
15:00 → 🔔 ALLARME con messaggio speciale sabato
15:00 → Sistema prepara configurazione per lunedì
```

#### Domenica
```
Tutto il giorno → ❌ Nessun controllo
                  ❌ Nessun allarme
```

#### Lunedì (nuovo)
```
09:00 → Ramadori inizia turno
17:00 → 🔔 ALLARME SPECIALE post-weekend
        Messaggio: "Buon inizio settimana! 🚀"
```

## 🎨 Componenti UI

### AlarmConfigPanel.tsx

Pannello admin per configurare gli allarmi.

**Funzionalità:**
- Lista utenti con turni
- Form configurazione orari
- Toggle giorni lavorativi
- Opzioni avanzate
- Test allarme manuale
- Salvataggio immediato

**Screenshot:**
```
┌────────────────────────────────────────┐
│ 🔔 Configurazione Allarmi              │
├────────────────────────────────────────┤
│ Utenti       │ Configurazione          │
│              │                         │
│ ▶ Ramadori   │ 📍 Orari Lavoro        │
│   Peroni     │   Inizio:   [09:00]   │
│              │   Fine:     [15:00]   │
│              │                         │
│              │ 🔔 Orari Allarmi       │
│              │   Lun-Ven:  [15:00]   │
│              │   Sabato:   [15:00]   │
│              │   Lunedì*:  [17:00]   │
│              │                         │
│              │ 📅 Giorni Lavorativi   │
│              │   ☑️ Lun ☑️ Mar ☑️ Mer  │
│              │   ☑️ Gio ☑️ Ven ☑️ Sab  │
│              │   ☐ Dom                │
│              │                         │
│              │ [💾 Salva] [🔔 Test]   │
└────────────────────────────────────────┘
```

### AlarmStats.tsx

Widget statistiche in tempo reale.

**Metriche:**
- Totale utenti attivi
- Rapporti inviati oggi
- Allarmi inviati oggi
- Utenti senza rapporto

**Screenshot:**
```
┌────────────────────────────────────────┐
│ ⏰ Statistiche Allarmi - Oggi          │
├────────────────────────────────────────┤
│  📊          ✅          🔔         ❌  │
│   2           1           1          1  │
│ Totale    Rapporti    Allarmi      Da   │
│ Utenti    Inviati     Inviati   Complet.│
└────────────────────────────────────────┘
```

### InstallPWA.tsx

Prompt per installare l'app come PWA.

**Comportamento:**
- Appare dopo 5 secondi
- Solo se app non installata
- Dismissible
- Salvata preferenza utente

## 🔧 API Endpoints

### POST `/api/alarms/check`

Controlla e invia allarmi necessari.

**Request:**
```bash
POST /api/alarms/check
```

**Response:**
```json
{
  "success": true,
  "message": "Check allarmi completato",
  "timestamp": "2025-10-19T15:00:00Z",
  "stats": {
    "before": {
      "totalUsers": 2,
      "alarmsSent": 0,
      "reportsSubmitted": 1
    },
    "after": {
      "totalUsers": 2,
      "alarmsSent": 1,
      "reportsSubmitted": 1
    },
    "alarmsSentInThisCheck": 1
  }
}
```

### GET `/api/alarms/stats`

Ottieni statistiche allarmi di oggi.

**Response:**
```json
{
  "success": true,
  "stats": {
    "totalUsers": 2,
    "alarmsToSend": 1,
    "alarmsSent": 1,
    "reportsSubmitted": 1,
    "usersWithoutReport": 1
  }
}
```

### GET/PUT `/api/alarms/config/[userId]`

Gestisce configurazione allarmi utente.

**GET Response:**
```json
{
  "success": true,
  "config": {
    "id": "...",
    "user_id": "...",
    "turno": "mattina",
    "ora_inizio": "09:00:00",
    "ora_fine": "15:00:00",
    "orario_allarme_lun_ven": "15:00:00",
    "orario_allarme_sabato": "15:00:00",
    "orario_allarme_lunedi_successivo": "17:00:00",
    "attivo": true
  }
}
```

**PUT Request:**
```json
{
  "orario_allarme_lun_ven": "16:00:00",
  "attivo": true
}
```

### POST `/api/alarms/force/[userId]`

Forza invio allarme per test.

**Response:**
```json
{
  "success": true,
  "message": "Allarme forzato inviato con successo"
}
```

## 🧪 Testing

### Test Unitari

```javascript
// Test: verifica giorno lavorativo
test('isWorkingDay returns true for working days', () => {
  const config = {
    lavora_lunedi: true,
    lavora_sabato: true,
    lavora_domenica: false
  }
  
  expect(isWorkingDay(config, 1)).toBe(true)  // Lunedì
  expect(isWorkingDay(config, 6)).toBe(true)  // Sabato
  expect(isWorkingDay(config, 0)).toBe(false) // Domenica
})
```

### Test Integrazione

```bash
# Test 1: Allarme manuale
curl -X POST http://localhost:3000/api/alarms/force/USER_ID

# Test 2: Verifica stats
curl http://localhost:3000/api/alarms/stats

# Test 3: Check automatico
curl -X POST http://localhost:3000/api/alarms/check
```

### Test E2E

1. **Scenario: Utente non ha inviato rapporto**
   ```
   ✅ Configura allarme alle 15:00
   ✅ Non inviare rapporto
   ✅ Aspetta le 15:00
   ✅ Verifica notifica ricevuta
   ```

2. **Scenario: Utente ha già inviato rapporto**
   ```
   ✅ Invia rapporto alle 14:00
   ✅ Aspetta le 15:00
   ✅ Verifica che NON arrivi notifica
   ```

3. **Scenario: Cambio orario weekend**
   ```
   ✅ Verifica allarme sabato alle 15:00
   ✅ Verifica domenica nessun allarme
   ✅ Verifica lunedì allarme alle 17:00
   ```

## 🚀 Deploy e Produzione

### Vercel

Il sistema usa Vercel Cron per chiamate automatiche:

```json
{
  "crons": [{
    "path": "/api/alarms/check",
    "schedule": "*/5 * * * *"
  }]
}
```

Questo chiama l'API ogni 5 minuti.

### Monitoring

Monitora questi KPI:

- **Tasso consegna allarmi:** % allarmi inviati con successo
- **Tempo risposta utenti:** tempo medio tra allarme e invio rapporto
- **Falsi positivi:** allarmi inviati quando non necessario
- **Performance API:** tempo risposta `/api/alarms/check`

### Logs

I log sono salvati in `log_allarmi`:

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
WHERE l.data >= CURRENT_DATE - INTERVAL '7 days'
ORDER BY l.ora_invio DESC;
```

## 📱 Conversione Android

Per convertire in app Android nativa, segui:

👉 **[ANDROID_STUDIO_GUIDE.md](./ANDROID_STUDIO_GUIDE.md)**

## 💡 Best Practices

### Configurazione Allarmi

1. **Orari realistici:** Non impostare allarmi troppo ravvicinati
2. **Buffer time:** Lascia almeno 30 min tra fine turno e allarme
3. **Limite orario:** Non inviare dopo le 18:00 (rispetto privacy)
4. **Test frequenti:** Testa ogni cambio configurazione

### Performance

1. **Cache:** Service Worker cachea risorse statiche
2. **Batch processing:** Elabora tutti gli utenti insieme
3. **Index database:** Ottimizza query con indici
4. **Lazy loading:** Carica componenti on-demand

### Sicurezza

1. **RLS Supabase:** Row Level Security abilitato
2. **Auth check:** Verifica autenticazione in ogni API
3. **Input validation:** Valida tutti gli input utente
4. **Rate limiting:** Limita chiamate API

## 🆘 Troubleshooting

### Problema: Allarmi duplicati

**Causa:** Chiamate API sovrapposte

**Soluzione:**
```javascript
// Aggiungi lock
let isChecking = false

async function checkAlarms() {
  if (isChecking) return
  isChecking = true
  
  try {
    // ... check logic
  } finally {
    isChecking = false
  }
}
```

### Problema: Notifiche non arrivano su iOS

**Causa:** iOS non supporta completamente PWA notifications

**Soluzione:**
- Usa app nativa (Capacitor/React Native)
- Oppure implementa fallback con email/SMS

### Problema: Orario sbagliato

**Causa:** Timezone non configurato

**Soluzione:**
```javascript
// Usa sempre timezone locale
import { format } from 'date-fns'
import { it } from 'date-fns/locale'

const now = new Date()
const time = format(now, 'HH:mm:ss', { locale: it })
```

## 📚 Riferimenti

- **Service Workers:** https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API
- **PWA:** https://web.dev/progressive-web-apps/
- **Supabase:** https://supabase.com/docs
- **Next.js API Routes:** https://nextjs.org/docs/api-routes/introduction
- **Vercel Cron:** https://vercel.com/docs/cron-jobs

## 🎉 Conclusione

Il Sistema Allarmi Intelligente offre:

✅ Notifiche automatiche personalizzate
✅ Logica avanzata per orari settimanali
✅ Installabilità come app nativa
✅ Pannello admin completo
✅ Log e monitoring dettagliato
✅ Scalabilità e performance

**Pronto per la produzione!** 🚀

