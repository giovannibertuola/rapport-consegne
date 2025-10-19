import type { NextApiRequest, NextApiResponse } from 'next'
import { advancedAlarmService } from '../../../lib/advancedAlarmService'

/**
 * API endpoint per controllare e inviare allarmi
 * Chiamata automaticamente ogni minuto da un cron job o manualmente
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Solo GET e POST
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    console.log('🔍 API Check Alarms chiamata')

    // Ottieni statistiche prima del check
    const statsBefore = await advancedAlarmService.getTodayAlarmStats()

    // Esegui il check degli allarmi
    // Nota: questo metodo è privato, quindi chiamiamo startAlarmScheduler
    // che fa un check immediato
    await advancedAlarmService.startAlarmScheduler()
    
    // Ferma subito dopo (perché l'API viene chiamata ripetutamente)
    advancedAlarmService.stopAlarmScheduler()

    // Ottieni statistiche dopo il check
    const statsAfter = await advancedAlarmService.getTodayAlarmStats()

    return res.status(200).json({
      success: true,
      message: 'Check allarmi completato',
      timestamp: new Date().toISOString(),
      stats: {
        before: statsBefore,
        after: statsAfter,
        alarmsSentInThisCheck: statsAfter.alarmsSent - statsBefore.alarmsSent
      }
    })
  } catch (error) {
    console.error('❌ Errore nell\'API check alarms:', error)
    return res.status(500).json({
      success: false,
      error: 'Errore interno del server',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

