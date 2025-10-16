import { supabase, Notification } from './supabase'
import { bayleisService } from './bayleisService'
import toast from 'react-hot-toast'

export class NotificationService {
  private static instance: NotificationService

  private constructor() {}

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService()
    }
    return NotificationService.instance
  }

  // Crea una notifica nel database
  async createNotification(notification: Omit<Notification, 'id' | 'created_at'>): Promise<Notification | null> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert([notification])
        .select()
        .single()

      if (error) {
        console.error('Error creating notification:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error creating notification:', error)
      return null
    }
  }

  // Ottiene le notifiche per un utente
  async getUserNotifications(userId: string, unreadOnly: boolean = false): Promise<Notification[]> {
    try {
      let query = supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (unreadOnly) {
        query = query.eq('read', false)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error fetching notifications:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error fetching notifications:', error)
      return []
    }
  }

  // Marca una notifica come letta
  async markAsRead(notificationId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId)

      if (error) {
        console.error('Error marking notification as read:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error marking notification as read:', error)
      return false
    }
  }

  // Marca tutte le notifiche di un utente come lette
  async markAllAsRead(userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', userId)
        .eq('read', false)

      if (error) {
        console.error('Error marking all notifications as read:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
      return false
    }
  }

  // Invia notifica push (simulata con toast per ora)
  async sendPushNotification(userId: string, title: string, message: string, type: 'info' | 'warning' | 'error' | 'success' = 'info'): Promise<void> {
    try {
      // Crea la notifica nel database
      await this.createNotification({
        user_id: userId,
        title,
        message,
        type,
        read: false
      })

      // Mostra toast notification se l'utente è attivo
      switch (type) {
        case 'success':
          toast.success(`${title}: ${message}`)
          break
        case 'error':
          toast.error(`${title}: ${message}`)
          break
        case 'warning':
          toast(`${title}: ${message}`, { icon: '⚠️' })
          break
        default:
          toast(`${title}: ${message}`)
      }

      console.log(`Notification sent to user ${userId}: ${title} - ${message}`)
    } catch (error) {
      console.error('Error sending push notification:', error)
    }
  }

  // Invia notifica email (simulata per ora)
  async sendEmailNotification(email: string, subject: string, message: string): Promise<void> {
    try {
      // Qui potresti integrare con un servizio email come SendGrid, Resend, etc.
      console.log(`Email notification sent to ${email}:`)
      console.log(`Subject: ${subject}`)
      console.log(`Message: ${message}`)
      
      // Per ora mostriamo un toast
      toast.success(`Email inviata a ${email}`)
    } catch (error) {
      console.error('Error sending email notification:', error)
    }
  }

  // Invia messaggio WhatsApp tramite Bayleis
  async sendWhatsAppNotification(phoneNumber: string, message: string): Promise<void> {
    try {
      // Per attivare WhatsApp con Bayleis:
      // 1. Registrati su bayleis.com
      // 2. Configura le variabili d'ambiente BAYLEIS_API_KEY, BAYLEIS_INSTANCE_ID
      // 3. Decommentare il codice sotto:
      
      /*
      const response = await fetch('https://api.bayleis.com/v1/messages', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.BAYLEIS_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          instance_id: process.env.BAYLEIS_INSTANCE_ID,
          to: phoneNumber.replace(/\s+/g, ''), // Rimuove spazi
          message: message,
          type: 'text'
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('WhatsApp message sent successfully:', result);
        toast.success(`WhatsApp inviato a ${phoneNumber}`);
      } else {
        throw new Error(`Bayleis API error: ${response.status}`);
      }
      */
      
      // Per ora simulato
      console.log(`WhatsApp notification sent to ${phoneNumber}: ${message}`)
      toast.success(`WhatsApp inviato a ${phoneNumber}`)
    } catch (error) {
      console.error('Error sending WhatsApp notification:', error)
      toast.error('Errore invio WhatsApp')
    }
  }

  // Manteniamo anche SMS per compatibilità
  async sendSMSNotification(phoneNumber: string, message: string): Promise<void> {
    // Prova prima con Bayleis, poi fallback alla simulazione
    const success = await bayleisService.sendMessage(phoneNumber, message)
    if (!success) {
      // Fallback alla simulazione se Bayleis non è configurato
      return this.sendWhatsAppNotification(phoneNumber, message)
    }
  }

  // Ascolta le notifiche in tempo reale
  subscribeToNotifications(userId: string, callback: (notification: Notification) => void) {
    const subscription = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          callback(payload.new as Notification)
        }
      )
      .subscribe()

    return subscription
  }
}

// Esporta l'istanza singleton
export const notificationService = NotificationService.getInstance()
