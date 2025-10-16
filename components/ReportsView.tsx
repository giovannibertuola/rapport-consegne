'use client'

import { useState, useEffect } from 'react'
import { AppUser } from '@/lib/supabase'
import { rapportoService, userService } from '@/lib/database'
import { Rapporto } from '@/lib/supabase'
import toast from 'react-hot-toast'
import { format, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns'
import { it } from 'date-fns/locale'
import { Calendar, Filter, Download, Eye } from 'lucide-react'

interface ReportsViewProps {
  user: AppUser
}

export default function ReportsView({ user }: ReportsViewProps) {
  const [rapporti, setRapporti] = useState<Rapporto[]>([])
  const [users, setUsers] = useState<AppUser[]>([])
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState({
    startDate: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
    endDate: format(endOfMonth(new Date()), 'yyyy-MM-dd'),
    operatore: '',
    month: format(new Date(), 'yyyy-MM')
  })

  useEffect(() => {
    fetchUsers()
    fetchRapporti()
  }, [filters])

  const fetchUsers = async () => {
    try {
      const usersData = await userService.getAllUsers()
      setUsers(usersData)
    } catch (error) {
      console.error('Error fetching users:', error)
    }
  }

  const fetchRapporti = async () => {
    setLoading(true)
    try {
      let data: Rapporto[] = []
      
      if (filters.operatore) {
        data = await rapportoService.getRapportiByOperatore(
          filters.operatore, 
          filters.startDate, 
          filters.endDate
        )
      } else {
        data = await rapportoService.getRapportiByDateRange(
          filters.startDate, 
          filters.endDate
        )
      }
      
      setRapporti(data)
    } catch (error) {
      toast.error('Errore nel caricamento dei rapporti')
      console.error('Error fetching rapporti:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleMonthChange = (month: string) => {
    const startDate = startOfMonth(new Date(month + '-01'))
    const endDate = endOfMonth(startDate)
    
    setFilters(prev => ({
      ...prev,
      month,
      startDate: format(startDate, 'yyyy-MM-dd'),
      endDate: format(endDate, 'yyyy-MM-dd')
    }))
  }

  const handleDateRangeChange = (startDate: string, endDate: string) => {
    setFilters(prev => ({
      ...prev,
      startDate,
      endDate,
      month: '' // Reset month filter when using custom range
    }))
  }

  const exportToCSV = () => {
    const headers = [
      'Data',
      'Operatore',
      'Ordinari',
      'Prelievi',
      'Urgenze',
      'Trasfusioni',
      'Aghi',
      'Urgenza Ultimo Momento',
      'Mancate Consegne',
      'Totale',
      'Km Inizio',
      'Km Fine',
      'Targa'
    ]

    const csvContent = [
      headers.join(','),
      ...rapporti.map(rapporto => [
        format(new Date(rapporto.data), 'dd/MM/yyyy'),
        rapporto.operatore,
        rapporto.ordinari,
        rapporto.prelievi,
        rapporto.urgenze,
        rapporto.trasfusioni,
        rapporto.aghi,
        rapporto.urgenza_ultimo_momento,
        rapporto.mancate_consegne,
        rapporto.totale,
        rapporto.km_inizio,
        rapporto.km_fine,
        rapporto.targa
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `rapporti_${filters.startDate}_${filters.endDate}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const getTotalStats = () => {
    return rapporti.reduce((acc, rapporto) => ({
      ordinari: acc.ordinari + rapporto.ordinari,
      prelievi: acc.prelievi + rapporto.prelievi,
      urgenze: acc.urgenze + rapporto.urgenze,
      trasfusioni: acc.trasfusioni + rapporto.trasfusioni,
      aghi: acc.aghi + rapporto.aghi,
      urgenza_ultimo_momento: acc.urgenza_ultimo_momento + rapporto.urgenza_ultimo_momento,
      mancate_consegne: acc.mancate_consegne + rapporto.mancate_consegne,
      totale: acc.totale + rapporto.totale
    }), {
      ordinari: 0,
      prelievi: 0,
      urgenze: 0,
      trasfusioni: 0,
      aghi: 0,
      urgenza_ultimo_momento: 0,
      mancate_consegne: 0,
      totale: 0
    })
  }

  const stats = getTotalStats()

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">
            Visualizza Rapporti
          </h2>
          <button
            onClick={exportToCSV}
            className="btn-primary"
            disabled={rapporti.length === 0}
          >
            <Download className="h-4 w-4 mr-2" />
            Esporta CSV
          </button>
        </div>

        {/* Filters */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            <Filter className="h-5 w-5 inline mr-2" />
            Filtri
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mese
              </label>
              <input
                type="month"
                className="input-field"
                value={filters.month}
                onChange={(e) => handleMonthChange(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data Inizio
              </label>
              <input
                type="date"
                className="input-field"
                value={filters.startDate}
                onChange={(e) => handleDateRangeChange(e.target.value, filters.endDate)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data Fine
              </label>
              <input
                type="date"
                className="input-field"
                value={filters.endDate}
                onChange={(e) => handleDateRangeChange(filters.startDate, e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Operatore
              </label>
              <select
                className="input-field"
                value={filters.operatore}
                onChange={(e) => setFilters(prev => ({ ...prev, operatore: e.target.value }))}
              >
                <option value="">Tutti gli operatori</option>
                {users.map((user) => (
                  <option key={user.id} value={`${user.nome} ${user.cognome}`}>
                    {user.nome} {user.cognome}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Statistics */}
        {rapporti.length > 0 && (
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Statistiche Periodo
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-600">{stats.ordinari}</div>
                <div className="text-sm text-gray-500">Ordinari</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.prelievi}</div>
                <div className="text-sm text-gray-500">Prelievi</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{stats.urgenze}</div>
                <div className="text-sm text-gray-500">Urgenze</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{stats.trasfusioni}</div>
                <div className="text-sm text-gray-500">Trasfusioni</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{stats.aghi}</div>
                <div className="text-sm text-gray-500">Aghi</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{stats.urgenza_ultimo_momento}</div>
                <div className="text-sm text-gray-500">Urgenza Ultimo</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{stats.mancate_consegne}</div>
                <div className="text-sm text-gray-500">Mancate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-800">{stats.totale}</div>
                <div className="text-sm text-gray-500">Totale</div>
              </div>
            </div>
          </div>
        )}

        {/* Reports Table */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            <Eye className="h-5 w-5 inline mr-2" />
            Rapporti ({rapporti.length})
          </h3>
          
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : rapporti.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              Nessun rapporto trovato per il periodo selezionato
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Data
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Operatore
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ordinari
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Prelievi
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Urgenze
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Trasfusioni
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aghi
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Urgenza Ultimo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Mancate
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Totale
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Targa
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {rapporti.map((rapporto) => (
                    <tr key={rapporto.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {format(new Date(rapporto.data), 'dd/MM/yyyy', { locale: it })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {rapporto.operatore}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {rapporto.ordinari}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {rapporto.prelievi}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {rapporto.urgenze}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {rapporto.trasfusioni}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {rapporto.aghi}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {rapporto.urgenza_ultimo_momento}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {rapporto.mancate_consegne}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {rapporto.totale}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {rapporto.targa}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
