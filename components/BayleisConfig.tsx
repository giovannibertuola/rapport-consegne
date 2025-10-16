'use client'

import { useState, useEffect } from 'react'
import { bayleisService, BayleisConfig } from '@/lib/bayleisService'
import { Smartphone, QrCode, CheckCircle, XCircle, RotateCcw, Loader, Wifi, WifiOff } from 'lucide-react'
import toast from 'react-hot-toast'

export default function BayleisConfig() {
  const [config, setConfig] = useState<BayleisConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [showSetupForm, setShowSetupForm] = useState(false)
  const [formData, setFormData] = useState({
    instance_id: '',
    api_key: '',
    phone_number: ''
  })

  useEffect(() => {
    loadConfig()
  }, [])

  const loadConfig = async () => {
    setLoading(true)
    try {
      const configData = await bayleisService.getConfig()
      setConfig(configData)
      
      if (!configData) {
        setShowSetupForm(true)
      }
    } catch (error) {
      console.error('Error loading Bayleis config:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSetupSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Genera QR code
      const qrCodeData = await bayleisService.generateQRCode(formData.instance_id, formData.api_key)
      if (!qrCodeData) {
        toast.error('Errore nella generazione del QR code')
        return
      }

      // Crea configurazione
      const newConfig = await bayleisService.createConfig({
        instance_id: formData.instance_id,
        api_key: formData.api_key,
        phone_number: formData.phone_number,
        qr_code: qrCodeData,
        is_connected: false
      })

      if (newConfig) {
        setConfig(newConfig)
        setQrCode(qrCodeData)
        setShowSetupForm(false)
        startConnectionCheck(newConfig)
      }
    } catch (error) {
      toast.error('Errore nella configurazione')
      console.error('Error setting up Bayleis:', error)
    } finally {
      setLoading(false)
    }
  }

  const startConnectionCheck = async (configData: BayleisConfig) => {
    setIsConnecting(true)
    
    const checkConnection = async () => {
      const isConnected = await bayleisService.checkConnectionStatus(
        configData.instance_id,
        configData.api_key
      )

      if (isConnected) {
        const updatedConfig = await bayleisService.updateConfig({
          is_connected: true,
          connected_at: new Date().toISOString()
        })
        
        if (updatedConfig) {
          setConfig(updatedConfig)
          setQrCode(null)
          setIsConnecting(false)
          toast.success('WhatsApp connesso con successo! 🎉')
        }
      } else {
        // Riprova dopo 3 secondi
        setTimeout(checkConnection, 3000)
      }
    }

    checkConnection()
  }

  const handleReset = async () => {
    if (!confirm('Sei sicuro di voler resettare la configurazione Bayleis? Dovrai rifare tutto il setup.')) {
      return
    }

    setLoading(true)
    try {
      const success = await bayleisService.resetConfig()
      if (success) {
        setConfig(null)
        setQrCode(null)
        setIsConnecting(false)
        setShowSetupForm(true)
        setFormData({
          instance_id: '',
          api_key: '',
          phone_number: ''
        })
      }
    } catch (error) {
      toast.error('Errore nel reset della configurazione')
      console.error('Error resetting config:', error)
    } finally {
      setLoading(false)
    }
  }

  const testMessage = async () => {
    if (!config || !config.is_connected) {
      toast.error('WhatsApp non è connesso')
      return
    }

    const success = await bayleisService.sendMessage(
      config.phone_number,
      '🧪 Test messaggio dal Sistema Rapporti Consegne!\n\nSe ricevi questo messaggio, la configurazione è corretta! ✅'
    )

    if (success) {
      toast.success('Messaggio di test inviato!')
    } else {
      toast.error('Errore nell\'invio del messaggio di test')
    }
  }

  if (loading && !config) {
    return (
      <div className="card">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          <Smartphone className="h-5 w-5 mr-2" />
          Configurazione WhatsApp (Bayleis)
        </h3>
        {config && (
          <button
            onClick={handleReset}
            className="inline-flex items-center px-3 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset Code
          </button>
        )}
      </div>

      {/* Setup Form */}
      {showSetupForm && (
        <form onSubmit={handleSetupSubmit} className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <h4 className="font-medium text-blue-900 mb-2">🚀 Prima configurazione</h4>
            <p className="text-sm text-blue-700">
              Inserisci i dati del tuo account Bayleis per configurare l'invio di messaggi WhatsApp automatici.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Instance ID
              </label>
              <input
                type="text"
                required
                className="input-field"
                placeholder="es: instance_123456"
                value={formData.instance_id}
                onChange={(e) => setFormData(prev => ({ ...prev, instance_id: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                API Key
              </label>
              <input
                type="password"
                required
                className="input-field"
                placeholder="La tua API key Bayleis"
                value={formData.api_key}
                onChange={(e) => setFormData(prev => ({ ...prev, api_key: e.target.value }))}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Numero di Telefono
            </label>
            <input
              type="tel"
              required
              className="input-field"
              placeholder="es: +39 123 456 7890"
              value={formData.phone_number}
              onChange={(e) => setFormData(prev => ({ ...prev, phone_number: e.target.value }))}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? (
              <>
                <Loader className="h-4 w-4 mr-2 animate-spin" />
                Generazione QR Code...
              </>
            ) : (
              <>
                <QrCode className="h-4 w-4 mr-2" />
                Genera QR Code
              </>
            )}
          </button>
        </form>
      )}

      {/* QR Code Display */}
      {qrCode && !config?.is_connected && (
        <div className="text-center space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-medium text-yellow-900 mb-2 flex items-center justify-center">
              <QrCode className="h-5 w-5 mr-2" />
              📱 Scansiona il QR Code con WhatsApp
            </h4>
            <p className="text-sm text-yellow-700 mb-4">
              1. Apri <strong>WhatsApp</strong> sul tuo telefono<br/>
              2. Vai su <strong>Impostazioni</strong> → <strong>Dispositivi collegati</strong><br/>
              3. Tocca <strong>"Collega un dispositivo"</strong><br/>
              4. Scansiona questo QR code
            </p>
            
            <div className="flex justify-center mb-4">
              <img 
                src={qrCode} 
                alt="QR Code WhatsApp" 
                className="border-2 border-gray-300 rounded-lg shadow-lg"
                width={200}
                height={200}
              />
            </div>

            {isConnecting && (
              <div className="flex items-center justify-center text-blue-600">
                <Loader className="h-4 w-4 mr-2 animate-spin" />
                In attesa di connessione...
              </div>
            )}
          </div>
        </div>
      )}

      {/* Connected Status */}
      {config?.is_connected && (
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                <div>
                  <h4 className="font-medium text-green-900">✅ Sistema Collegato</h4>
                  <p className="text-sm text-green-700">
                    WhatsApp è connesso e pronto per inviare messaggi automatici
                  </p>
                </div>
              </div>
              <Wifi className="h-6 w-6 text-green-500" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">Instance ID:</span>
              <span className="ml-2 text-gray-600">{config.instance_id}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Numero:</span>
              <span className="ml-2 text-gray-600">{config.phone_number}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Connesso il:</span>
              <span className="ml-2 text-gray-600">
                {config.connected_at ? new Date(config.connected_at).toLocaleString('it-IT') : 'N/A'}
              </span>
            </div>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={testMessage}
              className="btn-secondary flex-1"
            >
              <Smartphone className="h-4 w-4 mr-2" />
              Invia Messaggio di Test
            </button>
          </div>
        </div>
      )}

      {/* Disconnected Status */}
      {config && !config.is_connected && !qrCode && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <XCircle className="h-5 w-5 text-red-500 mr-2" />
            <div>
              <h4 className="font-medium text-red-900">❌ Sistema Non Collegato</h4>
              <p className="text-sm text-red-700">
                La connessione WhatsApp è stata persa. Usa "Reset Code" per riconfigurarla.
              </p>
            </div>
            <WifiOff className="h-6 w-6 text-red-500 ml-auto" />
          </div>
        </div>
      )}
    </div>
  )
}
