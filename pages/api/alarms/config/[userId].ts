import type { NextApiRequest, NextApiResponse } from 'next'
import { advancedAlarmService } from '../../../../lib/advancedAlarmService'

/**
 * API endpoint per gestire la configurazione allarmi di un utente
 * GET: ottiene la configurazione
 * PUT: aggiorna la configurazione
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { userId } = req.query

  if (!userId || typeof userId !== 'string') {
    return res.status(400).json({ error: 'UserId richiesto' })
  }

  try {
    if (req.method === 'GET') {
      // Ottieni configurazione
      const config = await advancedAlarmService.getUserAlarmConfig(userId)
      
      if (!config) {
        return res.status(404).json({ error: 'Configurazione non trovata' })
      }

      return res.status(200).json({
        success: true,
        config
      })
    }

    if (req.method === 'PUT') {
      // Aggiorna configurazione
      const updates = req.body

      if (!updates || Object.keys(updates).length === 0) {
        return res.status(400).json({ error: 'Nessun aggiornamento fornito' })
      }

      const success = await advancedAlarmService.updateUserAlarmConfig(userId, updates)

      if (!success) {
        return res.status(500).json({ error: 'Errore nell\'aggiornamento' })
      }

      return res.status(200).json({
        success: true,
        message: 'Configurazione aggiornata con successo'
      })
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (error) {
    console.error('Errore nell\'API config:', error)
    return res.status(500).json({
      success: false,
      error: 'Errore interno del server'
    })
  }
}

