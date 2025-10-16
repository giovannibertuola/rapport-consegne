'use client'

import { useState, useEffect } from 'react'
import { allertService } from '@/lib/allertService'
import { format } from 'date-fns'
import { it } from 'date-fns/locale'
import { Bell, CheckCircle, XCircle, Clock } from 'lucide-react'

interface AllertStats {
  totalUsers: number
  usersWithReport: number
  usersWithoutReport: number
}

export default function AllertStatus() {
  const [stats, setStats] = useState<AllertStats>({
    totalUsers: 0,
    usersWithReport: 0,
    usersWithoutReport: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const allertStats = await allertService.getAllertStats()
        setStats(allertStats)
      } catch (error) {
        console.error('Error fetching allert stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
    
    // Aggiorna le statistiche ogni 30 secondi
    const interval = setInterval(fetchStats, 30000)
    
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="card">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    )
  }

  const completionPercentage = stats.totalUsers > 0 
    ? Math.round((stats.usersWithReport / stats.totalUsers) * 100) 
    : 0

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          <Bell className="h-5 w-5 mr-2" />
          Stato Rapporti Oggi
        </h3>
        <span className="text-sm text-gray-500">
          {format(new Date(), 'dd MMMM yyyy', { locale: it })}
        </span>
      </div>

      <div className="space-y-4">
        {/* Progress Bar */}
        <div>
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Completamento</span>
            <span>{completionPercentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-primary-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${completionPercentage}%` }}
            ></div>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <CheckCircle className="h-6 w-6 text-green-500" />
            </div>
            <div className="text-2xl font-bold text-green-600">
              {stats.usersWithReport}
            </div>
            <div className="text-sm text-gray-500">
              Completati
            </div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <XCircle className="h-6 w-6 text-red-500" />
            </div>
            <div className="text-2xl font-bold text-red-600">
              {stats.usersWithoutReport}
            </div>
            <div className="text-sm text-gray-500">
              Mancanti
            </div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Clock className="h-6 w-6 text-blue-500" />
            </div>
            <div className="text-2xl font-bold text-blue-600">
              {stats.totalUsers}
            </div>
            <div className="text-sm text-gray-500">
              Totale
            </div>
          </div>
        </div>

        {/* Status Message */}
        {stats.usersWithoutReport === 0 ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
              <span className="text-green-800 font-medium">
                Tutti i rapporti sono stati completati!
              </span>
            </div>
          </div>
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="flex items-center">
              <Clock className="h-5 w-5 text-yellow-500 mr-2" />
              <span className="text-yellow-800 font-medium">
                {stats.usersWithoutReport} operatore/i deve ancora inviare il rapporto
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
