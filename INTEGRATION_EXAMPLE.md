# 🔌 Esempio Integrazione Componenti

Questa guida mostra come integrare tutti i componenti del sistema allarmi nella tua applicazione.

## 📁 Struttura File Creati

```
rapport/
├── components/
│   ├── AlarmInitializer.tsx      ← Inizializzatore allarmi (background)
│   ├── AlarmConfigPanel.tsx      ← Pannello admin configurazione
│   ├── AlarmStats.tsx             ← Widget statistiche
│   └── InstallPWA.tsx             ← Prompt installazione app
│
├── lib/
│   ├── advancedAlarmService.ts   ← Service logica allarmi
│   ├── notificationService.ts    ← Service notifiche push
│   └── supabase.ts                ← Client Supabase
│
├── pages/
│   └── api/
│       └── alarms/
│           ├── check.ts           ← API check allarmi
│           ├── stats.ts           ← API statistiche
│           ├── config/
│           │   └── [userId].ts    ← API configurazione utente
│           ├── logs/
│           │   └── [userId].ts    ← API log allarmi
│           └── force/
│               └── [userId].ts    ← API test manuale
│
├── public/
│   ├── sw.js                      ← Service Worker
│   ├── manifest.json              ← PWA Manifest
│   ├── icon-192x192.png
│   └── icon-512x512.png
│
├── database/
│   └── advanced_alarms_schema.sql ← Schema database
│
└── docs/
    ├── QUICK_START.md             ← Guida rapida
    ├── ANDROID_STUDIO_GUIDE.md    ← Guida Android
    └── SISTEMA_ALLARMI.md         ← Documentazione completa
```

## 🔧 Step 1: Integra in _app.tsx

Modifica il tuo file `_app.tsx` (o `app/layout.tsx` per App Router):

```typescript
// pages/_app.tsx
import type { AppProps } from 'next/app'
import { useEffect } from 'react'
import AlarmInitializer from '../components/AlarmInitializer'
import InstallPWA from '../components/InstallPWA'
import '../styles/globals.css'

export default function App({ Component, pageProps }: AppProps) {
  // Registra Service Worker al mount
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').then(
        (registration) => {
          console.log('✅ Service Worker registered:', registration)
        },
        (err) => {
          console.error('❌ Service Worker registration failed:', err)
        }
      )
    }
  }, [])

  return (
    <>
      {/* Sistema allarmi - runs in background */}
      <AlarmInitializer />
      
      {/* Prompt installazione PWA */}
      <InstallPWA />
      
      {/* La tua app */}
      <Component {...pageProps} />
    </>
  )
}
```

## 🎨 Step 2: Aggiungi al Pannello Admin

Nel tuo componente admin esistente (es: `components/AdminPanel.tsx`):

```typescript
import { useState } from 'react'
import AlarmConfigPanel from './AlarmConfigPanel'
import AlarmStats from './AlarmStats'
import { Bell, Settings } from 'lucide-react'

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('dashboard')

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-md p-4">
        <div className="flex space-x-4">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-2 rounded-lg ${
              activeTab === 'dashboard' 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Dashboard
          </button>
          
          <button
            onClick={() => setActiveTab('alarms')}
            className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
              activeTab === 'alarms' 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Bell size={18} />
            <span>Allarmi</span>
          </button>
          
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-lg ${
              activeTab === 'users' 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Utenti
          </button>
        </div>
      </nav>

      {/* Content */}
      <div className="container mx-auto p-6">
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
            
            {/* Statistiche Allarmi */}
            <AlarmStats />
            
            {/* Altri widget dashboard... */}
          </div>
        )}

        {activeTab === 'alarms' && (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold mb-6">Gestione Allarmi</h1>
            
            {/* Configurazione Allarmi */}
            <AlarmConfigPanel />
          </div>
        )}

        {activeTab === 'users' && (
          <div className="space-y-6">
            {/* Gestione utenti esistente */}
          </div>
        )}
      </div>
    </div>
  )
}
```

## 📱 Step 3: Aggiungi Meta Tags per PWA

