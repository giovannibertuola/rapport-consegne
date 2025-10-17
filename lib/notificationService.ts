import { supabase } from './supabase'
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

  // Richiede permessi per le notifiche push
  async requestNotificationPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications')
      return false
    }

    if (Notification.permission === 'granted') {
      return true
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission()
      return permission === 'granted'
    }

    return false
  }

  // Registra il service worker
  async registerServiceWorker(): Promise<boolean> {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js')
        console.log('Service Worker registered successfully:', registration)
        return true
      } catch (error) {
        console.error('Service Worker registration failed:', error)
        return false
      }
    }
    return false
  }

  // Invia notifica push
  async sendPushNotification(title: string, body: string, data?: any): Promise<void> {
    try {
      const hasPermission = await this.requestNotificationPermission()
      if (!hasPermission) {
        console.log('Notification permission denied')
        return
      }

      const registration = await navigator.serviceWorker.ready
      
      await registration.showNotification(title, {
        body: body,
        icon: '/icon-192x192.png',
        badge: '/icon-192x192.png',
        data: data,
        requireInteraction: true
      } as any)

      console.log('Push notification sent successfully')
    } catch (error) {
      console.error('Error sending push notification:', error)
    }
  }

  // Invia notifica per rapporto mancante
  async sendMissingReportNotification(userEmail: string, turno: string): Promise<void> {
    const title = 'Rapporto Giornaliero Mancante'
    const body = `È ora di inviare il rapporto per il turno ${turno}. Clicca per aprire il form.`
    const data = {
      user: userEmail,
      action: 'open_form',
      url: `/rapporto/${userEmail}`
    }

    await this.sendPushNotification(title, body, data)
  }

  // Invia notifica di promemoria
  async sendReminderNotification(userEmail: string, turno: string, minutesLeft: number): Promise<void> {
    const title = 'Promemoria Rapporto'
    const body = `Mancano ${minutesLeft} minuti per inviare il rapporto del turno ${turno}.`
    const data = {
      user: userEmail,
      action: 'reminder',
      url: `/rapporto/${userEmail}`
    }

    await this.sendPushNotification(title, body, data)
  }

  // Controlla e invia notifiche per rapporti mancanti
  async checkAndSendMissingReports(): Promise<void> {
    try {
      const today = new Date().toISOString().split('T')[0]
      
      // Ottieni tutti gli utenti
      const { data: users, error: usersError } = await supabase
        .from('utenti')
        .select('*')
        .eq('privilegi', 'utente')

      if (usersError) {
        console.error('Error fetching users:', usersError)
        return
      }

      // Ottieni i rapporti di oggi
      const { data: reports, error: reportsError } = await supabase
        .from('rapporti')
        .select('operatore')
        .eq('data', today)

      if (reportsError) {
        console.error('Error fetching reports:', reportsError)
        return
      }

      const reportedUsers = new Set(reports?.map(r => r.operatore) || [])

      // Invia notifiche agli utenti che non hanno inviato il rapporto
      for (const user of users || []) {
        if (!reportedUsers.has(user.email)) {
          await this.sendMissingReportNotification(user.email, user.turno || 'non specificato')
        }
      }

    } catch (error) {
      console.error('Error checking missing reports:', error)
    }
  }

  // Programma notifiche automatiche basate sui turni
  async scheduleTurnNotifications(): Promise<void> {
    try {
      const { data: users, error } = await supabase
        .from('utenti')
        .select('*')
        .eq('privilegi', 'utente')
        .not('turno', 'is', null)

      if (error) {
        console.error('Error fetching users with shifts:', error)
        return
      }

      for (const user of users || []) {
        if (user.turno === 'mattina') {
          // Notifica alle 17:00 per turno mattina
          this.scheduleNotification(user.email, 17, 0, 'mattina')
        } else if (user.turno === 'pomeriggio') {
          // Notifica alle 20:00 per turno pomeriggio
          this.scheduleNotification(user.email, 20, 0, 'pomeriggio')
        }
      }

    } catch (error) {
      console.error('Error scheduling notifications:', error)
    }
  }

  // Programma una notifica per un orario specifico
  private scheduleNotification(userEmail: string, hour: number, minute: number, turno: string): void {
    const now = new Date()
    const notificationTime = new Date()
    notificationTime.setHours(hour, minute, 0, 0)

    // Se l'orario è già passato oggi, programma per domani
    if (notificationTime <= now) {
      notificationTime.setDate(notificationTime.getDate() + 1)
    }

    const timeUntilNotification = notificationTime.getTime() - now.getTime()

    setTimeout(() => {
      this.sendMissingReportNotification(userEmail, turno)
    }, timeUntilNotification)

    console.log(`Notification scheduled for ${userEmail} at ${hour}:${minute.toString().padStart(2, '0')}`)
  }

  // Invia notifica di conferma
  async sendConfirmationNotification(userEmail: string): Promise<void> {
    const title = 'Rapporto Inviato'
    const body = 'Il tuo rapporto giornaliero è stato inviato con successo!'
    
    await this.sendPushNotification(title, body, {
      user: userEmail,
      action: 'confirmation'
    })
  }
}

// Esporta l'istanza singleton
export const notificationService = NotificationService.getInstance()