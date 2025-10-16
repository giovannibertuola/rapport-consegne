'use client'

import { useState, useEffect } from 'react'
import { User as SupabaseUser } from '@supabase/supabase-js'
import { userService } from '@/lib/database'
import { AppUser } from '@/lib/supabase'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'
import RapportiForm from './RapportiForm'
import AdminPanel from './AdminPanel'
import ReportsView from './ReportsView'
import AllertStatus from './AllertStatus'
import NotificationCenter from './NotificationCenter'
import { LogOut, User, Settings, FileText, BarChart3 } from 'lucide-react'

interface DashboardProps {
  user: SupabaseUser
}

export default function Dashboard({ user }: DashboardProps) {
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null)
  const [activeTab, setActiveTab] = useState<'rapporti' | 'reports' | 'admin'>('rapporti')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await userService.getUserByEmail(user.email!)
        setCurrentUser(userData)
      } catch (error) {
        toast.error('Errore nel caricamento dei dati utente')
        console.error('Error fetching user data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [user.email])

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      toast.success('Logout effettuato con successo')
    } catch (error) {
      toast.error('Errore durante il logout')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Utente non trovato</h2>
          <button onClick={handleLogout} className="btn-primary">
            Torna al Login
          </button>
        </div>
      </div>
    )
  }

  const isAdmin = currentUser.privilegi === 'admin'

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                Sistema Rapporti Consegne
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <NotificationCenter user={currentUser} />
              <div className="text-sm text-gray-700">
                <span className="font-medium">{currentUser.nome} {currentUser.cognome}</span>
                <span className="ml-2 px-2 py-1 text-xs rounded-full bg-primary-100 text-primary-800">
                  {currentUser.privilegi}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 text-gray-500 hover:text-gray-700"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('rapporti')}
              className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'rapporti'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FileText className="h-4 w-4" />
              <span>Rapporti</span>
            </button>
            
            <button
              onClick={() => setActiveTab('reports')}
              className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'reports'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <BarChart3 className="h-4 w-4" />
              <span>Visualizza Rapporti</span>
            </button>

            {isAdmin && (
              <button
                onClick={() => setActiveTab('admin')}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'admin'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Settings className="h-4 w-4" />
                <span>Amministrazione</span>
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {activeTab === 'rapporti' && (
          <div className="space-y-6">
            <AllertStatus />
            <RapportiForm user={currentUser} />
          </div>
        )}
        
        {activeTab === 'reports' && (
          <ReportsView user={currentUser} />
        )}
        
        {activeTab === 'admin' && isAdmin && (
          <AdminPanel user={currentUser} />
        )}
      </main>
    </div>
  )
}
