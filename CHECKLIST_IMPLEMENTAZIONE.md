# ✅ Checklist Implementazione Sistema Allarmi

## 📋 Checklist Completa

Usa questa checklist per implementare passo-passo il sistema di allarmi.

---

## 🗄️ FASE 1: Database Setup

### ☐ Step 1.1: Accedi a Supabase
- [ ] Apri [Supabase Dashboard](https://supabase.com/dashboard)
- [ ] Seleziona il tuo progetto
- [ ] Vai su **SQL Editor**

### ☐ Step 1.2: Esegui Schema SQL
- [ ] Apri il file: `database/advanced_alarms_schema.sql`
- [ ] Copia **TUTTO** il contenuto
- [ ] Incolla nell'editor SQL
- [ ] Clicca **RUN** o **Execute**

### ☐ Step 1.3: Verifica Tabelle Create
- [ ] Vai su **Table Editor**
- [ ] Verifica presenza tabella `allarmi_operatori`
- [ ] Verifica presenza tabella `log_allarmi`
- [ ] Verifica presenza tabella `stato_rapporti_giornalieri`

### ☐ Step 1.4: Verifica Dati Iniziali
- [ ] Apri tabella `allarmi_operatori`
- [ ] Dovresti vedere 2 righe (Ramadori e Peroni)
- [ ] Verifica che i campi siano popolati

**✅ FASE 1 COMPLETATA**

---

## 💻 FASE 2: Test Locale

### ☐ Step 2.1: Avvia Applicazione
```bash
cd C:\Users\Giovanni\Desktop\rapport
npm install
npm run dev
```
- [ ] Terminale mostra: "ready - started server on 0.0.0.0:3000"
- [ ] Nessun errore nel terminale

### ☐ Step 2.2: Apri Browser
- [ ] Vai su: http://localhost:3000
- [ ] L'app si carica correttamente
- [ ] Nessun errore nella console (F12)

### ☐ Step 2.3: Verifica Service Worker
- [ ] Apri DevTools (F12)
- [ ] Vai su **Application** → **Service Workers**
- [ ] Dovresti vedere `sw.js` con stato "activated"

### ☐ Step 2.4: Test Permessi Notifiche
- [ ] In console (F12) digita: `Notification.requestPermission()`
- [ ] Clicca "Consenti" quando richiesto
- [ ] Test: `new Notification("Test", {body: "Funziona!"})`
- [ ] Dovresti vedere la notifica

**✅ FASE 2 COMPLETATA**

---

## 🔌 FASE 3: Integrazione Componenti

### ☐ Step 3.1: Modifica _app.tsx

**File:** `pages/_app.tsx`

```typescript
// Aggiungi in cima
import AlarmInitializer from '../components/AlarmInitializer'
import InstallPWA from '../components/InstallPWA'

// Nel return, prima di <Component>
<AlarmInitializer />
<InstallPWA />
```

- [ ] File modificato
- [ ] Nessun errore TypeScript
- [ ] App si ricarica correttamente

### ☐ Step 3.2: Aggiungi Meta Tags PWA

**File:** `pages/_document.tsx` (o `app/layout.tsx`)

```typescript
<meta name="theme-color" content="#3b82f6" />
<link rel="manifest" href="/manifest.json" />
<link rel="icon" href="/icon-192x192.png" />
```

- [ ] Meta tags aggiunti
- [ ] File salvato

### ☐ Step 3.3: Integra nel Pannello Admin

**Nel tuo componente admin esistente:**

```typescript
import AlarmConfigPanel from '../components/AlarmConfigPanel'
import AlarmStats from '../components/AlarmStats'

// Aggiungi dove vuoi
<AlarmStats />
<AlarmConfigPanel />
```

- [ ] Componenti importati
- [ ] Aggiunti nel layout
- [ ] Nessun errore

**✅ FASE 3 COMPLETATA**

---

## 🧪 FASE 4: Test Funzionalità

### ☐ Step 4.1: Test API Endpoints

**Test 1: Stats**
```bash
curl http://localhost:3000/api/alarms/stats
```
- [ ] Risposta JSON ricevuta
- [ ] Contiene: totalUsers, alarmsSent, etc.

**Test 2: Check**
```bash
curl -X POST http://localhost:3000/api/alarms/check
```
- [ ] Risposta: "success": true
- [ ] Stats aggiornate

### ☐ Step 4.2: Test Componente Stats

- [ ] Apri la dashboard admin
- [ ] Vedi il widget **AlarmStats**
- [ ] Mostra: Totale Utenti, Rapporti Inviati, etc.
- [ ] Numeri sono corretti

### ☐ Step 4.3: Test Pannello Configurazione

- [ ] Apri il pannello **Configurazione Allarmi**
- [ ] Vedi lista utenti (Ramadori, Peroni)
- [ ] Clicca su un utente
- [ ] Vedi form configurazione caricato
- [ ] Cambia un orario
- [ ] Clicca **Salva**
- [ ] Messaggio successo appare

### ☐ Step 4.4: Test Allarme Manuale

- [ ] Nel pannello configurazione
- [ ] Seleziona un utente
- [ ] Clicca **Test Allarme**
- [ ] ✅ Ricevi notifica push!

**✅ FASE 4 COMPLETATA**

---

## 🎯 FASE 5: Test Scenario Completo

### ☐ Scenario Test: Allarme Automatico

**Setup:**
- [ ] Configura allarme tra 2 minuti (ora attuale + 2)
- [ ] NON inviare il rapporto

**Esecuzione:**
- [ ] Aspetta 2 minuti
- [ ] ✅ Ricevi notifica automaticamente

**Verifica:**
- [ ] Vai su Admin → Statistiche Allarmi
- [ ] "Allarmi Inviati Oggi" incrementato di 1

### ☐ Scenario Test: Rapporto Inviato

**Setup:**
- [ ] Configura allarme tra 1 minuto
- [ ] INVIA il rapporto prima

**Esecuzione:**
- [ ] Aspetta 1 minuto
- [ ] ❌ NON ricevi notifica (corretto!)

**Verifica:**
- [ ] Controlla log: motivo_skip = "Rapporto già inviato"

### ☐ Scenario Test: Fuori Orario

**Setup:**
- [ ] Configura limite_orario_invio = "18:00"
- [ ] Simula orario > 18:00 (cambia temporaneamente orario sistema)

**Esecuzione:**
- [ ] Prova ad inviare allarme

**Verifica:**
- [ ] ❌ Allarme NON inviato (corretto!)

**✅ FASE 5 COMPLETATA**

---

## 📱 FASE 6: Test PWA

### ☐ Step 6.1: Installazione Android

- [ ] Apri app in Chrome (su Android)
- [ ] Clicca 3 puntini → "Installa app"
- [ ] App appare in home screen
- [ ] Apri app dalla home
- [ ] Funziona come app nativa

### ☐ Step 6.2: Installazione iOS

- [ ] Apri app in Safari (su iPhone)
- [ ] Clicca "Condividi"
- [ ] "Aggiungi a Home"
- [ ] App appare in home screen
- [ ] Apri app dalla home
- [ ] Funziona

### ☐ Step 6.3: Test Offline

- [ ] Apri app
- [ ] Disattiva Wi-Fi/Dati
- [ ] L'app continua a funzionare (almeno parzialmente)
- [ ] Service Worker serve dalla cache

**✅ FASE 6 COMPLETATA**

---

## 🚀 FASE 7: Deploy Produzione

### ☐ Step 7.1: Commit Codice

```bash
git add .
git commit -m "Add advanced alarm system with PWA"
git push origin main
```

- [ ] Tutti i file commitati
- [ ] Push su repository riuscito

### ☐ Step 7.2: Deploy Vercel

**Automatico:**
- [ ] Vercel fa deploy automaticamente
- [ ] Attendi completamento (1-2 minuti)

**Manuale:**
```bash
vercel --prod
```
- [ ] Deploy completato
- [ ] URL produzione ricevuto

### ☐ Step 7.3: Verifica Deploy

- [ ] Apri URL produzione
- [ ] App si carica correttamente
- [ ] Test login
- [ ] Test un componente

### ☐ Step 7.4: Verifica Variabili d'Ambiente

- [ ] Vercel Dashboard → Settings → Environment Variables
- [ ] `NEXT_PUBLIC_SUPABASE_URL` presente
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` presente

### ☐ Step 7.5: Verifica Cron Job

- [ ] Vercel Dashboard → Settings → Cron Jobs
- [ ] Vedi: `/api/alarms/check`
- [ ] Schedule: `*/5 * * * *` (ogni 5 minuti)
- [ ] Status: Active

**✅ FASE 7 COMPLETATA**

---

## 🔍 FASE 8: Monitoraggio Produzione

### ☐ Step 8.1: Test Produzione

- [ ] Apri app produzione
- [ ] Abilita notifiche
- [ ] Test allarme manuale
- [ ] ✅ Funziona

### ☐ Step 8.2: Verifica Cron Funziona

**Dopo 5-10 minuti:**
- [ ] Vai su Vercel → Logs
- [ ] Vedi chiamate a `/api/alarms/check`
- [ ] Status: 200 OK

### ☐ Step 8.3: Verifica Database

**Su Supabase:**
```sql
SELECT * FROM log_allarmi 
ORDER BY ora_invio DESC 
LIMIT 10;
```

- [ ] Vedi record nel log
- [ ] Dati corretti

### ☐ Step 8.4: Monitoraggio Giornaliero

**Setup dashboard:**
- [ ] Segna URL produzione nei bookmark
- [ ] Imposta reminder giornaliero
- [ ] Controlla statistiche ogni giorno

**✅ FASE 8 COMPLETATA**

---

## 📱 FASE 9 (OPZIONALE): App Android

### ☐ Decisione

- [ ] Vuoi un'app Android nativa?
- [ ] Vuoi pubblicare su Google Play Store?

**Se SÌ:**
- [ ] Leggi: `ANDROID_STUDIO_GUIDE.md`
- [ ] Segui la guida passo-passo
- [ ] Tempo stimato: 2-3 ore

**Se NO:**
- [ ] La PWA è sufficiente!
- [ ] Gli utenti possono installarla dal browser

**✅ FASE 9 COMPLETATA (o skippata)**

---

## 🎓 FASE 10: Formazione Team

### ☐ Documento Utente Admin

- [ ] Crea guida per admin:
  - Come configurare allarmi
  - Come leggere statistiche
  - Come testare allarmi

### ☐ Documento Utente Operatore

- [ ] Crea guida per operatori:
  - Come installare PWA
  - Come abilitare notifiche
  - Cosa fare quando arriva allarme

### ☐ Formazione

- [ ] Mostra il sistema agli admin
- [ ] Spiega come configurare
- [ ] Fai test insieme
- [ ] Rispondi a domande

**✅ FASE 10 COMPLETATA**

---

## 🎉 CHECKLIST FINALE

### ☐ Verifica Completa Sistema

- [ ] ✅ Database configurato
- [ ] ✅ App funzionante in locale
- [ ] ✅ Componenti integrati
- [ ] ✅ API funzionanti
- [ ] ✅ Test completati
- [ ] ✅ PWA installabile
- [ ] ✅ Deploy produzione
- [ ] ✅ Cron job attivo
- [ ] ✅ Monitoraggio configurato
- [ ] ✅ (Opzionale) App Android

### ☐ Documentazione

- [ ] ✅ START_HERE.md letto
- [ ] ✅ QUICK_START.md consultato
- [ ] ✅ SISTEMA_ALLARMI.md compreso
- [ ] ⏳ ANDROID_STUDIO_GUIDE.md (se necessario)

### ☐ Sistema Operativo

- [ ] ✅ Allarmi automatici funzionanti
- [ ] ✅ Notifiche push attive
- [ ] ✅ Statistiche in tempo reale
- [ ] ✅ Log completo
- [ ] ✅ Admin può configurare

### ☐ Pronto per Produzione

- [ ] ✅ Testato con utenti reali
- [ ] ✅ Orari configurati correttamente
- [ ] ✅ Team formato
- [ ] ✅ Monitoraggio attivo

---

## 📊 Metriche da Monitorare

### Giornalmente

- [ ] **Totale allarmi inviati** (deve essere ragionevole)
- [ ] **% rapporti inviati** (obiettivo: 100%)
- [ ] **Tempo medio risposta** (tra allarme e invio)

### Settimanalmente

- [ ] **Allarmi non inviati** (motivi)
- [ ] **Errori API** (se presenti)
- [ ] **Feedback utenti** (ricevuto)

### Mensilmente

- [ ] **Trend rapporti in tempo**
- [ ] **Efficacia allarmi**
- [ ] **Necessità regolazioni orari**

---

## 🆘 Cosa Fare Se...

### ❌ Database non si connette

**Soluzione:**
1. Verifica variabili d'ambiente
2. Controlla Supabase status
3. Rigenera API keys se necessario

### ❌ Notifiche non arrivano

**Soluzione:**
1. Verifica permessi browser
2. Controlla Service Worker
3. Test allarme manuale
4. Verifica log_allarmi

### ❌ Cron job non funziona

**Soluzione:**
1. Vercel Dashboard → Logs
2. Cerca errori
3. Test API manualmente
4. Verifica vercel.json

### ❌ PWA non installabile

**Soluzione:**
1. Verifica manifest.json
2. Controlla icone presenti
3. HTTPS obbligatorio
4. Audit Lighthouse

---

## 🎯 Obiettivi Raggiunti

Al completamento di questa checklist avrai:

✅ **Sistema allarmi automatico completo**
✅ **Notifiche push funzionanti**
✅ **PWA installabile**
✅ **Pannello admin professionale**
✅ **Monitoraggio e statistiche**
✅ **Documentazione completa**
✅ **Sistema scalabile e manutenibile**

---

## 🚀 Inizia Ora!

Stampa questa checklist e segui step-by-step.

**Tempo totale stimato:**
- Setup iniziale: 30-45 minuti
- Test: 30 minuti
- Deploy: 15 minuti
- Totale: **1.5-2 ore**

**Buon lavoro! 🎉**

