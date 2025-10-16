'use client'

import { useState, useEffect } from 'react'
import { AppUser } from '@/lib/supabase'
import { rapportoService, targaService } from '@/lib/database'
import { Targa } from '@/lib/supabase'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import { it } from 'date-fns/locale'

interface RapportiFormProps {
  user: AppUser
}

export default function RapportiForm({ user }: RapportiFormProps) {
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
  
  const [targhe, setTarghe] = useState<Targa[]>([])
  const [loading, setLoading] = useState(false)
  const [targheLoading, setTargheLoading] = useState(true)

  useEffect(() => {
    const fetchTarghe = async () => {
      try {
        const targheData = await targaService.getAllTarghe()
        setTarghe(targheData)
      } catch (error) {
        toast.error('Errore nel caricamento delle targhe')
        console.error('Error fetching targhe:', error)
      } finally {
        setTargheLoading(false)
      }
    }

    fetchTarghe()
  }, [])

  const calculateTotal = () => {
    return formData.ordinari + 
           formData.prelievi + 
           formData.urgenze + 
           formData.trasfusioni + 
           formData.aghi + 
           formData.urgenza_ultimo_momento + 
           formData.mancate_consegne
  }

  const handleInputChange = (field: string, value: number | string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const operatore = `${user.nome} ${user.cognome}`
      const today = format(new Date(), 'yyyy-MM-dd')
      const totale = calculateTotal()

      const rapporto = {
        operatore,
        data: today,
        ordinari: formData.ordinari,
        prelievi: formData.prelievi,
        urgenze: formData.urgenze,
        trasfusioni: formData.trasfusioni,
        aghi: formData.aghi,
        urgenza_ultimo_momento: formData.urgenza_ultimo_momento,
        mancate_consegne: formData.mancate_consegne,
        totale,
        km_inizio: formData.km_inizio,
        km_fine: formData.km_fine,
        targa: formData.targa
      }

      await rapportoService.createRapporto(rapporto)
      
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
      toast.error('Errore nell\'invio del rapporto')
      console.error('Error submitting rapporto:', error)
    } finally {
      setLoading(false)
    }
  }

  if (targheLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="card max-w-4xl mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Inserisci Rapporto Giornaliero
          </h2>
          <p className="text-gray-600">
            Data: {format(new Date(), 'dd MMMM yyyy', { locale: it })}
          </p>
          <p className="text-gray-600">
            Operatore: {user.nome} {user.cognome}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Consegne */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ordinari
              </label>
              <input
                type="number"
                min="0"
                className="input-field"
                value={formData.ordinari}
                onChange={(e) => handleInputChange('ordinari', parseInt(e.target.value) || 0)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prelievi
              </label>
              <input
                type="number"
                min="0"
                className="input-field"
                value={formData.prelievi}
                onChange={(e) => handleInputChange('prelievi', parseInt(e.target.value) || 0)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Urgenze
              </label>
              <input
                type="number"
                min="0"
                className="input-field"
                value={formData.urgenze}
                onChange={(e) => handleInputChange('urgenze', parseInt(e.target.value) || 0)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Trasfusioni
              </label>
              <input
                type="number"
                min="0"
                className="input-field"
                value={formData.trasfusioni}
                onChange={(e) => handleInputChange('trasfusioni', parseInt(e.target.value) || 0)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Aghi
              </label>
              <input
                type="number"
                min="0"
                className="input-field"
                value={formData.aghi}
                onChange={(e) => handleInputChange('aghi', parseInt(e.target.value) || 0)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Urgenza Ultimo Momento
              </label>
              <input
                type="number"
                min="0"
                className="input-field"
                value={formData.urgenza_ultimo_momento}
                onChange={(e) => handleInputChange('urgenza_ultimo_momento', parseInt(e.target.value) || 0)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mancate Consegne
              </label>
              <input
                type="number"
                min="0"
                className="input-field"
                value={formData.mancate_consegne}
                onChange={(e) => handleInputChange('mancate_consegne', parseInt(e.target.value) || 0)}
              />
            </div>
          </div>

          {/* Totale */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-lg font-medium text-gray-700">Totale:</span>
              <span className="text-2xl font-bold text-primary-600">
                {calculateTotal()}
              </span>
            </div>
          </div>

          {/* Chilometri e Targa */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Km Inizio
              </label>
              <input
                type="number"
                min="0"
                className="input-field"
                value={formData.km_inizio}
                onChange={(e) => handleInputChange('km_inizio', parseInt(e.target.value) || 0)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Km Fine
              </label>
              <input
                type="number"
                min="0"
                className="input-field"
                value={formData.km_fine}
                onChange={(e) => handleInputChange('km_fine', parseInt(e.target.value) || 0)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Targa
              </label>
              <select
                className="input-field"
                value={formData.targa}
                onChange={(e) => handleInputChange('targa', e.target.value)}
                required
              >
                <option value="">Seleziona targa</option>
                {targhe.map((targa) => (
                  <option key={targa.id} value={targa.targa}>
                    {targa.targa}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading || !formData.targa}
              className="btn-primary px-8 py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Invio in corso...' : 'Invia Rapporto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
