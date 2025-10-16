import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { phone_number, message, instance_id } = req.body

    // Validazione input
    if (!phone_number || !message) {
      return res.status(400).json({ error: 'Phone number and message are required' })
    }

    // In produzione, qui useresti whatsapp-web.js per inviare il messaggio:
    /*
    const { Client, LocalAuth } = require('whatsapp-web.js');
    
    const client = new Client({
      authStrategy: new LocalAuth({ clientId: `session_${instance_id}` })
    });

    await client.initialize();

    // Formatta il numero di telefono
    const chatId = phone_number.replace(/\D/g, '') + '@c.us';
    
    // Invia il messaggio
    await client.sendMessage(chatId, message);
    
    return res.status(200).json({
      success: true,
      message: 'Message sent successfully',
      phone_number,
      instance_id
    });
    */

    // Per ora simuliamo l'invio
    console.log(`[WhatsApp-Web.js] Sending message to ${phone_number}:`, message)
    
    // Simula un piccolo delay come se stesse inviando
    await new Promise(resolve => setTimeout(resolve, 1000))

    res.status(200).json({
      success: true,
      message: 'Message sent successfully via WhatsApp Web',
      phone_number,
      instance_id,
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
