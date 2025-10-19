import { supabase, Rapporto, Allarme, Targa } from './supabase'
import type { AppUser } from './supabase'

// Gestione Utenti
export const userService = {
  async getAllUsers(): Promise<AppUser[]> {
    const { data, error } = await supabase
      .from('utenti')
      .select('*')
      .order('cognome')
    
    if (error) throw error
    return data || []
  },

  async createUser(user: Omit<AppUser, 'id' | 'created_at' | 'updated_at'>): Promise<AppUser> {
    // Crea l'utente senza password_hash se non fornito
    const userData = {
      nome: user.nome,
      cognome: user.cognome,
      cellulare: user.cellulare,
      email: user.email,
      privilegi: user.privilegi,
      turno: user.turno
      // Non include password_hash se causa problemi
    }
    
    const { data, error } = await supabase
      .from('utenti')
      .insert([userData])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async updateUser(id: string, updates: Partial<AppUser>): Promise<AppUser> {
    const { data, error } = await supabase
      .from('utenti')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async deleteUser(id: string): Promise<void> {
    const { error } = await supabase
      .from('utenti')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  },

  async getUserByEmail(email: string): Promise<AppUser | null> {
    const { data, error } = await supabase
      .from('utenti')
      .select('*')
      .eq('email', email)
      .single()
    
    if (error && error.code !== 'PGRST116') throw error
    return data
  }
}

// Gestione Rapporti
export const rapportoService = {
  async createRapporto(rapporto: Omit<Rapporto, 'id' | 'created_at' | 'updated_at'>): Promise<Rapporto> {
    const { data, error } = await supabase
      .from('rapporti')
      .insert([rapporto])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async getRapportiByDateRange(startDate: string, endDate: string): Promise<Rapporto[]> {
    const { data, error } = await supabase
      .from('rapporti')
      .select('*')
      .gte('data', startDate)
      .lte('data', endDate)
      .order('data', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  async getRapportiByOperatore(operatore: string, startDate?: string, endDate?: string): Promise<Rapporto[]> {
    let query = supabase
      .from('rapporti')
      .select('*')
      .eq('operatore', operatore)
      .order('data', { ascending: false })
    
    if (startDate && endDate) {
      query = query.gte('data', startDate).lte('data', endDate)
    }
    
    const { data, error } = await query
    
    if (error) throw error
    return data || []
  },

  async updateRapporto(id: string, updates: Partial<Rapporto>): Promise<Rapporto> {
    const { data, error } = await supabase
      .from('rapporti')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async deleteRapporto(id: string): Promise<void> {
    const { error } = await supabase
      .from('rapporti')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }
}

// Gestione Allarmi
export const allarmeService = {
  async getAllarme(): Promise<Allarme | null> {
    const { data, error } = await supabase
      .from('allarmi')
      .select('*')
      .single()
    
    if (error && error.code !== 'PGRST116') throw error
    return data
  },

  async createAllarme(allarme: Omit<Allarme, 'id' | 'created_at' | 'updated_at'>): Promise<Allarme> {
    const { data, error } = await supabase
      .from('allarmi')
      .insert([allarme])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async updateAllarme(id: string, updates: Partial<Allarme>): Promise<Allarme> {
    const { data, error } = await supabase
      .from('allarmi')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  }
}

// Gestione Targhe
export const targaService = {
  async getAllTarghe(): Promise<Targa[]> {
    const { data, error } = await supabase
      .from('targhe')
      .select('*')
      .eq('attiva', true)
      .order('targa')
    
    if (error) throw error
    return data || []
  },

  async createTarga(targa: Omit<Targa, 'id' | 'created_at'>): Promise<Targa> {
    const { data, error } = await supabase
      .from('targhe')
      .insert([targa])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async deleteTarga(id: string): Promise<void> {
    const { error } = await supabase
      .from('targhe')
      .update({ attiva: false })
      .eq('id', id)
    
    if (error) throw error
  }
}

// Utility per i turni
export const turniService = {
  async getCurrentTurno(operatore: string): Promise<'mattina' | 'pomeriggio'> {
    const user = await userService.getUserByEmail(operatore)
    if (!user || user.turno === null) {
      return 'mattina' // default
    }
    
    // Calcola la settimana corrente
    const now = new Date()
    const startOfYear = new Date(now.getFullYear(), 0, 1)
    const days = Math.floor((now.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000))
    const weekNumber = Math.ceil((days + startOfYear.getDay() + 1) / 7)
    
    // Inverte il turno ogni settimana (eccetto per Bertuola)
    if (operatore.toLowerCase().includes('bertuola')) {
      return user.turno
    }
    
    return weekNumber % 2 === 0 ? 
      (user.turno === 'mattina' ? 'pomeriggio' : 'mattina') : 
      user.turno
  }
}
