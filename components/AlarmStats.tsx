import { useEffect, useState } from 'react'
import { Bell, CheckCircle, XCircle, Clock, TrendingUp } from 'lucide-react'

interface AlarmStats {
  totalUsers: number
  alarmsToSend: number
  alarmsSent: number
  reportsSubmitted: number
  usersWithoutReport: number
}

export default function AlarmStats() {
  const [stats, setStats] = useState<AlarmStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
    
    // Aggiorna le statistiche ogni 30 secondi
    const interval = setInterval(loadStats, 30000)
    
    return () => clearInterval(interval)
  }, [])

  const loadStats = async () => {
    try {
      const response = await fetch('/api/alarms/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Errore caricamento stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!stats) {
    return null
  }

  const statCards = [
    {
      label: 'Totale Utenti',
      value: stats.totalUsers,
      icon: TrendingUp,
      color: 'blue'
    },
    {
      label: 'Rapporti Inviati',
      value: stats.reportsSubmitted,
      icon: CheckCircle,
      color: 'green'
    },
    {
      label: 'Allarmi Inviati',
      value: stats.alarmsSent,
      icon: Bell,
      color: 'orange'
    },
    {
      label: 'Da Completare',
      value: stats.usersWithoutReport,
      icon: XCircle,
      color: 'red'
    }
  ]

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-100 text-blue-600',
      green: 'bg-green-100 text-green-600',
      orange: 'bg-orange-100 text-orange-600',
      red: 'bg-red-100 text-red-600'
    }
    return colors[color as keyof typeof colors] || colors.blue
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 flex items-center">
          <Clock className="w-6 h-6 mr-2 text-blue-600" />
          Statistiche Allarmi - Oggi
        </h2>
        <button
          onClick={loadStats}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          Aggiorna
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon
          const colorClasses = getColorClasses(card.color)
          
          return (
            <div
              key={card.label}
              className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-2">
                <div className={`p-2 rounded-lg ${colorClasses}`}>
                  <Icon size={20} />
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {card.value}
              </div>
              <div className="text-sm text-gray-600">
                {card.label}
              </div>
            </div>
          )
        })}
      </div>

      {stats.usersWithoutReport > 0 && (
        <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            <strong>Attenzione:</strong> Ci sono ancora {stats.usersWithoutReport} utenti 
            che non hanno inviato il rapporto di oggi.
          </p>
        </div>
      )}

      {stats.reportsSubmitted === stats.totalUsers && stats.totalUsers > 0 && (
        <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-green-800">
            <strong>Ottimo!</strong> Tutti gli utenti hanno inviato il loro rapporto oggi! 🎉
          </p>
        </div>
      )}
    </div>
  )
}

