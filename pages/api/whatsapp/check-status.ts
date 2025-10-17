import { NextApiRequest, NextApiResponse } from 'next'
import { whatsappSessionManager } from '@/lib/whatsappSessionManager'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { instance_id } = req.body

    if (!instance_id) {
      return res.status(400).json({ error: 'instance_id is required' })
    }

    // Verifica se la sessione è pronta
    const isReady = await whatsappSessionManager.isSessionReady(instance_id);
    
    res.status(200).json({
      instance_id,
      is_connected: isReady,
      status: isReady ? 'connected' : 'disconnected',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error checking WhatsApp status:', error)
    res.status(500).json({ 
      error: 'Failed to check status',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
