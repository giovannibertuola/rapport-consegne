import type { NextApiRequest, NextApiResponse } from 'next'
import { advancedAlarmService } from '../../../../lib/advancedAlarmService'

/**
 * API endpoint per forzare l'invio di un allarme a un utente specifico
 * Utile per testing o per invii manuali dall'admin
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { userId } = req.query

  if (!userId || typeof userId !== 'string') {
    return res.status(400).json({ error: 'UserId richiesto' })
  }

  try {
    const success = await advancedAlarmService.forceAlarmToUser(userId)

    if (!success) {
      return res.status(500).json({
        success: false,
        error: 'Errore nell\'invio dell\'allarme'
      })
    }

    return res.status(200).json({
      success: true,
      message: `Allarme forzato inviato con successo all'utente ${userId}`
    })
  } catch (error) {
    console.error('Errore nell\'API force alarm:', error)
    return res.status(500).json({
      success: false,
      error: 'Errore interno del server'
    })
  }
}

