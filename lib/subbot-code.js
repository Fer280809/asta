import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion
} from '@whiskeysockets/baileys'
import Pino from 'pino'
import fs from 'fs'

const sessionId = process.argv[2]
const sessionPath = process.argv[3]

const logger = Pino({ level: 'silent' })

async function generateCode() {
  const { state, saveCreds } = await useMultiFileAuthState(sessionPath)
  const { version } = await fetchLatestBaileysVersion()

  const sock = makeWASocket({
    version,
    auth: state,
    logger,
    browser: ['SubBot', 'Chrome', '1.0'],
    printQRInTerminal: false
  })

  // Solicitar código de emparejamiento
  const phoneNumber = sessionId.split('_')[0]
  if (phoneNumber) {
    try {
      const code = await sock.requestPairingCode(phoneNumber)
      console.log('CODE:' + code)
      fs.writeFileSync(`${sessionPath}/code.txt`, code)
    } catch (e) {
      console.log('ERROR:' + e.message)
    }
  }

  sock.ev.on('creds.update', saveCreds)

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect } = update

    if (connection === 'open') {
      console.log('CONNECTED:' + sock.user.id)
      fs.writeFileSync(`${sessionPath}/info.json`, JSON.stringify({
        connected: true,
        user: sock.user,
        connectedAt: new Date().toISOString()
      }))

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

generateCode()
