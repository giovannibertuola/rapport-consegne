import type { NextApiRequest, NextApiResponse } from 'next'
import { advancedAlarmService } from '../../../lib/advancedAlarmService'

/**
 * API endpoint per ottenere statistiche degli allarmi
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const stats = await advancedAlarmService.getTodayAlarmStats()

    return res.status(200).json({
      success: true,
      stats,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Errore nell\'API stats:', error)
    return res.status(500).json({
      success: false,
      error: 'Errore interno del server'
    })
  }
}

