import { useEffect, useState } from 'react'
import { X, Download, Smartphone } from 'lucide-react'

/**
 * Componente per mostrare il prompt di installazione PWA
 */
export default function InstallPWA() {
  const [installPrompt, setInstallPrompt] = useState<any>(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    // Controlla se l'app è già installata
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true)
      return
    }

    // Ascolta l'evento beforeinstallprompt
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault()
      setInstallPrompt(e)
      
      // Mostra il prompt dopo 5 secondi
      setTimeout(() => {
        setShowPrompt(true)
      }, 5000)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstall)

    // Ascolta l'evento di installazione completata
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true)
      setShowPrompt(false)
      console.log('✅ PWA installata con successo!')
    })

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall)
    }
  }, [])

  const handleInstall = async () => {
    if (!installPrompt) {
      return
    }

    // Mostra il prompt di installazione nativo
    installPrompt.prompt()

    // Aspetta la scelta dell'utente
    const { outcome } = await installPrompt.userChoice
    console.log(`User response to the install prompt: ${outcome}`)

    // Reset del prompt
    setInstallPrompt(null)
    setShowPrompt(false)
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    // Salva nelle preferenze che l'utente ha rifiutato
    localStorage.setItem('pwa-install-dismissed', 'true')
  }

  // Non mostrare nulla se già installata o se non c'è il prompt
  if (isInstalled || !showPrompt) {
    return null
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-white rounded-lg shadow-2xl border border-gray-200 p-4 z-50 animate-slide-up">
      <button
        onClick={handleDismiss}
        className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition-colors"
        aria-label="Chiudi"
      >
        <X size={20} />
      </button>

      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0 bg-blue-100 rounded-full p-3">
          <Smartphone className="w-6 h-6 text-blue-600" />
        </div>

        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            Installa l'App
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Installa Rapport Consegne sul tuo dispositivo per un accesso più rapido e notifiche push!
          </p>

          <div className="flex space-x-2">
            <button
              onClick={handleInstall}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              <Download size={18} />
              <span>Installa</span>
            </button>
            <button
              onClick={handleDismiss}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
            >
              Dopo
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}

