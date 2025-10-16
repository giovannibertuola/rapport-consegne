'use client'

import { useState, useEffect } from 'react'
import { AppUser } from '@/lib/supabase'
import { userService, allarmeService, targaService } from '@/lib/database'
import { Allarme, Targa } from '@/lib/supabase'
import toast from 'react-hot-toast'
import { Plus, Trash2, Edit, Clock, Car, Smartphone } from 'lucide-react'
import BayleisConfig from './BayleisConfig'

interface AdminPanelProps {
  user: AppUser
}

export default function AdminPanel({ user }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<'users' | 'alarms' | 'targhe' | 'whatsapp'>('users')
  const [users, setUsers] = useState<AppUser[]>([])
  const [allarme, setAllarme] = useState<Allarme | null>(null)
  const [targhe, setTarghe] = useState<Targa[]>([])
  const [loading, setLoading] = useState(false)
  const [editingUser, setEditingUser] = useState<AppUser | null>(null)

  // Form states
  const [newUser, setNewUser] = useState({
    nome: '',
    cognome: '',
    cellulare: '',
    email: '',
    privilegi: 'utente' as 'admin' | 'utente',
    turno: null as 'mattina' | 'pomeriggio' | null,
    password: ''
  })

  const [newTarga, setNewTarga] = useState('')
  const [allarmeTime, setAllarmeTime] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [usersData, allarmeData, targheData] = await Promise.all([
        userService.getAllUsers(),
        allarmeService.getAllarme(),
        targaService.getAllTarghe()
      ])
      
      setUsers(usersData)
      setAllarme(allarmeData)
      setTarghe(targheData)
      
      if (allarmeData) {
        setAllarmeTime(allarmeData.ora_invio)
      }
    } catch (error) {
      toast.error('Errore nel caricamento dei dati')
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const userData = {
        ...newUser,
        password_hash: 'temp_password' // In produzione, hashare la password
      }
      
      await userService.createUser(userData)
      toast.success('Utente creato con successo')
      setNewUser({
        nome: '',
        cognome: '',
        cellulare: '',
        email: '',
        privilegi: 'utente',
        turno: null,
        password: ''
      })
      fetchData()
    } catch (error) {
      toast.error('Errore nella creazione dell\'utente')
      console.error('Error creating user:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteUser = async (id: string) => {
    if (!confirm('Sei sicuro di voler eliminare questo utente?')) return

    try {
      await userService.deleteUser(id)
      toast.success('Utente eliminato con successo')
      fetchData()
    } catch (error) {
      toast.error('Errore nell\'eliminazione dell\'utente')
      console.error('Error deleting user:', error)
    }
  }

  const handleEditUser = (user: AppUser) => {
    setEditingUser(user)
    setNewUser({
      nome: user.nome,
      cognome: user.cognome,
      cellulare: user.cellulare,
      email: user.email,
      privilegi: user.privilegi,
      turno: user.turno,
      password: ''
    })
  }

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingUser) return

    setLoading(true)
    try {
      const updates = {
        nome: newUser.nome,
        cognome: newUser.cognome,
        cellulare: newUser.cellulare,
        privilegi: newUser.privilegi,
        turno: newUser.turno
      }
      
      await userService.updateUser(editingUser.id, updates)
      toast.success('Utente aggiornato con successo')
      setEditingUser(null)
      setNewUser({
        nome: '',
        cognome: '',
        cellulare: '',
        email: '',
        privilegi: 'utente',
        turno: null,
        password: ''
      })
      fetchData()
    } catch (error) {
      toast.error('Errore nell\'aggiornamento dell\'utente')
      console.error('Error updating user:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCancelEdit = () => {
    setEditingUser(null)
    setNewUser({
      nome: '',
      cognome: '',
      cellulare: '',
      email: '',
      privilegi: 'utente',
      turno: null,
      password: ''
    })
  }

  const handleUpdateAllarme = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (allarme) {
        await allarmeService.updateAllarme(allarme.id, { ora_invio: allarmeTime })
      } else {
        await allarmeService.createAllarme({ 
          ora_invio: allarmeTime, 
          attivo: true 
        })
      }
      toast.success('Orario allarme aggiornato')
      fetchData()
    } catch (error) {
      toast.error('Errore nell\'aggiornamento dell\'allarme')
      console.error('Error updating alarm:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddTarga = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTarga.trim()) return

    try {
      await targaService.createTarga({ 
        targa: newTarga.toUpperCase(), 
        attiva: true 
      })
      toast.success('Targa aggiunta con successo')
      setNewTarga('')
      fetchData()
    } catch (error) {
      toast.error('Errore nell\'aggiunta della targa')
      console.error('Error adding targa:', error)
    }
  }

  const handleDeleteTarga = async (id: string) => {
    if (!confirm('Sei sicuro di voler eliminare questa targa?')) return

    try {
      await targaService.deleteTarga(id)
      toast.success('Targa eliminata con successo')
      fetchData()
    } catch (error) {
      toast.error('Errore nell\'eliminazione della targa')
      console.error('Error deleting targa:', error)
    }
  }

  if (loading && users.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="max-w-7xl mx-auto">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('users')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'users'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Gestione Utenti
            </button>
            <button
              onClick={() => setActiveTab('alarms')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'alarms'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Allarmi
            </button>
            <button
              onClick={() => setActiveTab('targhe')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'targhe'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Gestione Targhe
            </button>
            <button
              onClick={() => setActiveTab('whatsapp')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'whatsapp'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Smartphone className="h-4 w-4 inline mr-1" />
              WhatsApp
            </button>
          </nav>
        </div>

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            {/* Add/Edit User Form */}
            <div className="card">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingUser ? 'Modifica Utente' : 'Aggiungi Nuovo Utente'}
              </h3>
              <form onSubmit={editingUser ? handleUpdateUser : handleCreateUser} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome
                  </label>
                  <input
                    type="text"
                    required
                    className="input-field"
                    value={newUser.nome}
                    onChange={(e) => setNewUser(prev => ({ ...prev, nome: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cognome
                  </label>
                  <input
                    type="text"
                    required
                    className="input-field"
                    value={newUser.cognome}
                    onChange={(e) => setNewUser(prev => ({ ...prev, cognome: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cellulare
                  </label>
                  <input
                    type="tel"
                    required
                    className="input-field"
                    value={newUser.cellulare}
                    onChange={(e) => setNewUser(prev => ({ ...prev, cellulare: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    className="input-field"
                    value={newUser.email}
                    onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                    disabled={editingUser !== null}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Privilegi
                  </label>
                  <select
                    className="input-field"
                    value={newUser.privilegi}
                    onChange={(e) => setNewUser(prev => ({ ...prev, privilegi: e.target.value as 'admin' | 'utente' }))}
                  >
                    <option value="utente">Utente</option>
                    <option value="admin">Amministratore</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Turno
                  </label>
                  <select
                    className="input-field"
                    value={newUser.turno || ''}
                    onChange={(e) => setNewUser(prev => ({ ...prev, turno: e.target.value as 'mattina' | 'pomeriggio' | null }))}
                  >
                    <option value="">Nessun turno</option>
                    <option value="mattina">Mattina (9:00-15:00)</option>
                    <option value="pomeriggio">Pomeriggio (10:00-17:42)</option>
                  </select>
                </div>
                <div className="md:col-span-2 lg:col-span-3 flex space-x-4">
                  <button type="submit" className="btn-primary">
                    <Plus className="h-4 w-4 mr-2" />
                    {editingUser ? 'Aggiorna Utente' : 'Aggiungi Utente'}
                  </button>
                  {editingUser && (
                    <button type="button" onClick={handleCancelEdit} className="btn-secondary">
                      Annulla
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Users List */}
            <div className="card">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Lista Utenti
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nome
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Telefono
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Privilegi
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Turno
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Azioni
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {user.nome} {user.cognome}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.cellulare}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            user.privilegi === 'admin' 
                              ? 'bg-red-100 text-red-800' 
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {user.privilegi}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.turno || 'Nessun turno'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-3">
                            <button
                              onClick={() => handleEditUser(user)}
                              className="inline-flex items-center px-2 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded hover:bg-blue-100 hover:text-blue-900 transition-colors"
                              title="Modifica utente"
                            >
                              <Edit className="h-3 w-3 mr-1" />
                              Modifica
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              className="inline-flex items-center px-2 py-1 text-xs font-medium text-red-600 bg-red-50 rounded hover:bg-red-100 hover:text-red-900 transition-colors"
                              title="Elimina utente"
                            >
                              <Trash2 className="h-3 w-3 mr-1" />
                              Elimina
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Alarms Tab */}
        {activeTab === 'alarms' && (
          <div className="card max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              <Clock className="h-5 w-5 inline mr-2" />
              Configurazione Allarmi
            </h3>
            <form onSubmit={handleUpdateAllarme} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ora Invio Allarme
                </label>
                <input
                  type="time"
                  required
                  className="input-field"
                  value={allarmeTime}
                  onChange={(e) => setAllarmeTime(e.target.value)}
                />
              </div>
              <button type="submit" className="btn-primary">
                Salva Configurazione
              </button>
            </form>
          </div>
        )}

        {/* Targhe Tab */}
        {activeTab === 'targhe' && (
          <div className="space-y-6">
            {/* Add Targa Form */}
            <div className="card">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                <Car className="h-5 w-5 inline mr-2" />
                Aggiungi Nuova Targa
              </h3>
              <form onSubmit={handleAddTarga} className="flex space-x-4">
                <input
                  type="text"
                  required
                  placeholder="Es: AB123CD"
                  className="input-field flex-1"
                  value={newTarga}
                  onChange={(e) => setNewTarga(e.target.value)}
                />
                <button type="submit" className="btn-primary">
                  <Plus className="h-4 w-4 mr-2" />
                  Aggiungi
                </button>
              </form>
            </div>

            {/* Targhe List */}
            <div className="card">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Lista Targhe
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {targhe.map((targa) => (
                  <div key={targa.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">{targa.targa}</span>
                    <button
                      onClick={() => handleDeleteTarga(targa.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* WhatsApp Tab */}
        {activeTab === 'whatsapp' && (
          <BayleisConfig />
        )}
      </div>
    </div>
  )
}
