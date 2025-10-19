import { supabase } from './supabase'
import { format, getDay, isWeekend } from 'date-fns'
import { notificationService } from './notificationService'

export interface AlarmConfig {
  id: string
  user_id: string
  turno: 'mattina' | 'pomeriggio' | 'giornaliero'
  ora_inizio: string
  ora_fine: string
  orario_allarme_lun_ven: string
  orario_allarme_sabato: string
  orario_allarme_lunedi_successivo: string | null
  lavora_lunedi: boolean
  lavora_martedi: boolean
  lavora_mercoledi: boolean
  lavora_giovedi: boolean
  lavora_venerdi: boolean
  lavora_sabato: boolean
  lavora_domenica: boolean
  attivo: boolean
  invia_dopo_orario: boolean
  limite_orario_invio: string
}

export interface AlarmLog {
  id: string
  user_id: string
  data: string
  ora_invio: string
  tipo_allarme: string
  inviato: boolean
  motivo_skip: string | null
}

export interface RapportoStatus {
  user_id: string
  data: string
  rapporto_inviato: boolean
  ora_invio: string | null
  allarme_inviato: boolean
}

export class AdvancedAlarmService {
  private static instance: AdvancedAlarmService
  private intervalId: NodeJS.Timeout | null = null
  private isRunning: boolean = false

  private constructor() {}

  public static getInstance(): AdvancedAlarmService {
    if (!AdvancedAlarmService.instance) {
      AdvancedAlarmService.instance = new AdvancedAlarmService()
    }
    return AdvancedAlarmService.instance
  }

  /**
   * Avvia il sistema di monitoraggio allarmi
   * Controlla ogni 30 secondi se ci sono allarmi da inviare
   */
  public async startAlarmScheduler(): Promise<void> {
    if (this.isRunning) {
      console.log('Alarm scheduler già in esecuzione')
      return
    }

    this.isRunning = true
    console.log('🚀 Avvio Advanced Alarm Scheduler...')

    // Controlla immediatamente
    await this.checkAndSendAlarms()

    // Poi controlla ogni 30 secondi
    this.intervalId = setInterval(async () => {
      await this.checkAndSendAlarms()
    }, 30000) // 30 secondi
  }

