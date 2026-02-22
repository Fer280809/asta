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
import { onGroupUpdate } from './plugins/eventos/group-events.js'

function question(q) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    })
    rl.question(q, (answer) => {
      rl.close()
      resolve(answer)
    })
  })
}

function limpiarNumero(numero) {
  return numero.replace(/[^0-9]/g, '')
}

let asked = false

async function start() {
  const { state, saveCreds } = await useMultiFileAuthState('./session')
  const { version } = await fetchLatestBaileysVersion()

  let usarQR = true
  let numeroGuardado = null

  const sesionExiste = state.creds.registered || state.creds.me?.id

  if (!sesionExiste && !asked) {
    asked = true

    console.log(`\n╔════════════════════════════════════╗`)
    console.log(`║     ${global.namebot} v${global.vs}      ║`)
    console.log(`╚════════════════════════════════════╝\n`)
    console.log('1. 📱 Código de emparejamiento')
    console.log('2. 📷 Código QR\n')

    const opcion = await question('Opción (1 o 2): ')

    if (opcion.trim() === '1') {
      usarQR = false
      const raw = await question('\n📞 Número con código de país (ej: 521XXXXXXXXXX):\n> ')
      numeroGuardado = limpiarNumero(raw)
      console.log(`\n✅ Número registrado: ${numeroGuardado}`)
      console.log('⏳ Conectando, espera el código...\n')
    }
  } else if (sesionExiste) {
    console.log(`\n⏳ Reconectando ${global.namebot}...\n`)
  }

  const logger = Pino({ level: 'fatal' })

  const sock = makeWASocket({
    logger,
    auth: state,
    browser: [global.namebot, 'Chrome', global.vs],
    version,
    printQRInTerminal: false
  })

  if (!sesionExiste && !usarQR && numeroGuardado) {
    await new Promise((resolve) => {
      const listener = (update) => {
        if (update.connection === 'connecting' || update.qr) {
          sock.ev.off('connection.update', listener)
          resolve()
        }
      }
      sock.ev.on('connection.update', listener)
      setTimeout(resolve, 5000)
    })

    try {
      const code = await sock.requestPairingCode(numeroGuardado)
      console.log(`\n╔════════════════════════════════════╗`)
      console.log(`║   🔑 CÓDIGO: ${code}         ║`)
      console.log(`╚════════════════════════════════════╝\n`)
      console.log('📱 Ingresa este código en WhatsApp > Dispositivos vinculados\n')
    } catch (err) {
      console.log('❌ Error al obtener código:', err.message)
      console.log('💡 Intenta de nuevo o usa el método QR')
    }
  }

  sock.ev.on('connection.update', async (update) => {
    const { connection, qr, lastDisconnect } = update

    if (qr && usarQR && !sesionExiste) {
      console.log('\n📷 Escanea el QR:')
      qrcode.generate(qr, { small: true })
    }

    if (connection === 'open') {
      console.log(`\n✅ ${global.namebot} conectado\n`)
      try {
        const botId = sock.user?.id?.replace(/:.*@/, '@') || ''
        if (botId) {
          await sock.sendMessage(botId, {
            text: `🤖 *${global.namebot}* en línea\n📅 ${new Date().toLocaleString()}`
          })
        }
      } catch {}
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

  // ✅ Listener de eventos de grupo
  sock.ev.on('group-participants.update', async (update) => {
    await onGroupUpdate(sock, update)
  })
}

start().catch(console.error)
