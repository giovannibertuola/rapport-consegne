import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://yydvltllcqfsrrnfypnf.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl5ZHZsdGxsY3Fmc3JybmZ5cG5mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1NDE5NzQsImV4cCI6MjA3NjExNzk3NH0.z096iysKd0hMcnpK6oyv4FVsNKtaZs8wrm-G1fl0wi4'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Tipi per il database
export interface AppUser {
  id: string
  nome: string
  cognome: string
  cellulare: string
  email: string
  privilegi: 'admin' | 'utente'
  turno: 'mattina' | 'pomeriggio' | null
  password_hash: string
  created_at: string
  updated_at: string
}

export interface Rapporto {
  id: string
  operatore: string
  data: string
  ordinari: number
  prelievi: number
  urgenze: number
  trasfusioni: number
  aghi: number
  urgenza_ultimo_momento: number
  mancate_consegne: number
  totale: number
  km_inizio: number
  km_fine: number
  targa: string
  created_at: string
  updated_at: string
}

export interface Allarme {
  id: string
  ora_invio: string
  attivo: boolean
  created_at: string
  updated_at: string
}

export interface Targa {
  id: string
  targa: string
  attiva: boolean
  created_at: string
}

export interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  type: 'info' | 'warning' | 'error' | 'success'
  read: boolean
  created_at: string
}