  /**
   * Ferma il sistema di monitoraggio
   */
  public stopAlarmScheduler(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
      this.isRunning = false
      console.log('🛑 Advanced Alarm Scheduler fermato')
    }
  }

  /**
   * Controlla e invia gli allarmi necessari
   */
  private async checkAndSendAlarms(): Promise<void> {
    try {
      const now = new Date()
      const currentTime = format(now, 'HH:mm:ss')
      const currentDay = getDay(now) // 0 = Domenica, 1 = Lunedì, ..., 6 = Sabato
      const today = format(now, 'yyyy-MM-dd')

      console.log(`⏰ Check allarmi - ${today} ${currentTime} (giorno: ${currentDay})`)

      // Ottieni tutte le configurazioni allarmi attive
      const { data: configs, error } = await supabase
        .from('allarmi_operatori')
        .select(`
          *,
          utenti:user_id (
            id,
            nome,
            cognome,
            email,
            turno
          )
        `)
        .eq('attivo', true)

      if (error) {
        console.error('❌ Errore nel recupero configurazioni allarmi:', error)
        return
      }

      if (!configs || configs.length === 0) {
        console.log('ℹ️ Nessuna configurazione allarme attiva')
        return
      }

      // Processa ogni configurazione
      for (const config of configs) {
        await this.processAlarmForUser(config, now, currentTime, currentDay, today)
      }

    } catch (error) {
      console.error('❌ Errore nel check allarmi:', error)
    }
  }

  /**
   * Processa l'allarme per un singolo utente
   */
  private async processAlarmForUser(
    config: any,
    now: Date,
    currentTime: string,
    currentDay: number,
    today: string
  ): Promise<void> {
    const user = config.utenti
    const userName = `${user.nome} ${user.cognome}`

    try {
      // 1. Verifica se è un giorno lavorativo
      if (!this.isWorkingDay(config, currentDay)) {
        console.log(`ℹ️ ${userName}: Non è giorno lavorativo`)
        return
      }

      // 2. Verifica se è fuori orario
      if (this.isAfterWorkHours(config, currentTime)) {
        console.log(`ℹ️ ${userName}: Fuori orario lavorativo (dopo ${config.limite_orario_invio})`)
        return
      }

      // 3. Determina l'orario allarme da usare
      const alarmTime = this.getAlarmTime(config, currentDay)
      
      // 4. Verifica se è l'ora dell'allarme (con tolleranza di 1 minuto)
      if (!this.isAlarmTime(currentTime, alarmTime)) {
        return // Non è ancora ora
      }

      // 5. Verifica se il rapporto è già stato inviato
      const rapportoInviato = await this.hasUserSubmittedToday(user.id, today)
      if (rapportoInviato) {
        await this.logAlarm(user.id, today, 'giornaliero', false, 'Rapporto già inviato')
        console.log(`✅ ${userName}: Rapporto già inviato, skip allarme`)
        return
      }

      // 6. Verifica se l'allarme è già stato inviato oggi
      const allarmeGiaInviato = await this.hasAlarmBeenSentToday(user.id, today)
      if (allarmeGiaInviato) {
        console.log(`ℹ️ ${userName}: Allarme già inviato oggi`)
        return
      }

      // 7. Invia l'allarme
      await this.sendAlarmToUser(user, config, currentDay)
      await this.logAlarm(user.id, today, this.getAlarmType(currentDay), true, null)
      
      console.log(`🔔 ${userName}: Allarme inviato con successo!`)

    } catch (error) {
      console.error(`❌ Errore processing allarme per ${userName}:`, error)
    }
  }

  /**
   * Verifica se è un giorno lavorativo per l'utente
   */
  private isWorkingDay(config: AlarmConfig, dayOfWeek: number): boolean {
    const dayMap: { [key: number]: keyof AlarmConfig } = {
      0: 'lavora_domenica',
      1: 'lavora_lunedi',
      2: 'lavora_martedi',
      3: 'lavora_mercoledi',
      4: 'lavora_giovedi',
      5: 'lavora_venerdi',
      6: 'lavora_sabato'
    }

    const dayKey = dayMap[dayOfWeek]
    return config[dayKey] as boolean
  }

  /**
   * Verifica se è dopo l'orario di lavoro
   */
  private isAfterWorkHours(config: AlarmConfig, currentTime: string): boolean {
    if (config.invia_dopo_orario) {
      return false // Può inviare anche fuori orario
    }

    return currentTime > config.limite_orario_invio
  }

  /**
   * Determina quale orario allarme usare in base al giorno
   */
  private getAlarmTime(config: AlarmConfig, dayOfWeek: number): string {
    // Sabato
    if (dayOfWeek === 6) {
      return config.orario_allarme_sabato
    }

    // Lunedì (se configurato orario speciale post-weekend)
    if (dayOfWeek === 1 && config.orario_allarme_lunedi_successivo) {
      return config.orario_allarme_lunedi_successivo
    }

    // Lunedì-Venerdì normale
    return config.orario_allarme_lun_ven
  }

  /**
   * Verifica se è l'ora esatta dell'allarme (con tolleranza 1 minuto)
   */
  private isAlarmTime(currentTime: string, alarmTime: string): boolean {
    const [currentH, currentM] = currentTime.split(':').map(Number)
    const [alarmH, alarmM] = alarmTime.split(':').map(Number)

    const currentMinutes = currentH * 60 + currentM
    const alarmMinutes = alarmH * 60 + alarmM

    // Tolleranza di 1 minuto
    return Math.abs(currentMinutes - alarmMinutes) <= 1
  }

  /**
   * Verifica se l'utente ha già inviato il rapporto oggi
   */
  private async hasUserSubmittedToday(userId: string, date: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('stato_rapporti_giornalieri')
      .select('rapporto_inviato')
      .eq('user_id', userId)
      .eq('data', date)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = not found
      console.error('Errore check rapporto:', error)
      return false
    }

    return data?.rapporto_inviato || false
  }

  /**
   * Verifica se l'allarme è già stato inviato oggi
   */
  private async hasAlarmBeenSentToday(userId: string, date: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('log_allarmi')
      .select('id')
      .eq('user_id', userId)
      .eq('data', date)
      .eq('inviato', true)
      .limit(1)

    if (error) {
      console.error('Errore check log allarmi:', error)
      return false
    }

    return (data?.length || 0) > 0
  }

  /**
   * Invia l'allarme all'utente
   */
  private async sendAlarmToUser(user: any, config: AlarmConfig, dayOfWeek: number): Promise<void> {
    const userName = `${user.nome} ${user.cognome}`
    const alarmType = this.getAlarmType(dayOfWeek)
    
    let message = `Ciao ${user.nome}! 👋\n\n`
    
    if (dayOfWeek === 6) {
      // Sabato - messaggio speciale
      message += `È sabato e il tuo turno ${config.turno} sta per finire.\n`
      message += `Ricordati di inviare il rapporto delle consegne di oggi!\n\n`
      message += `📅 Lunedì l'allarme sarà alle ${config.orario_allarme_lunedi_successivo || '17:00'}`
    } else if (dayOfWeek === 1 && config.orario_allarme_lunedi_successivo) {
      // Lunedì post-weekend
      message += `Buon inizio settimana! 🚀\n`
      message += `È ora di inviare il rapporto del turno ${config.turno}.\n`
      message += `Orario: ${config.ora_inizio} - ${config.ora_fine}`
    } else {
      // Giorni normali
      message += `È ora di inviare il rapporto del turno ${config.turno}!\n`
      message += `Orario: ${config.ora_inizio} - ${config.ora_fine}\n\n`
      message += `⏰ Ricorda di inviarlo entro le ${config.limite_orario_invio}`
    }

    // Invia notifica push
    await notificationService.sendPushNotification(
      '🚛 Promemoria Rapporto Consegne',
      message,
      {
        userId: user.id,
        userName: userName,
        type: 'warning',
        action: 'open_form',
        url: '/dashboard',
        turno: config.turno,
        alarmType: alarmType
      }
    )
  }

  /**
   * Determina il tipo di allarme in base al giorno
   */
  private getAlarmType(dayOfWeek: number): string {
    if (dayOfWeek === 6) {
      return 'weekend'
    } else if (dayOfWeek === 1) {
      return 'lunedi_post_weekend'
    }
    return 'giornaliero'
  }

  /**
   * Registra l'allarme nel log
   */
  private async logAlarm(
    userId: string,
    date: string,
    type: string,
    sent: boolean,
    reason: string | null
  ): Promise<void> {
    const { error } = await supabase
      .from('log_allarmi')
      .insert({
        user_id: userId,
        data: date,
        ora_invio: new Date().toISOString(),
        tipo_allarme: type,
        inviato: sent,
        motivo_skip: reason
      })

    if (error) {
      console.error('Errore nel log allarme:', error)
    }
  }

  // ==================== API PUBBLICHE ====================

  /**
   * Ottieni configurazione allarme per un utente
   */
  public async getUserAlarmConfig(userId: string): Promise<AlarmConfig | null> {
    const { data, error } = await supabase
      .from('allarmi_operatori')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error) {
      console.error('Errore recupero config allarme:', error)
      return null
    }

    return data
  }

  /**
   * Aggiorna configurazione allarme per un utente
   */
  public async updateUserAlarmConfig(userId: string, config: Partial<AlarmConfig>): Promise<boolean> {
    const { error } = await supabase
      .from('allarmi_operatori')
      .update(config)
      .eq('user_id', userId)

    if (error) {
      console.error('Errore aggiornamento config allarme:', error)
      return false
    }

    return true
  }

  /**
   * Ottieni log allarmi per un utente
   */
  public async getUserAlarmLogs(userId: string, limit: number = 30): Promise<AlarmLog[]> {
    const { data, error } = await supabase
      .from('log_allarmi')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Errore recupero log allarmi:', error)
      return []
    }

    return data || []
  }

  /**
   * Ottieni statistiche allarmi di oggi
   */
  public async getTodayAlarmStats(): Promise<{
    totalUsers: number
    alarmsToSend: number
    alarmsSent: number
    reportsSubmitted: number
    usersWithoutReport: number
  }> {
    const today = format(new Date(), 'yyyy-MM-dd')

    try {
      // Totale utenti attivi
      const { data: users, error: usersError } = await supabase
        .from('allarmi_operatori')
        .select('user_id')
        .eq('attivo', true)

      const totalUsers = users?.length || 0

      // Allarmi inviati oggi
      const { data: sentAlarms, error: sentError } = await supabase
        .from('log_allarmi')
        .select('id')
        .eq('data', today)
        .eq('inviato', true)

      const alarmsSent = sentAlarms?.length || 0

      // Rapporti inviati oggi
      const { data: reports, error: reportsError } = await supabase
        .from('stato_rapporti_giornalieri')
        .select('user_id')
        .eq('data', today)
        .eq('rapporto_inviato', true)

      const reportsSubmitted = reports?.length || 0

      return {
        totalUsers,
        alarmsToSend: totalUsers - reportsSubmitted,
        alarmsSent,
        reportsSubmitted,
        usersWithoutReport: totalUsers - reportsSubmitted
      }
    } catch (error) {
      console.error('Errore statistiche allarmi:', error)
      return {
        totalUsers: 0,
        alarmsToSend: 0,
        alarmsSent: 0,
        reportsSubmitted: 0,
        usersWithoutReport: 0
      }
    }
  }

  /**
   * Forza l'invio di un allarme a un utente specifico (per testing)
   */
  public async forceAlarmToUser(userId: string): Promise<boolean> {
    try {
      const { data: config, error } = await supabase
        .from('allarmi_operatori')
        .select(`
          *,
          utenti:user_id (
            id,
            nome,
            cognome,
            email,
            turno
          )
        `)
        .eq('user_id', userId)
        .single()

      if (error || !config) {
        console.error('Errore recupero config per force alarm:', error)
        return false
      }

      const now = new Date()
      const today = format(now, 'yyyy-MM-dd')
      const currentDay = getDay(now)

      await this.sendAlarmToUser(config.utenti, config, currentDay)
      await this.logAlarm(userId, today, 'manuale', true, 'Invio forzato manualmente')

      return true
    } catch (error) {
      console.error('Errore force alarm:', error)
      return false
    }
  }
}

// Esporta l'istanza singleton
export const advancedAlarmService = AdvancedAlarmService.getInstance()

