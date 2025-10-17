import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { phone_number, message } = req.body

    // Validazione input
    if (!phone_number || !message) {
      return res.status(400).json({ error: 'Phone number and message are required' })
    }

    // Per ora simuliamo l'invio - in futuro si può integrare con servizi esterni
    console.log(`[Notification] Sending message to ${phone_number}:`, message)
    
    // Simula un piccolo delay
    await new Promise(resolve => setTimeout(resolve, 500))

    res.status(200).json({
      success: true,
      message: 'Notification sent successfully',
      phone_number,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error sending WhatsApp message:', error)
    res.status(500).json({ 
      error: 'Failed to send message',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
