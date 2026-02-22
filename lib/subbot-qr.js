import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion
} from '@whiskeysockets/baileys'
import Pino from 'pino'
import fs from 'fs'
import qrcode from 'qrcode'

const sessionId = process.argv[2]
const sessionPath = process.argv[3]

const logger = Pino({ level: 'silent' })

async function generateQR() {
  const { state, saveCreds } = await useMultiFileAuthState(sessionPath)
  const { version } = await fetchLatestBaileysVersion()

  const sock = makeWASocket({
    version,
    auth: state,
    logger,
    browser: ['SubBot', 'Chrome', '1.0'],
    printQRInTerminal: false
  })

  sock.ev.on('creds.update', saveCreds)

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update

    if (qr) {
      // Generar QR como imagen base64
      const qrData = await qrcode.toDataURL(qr)
      console.log('QR:' + qrData)

      // Guardar QR en archivo para referencia
      fs.writeFileSync(`${sessionPath}/qr.txt`, qr)
    }

    if (connection === 'open') {
      console.log('CONNECTED:' + sock.user.id)
      fs.writeFileSync(`${sessionPath}/info.json`, JSON.stringify({
        connected: true,
        user: sock.user,
        connectedAt: new Date().toISOString()
      }))

      // Mantener conexión por un tiempo para que se complete
      setTimeout(() => {
        process.exit(0)
      }, 30000)
    }

    if (connection === 'close') {
      const reason = lastDisconnect?.error?.output?.statusCode
      if (reason === DisconnectReason.loggedOut) {
        console.log('LOGGED_OUT')
        process.exit(1)
      }
    }
  })
}

generateQR()
