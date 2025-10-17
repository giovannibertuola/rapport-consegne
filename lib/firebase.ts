// Firebase Configuration for Push Notifications
import { initializeApp, getApps, FirebaseApp } from 'firebase/app'
import { getMessaging, getToken, onMessage, Messaging, MessagePayload } from 'firebase/messaging'

// Configurazione Firebase
// NOTA: Queste credenziali devono essere aggiunte come variabili d'ambiente
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

let app: FirebaseApp | undefined
let messaging: Messaging | undefined

// Inizializza Firebase
export const initializeFirebase = () => {
  if (typeof window !== 'undefined' && !getApps().length) {
    app = initializeApp(firebaseConfig)
  }
  return app
}

// Ottieni il token FCM per le notifiche push
export const getFCMToken = async (): Promise<string | null> => {
  try {
    if (typeof window === 'undefined') return null
    
    const app = initializeFirebase()
    if (!app) return null

    messaging = getMessaging(app)
    
    // Richiedi permesso per le notifiche
    const permission = await Notification.requestPermission()
    
    if (permission === 'granted') {
      const token = await getToken(messaging, {
        vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
      })
      
      console.log('FCM Token:', token)
      return token
    } else {
      console.log('Notification permission denied')
      return null
    }
  } catch (error) {
    console.error('Error getting FCM token:', error)
    return null
  }
}

// Ascolta i messaggi in foreground
export const onMessageListener = () =>
  new Promise<MessagePayload>((resolve) => {
    if (typeof window === 'undefined') return
    
    const app = initializeFirebase()
    if (!app) return

    messaging = getMessaging(app)
    
    onMessage(messaging, (payload) => {
      console.log('Message received:', payload)
      resolve(payload)
    })
  })

// Funzione helper per inviare notifica
export const sendNotificationToUser = async (
  userId: string,
  title: string,
  body: string,
  data?: Record<string, string>
) => {
  try {
    // Questa chiamata andrà al tuo backend che invierà la notifica tramite Firebase Admin SDK
    const response = await fetch('/api/notifications/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        title,
        body,
        data,
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to send notification')
    }

    return await response.json()
  } catch (error) {
    console.error('Error sending notification:', error)
    throw error
  }
}

