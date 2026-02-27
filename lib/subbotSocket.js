import makeWASocket, {
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  DisconnectReason
} from '@whiskeysockets/baileys'
import Pino from 'pino'
import qrcode from 'qrcode-terminal'
import fs from 'fs'
import path from 'path'

// Almacenamiento de subbots activos
const subbots = new Map()

class Subbot {
  constructor(userId, mainConn) {
    this.userId = userId
    this.mainConn = mainConn
    this.sock = null
    this.isConnected = false
    this.connectionType = 'qr'
    this.sessionPath = `./sessions/subbot_${userId}`
    this.pairingCode = null
    this.qrCode = null
    this.connectionPromise = null
  }

  async initialize(connectionType = 'qr') {
    this.connectionType = connectionType
    
    // Crear directorio de sesión si no existe
    fs.mkdirSync(this.sessionPath, { recursive: true })

    const { state, saveCreds } = await useMultiFileAuthState(this.sessionPath)
    const { version } = await fetchLatestBaileysVersion()
    
    const logger = Pino({ level: 'silent' })

    this.sock = makeWASocket({
      logger,
      auth: state,
      browser: [global.namebot || 'Subbot', 'Chrome', '1.0.0'],
      version,
      printQRInTerminal: false
    })

    // Guardar credenciales
    this.sock.ev.on('creds.update', saveCreds)

    // Manejar actualizaciones de conexión
    this.sock.ev.on('connection.update', async (update) => {
      const { connection, qr, lastDisconnect } = update

      // Si es QR y estamos esperando QR
      if (qr && this.connectionType === 'qr' && !this.isConnected) {
        this.qrCode = qr
        console.log(`\n[Subbot ${this.userId}] QR generado:`)
        qrcode.generate(qr, { small: true })
        
        // Enviar QR al usuario por el bot principal
        try {
          await this.mainConn.sendMessage(this.userId + '@s.whatsapp.net', {
            text: `> . ﹡ ﹟ 📷 ׄ ⬭ *¡ǫʀ ᴅᴇʟ sᴜʙʙᴏᴛ!*
            
*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜📷* ㅤ֢ㅤ⸱ㅤᯭִ*
ׅㅤ𓏸𓈒ㅤׄ *ɪᴅ* :: ${this.userId}
ׅㅤ𓏸𓈒ㅤׄ *ᴇsᴛᴀᴅᴏ* :: Escanea el QR

> Escanea este QR en WhatsApp > Dispositivos vinculados

*Nota:* El QR expira en 60 segundos. Si expira, usa ${global.prefix || '.'}qr de nuevo.`
          })
        } catch (err) {
          console.error('Error enviando QR:', err)
        }
      }

      if (connection === 'open') {
        this.isConnected = true
        console.log(`[Subbot ${this.userId}] Conectado`)
        
        try {
          await this.mainConn.sendMessage(this.userId + '@s.whatsapp.net', {
            text: `> . ﹡ ﹟ ✅ ׄ ⬭ *¡sᴜʙʙᴏᴛ ᴄᴏɴᴇᴄᴛᴀᴅᴏ!*
            
*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜✅* ㅤ֢ㅤ⸱ㅤᯭִ*
ׅㅤ𓏸𓈒ㅤׄ *ɴúᴍᴇʀᴏ* :: ${this.sock.user?.id?.split(':')[0] || this.userId}
ׅㅤ𓏸𓈒ㅤׄ *ᴇsᴛᴀᴅᴏ* :: En línea

> Tu subbot está activo y listo para usar.

> • ${global.prefix || '.'}stopsocket - Detener subbot
> • ${global.prefix || '.'}listbots - Ver estado`
          })
        } catch {}
      }

      if (connection === 'close') {
        this.isConnected = false
        const reason = lastDisconnect?.error?.output?.statusCode
        
        if (reason === DisconnectReason.loggedOut) {
          this.destroy()
        } else {
          console.log(`[Subbot ${this.userId}] Reconectando...`)
          setTimeout(() => this.initialize(this.connectionType), 3000)
        }
      }
    })

    // Manejar mensajes del subbot
    this.sock.ev.on('messages.upsert', async (m) => {
      // Aquí puedes agregar lógica para que el subbot responda mensajes
    })

    return this
  }

  async requestPairingCode(phoneNumber) {
    if (!this.sock) throw new Error('Subbot no inicializado')
    
    // Limpiar número
    const cleanNumber = phoneNumber.replace(/[^0-9]/g, '')
    
    // Formato para México: agregar 1 después del 52 si falta
    let formattedNumber = cleanNumber
    if (formattedNumber.startsWith('52') && formattedNumber.length === 12) {
      formattedNumber = '521' + formattedNumber.slice(2)
    }
    
    try {
      console.log(`[Subbot ${this.userId}] Solicitando código para: ${formattedNumber}`)
      const code = await this.sock.requestPairingCode(formattedNumber)
      this.pairingCode = code
      console.log(`[Subbot ${this.userId}] Código generado: ${code}`)
      return code
    } catch (error) {
      console.error('Error solicitando código:', error)
      throw error
    }
  }

  async destroy() {
    try {
      if (this.sock) {
        await this.sock.logout()
      }
      fs.rmSync(this.sessionPath, { recursive: true, force: true })
    } catch (err) {
      console.error('Error destruyendo subbot:', err)
    }
    subbots.delete(this.userId)
  }

  getStatus() {
    return {
      userId: this.userId,
      isConnected: this.isConnected,
      connectionType: this.connectionType,
      pairingCode: this.pairingCode,
      user: this.sock?.user || null
    }
  }
}

// Funciones exportadas
export function createSubbot(userId, mainConn) {
  if (subbots.has(userId)) {
    const existing = subbots.get(userId)
    existing.destroy()
  }
  
  const subbot = new Subbot(userId, mainConn)
  subbots.set(userId, subbot)
  return subbot
}

export function getSubbot(userId) {
  return subbots.get(userId) || null
}

export function removeSubbot(userId) {
  const subbot = subbots.get(userId)
  if (subbot) {
    subbot.destroy()
    return true
  }
  return false
}

export function listSubbots() {
  return Array.from(subbots.values()).map(s => s.getStatus())
}

export function getSubbotsCount() {
  return subbots.size
}

export { Subbot }
