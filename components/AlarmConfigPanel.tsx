import { useState, useEffect } from 'react'
import { Clock, Save, Bell, Calendar, User, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'

interface AlarmConfig {
  id: string
  user_id: string
  turno: 'mattina' | 'pomeriggio' | 'giornaliero'
  ora_inizio: string
  ora_fine: string
  orario_allarme_lun_ven: string
  orario_allarme_sabato: string
  orario_allarme_lunedi_successivo: string | null
  lavora_lunedi: boolean
  lavora_martedi: boolean
  lavora_mercoledi: boolean
  lavora_giovedi: boolean
  lavora_venerdi: boolean
  lavora_sabato: boolean
  lavora_domenica: boolean
  attivo: boolean
  invia_dopo_orario: boolean
  limite_orario_invio: string
}

interface User {
  id: string
  nome: string
  cognome: string
  email: string
  turno: string | null
}

export default function AlarmConfigPanel() {
  const [users, setUsers] = useState<User[]>([])
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [config, setConfig] = useState<AlarmConfig | null>(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  // Carica lista utenti
  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      const response = await fetch('/api/utenti')
      if (response.ok) {
        const data = await response.json()
        setUsers(data.filter((u: User) => u.turno))
      }
    } catch (error) {
      console.error('Errore caricamento utenti:', error)
      toast.error('Errore nel caricamento degli utenti')
    }
  }

  const loadUserConfig = async (userId: string) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/alarms/config/${userId}`)
      if (response.ok) {
        const data = await response.json()
        setConfig(data.config)
      } else {
        toast.error('Configurazione non trovata')
        setConfig(null)
      }
    } catch (error) {
      console.error('Errore caricamento config:', error)
      toast.error('Errore nel caricamento della configurazione')
    } finally {
      setLoading(false)
    }
  }

  const handleUserSelect = (user: User) => {
    setSelectedUser(user)
    loadUserConfig(user.id)
  }

  const handleSave = async () => {
    if (!selectedUser || !config) return

    setSaving(true)
    try {
      const response = await fetch(`/api/alarms/config/${selectedUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(config)
      })

      if (response.ok) {
        toast.success('Configurazione salvata con successo!')
      } else {
        toast.error('Errore nel salvataggio')
      }
    } catch (error) {
      console.error('Errore salvataggio:', error)
      toast.error('Errore nel salvataggio della configurazione')
    } finally {
      setSaving(false)
    }
  }

  const handleForceAlarm = async () => {
    if (!selectedUser) return

    try {
      const response = await fetch(`/api/alarms/force/${selectedUser.id}`, {
        method: 'POST'
      })

      if (response.ok) {
        toast.success('Allarme inviato con successo!')
      } else {
        toast.error('Errore nell\'invio dell\'allarme')
      }
    } catch (error) {
      console.error('Errore invio allarme:', error)
      toast.error('Errore nell\'invio dell\'allarme')
    }
  }

  const updateConfig = (field: keyof AlarmConfig, value: any) => {
    if (!config) return
    setConfig({
      ...config,
      [field]: value
    })
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Bell className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">
            Configurazione Allarmi
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Lista Utenti */}
        <div className="md:col-span-1">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <User className="w-5 h-5 mr-2" />
            Utenti
          </h3>
          <div className="space-y-2">
            {users.map((user) => (
              <button
                key={user.id}
                onClick={() => handleUserSelect(user)}
                className={`w-full text-left p-3 rounded-lg transition-colors ${
                  selectedUser?.id === user.id
                    ? 'bg-blue-100 border-2 border-blue-500'
                    : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                }`}
              >
                <div className="font-medium text-gray-900">
                  {user.nome} {user.cognome}
                </div>
                <div className="text-sm text-gray-500 capitalize">
                  Turno: {user.turno}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Configurazione */}
        <div className="md:col-span-3">
          {!selectedUser ? (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p>Seleziona un utente per configurare gli allarmi</p>
              </div>
            </div>
          ) : loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : config ? (
            <div className="space-y-6">
              {/* Header */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-xl font-semibold mb-2">
                  {selectedUser.nome} {selectedUser.cognome}
                </h3>
                <p className="text-gray-600">Turno: <span className="font-medium capitalize">{config.turno}</span></p>
              </div>

              {/* Orari Lavoro */}
              <div className="border-b pb-4">
                <h4 className="font-semibold mb-3 flex items-center">
                  <Clock className="w-5 h-5 mr-2" />
                  Orari di Lavoro
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ora Inizio
                    </label>
                    <input
                      type="time"
                      value={config.ora_inizio}
                      onChange={(e) => updateConfig('ora_inizio', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ora Fine
                    </label>
                    <input
                      type="time"
                      value={config.ora_fine}
                      onChange={(e) => updateConfig('ora_fine', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Orari Allarmi */}
              <div className="border-b pb-4">
                <h4 className="font-semibold mb-3 flex items-center">
                  <Bell className="w-5 h-5 mr-2" />
                  Orari Allarmi
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Lunedì - Venerdì
                    </label>
                    <input
                      type="time"
                      value={config.orario_allarme_lun_ven}
                      onChange={(e) => updateConfig('orario_allarme_lun_ven', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Sabato
                    </label>
                    <input
                      type="time"
                      value={config.orario_allarme_sabato}
                      onChange={(e) => updateConfig('orario_allarme_sabato', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Lunedì (post-weekend)
                    </label>
                    <input
                      type="time"
                      value={config.orario_allarme_lunedi_successivo || ''}
                      onChange={(e) => updateConfig('orario_allarme_lunedi_successivo', e.target.value || null)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Giorni Lavorativi */}
              <div className="border-b pb-4">
                <h4 className="font-semibold mb-3 flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  Giorni Lavorativi
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { key: 'lavora_lunedi', label: 'Lunedì' },
                    { key: 'lavora_martedi', label: 'Martedì' },
                    { key: 'lavora_mercoledi', label: 'Mercoledì' },
                    { key: 'lavora_giovedi', label: 'Giovedì' },
                    { key: 'lavora_venerdi', label: 'Venerdì' },
                    { key: 'lavora_sabato', label: 'Sabato' },
                    { key: 'lavora_domenica', label: 'Domenica' }
                  ].map((day) => (
                    <label key={day.key} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config[day.key as keyof AlarmConfig] as boolean}
                        onChange={(e) => updateConfig(day.key as keyof AlarmConfig, e.target.checked)}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{day.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Impostazioni Avanzate */}
              <div className="border-b pb-4">
                <h4 className="font-semibold mb-3">Impostazioni Avanzate</h4>
                <div className="space-y-3">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.attivo}
                      onChange={(e) => updateConfig('attivo', e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Allarme Attivo</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.invia_dopo_orario}
                      onChange={(e) => updateConfig('invia_dopo_orario', e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Invia anche fuori orario</span>
                  </label>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Limite Orario Invio (non invia dopo quest'ora)
                    </label>
                    <input
                      type="time"
                      value={config.limite_orario_invio}
                      onChange={(e) => updateConfig('limite_orario_invio', e.target.value)}
                      disabled={config.invia_dopo_orario}
                      className="w-48 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    />
                  </div>
                </div>
              </div>

              {/* Azioni */}
              <div className="flex space-x-4">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  <Save size={20} />
                  <span>{saving ? 'Salvataggio...' : 'Salva Configurazione'}</span>
                </button>
                <button
                  onClick={handleForceAlarm}
                  className="bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center space-x-2"
                >
                  <Bell size={20} />
                  <span>Test Allarme</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              <p>Configurazione non trovata</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

