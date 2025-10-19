import { useEffect } from 'react'
import { notificationService } from '../lib/notificationService'

/**
 * Componente per inizializzare il sistema di allarmi e notifiche
 * Da includere nell'app principale (_app.tsx)
 */
export default function AlarmInitializer() {
  useEffect(() => {
    const initAlarmSystem = async () => {
      try {
        console.log('🚀 Inizializzazione sistema allarmi...')

        // 1. Registra il service worker
        const swRegistered = await notificationService.registerServiceWorker()
        if (swRegistered) {
          console.log('✅ Service Worker registrato')
        }

        // 2. Richiedi permesso notifiche
        const hasPermission = await notificationService.requestNotificationPermission()
        if (hasPermission) {
          console.log('✅ Permesso notifiche concesso')
        } else {
          console.log('⚠️ Permesso notifiche non concesso')
        }

        // 3. Imposta un intervallo per chiamare l'API di check allarmi
        // Ogni 60 secondi controlla se ci sono allarmi da inviare
        const checkInterval = setInterval(async () => {
          try {
            const response = await fetch('/api/alarms/check', {
              method: 'POST'
            })
            
            if (response.ok) {
              const data = await response.json()
              console.log('✅ Check allarmi completato:', data.stats)
              
              // Se sono stati inviati nuovi allarmi, mostra una notifica
              if (data.stats?.alarmsSentInThisCheck > 0) {
                console.log(`🔔 ${data.stats.alarmsSentInThisCheck} allarmi inviati`)
              }
            }
          } catch (error) {
            console.error('❌ Errore check allarmi:', error)
          }
        }, 60000) // 60 secondi

        // Cleanup
        return () => {
          clearInterval(checkInterval)
        }
      } catch (error) {
        console.error('❌ Errore inizializzazione sistema allarmi:', error)
      }
    }

    initAlarmSystem()
  }, [])

  // Questo componente non renderizza nulla
  return null
}

