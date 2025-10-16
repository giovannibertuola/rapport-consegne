import { supabase } from './supabase'
import { allarmeService, userService, rapportoService } from './database'
import { notificationService } from './notificationService'
import { format, addDays } from 'date-fns'

export class AllertService {
  private static instance: AllertService
  private intervalId: NodeJS.Timeout | null = null

  private constructor() {}

  public static getInstance(): AllertService {
    if (!AllertService.instance) {
      AllertService.instance = new AllertService()
    }
    return AllertService.instance
  }

  public async startAllertScheduler(): Promise<void> {
    // Controlla ogni minuto se è ora di inviare l'allert
    this.intervalId = setInterval(async () => {
      await this.checkAndSendAllert()
    }, 60000) // 60 secondi

    // Controlla immediatamente all'avvio
    await this.checkAndSendAllert()
  }

  public stopAllertScheduler(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
  }

  private async checkAndSendAllert(): Promise<void> {
    try {
      const allarme = await allarmeService.getAllarme()
      if (!allarme || !allarme.attivo) {
        return
      }

      const now = new Date()
      const currentTime = format(now, 'HH:mm')
      const allertTime = allarme.ora_invio

      // Controlla se è l'ora dell'allert
      if (currentTime === allertTime) {
        await this.sendAllertToUsers()
      }
    } catch (error) {
      console.error('Error checking allert:', error)
    }
  }

  private async sendAllertToUsers(): Promise<void> {
    try {
      const users = await userService.getAllUsers()
      const today = format(new Date(), 'yyyy-MM-dd')

      for (const user of users) {
        // Controlla se l'utente ha già inviato il rapporto oggi
        const existingRapporto = await rapportoService.getRapportiByOperatore(
          `${user.nome} ${user.cognome}`,
          today,
          today
        )

        if (existingRapporto.length === 0) {
          await this.sendAllertToUser(user)
        }
      }
    } catch (error) {
      console.error('Error sending allert to users:', error)
    }
  }

  private async sendAllertToUser(user: any): Promise<void> {
    try {
      const title = '🚛 Promemoria Rapporto Consegne'
      const appMessage = `Ciao ${user.nome}, ricordati di inviare il rapporto delle consegne di oggi entro la fine del turno.`
      const whatsappMessage = `🚛 *Promemoria Rapporto Consegne*\n\nCiao ${user.nome}! 👋\n\nRicordati di inviare il rapporto delle consegne di oggi entro la fine del turno.\n\n📱 Accedi all'app: https://rapport-consegne-obj7dcmw-giovanni-bertuolas-projects.vercel.app\n\nGrazie! 🙏`
      
      // Invia notifica push (in-app)
      await notificationService.sendPushNotification(
        user.id,
        title,
        appMessage,
        'warning'
      )
      
      // Invia email se configurato
      await notificationService.sendEmailNotification(
        user.email,
        title,
        appMessage
      )
      
      // Invia WhatsApp se il numero è disponibile
      if (user.cellulare) {
        await notificationService.sendWhatsAppNotification(
          user.cellulare,
          whatsappMessage
        )
      }
      
      console.log(`Allert inviato con successo a ${user.nome} ${user.cognome} (${user.email})`)
    } catch (error) {
      console.error(`Error sending allert to user ${user.email}:`, error)
    }
  }


  // Metodo per verificare se un utente ha inviato il rapporto oggi
  public async hasUserSubmittedToday(operatore: string): Promise<boolean> {
    try {
      const today = format(new Date(), 'yyyy-MM-dd')
      const rapporti = await rapportoService.getRapportiByOperatore(
        operatore,
        today,
        today
      )
      return rapporti.length > 0
    } catch (error) {
      console.error('Error checking if user submitted today:', error)
      return false
    }
  }

  // Metodo per ottenere statistiche degli allert
  public async getAllertStats(): Promise<{
    totalUsers: number
    usersWithReport: number
    usersWithoutReport: number
  }> {
    try {
      const users = await userService.getAllUsers()
      const today = format(new Date(), 'yyyy-MM-dd')
      
      let usersWithReport = 0
      
      for (const user of users) {
        const hasReport = await this.hasUserSubmittedToday(`${user.nome} ${user.cognome}`)
        if (hasReport) {
          usersWithReport++
        }
      }

      return {
        totalUsers: users.length,
        usersWithReport,
        usersWithoutReport: users.length - usersWithReport
      }
    } catch (error) {
      console.error('Error getting allert stats:', error)
      return {
        totalUsers: 0,
        usersWithReport: 0,
        usersWithoutReport: 0
      }
    }
  }
}

// Esporta l'istanza singleton
export const allertService = AllertService.getInstance()
