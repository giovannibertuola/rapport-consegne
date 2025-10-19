# 📱 Guida Conversione App Android con Android Studio

## 🎯 Panoramica

Questa guida ti aiuterà a convertire l'applicazione web **Rapport Consegne** in un'app Android nativa usando **Trusted Web Activity (TWA)** in Android Studio.

## 📋 Prerequisiti

### Software Necessario
1. **Android Studio** (ultima versione)
   - Download: https://developer.android.com/studio
   
2. **Java Development Kit (JDK)** 11 o superiore
   - Incluso in Android Studio
   
3. **Node.js e npm** (per build dell'app web)
   - Download: https://nodejs.org/

### Account e Credenziali
1. **Google Play Console Account** (per pubblicare l'app)
   - Costo: $25 una tantum
   - URL: https://play.google.com/console

2. **Dominio e Hosting** per l'app web
   - Es: consegne.tecnotablet.it
   - Deve supportare HTTPS

## 🚀 Passo 1: Preparazione dell'App Web

### 1.1 Deploy dell'App Web

Assicurati che l'app web sia deployata e accessibile online:

```bash
# Build dell'app
npm run build

# Deploy su Vercel (o altro hosting)
vercel --prod
```

**URL dell'app:** `https://rapport-gamma.vercel.app` (sostituisci con il tuo dominio)

### 1.2 Verifica PWA

Verifica che l'app sia una PWA valida:

1. Apri Chrome DevTools (F12)
2. Vai su **Lighthouse**
3. Seleziona **Progressive Web App**
4. Clicca **Generate report**
5. Assicurati che il punteggio PWA sia > 90

### 1.3 Configurazione Digital Asset Links

Crea il file `.well-known/assetlinks.json` nel tuo dominio per verificare l'ownership:

```json
[{
  "relation": ["delegate_permission/common.handle_all_urls"],
  "target": {
    "namespace": "android_app",
    "package_name": "it.tecnotablet.rapportconsegne",
    "sha256_cert_fingerprints": ["TUO_SHA256_FINGERPRINT"]
  }
}]
```

Il fingerprint SHA256 verrà generato nei passi successivi.

## 🏗️ Passo 2: Creazione Progetto Android Studio

### 2.1 Nuovo Progetto TWA

1. Apri **Android Studio**
2. File → **New** → **New Project**
3. Seleziona **Empty Activity**
4. Configura:
   - **Name:** Rapport Consegne
   - **Package name:** `it.tecnotablet.rapportconsegne`
   - **Save location:** `C:\Android\RapportConsegne`
   - **Language:** Java
   - **Minimum SDK:** API 23 (Android 6.0)

### 2.2 Aggiungi Dipendenze

Apri `app/build.gradle` e aggiungi:

```gradle
dependencies {
    implementation 'androidx.browser:browser:1.7.0'
    implementation 'com.google.androidbrowserhelper:androidbrowserhelper:2.5.0'
}
```

### 2.3 Modifica AndroidManifest.xml

Sostituisci il contenuto di `app/src/main/AndroidManifest.xml`:

```xml
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:tools="http://schemas.android.com/tools">

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
    <uses-permission android:name="android.permission.VIBRATE" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.AppCompat.Light.NoActionBar"
        tools:targetApi="31">

        <!-- Main Launcher Activity -->
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:launchMode="singleTask"
            android:configChanges="orientation|screenSize">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>

            <!-- Deep Links -->
            <intent-filter android:autoVerify="true">
                <action android:name="android.intent.action.VIEW" />
                <category android:name="android.intent.category.DEFAULT" />
                <category android:name="android.intent.category.BROWSABLE" />
                
                <!-- Sostituisci con il tuo dominio -->
                <data 
                    android:scheme="https"
                    android:host="rapport-gamma.vercel.app" />
            </intent-filter>

            <!-- TWA Metadata -->
            <meta-data
                android:name="android.support.customtabs.trusted.DEFAULT_URL"
                android:value="https://rapport-gamma.vercel.app" />
            
            <meta-data
                android:name="android.support.customtabs.trusted.STATUS_BAR_COLOR"
                android:resource="@color/colorPrimary" />
            
            <meta-data
                android:name="android.support.customtabs.trusted.NAVIGATION_BAR_COLOR"
                android:resource="@color/colorPrimaryDark" />
            
            <meta-data
                android:name="android.support.customtabs.trusted.SPLASH_IMAGE_DRAWABLE"
                android:resource="@drawable/splash" />
            
            <meta-data
                android:name="android.support.customtabs.trusted.SPLASH_SCREEN_BACKGROUND_COLOR"
                android:resource="@color/colorPrimary" />
            
            <meta-data
                android:name="android.support.customtabs.trusted.SPLASH_SCREEN_FADE_OUT_DURATION"
                android:value="300" />
            
            <meta-data
                android:name="android.support.customtabs.trusted.FILE_PROVIDER_AUTHORITY"
                android:value="it.tecnotablet.rapportconsegne.fileprovider" />
        </activity>

    </application>

</manifest>
```

### 2.4 MainActivity.java

Crea/modifica `app/src/main/java/it/tecnotablet/rapportconsegne/MainActivity.java`:

```java
package it.tecnotablet.rapportconsegne;

import android.net.Uri;
import android.os.Bundle;
import androidx.appcompat.app.AppCompatActivity;
import com.google.androidbrowserhelper.trusted.TwaLauncher;

public class MainActivity extends AppCompatActivity {

    private static final String TWA_URL = "https://rapport-gamma.vercel.app";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // Launch TWA
        TwaLauncher twaLauncher = new TwaLauncher(this);
        twaLauncher.launch(
            Uri.parse(TWA_URL),
            null,
            null,
            null
        );
    }
}
```

### 2.5 Colori e Risorse

Modifica `app/src/main/res/values/colors.xml`:

```xml
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="colorPrimary">#3b82f6</color>
    <color name="colorPrimaryDark">#2563eb</color>
    <color name="colorAccent">#60a5fa</color>
</resources>
```

## 🎨 Passo 3: Icone e Grafica

### 3.1 Icona Launcher

1. Crea un'icona 512x512px per l'app
2. In Android Studio: **File** → **New** → **Image Asset**
3. Seleziona **Launcher Icons (Adaptive and Legacy)**
4. Carica la tua icona
5. Genera le icone per tutte le densità

### 3.2 Splash Screen

Crea `app/src/main/res/drawable/splash.xml`:

```xml
<?xml version="1.0" encoding="utf-8"?>
<layer-list xmlns:android="http://schemas.android.com/apk/res/android">
    <item android:drawable="@color/colorPrimary"/>
    <item>
        <bitmap
            android:gravity="center"
            android:src="@mipmap/ic_launcher"/>
    </item>
</layer-list>
```

## 🔐 Passo 4: Firma e Certificati

### 4.1 Genera Keystore

```bash
keytool -genkey -v -keystore rapport-release-key.jks \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -alias rapport-consegne
```

Compila i dati richiesti:
- **Nome e cognome:** Giovanni Bertuola
- **Organizzazione:** Tecnotablet
- **Città:** [La tua città]
- **Password:** [Scegli una password sicura e SALVALA!]

### 4.2 Estrai SHA256 Fingerprint

```bash
keytool -list -v -keystore rapport-release-key.jks -alias rapport-consegne
```

Copia il valore **SHA256** che appare, esempio:
```
SHA256: A1:B2:C3:D4:E5:F6:...
```

### 4.3 Configura Signing in build.gradle

Aggiungi in `app/build.gradle`:

```gradle
android {
    signingConfigs {
        release {
            storeFile file("../rapport-release-key.jks")
            storePassword "LA_TUA_PASSWORD"
            keyAlias "rapport-consegne"
            keyPassword "LA_TUA_PASSWORD"
        }
    }
    
    buildTypes {
        release {
            minifyEnabled true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
            signingConfig signingConfigs.release
        }
    }
}
```

### 4.4 Aggiorna Asset Links

Torna al file `assetlinks.json` e inserisci il fingerprint SHA256:

```json
[{
  "relation": ["delegate_permission/common.handle_all_urls"],
  "target": {
    "namespace": "android_app",
    "package_name": "it.tecnotablet.rapportconsegne",
    "sha256_cert_fingerprints": ["A1:B2:C3:D4:E5:F6:..."]
  }
}]
```

Carica questo file su: `https://tuo-dominio.it/.well-known/assetlinks.json`

## 🏗️ Passo 5: Build e Test

### 5.1 Build Debug

1. Connetti un dispositivo Android via USB
2. Abilita **Debug USB** sul dispositivo
3. In Android Studio: **Run** → **Run 'app'**

### 5.2 Build Release (APK)

```bash
# In Android Studio:
Build → Generate Signed Bundle / APK → APK
```

Oppure da terminale:

```bash
cd android-project
./gradlew assembleRelease
```

L'APK sarà in: `app/build/outputs/apk/release/app-release.apk`

### 5.3 Build AAB (per Google Play)

```bash
./gradlew bundleRelease
```

L'AAB sarà in: `app/build/outputs/bundle/release/app-release.aab`

## 📦 Passo 6: Pubblicazione su Google Play

### 6.1 Prepara i Materiali

Prima di pubblicare, prepara:

1. **Icona dell'app** 512x512px PNG
2. **Screenshot** (almeno 2):
   - Telefono: 16:9 o 9:16
   - Tablet (opzionale): 16:9 o 9:16
3. **Grafica del feature** 1024x500px
4. **Descrizione breve** (max 80 caratteri)
5. **Descrizione completa** (max 4000 caratteri)
6. **Privacy Policy URL**

### 6.2 Google Play Console

1. Vai su: https://play.google.com/console
2. Crea un nuovo account sviluppatore ($25)
3. Clicca **Crea app**
4. Compila i dettagli:
   - **Nome app:** Rapport Consegne
   - **Lingua predefinita:** Italiano
   - **App o gioco:** App
   - **Gratuita o a pagamento:** Gratuita

### 6.3 Carica l'AAB

1. **Release** → **Produzione**
2. **Crea nuova release**
3. Carica il file AAB
4. Completa tutte le sezioni:
   - Classificazione contenuti
   - Pubblico di destinazione
   - Privacy policy
   - Autorizzazioni app
   - Categoria app

### 6.4 Test Interno/Chiuso

Prima della produzione, fai un test:

1. **Release** → **Test interno**
2. Crea una lista di email tester
3. Carica l'AAB
4. Condividi il link di test

### 6.5 Pubblica in Produzione

Quando tutto è pronto:

1. Completa tutte le sezioni richieste
2. Clicca **Invia per revisione**
3. Attendi l'approvazione (1-3 giorni)

## 🔔 Passo 7: Configurazione Notifiche Push

### 7.1 Firebase Cloud Messaging

1. Vai su: https://console.firebase.google.com
2. Crea un nuovo progetto
3. Aggiungi un'app Android
4. Package name: `it.tecnotablet.rapportconsegne`
5. Scarica `google-services.json`
6. Copia in `app/google-services.json`

### 7.2 Aggiungi Plugin Firebase

In `build.gradle` (progetto):

```gradle
buildscript {
    dependencies {
        classpath 'com.google.gms:google-services:4.4.0'
    }
}
```

In `app/build.gradle`:

```gradle
plugins {
    id 'com.google.gms.google-services'
}

dependencies {
    implementation platform('com.google.firebase:firebase-bom:32.7.0')
    implementation 'com.google.firebase:firebase-messaging'
}
```

### 7.3 Service per Notifiche

Crea `MyFirebaseMessagingService.java`:

```java
package it.tecnotablet.rapportconsegne;

import com.google.firebase.messaging.FirebaseMessagingService;
import com.google.firebase.messaging.RemoteMessage;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.os.Build;
import androidx.core.app.NotificationCompat;

public class MyFirebaseMessagingService extends FirebaseMessagingService {
    
    @Override
    public void onMessageReceived(RemoteMessage remoteMessage) {
        // Gestisci il messaggio ricevuto
        if (remoteMessage.getNotification() != null) {
            sendNotification(
                remoteMessage.getNotification().getTitle(),
                remoteMessage.getNotification().getBody()
            );
        }
    }

    private void sendNotification(String title, String message) {
        String channelId = "rapport_notifications";
        NotificationCompat.Builder builder = 
            new NotificationCompat.Builder(this, channelId)
                .setSmallIcon(R.drawable.ic_notification)
                .setContentTitle(title)
                .setContentText(message)
                .setPriority(NotificationCompat.PRIORITY_HIGH)
                .setAutoCancel(true);

        NotificationManager notificationManager = 
            (NotificationManager) getSystemService(NOTIFICATION_SERVICE);

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                channelId,
                "Rapport Notifiche",
                NotificationManager.IMPORTANCE_HIGH
            );
            notificationManager.createNotificationChannel(channel);
        }

        notificationManager.notify(0, builder.build());
    }
}
```

Aggiungi in `AndroidManifest.xml`:

```xml
<service
    android:name=".MyFirebaseMessagingService"
    android:exported="false">
    <intent-filter>
        <action android:name="com.google.firebase.MESSAGING_EVENT" />
    </intent-filter>
</service>
```

## 🔄 Passo 8: Aggiornamenti Automatici

### 8.1 Setup Vercel Cron (per API checks)

Nel file `vercel.json`:

```json
{
  "crons": [{
    "path": "/api/alarms/check",
    "schedule": "*/5 * * * *"
  }]
}
```

Questo chiama l'API ogni 5 minuti per controllare gli allarmi.

### 8.2 In-App Updates

Aggiungi in `app/build.gradle`:

```gradle
dependencies {
    implementation 'com.google.android.play:app-update:2.1.0'
}
```

In `MainActivity.java`:

```java
import com.google.android.play.core.appupdate.AppUpdateManager;
import com.google.android.play.core.appupdate.AppUpdateManagerFactory;
import com.google.android.play.core.install.model.AppUpdateType;
import com.google.android.play.core.install.model.UpdateAvailability;

private AppUpdateManager appUpdateManager;

@Override
protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    
    // Check for updates
    appUpdateManager = AppUpdateManagerFactory.create(this);
    checkForUpdates();
    
    // ... resto del codice
}

private void checkForUpdates() {
    appUpdateManager.getAppUpdateInfo().addOnSuccessListener(appUpdateInfo -> {
        if (appUpdateInfo.updateAvailability() == UpdateAvailability.UPDATE_AVAILABLE
                && appUpdateInfo.isUpdateTypeAllowed(AppUpdateType.IMMEDIATE)) {
            try {
                appUpdateManager.startUpdateFlowForResult(
                    appUpdateInfo,
                    AppUpdateType.IMMEDIATE,
                    this,
                    123
                );
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
    });
}
```

## 📊 Passo 9: Analytics e Monitoring

### 9.1 Google Analytics

```gradle
dependencies {
    implementation 'com.google.firebase:firebase-analytics'
}
```

### 9.2 Crashlytics

```gradle
dependencies {
    implementation 'com.google.firebase:firebase-crashlytics'
}
```

## 🎯 Checklist Finale

Prima di pubblicare, verifica:

- [ ] App funziona correttamente su almeno 3 dispositivi diversi
- [ ] Notifiche push funzionano
- [ ] Deep links funzionano
- [ ] Asset Links verificato (https://digitalassetlinks.googleapis.com/v1/statements:list?source.web.site=https://tuo-dominio.it)
- [ ] Icone corrette per tutte le densità
- [ ] Screenshot e materiali grafici preparati
- [ ] Privacy policy pubblicata
- [ ] Termini di servizio (se necessario)
- [ ] Testato sistema allarmi con orari reali
- [ ] Build firmato con keystore release
- [ ] Versioni corrette in build.gradle

## 🆘 Problemi Comuni

### Problema: App si apre nel browser invece che in TWA

**Soluzione:**
- Verifica il file `assetlinks.json`
- Controlla che il fingerprint SHA256 sia corretto
- Attendi qualche ora per la propagazione DNS

### Problema: Notifiche non arrivano

**Soluzione:**
- Verifica permessi in AndroidManifest.xml
- Controlla Firebase Console → Cloud Messaging
- Testa con Firebase Console → Test message

### Problema: App rifiutata da Google Play

**Soluzioni comuni:**
- Aggiungi Privacy Policy valida
- Completa tutte le dichiarazioni richieste
- Rimuovi permessi non necessari
- Fornisci screenshots di qualità

## 📞 Supporto

Per problemi tecnici:
- **Android Studio:** https://developer.android.com/studio/intro
- **TWA Documentation:** https://developer.chrome.com/docs/android/trusted-web-activity/
- **Firebase:** https://firebase.google.com/docs

## 🎉 Congratulazioni!

Se hai seguito tutti i passi, ora hai:

✅ Un'app Android nativa della tua PWA
✅ Sistema di allarmi automatici funzionante
✅ Notifiche push
✅ App pubblicata su Google Play Store
✅ Aggiornamenti automatici configurati

Buon lavoro! 🚀

