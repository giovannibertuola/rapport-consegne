import type { NextApiRequest, NextApiResponse } from 'next'
import { advancedAlarmService } from '../../../../lib/advancedAlarmService'

/**
 * API endpoint per ottenere i log degli allarmi di un utente
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { userId, limit } = req.query

  if (!userId || typeof userId !== 'string') {
    return res.status(400).json({ error: 'UserId richiesto' })
  }

  try {
    const limitNum = limit ? parseInt(limit as string, 10) : 30
    const logs = await advancedAlarmService.getUserAlarmLogs(userId, limitNum)

    return res.status(200).json({
      success: true,
      logs,
      count: logs.length
    })
  } catch (error) {
    console.error('Errore nell\'API logs:', error)
    return res.status(500).json({
      success: false,
      error: 'Errore interno del server'
    })
  }
}

