import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { instance_id } = req.body

    if (!instance_id) {
      return res.status(400).json({ error: 'instance_id is required' })
    }

    // Genera un QR code di esempio per il demo
    const qrCodeSVG = `
      <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
        <rect width="200" height="200" fill="white"/>
        <rect x="10" y="10" width="180" height="180" fill="none" stroke="black" stroke-width="2"/>
        
        <!-- Pattern QR code simulato -->
        <rect x="20" y="20" width="20" height="20" fill="black"/>
        <rect x="50" y="20" width="10" height="10" fill="black"/>
        <rect x="70" y="20" width="10" height="10" fill="black"/>
        <rect x="90" y="20" width="20" height="20" fill="black"/>
        <rect x="120" y="20" width="10" height="10" fill="black"/>
        <rect x="140" y="20" width="10" height="10" fill="black"/>
        <rect x="160" y="20" width="20" height="20" fill="black"/>
        
        <rect x="20" y="40" width="10" height="10" fill="black"/>
        <rect x="40" y="40" width="10" height="10" fill="black"/>
        <rect x="60" y="40" width="20" height="20" fill="black"/>
        <rect x="90" y="40" width="10" height="10" fill="black"/>
        <rect x="110" y="40" width="20" height="20" fill="black"/>
        <rect x="140" y="40" width="10" height="10" fill="black"/>
        <rect x="160" y="40" width="10" height="10" fill="black"/>
        
        <!-- Centro con logo WhatsApp simulato -->
        <circle cx="100" cy="100" r="25" fill="white" stroke="black" stroke-width="2"/>
        <text x="100" y="105" text-anchor="middle" font-family="Arial" font-size="12" fill="black">WA</text>
        
        <!-- Altri pattern -->
        <rect x="20" y="160" width="20" height="20" fill="black"/>
        <rect x="50" y="160" width="10" height="10" fill="black"/>
        <rect x="70" y="160" width="10" height="10" fill="black"/>
        <rect x="90" y="160" width="20" height="20" fill="black"/>
        <rect x="120" y="160" width="10" height="10" fill="black"/>
        <rect x="140" y="160" width="10" height="10" fill="black"/>
        <rect x="160" y="160" width="20" height="20" fill="black"/>
        
        <text x="100" y="195" text-anchor="middle" font-family="Arial" font-size="8" fill="gray">
          Instance: ${instance_id}
        </text>
      </svg>
    `

    const base64QR = `data:image/svg+xml;base64,${btoa(qrCodeSVG)}`
    
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
