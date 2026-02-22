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

// Limpia el número para cualquier país
function limpiarNumero(numero) {
  // Quita todo excepto dígitos
  return numero.replace(/[^0-9]/g, '')
}

let asked = false

async function start() {
  const { state, saveCreds } = await useMultiFileAuthState('./session')
  const { version } = await fetchLatestBaileysVersion()

  let usarQR = true
  let numeroGuardado = null

  if (!state.creds.registered && !asked) {
    asked = true

    console.log(`\n╔════════════════════════════════════╗`)
    console.log(`║     ${global.namebot} v${global.vs}      ║`)
    console.log(`╚════════════════════════════════════╝\n`)
    console.log('1. 📱 Código de emparejamiento')
    console.log('2. 📷 Código QR\n')

    const opcion = await question('Opción (1 o 2): ')

    if (opcion.trim() === '1') {
      usarQR = false
      const raw = await question('\n📞 Número con código de país (ej: 521XXXXXXXXXX, 1XXXXXXXXXX):\n> ')
      numeroGuardado = limpiarNumero(raw)
      console.log(`\n✅ Número registrado: ${numeroGuardado}`)
      console.log('⏳ Conectando, espera el código...\n')
    }
  }

  const sock = makeWASocket({
    logger: Pino({ level: 'silent' }),
    auth: state,
    browser: [global.namebot, 'Chrome', global.vs],
    version,
    printQRInTerminal: false
  })

  // Pedir código cuando el socket ya esté listo
  if (!state.creds.registered && !usarQR && numeroGuardado) {
    // Esperar a que el socket se conecte al servidor antes de pedir el código
    await new Promise((resolve) => {
      const unsub = sock.ev.on('connection.update', (update) => {
        // Cuando empieza a conectar ya podemos pedir el código
        if (update.connection === 'connecting' || update.qr) {
          unsub()
          resolve()
        }
      })
      // Timeout de seguridad por si no llega el evento
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

    if (qr && usarQR) {
      console.log('\n📷 Escanea el QR:')
      qrcode.generate(qr, { small: true })
    }

    if (connection === 'open') {
      console.log(`\n✅ ${global.namebot} conectado\n`)

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
