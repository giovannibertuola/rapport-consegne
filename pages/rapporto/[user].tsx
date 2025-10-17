import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { AppUser } from '@/lib/supabase'
import toast from 'react-hot-toast'

export default function RapportoUser() {
  const router = useRouter()
  const { user } = router.query
  const [userData, setUserData] = useState<AppUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    ordinari: 0,
    prelievi: 0,
    urgenze: 0,
    trasfusioni: 0,
    aghi: 0,
    urgenza_ultimo_momento: 0,
    mancate_consegne: 0,
    km_inizio: 0,
    km_fine: 0,
    targa: ''
  })

  useEffect(() => {
    if (user) {
      loadUserData(user as string)
    }
  }, [user])

  const loadUserData = async (email: string) => {
    try {
      const { data, error } = await supabase
        .from('utenti')
        .select('*')
        .eq('email', email)
        .single()

      if (error) {
        toast.error('Utente non trovato')
        router.push('/')
        return
      }

      setUserData(data)
    } catch (error) {
      console.error('Error loading user:', error)
      toast.error('Errore nel caricamento utente')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!userData) return

    try {
      const totale = formData.ordinari + formData.prelievi + formData.urgenze + 
                    formData.trasfusioni + formData.aghi + formData.urgenza_ultimo_momento

      const { error } = await supabase
        .from('rapporti')
        .insert([{
          operatore: userData.email,
          data: new Date().toISOString().split('T')[0],
          ordinari: formData.ordinari,
          prelievi: formData.prelievi,
          urgenze: formData.urgenze,
          trasfusioni: formData.trasfusioni,
          aghi: formData.aghi,
          urgenza_ultimo_momento: formData.urgenza_ultimo_momento,
          mancate_consegne: formData.mancate_consegne,
          totale: totale,
          km_inizio: formData.km_inizio,
          km_fine: formData.km_fine,
          targa: formData.targa
        }])

      if (error) {
        throw error
      }

      toast.success('Rapporto inviato con successo!')
      
      // Reset form
      setFormData({
        ordinari: 0,
        prelievi: 0,
        urgenze: 0,
        trasfusioni: 0,
        aghi: 0,
        urgenza_ultimo_momento: 0,
        mancate_consegne: 0,
        km_inizio: 0,
        km_fine: 0,
        targa: ''
      })

    } catch (error) {
      console.error('Error submitting report:', error)
      toast.error('Errore nell\'invio del rapporto')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Caricamento...</p>
        </div>
      </div>
    )
  }

  if (!userData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Utente non trovato</h1>
          <p className="text-gray-600 mb-4">L'utente specificato non esiste nel sistema.</p>
          <button 
            onClick={() => router.push('/')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Torna alla Home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Inserisci Rapporto Giornaliero
            </h1>
            <p className="text-gray-600">
              Data: {new Date().toLocaleDateString('it-IT')}
            </p>
            <p className="text-gray-600">
              Operatore: {userData.nome} {userData.cognome}
            </p>
            <p className="text-sm text-blue-600 mt-2">
              Turno: {userData.turno || 'Non specificato'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Prima colonna */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ordinari
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.ordinari}
                    onChange={(e) => setFormData({...formData, ordinari: parseInt(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Trasfusioni
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.trasfusioni}
                    onChange={(e) => setFormData({...formData, trasfusioni: parseInt(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mancate Consegne
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.mancate_consegne}
                    onChange={(e) => setFormData({...formData, mancate_consegne: parseInt(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Seconda colonna */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prelievi
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.prelievi}
                    onChange={(e) => setFormData({...formData, prelievi: parseInt(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Aghi
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.aghi}
                    onChange={(e) => setFormData({...formData, aghi: parseInt(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Terza colonna */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Urgenze
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.urgenze}
                    onChange={(e) => setFormData({...formData, urgenze: parseInt(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Urgenza Ultimo Momento
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.urgenza_ultimo_momento}
                    onChange={(e) => setFormData({...formData, urgenza_ultimo_momento: parseInt(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Totale */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium text-gray-700">Totale:</span>
                <span className="text-2xl font-bold text-blue-600">
                  {formData.ordinari + formData.prelievi + formData.urgenze + 
                   formData.trasfusioni + formData.aghi + formData.urgenza_ultimo_momento}
                </span>
              </div>
            </div>

            {/* Informazioni veicolo */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Km Inizio
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.km_inizio}
                  onChange={(e) => setFormData({...formData, km_inizio: parseInt(e.target.value) || 0})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Km Fine
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.km_fine}
                  onChange={(e) => setFormData({...formData, km_fine: parseInt(e.target.value) || 0})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Targa
                </label>
                <input
                  type="text"
                  value={formData.targa}
                  onChange={(e) => setFormData({...formData, targa: e.target.value})}
                  placeholder="Inserisci targa"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Pulsante invio */}
            <div className="flex justify-end">
              <button
                type="submit"
                className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Invia Rapporto
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
