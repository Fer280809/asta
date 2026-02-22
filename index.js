import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion
} from '@whiskeysockets/baileys'

import Pino from 'pino'
import chalk from 'chalk'
import qrcode from 'qrcode-terminal'
import { Boom } from '@hapi/boom'

import { handleMessage, handleEvent, loadPlugins } from './lib/handler.js'
import config from './config.js'

const logger = Pino({ level: 'silent' })

async function startBot() {
  console.log(chalk.cyan(`
╔════════════════════════════════════╗
║     ${config.botname}               ║
║     By ${config.etiqueta}           ║
╚════════════════════════════════════╝
`))

  // Cargar plugins antes de conectar
  await loadPlugins()

  const { state, saveCreds } = await useMultiFileAuthState('./Sessions/Principal')
  const { version } = await fetchLatestBaileysVersion()

  const sock = makeWASocket({
    version,
    auth: state,
    logger,
    browser: [config.botname, 'Chrome', '2.0'],
    printQRInTerminal: false
  })

  sock.ev.on('creds.update', saveCreds)

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update

    if (qr) {
      qrcode.generate(qr, { small: true })
    }

    if (connection === 'open') {
      console.log(chalk.green('✅ Bot conectado correctamente'))
      console.log(chalk.cyan(`📱 Número: ${sock.user.id.split(':')[0]}`))
    }

    if (connection === 'close') {
      const reason = new Boom(lastDisconnect?.error)?.output?.statusCode
      if (reason !== DisconnectReason.loggedOut) {
        console.log(chalk.yellow('♻️ Reconectando...'))
        setTimeout(startBot, 5000)
      } else {
        console.log(chalk.red('❌ Sesión cerrada, elimina la carpeta Sessions'))
      }
    }
  })

  // Handler de mensajes
  sock.ev.on('messages.upsert', async ({ messages }) => {
    const msg = messages[0]
    if (!msg?.message) return
    if (msg.key?.remoteJid === 'status@broadcast') return
    await handleMessage(sock, msg)
  })

  // Handler de eventos de grupo
  sock.ev.on('group-participants.update', async (update) => {
    update.event = 'group-participants.update'
    await handleEvent(sock, update)
  })
}

startBot()
