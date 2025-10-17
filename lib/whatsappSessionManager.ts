import { Client, LocalAuth } from 'whatsapp-web.js';
import QRCode from 'qrcode';

interface WhatsAppSession {
  client: Client;
  isReady: boolean;
  qrCode?: string;
  instanceId: string;
  lastActivity: Date;
}

class WhatsAppSessionManager {
  private static instance: WhatsAppSessionManager;
  private sessions: Map<string, WhatsAppSession> = new Map();
  private readonly SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minuti

  private constructor() {
    // Pulisce le sessioni inattive ogni 5 minuti
    setInterval(() => {
      this.cleanupInactiveSessions();
    }, 5 * 60 * 1000);
  }

  public static getInstance(): WhatsAppSessionManager {
    if (!WhatsAppSessionManager.instance) {
      WhatsAppSessionManager.instance = new WhatsAppSessionManager();
    }
    return WhatsAppSessionManager.instance;
  }

  // Crea o ottiene una sessione WhatsApp
  async getOrCreateSession(instanceId: string): Promise<WhatsAppSession> {
    const existingSession = this.sessions.get(instanceId);
    
    if (existingSession && existingSession.isReady) {
      existingSession.lastActivity = new Date();
      return existingSession;
    }

    // Crea una nuova sessione
    const sessionPath = process.env.WHATSAPP_SESSION_PATH || './whatsapp-sessions';
    const puppeteerArgs = process.env.PUPPETEER_ARGS?.split(',') || [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--single-process',
      '--disable-gpu'
    ];

    const client = new Client({
      authStrategy: new LocalAuth({ 
        clientId: `session_${instanceId}`,
        dataPath: sessionPath
      }),
      puppeteer: {
        headless: process.env.WHATSAPP_HEADLESS !== 'false',
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
        args: puppeteerArgs
      }
    });

    const session: WhatsAppSession = {
      client,
      isReady: false,
      instanceId,
      lastActivity: new Date()
    };

    // Configura gli eventi del client
    client.on('qr', async (qr) => {
      try {
        session.qrCode = await QRCode.toDataURL(qr);
        console.log(`QR Code generated for instance: ${instanceId}`);
      } catch (error) {
        console.error('Error generating QR code:', error);
        session.qrCode = qr; // Fallback al QR code testuale
      }
    });

    client.on('ready', () => {
      console.log(`WhatsApp client ready for instance: ${instanceId}`);
      session.isReady = true;
      session.qrCode = undefined; // Rimuove il QR code quando è pronto
    });

    client.on('authenticated', () => {
      console.log(`WhatsApp client authenticated for instance: ${instanceId}`);
    });

    client.on('auth_failure', (msg) => {
      console.error(`WhatsApp authentication failed for instance: ${instanceId}`, msg);
      session.isReady = false;
    });

    client.on('disconnected', (reason) => {
      console.log(`WhatsApp client disconnected for instance: ${instanceId}`, reason);
      session.isReady = false;
      this.sessions.delete(instanceId);
    });

    // Inizializza il client
    try {
      await client.initialize();
      this.sessions.set(instanceId, session);
      return session;
    } catch (error) {
      console.error(`Error initializing WhatsApp client for instance: ${instanceId}`, error);
      throw error;
    }
  }

  // Invia un messaggio usando una sessione esistente
  async sendMessage(instanceId: string, phoneNumber: string, message: string): Promise<boolean> {
    try {
      const session = await this.getOrCreateSession(instanceId);
      
      if (!session.isReady) {
        console.log(`WhatsApp session not ready for instance: ${instanceId}`);
        return false;
      }

      // Formatta il numero di telefono
      const chatId = phoneNumber.replace(/\D/g, '') + '@c.us';
      
      // Invia il messaggio
      await session.client.sendMessage(chatId, message);
      session.lastActivity = new Date();
      
      console.log(`Message sent successfully to ${phoneNumber} via instance: ${instanceId}`);
      return true;
    } catch (error) {
      console.error(`Error sending message via instance: ${instanceId}`, error);
      return false;
    }
  }

  // Ottiene il QR code per una sessione
  async getQRCode(instanceId: string): Promise<string | null> {
    try {
      const session = await this.getOrCreateSession(instanceId);
      
      if (session.qrCode) {
        return session.qrCode;
      }

      // Se non c'è QR code, aspetta che venga generato
      let attempts = 0;
      while (!session.qrCode && attempts < 100) {
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
      }

      return session.qrCode || null;
    } catch (error) {
      console.error(`Error getting QR code for instance: ${instanceId}`, error);
      return null;
    }
  }

  // Verifica se una sessione è pronta
  async isSessionReady(instanceId: string): Promise<boolean> {
    const session = this.sessions.get(instanceId);
    return session ? session.isReady : false;
  }

  // Disconnette una sessione
  async disconnectSession(instanceId: string): Promise<void> {
    const session = this.sessions.get(instanceId);
    if (session) {
      try {
        await session.client.destroy();
      } catch (error) {
        console.error(`Error destroying client for instance: ${instanceId}`, error);
      }
      this.sessions.delete(instanceId);
    }
  }

  // Pulisce le sessioni inattive
  private cleanupInactiveSessions(): void {
    const now = new Date();
    for (const [instanceId, session] of this.sessions.entries()) {
      const timeSinceLastActivity = now.getTime() - session.lastActivity.getTime();
      if (timeSinceLastActivity > this.SESSION_TIMEOUT) {
        console.log(`Cleaning up inactive session: ${instanceId}`);
        this.disconnectSession(instanceId);
      }
    }
  }

  // Ottiene lo stato di tutte le sessioni
  getSessionsStatus(): Array<{instanceId: string, isReady: boolean, lastActivity: Date}> {
    return Array.from(this.sessions.entries()).map(([instanceId, session]) => ({
      instanceId,
      isReady: session.isReady,
      lastActivity: session.lastActivity
    }));
  }
}

export const whatsappSessionManager = WhatsAppSessionManager.getInstance();
