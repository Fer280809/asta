import './setting.js'
import makeWASocket, {
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  DisconnectReason
} from '@whiskeysockets/baileys'
import Pino from 'pino'
import qrcode from 'qrcode-terminal'
import readline from 'readline'
import { handler } from './lib/handler.js'

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

function preguntarMetodo() {
  return new Promise((resolve) => {
    console.log(`\n╔════════════════════════════════════╗`)
    console.log(`║     ${global.namebot} v${global.vs}      ║`)
    console.log(`╚════════════════════════════════════╝\n`)
    console.log('1. 📱 Código de emparejamiento')
    console.log('2. 📷 Código QR\n')
    rl.question('Opción (1 o 2): ', (r) => resolve(r.trim()))
  })
}

function pedirNumero() {
  return new Promise((resolve) => {
    rl.question('\n📞 Número (con código de país):\n> ', (n) => resolve(n.trim()))
  })
}

async function start() {
  const { state, saveCreds } = await useMultiFileAuthState('./session')
  const { version } = await fetchLatestBaileysVersion()
  
  let sock
  let metodo = 'qr'

  if (!state.creds.registered) {
    const opcion = await preguntarMetodo()
    
    if (opcion === '1') {
      metodo = 'code'
      const numero = await pedirNumero()
      
      sock = makeWASocket({
        logger: Pino({ level: 'silent' }),
        auth: state,
        browser: [global.namebot, 'Chrome', global.vs],
        version,
        printQRInTerminal: false
      })
      
      if (!sock.authState.creds.registered) {
        try {
          const code = await sock.requestPairingCode(numero)
          console.log(`\n╔════════════════════════════════════╗`)
          console.log(`║   🔑 CÓDIGO: ${code}    ║`)
          console.log(`╚════════════════════════════════════╝\n`)
        } catch (err) {
          console.log('Error con código, usando QR...')
          metodo = 'qr'
        }
      }
    }
  }

  if (metodo === 'qr' || state.creds.registered) {
    sock = makeWASocket({
      logger: Pino({ level: 'silent' }),
      auth: state,
      browser: [global.namebot, 'Chrome', global.vs],
      version,
      printQRInTerminal: true
    })
  }

  rl.close()

  sock.ev.on('connection.update', async (update) => {
    const { connection, qr, lastDisconnect } = update

    if (qr && metodo === 'qr') {
      console.log('\n📷 Escanea el QR:')
      qrcode.generate(qr, { small: true })
    }

    if (connection === 'open') {
      console.log(`\n✅ ${global.namebot} conectado`)
      
      for (let [numero] of global.owner) {
        try {
          await sock.sendMessage(`${numero}@s.whatsapp.net`, {
            text: `🤖 *${global.namebot}* en línea\n📅 ${new Date().toLocaleString()}`
          })
        } catch {}
      }
    }

    if (connection === 'close') {
      const reason = lastDisconnect?.error?.output?.statusCode
      if (reason !== DisconnectReason.loggedOut) {
        console.log('🔄 Reconectando...')
        start()
      } else {
        console.log('❌ Sesión cerrada')
        process.exit(0)
      }
    }
  })

  sock.ev.on('creds.update', saveCreds)
  sock.ev.on('messages.upsert', async (m) => await handler(sock, m))
}

start().catch(console.error)
