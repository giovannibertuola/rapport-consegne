import { supabase } from './supabase'
import toast from 'react-hot-toast'

export interface BayleisConfig {
  id?: string
  instance_id: string
  api_key: string
  phone_number: string
  qr_code?: string
  is_connected: boolean
  connected_at?: string
  created_at?: string
  updated_at?: string
}

export class BayleisService {
  private static instance: BayleisService

  private constructor() {}

  public static getInstance(): BayleisService {
    if (!BayleisService.instance) {
      BayleisService.instance = new BayleisService()
    }
    return BayleisService.instance
  }

  // Ottiene la configurazione Bayleis
  async getConfig(): Promise<BayleisConfig | null> {
    try {
      const { data, error } = await supabase
        .from('bayleis_config')
        .select('*')
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching Bayleis config:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error fetching Bayleis config:', error)
      return null
    }
  }

  // Crea una nuova configurazione Bayleis
  async createConfig(config: Omit<BayleisConfig, 'id' | 'created_at' | 'updated_at'>): Promise<BayleisConfig | null> {
    try {
      const { data, error } = await supabase
        .from('bayleis_config')
        .insert([config])
        .select()
        .single()

      if (error) {
        console.error('Error creating Bayleis config:', error)
        toast.error('Errore nella creazione della configurazione')
        return null
      }

      toast.success('Configurazione Bayleis creata con successo')
      return data
    } catch (error) {
      console.error('Error creating Bayleis config:', error)
      toast.error('Errore nella creazione della configurazione')
      return null
    }
  }

  // Aggiorna la configurazione
  async updateConfig(updates: Partial<BayleisConfig>): Promise<BayleisConfig | null> {
    try {
      const { data, error } = await supabase
        .from('bayleis_config')
        .update(updates)
        .select()
        .single()

      if (error) {
        console.error('Error updating Bayleis config:', error)
        toast.error('Errore nell\'aggiornamento della configurazione')
        return null
      }

      return data
    } catch (error) {
      console.error('Error updating Bayleis config:', error)
      toast.error('Errore nell\'aggiornamento della configurazione')
      return null
    }
  }

  // Elimina la configurazione (reset)
  async resetConfig(): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('bayleis_config')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all

      if (error) {
        console.error('Error resetting Bayleis config:', error)
        toast.error('Errore nel reset della configurazione')
        return false
      }

      toast.success('Configurazione resettata con successo')
      return true
    } catch (error) {
      console.error('Error resetting Bayleis config:', error)
      toast.error('Errore nel reset della configurazione')
      return false
    }
  }

  // Genera un nuovo QR code per l'istanza
  async generateQRCode(instanceId: string, apiKey: string): Promise<string | null> {
    try {
      // Per ora generiamo un QR code di esempio
      // In produzione, qui faresti una chiamata alle API di Bayleis:
      /*
      const response = await fetch('https://api.bayleis.com/v1/qr-code', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          instance_id: instanceId
        })
      });

      if (response.ok) {
        const result = await response.json();
        return result.qr_code; // Base64 dell'immagine QR
      }
      */

      // QR code di esempio per il demo
      const qrCodeSVG = `
        <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
          <rect width="200" height="200" fill="white"/>
          <rect x="10" y="10" width="180" height="180" fill="none" stroke="black" stroke-width="2"/>
          
          <!-- Pattern QR code simulato -->
          <rect x="20" y="20" width="20" height="20" fill="black"/>
          <rect x="50" y="20" width="10" height="10" fill="black"/>
          <rect x="70" y="20" width="10" height="10" fill="black"/>
          <rect x="90" y="20" width="20" height="20" fill="black"/>
          <rect x="120" y="20" width="10" height="10" fill="black"/>
          <rect x="140" y="20" width="10" height="10" fill="black"/>
          <rect x="160" y="20" width="20" height="20" fill="black"/>
          
          <rect x="20" y="40" width="10" height="10" fill="black"/>
          <rect x="40" y="40" width="10" height="10" fill="black"/>
          <rect x="60" y="40" width="20" height="20" fill="black"/>
          <rect x="90" y="40" width="10" height="10" fill="black"/>
          <rect x="110" y="40" width="20" height="20" fill="black"/>
          <rect x="140" y="40" width="10" height="10" fill="black"/>
          <rect x="160" y="40" width="10" height="10" fill="black"/>
          
          <!-- Centro con logo WhatsApp simulato -->
          <circle cx="100" cy="100" r="25" fill="white" stroke="black" stroke-width="2"/>
          <text x="100" y="105" text-anchor="middle" font-family="Arial" font-size="12" fill="black">WA</text>
          
          <!-- Altri pattern -->
          <rect x="20" y="160" width="20" height="20" fill="black"/>
          <rect x="50" y="160" width="10" height="10" fill="black"/>
          <rect x="70" y="160" width="10" height="10" fill="black"/>
          <rect x="90" y="160" width="20" height="20" fill="black"/>
          <rect x="120" y="160" width="10" height="10" fill="black"/>
          <rect x="140" y="160" width="10" height="10" fill="black"/>
          <rect x="160" y="160" width="20" height="20" fill="black"/>
          
          <text x="100" y="195" text-anchor="middle" font-family="Arial" font-size="8" fill="gray">
            Instance: ${instanceId}
          </text>
        </svg>
      `

      const base64QR = `data:image/svg+xml;base64,${btoa(qrCodeSVG)}`
      return base64QR
    } catch (error) {
      console.error('Error generating QR code:', error)
      return null
    }
  }

  // Verifica lo stato della connessione
  async checkConnectionStatus(instanceId: string, apiKey: string): Promise<boolean> {
    try {
      // Simuliamo la verifica dello stato
      // In produzione faresti una chiamata alle API di Bayleis
      
      // Simula che dopo 5 secondi si connette (70% di probabilità)
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(Math.random() > 0.3)
        }, 5000)
      })
    } catch (error) {
      console.error('Error checking connection status:', error)
      return false
    }
  }

  // Invia messaggio WhatsApp
  async sendMessage(phoneNumber: string, message: string): Promise<boolean> {
    try {
      const config = await this.getConfig()
      if (!config || !config.is_connected) {
        console.log('Bayleis non configurato, uso simulazione')
        return false
      }

      // In produzione faresti una chiamata alle API di Bayleis
      console.log(`WhatsApp message sent via Bayleis to ${phoneNumber}: ${message}`)
      return true
    } catch (error) {
      console.error('Error sending WhatsApp message:', error)
      return false
    }
  }
}

// Esporta l'istanza singleton
export const bayleisService = BayleisService.getInstance()
