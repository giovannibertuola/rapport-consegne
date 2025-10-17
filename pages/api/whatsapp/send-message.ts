import { NextApiRequest, NextApiResponse } from 'next'
import { whatsappSessionManager } from '@/lib/whatsappSessionManager'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { phone_number, message, instance_id } = req.body

    // Validazione input
    if (!phone_number || !message || !instance_id) {
      return res.status(400).json({ error: 'Phone number, message and instance_id are required' })
    }

    // Invia messaggio usando il session manager
    const success = await whatsappSessionManager.sendMessage(instance_id, phone_number, message);
    
    if (success) {
      res.status(200).json({
        success: true,
        message: 'Message sent successfully via WhatsApp Web',
        phone_number,
        instance_id,
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(500).json({
        error: 'Failed to send message - WhatsApp session not ready or error occurred',
        phone_number,
        instance_id
      });
    }

  } catch (error) {
    console.error('Error sending WhatsApp message:', error)
    res.status(500).json({ 
      error: 'Failed to send message',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
