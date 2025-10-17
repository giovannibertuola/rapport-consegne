'use client'

import { useState, useEffect } from 'react'
import { Download, Smartphone, Bell, Clock, CheckCircle } from 'lucide-react'
import { notificationService } from '@/lib/notificationService'

export default function InstallApp() {
  const [isInstalled, setIsInstalled] = useState(false)
  const [canInstall, setCanInstall] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [notificationPermission, setNotificationPermission] = useState(false)

  useEffect(() => {
    // Controlla se l'app è già installata
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true)
    }

    // Controlla se può essere installata
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setCanInstall(true)
    })

    // Controlla permessi notifiche
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission === 'granted')
    }

    // Registra service worker
    notificationService.registerServiceWorker()
  }, [])

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      
      if (outcome === 'accepted') {
        console.log('App installed successfully')
        setIsInstalled(true)
        setCanInstall(false)
      }
      
      setDeferredPrompt(null)
    }
  }

  const requestNotificationPermission = async () => {
    const granted = await notificationService.requestNotificationPermission()
    setNotificationPermission(granted)
    
    if (granted) {
      // Testa la notifica
      await notificationService.sendPushNotification(
        'Benvenuto!',
        'Le notifiche sono ora attive. Riceverai promemoria per i rapporti.',
        { action: 'welcome' }
      )
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Installa l'App Rapporti
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Aggiungi l'app al tuo dispositivo per ricevere notifiche automatiche 
            e accedere rapidamente al form dei rapporti.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Benefici */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <CheckCircle className="h-6 w-6 text-green-500 mr-2" />
              Vantaggi dell'App
            </h2>
            <ul className="space-y-4">
              <li className="flex items-start">
                <Bell className="h-5 w-5 text-blue-500 mr-3 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-gray-900">Notifiche Automatiche</h3>
                  <p className="text-gray-600 text-sm">Ricevi promemoria per inviare i rapporti</p>
                </div>
              </li>
              <li className="flex items-start">
                <Smartphone className="h-5 w-5 text-blue-500 mr-3 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-gray-900">Accesso Rapido</h3>
                  <p className="text-gray-600 text-sm">Apri l'app direttamente dal desktop</p>
                </div>
              </li>
              <li className="flex items-start">
                <Clock className="h-5 w-5 text-blue-500 mr-3 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-gray-900">Funziona Offline</h3>
                  <p className="text-gray-600 text-sm">Compila i rapporti anche senza connessione</p>
                </div>
              </li>
            </ul>
          </div>

          {/* Istruzioni */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Come Installare
            </h2>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">
                  1
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Clicca "Installa App"</h3>
                  <p className="text-gray-600 text-sm">Il browser ti chiederà di installare l'app</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">
                  2
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Conferma l'Installazione</h3>
                  <p className="text-gray-600 text-sm">Segui le istruzioni del browser</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">
                  3
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Attiva le Notifiche</h3>
                  <p className="text-gray-600 text-sm">Consenti le notifiche per ricevere promemoria</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pulsanti di azione */}
        <div className="text-center space-y-4">
          {isInstalled ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-green-900 mb-2">
                App Installata!
              </h3>
              <p className="text-green-700">
                L'app è stata installata con successo. Puoi trovarla nel tuo desktop o nella schermata home.
              </p>
            </div>
          ) : canInstall ? (
            <button
              onClick={handleInstall}
              className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center mx-auto"
            >
              <Download className="h-6 w-6 mr-2" />
              Installa App
            </button>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <h3 className="text-lg font-bold text-yellow-900 mb-2">
                Installazione non disponibile
              </h3>
              <p className="text-yellow-700">
                L'installazione non è disponibile su questo dispositivo. 
                Puoi comunque usare l'app nel browser.
              </p>
            </div>
          )}

          {!notificationPermission && (
            <div className="mt-6">
              <button
                onClick={requestNotificationPermission}
                className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 flex items-center mx-auto"
              >
                <Bell className="h-5 w-5 mr-2" />
                Attiva Notifiche
              </button>
            </div>
          )}

          {notificationPermission && (
            <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center justify-center">
                <Bell className="h-5 w-5 text-green-500 mr-2" />
                <span className="text-green-700 font-semibold">
                  Notifiche attivate con successo!
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Link diretti */}
        <div className="mt-12 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Link Diretti per Corrieri
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Giovanni Bertuola</h3>
              <p className="text-sm text-gray-600 mb-2">Turno: Mattina</p>
              <a 
                href="/rapporto/bertuola@tecnotablet.it"
                className="text-blue-600 hover:text-blue-800 text-sm break-all"
              >
                /rapporto/bertuola@tecnotablet.it
              </a>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Ramadori</h3>
              <p className="text-sm text-gray-600 mb-2">Turno: Pomeriggio</p>
              <a 
                href="/rapporto/ramadori@tecnotablet.it"
                className="text-blue-600 hover:text-blue-800 text-sm break-all"
              >
                /rapporto/ramadori@tecnotablet.it
              </a>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-4 text-center">
            Salva questi link sui dispositivi dei corrieri per accesso rapido al form.
          </p>
        </div>
      </div>
    </div>
  )
}