Nel tuo `_document.tsx` (o `app/layout.tsx`):

```typescript
import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="it">
      <Head>
        {/* PWA Meta Tags */}
        <meta name="application-name" content="Rapport Consegne" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Rapport Consegne" />
        <meta name="description" content="Sistema rapporti consegne con allarmi automatici" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#3b82f6" />

        {/* PWA Icons */}
        <link rel="icon" type="image/png" sizes="192x192" href="/icon-192x192.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/icon-512x512.png" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
        
        {/* PWA Manifest */}
        <link rel="manifest" href="/manifest.json" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
```

## 🗄️ Step 4: Setup Database

Esegui lo schema SQL su Supabase:

```bash
# 1. Vai su Supabase Dashboard
# 2. Vai su SQL Editor
# 3. Copia il contenuto di database/advanced_alarms_schema.sql
# 4. Esegui
```

Oppure via CLI:

```bash
supabase db push --file database/advanced_alarms_schema.sql
```

## 🎯 Step 5: Test Completo

### Test 1: Verifica Service Worker

Apri Chrome DevTools (F12) → Application → Service Workers

Dovresti vedere:
```
✅ sw.js - activated and is running
```

### Test 2: Test Notifiche

```javascript
// Nella console del browser (F12)
Notification.requestPermission().then(permission => {
  if (permission === "granted") {
    new Notification("Test", { body: "Funziona!" })
  }
})
```

### Test 3: Test Allarme Manuale

1. Vai al Pannello Admin → Allarmi
2. Seleziona un utente
3. Clicca "Test Allarme"
4. Verifica che arrivi la notifica

### Test 4: Test Automatico

1. Configura un allarme tra 2 minuti
2. NON inviare il rapporto
3. Aspetta
4. Dovresti ricevere la notifica automaticamente

## 🔌 Step 6: API Client (Optional)

Crea un client per le API allarmi:

```typescript
// lib/alarmClient.ts
export class AlarmClient {
  private baseUrl = '/api/alarms'

  async checkAlarms() {
    const res = await fetch(`${this.baseUrl}/check`, { method: 'POST' })
    return res.json()
  }

  async getStats() {
    const res = await fetch(`${this.baseUrl}/stats`)
    return res.json()
  }

  async getUserConfig(userId: string) {
    const res = await fetch(`${this.baseUrl}/config/${userId}`)
    return res.json()
  }

  async updateUserConfig(userId: string, config: any) {
    const res = await fetch(`${this.baseUrl}/config/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config)
    })
    return res.json()
  }

  async forceAlarm(userId: string) {
    const res = await fetch(`${this.baseUrl}/force/${userId}`, {
      method: 'POST'
    })
    return res.json()
  }

  async getUserLogs(userId: string, limit = 30) {
    const res = await fetch(`${this.baseUrl}/logs/${userId}?limit=${limit}`)
    return res.json()
  }
}

export const alarmClient = new AlarmClient()
```

Usa nel componente:

```typescript
import { alarmClient } from '../lib/alarmClient'

function MyComponent() {
  const handleTestAlarm = async (userId: string) => {
    const result = await alarmClient.forceAlarm(userId)
    if (result.success) {
      toast.success('Allarme inviato!')
    }
  }
  
  // ...
}
```

## 📊 Step 7: Dashboard Stats Widget

Aggiungi widget stats nella home:

```typescript
// components/Dashboard.tsx
import AlarmStats from './AlarmStats'

export default function Dashboard() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      
      {/* Stats Allarmi */}
      <AlarmStats />
      
      {/* Form Rapporto */}
      <RapportiForm />
      
      {/* Altri componenti... */}
    </div>
  )
}
```

## 🚀 Step 8: Deploy

### Vercel

```bash
# 1. Commit tutti i file
git add .
git commit -m "Add advanced alarm system"

# 2. Push
git push origin main

# 3. Deploy automatico su Vercel
# oppure manualmente:
vercel --prod
```

### Variabili d'Ambiente

Assicurati di avere su Vercel:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
```

### Verifica Cron Job

Dopo il deploy, verifica che il cron sia attivo:

