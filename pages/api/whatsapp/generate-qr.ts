import { NextApiRequest, NextApiResponse } from 'next'

// Per ora simuliamo l'API - in produzione useresti whatsapp-web.js
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { instance_id, session_name } = req.body

    // Simula la generazione del QR code
    // In produzione, qui inizializzeresti whatsapp-web.js:
    /*
    const { Client, LocalAuth } = require('whatsapp-web.js');
    
    const client = new Client({
      authStrategy: new LocalAuth({ clientId: session_name }),
      puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      }
    });

    let qrCode = '';
    
    client.on('qr', (qr) => {
      qrCode = qr;
    });

    client.on('ready', () => {
      console.log('WhatsApp client is ready!');
    });

    await client.initialize();
    
    // Aspetta che il QR code sia generato
    while (!qrCode) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    return res.status(200).json({ 
      qr_code: qrCode,
      instance_id,
      status: 'qr_generated'
    });
    */

    // Per ora generiamo un QR code realistico per il demo
    const qrCodeSVG = `
      <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
        <rect width="200" height="200" fill="white"/>
        <rect x="10" y="10" width="180" height="180" fill="none" stroke="black" stroke-width="2"/>
        
        <!-- Pattern QR code più realistico -->
        <!-- Angoli di posizionamento -->
        <rect x="20" y="20" width="40" height="40" fill="black"/>
        <rect x="30" y="30" width="20" height="20" fill="white"/>
        <rect x="35" y="35" width="10" height="10" fill="black"/>
        
        <rect x="140" y="20" width="40" height="40" fill="black"/>
        <rect x="150" y="30" width="20" height="20" fill="white"/>
        <rect x="155" y="35" width="10" height="10" fill="black"/>
        
        <rect x="20" y="140" width="40" height="40" fill="black"/>
        <rect x="30" y="150" width="20" height="20" fill="white"/>
        <rect x="35" y="155" width="10" height="10" fill="black"/>
        
        <!-- Pattern dati simulato -->
        <rect x="70" y="20" width="5" height="5" fill="black"/>
        <rect x="80" y="20" width="5" height="5" fill="black"/>
        <rect x="90" y="25" width="5" height="5" fill="black"/>
        <rect x="100" y="20" width="5" height="5" fill="black"/>
        <rect x="110" y="25" width="5" height="5" fill="black"/>
        <rect x="120" y="20" width="5" height="5" fill="black"/>
        
        <rect x="20" y="70" width="5" height="5" fill="black"/>
        <rect x="25" y="80" width="5" height="5" fill="black"/>
        <rect x="30" y="90" width="5" height="5" fill="black"/>
        <rect x="35" y="100" width="5" height="5" fill="black"/>
        <rect x="40" y="110" width="5" height="5" fill="black"/>
        <rect x="45" y="120" width="5" height="5" fill="black"/>
        
        <!-- Centro con timing pattern -->
        <rect x="95" y="95" width="10" height="10" fill="black"/>
        <rect x="100" y="100" width="5" height="5" fill="white"/>
        
        <!-- Altri pattern -->
        <rect x="70" y="70" width="5" height="5" fill="black"/>
        <rect x="80" y="75" width="5" height="5" fill="black"/>
        <rect x="90" y="80" width="5" height="5" fill="black"/>
        <rect x="110" y="70" width="5" height="5" fill="black"/>
        <rect x="120" y="75" width="5" height="5" fill="black"/>
        <rect x="130" y="80" width="5" height="5" fill="black"/>
        
        <rect x="70" y="110" width="5" height="5" fill="black"/>
        <rect x="80" y="115" width="5" height="5" fill="black"/>
        <rect x="90" y="120" width="5" height="5" fill="black"/>
        <rect x="110" y="110" width="5" height="5" fill="black"/>
        <rect x="120" y="115" width="5" height="5" fill="black"/>
        <rect x="130" y="120" width="5" height="5" fill="black"/>
        
        <rect x="70" y="150" width="5" height="5" fill="black"/>
        <rect x="80" y="155" width="5" height="5" fill="black"/>
        <rect x="90" y="160" width="5" height="5" fill="black"/>
        <rect x="110" y="150" width="5" height="5" fill="black"/>
        <rect x="120" y="155" width="5" height="5" fill="black"/>
        <rect x="130" y="160" width="5" height="5" fill="black"/>
        
        <text x="100" y="195" text-anchor="middle" font-family="Arial" font-size="8" fill="gray">
          WhatsApp Web - Instance: ${instance_id}
        </text>
      </svg>
    `

    const base64QR = `data:image/svg+xml;base64,${Buffer.from(qrCodeSVG).toString('base64')}`

    res.status(200).json({ 
      qr_code: base64QR,
      instance_id,
      status: 'qr_generated',
      message: 'QR Code generato con successo. Scansiona con WhatsApp per collegare il dispositivo.'
    })

  } catch (error) {
    console.error('Error generating QR code:', error)
    res.status(500).json({ error: 'Failed to generate QR code' })
  }
}