1. Vai su Vercel Dashboard
2. Progetto → Settings → Cron Jobs
3. Dovresti vedere:
   ```
   /api/alarms/check - */5 * * * * (every 5 minutes)
   ```

## ✅ Checklist Finale

Prima di andare live, verifica:

- [ ] Database schema eseguito su Supabase
- [ ] Service Worker registrato correttamente
- [ ] Notifiche push funzionanti
- [ ] AlarmInitializer montato in _app.tsx
- [ ] AlarmConfigPanel accessibile agli admin
- [ ] AlarmStats visibile in dashboard
- [ ] API endpoints rispondono correttamente
- [ ] Cron job configurato su Vercel
- [ ] Test manuale allarmi funzionante
- [ ] Test automatico verificato
- [ ] PWA installabile su mobile
- [ ] Icone 192x192 e 512x512 presenti
- [ ] Manifest.json configurato
- [ ] Meta tags PWA aggiunti

## 🎯 Esempio Flusso Completo

### Scenario: Nuovo utente

1. **Admin aggiunge utente**
   ```typescript
   // Il trigger SQL crea automaticamente la configurazione allarmi
   ```

2. **Admin configura orari**
   - Va su Pannello Admin → Allarmi
   - Seleziona l'utente
   - Imposta orari personalizzati
   - Salva

3. **Sistema inizia monitoraggio**
   - Ogni 30 secondi controlla se è ora di inviare allarmi
   - Se sì, verifica condizioni
   - Se tutto OK, invia notifica

4. **Utente riceve notifica**
   - Notifica push sul dispositivo
   - Click apre l'app
   - Compila e invia rapporto

5. **Sistema registra**
   - Aggiorna `stato_rapporti_giornalieri`
   - Salva in `log_allarmi`
   - Non invia più allarmi per oggi

## 💡 Tips Avanzati

### Performance

```typescript
// Usa React.memo per componenti pesanti
export default React.memo(AlarmConfigPanel)

// Lazy load componenti admin
const AlarmConfigPanel = dynamic(() => import('./AlarmConfigPanel'), {
  loading: () => <div>Caricamento...</div>
})
```

### Error Handling

```typescript
// Wrapper con error boundary
function AlarmConfigPanelWrapper() {
  return (
    <ErrorBoundary fallback={<ErrorFallback />}>
      <AlarmConfigPanel />
    </ErrorBoundary>
  )
}
```

### Analytics

```typescript
// Track eventi allarmi
import { analytics } from '../lib/analytics'

async function sendAlarm(userId: string) {
  await notificationService.sendPush(...)
  
  // Track evento
  analytics.track('alarm_sent', {
    userId,
    type: 'automatic',
    timestamp: new Date()
  })
}
```

## 🆘 Troubleshooting

### Problema: AlarmInitializer non parte

**Verifica:**
```typescript
// In _app.tsx
console.log('AlarmInitializer mounted:', !!AlarmInitializer)
```

**Soluzione:** Assicurati che sia importato correttamente

### Problema: API non raggiungibile

**Verifica:**
```bash
curl http://localhost:3000/api/alarms/stats
```

**Soluzione:** Controlla che i file API siano nella giusta posizione

### Problema: Database errore

**Verifica:**
```sql
SELECT * FROM allarmi_operatori;
```

**Soluzione:** Riesegui lo schema SQL

## 📚 Prossimi Passi

1. ✅ Integrazione completata
2. 🧪 Test completo del sistema
3. 📱 [Converti in app Android](./ANDROID_STUDIO_GUIDE.md)
4. 🚀 Deploy in produzione
5. 📊 Monitora metriche

## 🎉 Fatto!

Il sistema è ora completamente integrato! 🚀

Per domande o supporto, consulta:
- [QUICK_START.md](./QUICK_START.md) - Guida rapida
- [SISTEMA_ALLARMI.md](./SISTEMA_ALLARMI.md) - Documentazione completa
- [ANDROID_STUDIO_GUIDE.md](./ANDROID_STUDIO_GUIDE.md) - Conversione Android

