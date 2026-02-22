import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion
} from '@whiskeysockets/baileys'
import Pino from 'pino'
import fs from 'fs'
import path from 'path'

const sessionId = process.argv[2]
const sessionPath = process.env.SUBBOT_PATH || `./Sessions/SubBots/${sessionId}`

// Cargar config del subbot
const configPath = path.join(sessionPath, 'config.json')
let subbotConfig = {
  prefix: '#',
  name: 'SubBot',
  owner: null,
  config: {}
}

if (fs.existsSync(configPath)) {
  subbotConfig = { ...subbotConfig, ...JSON.parse(fs.readFileSync(configPath, 'utf-8')) }
}

const logger = Pino({ level: 'silent' })

async function startSubBot() {
  const { state, saveCreds } = await useMultiFileAuthState(sessionPath)
  const { version } = await fetchLatestBaileysVersion()

  const sock = makeWASocket({
    version,
    auth: state,
    logger,
    browser: [subbotConfig.name, 'Chrome', '1.0']
  })

  sock.ev.on('creds.update', saveCreds)

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect } = update

    if (connection === 'open') {
      console.log(`SubBot ${sessionId} connected: ${sock.user.id}`)

      // Notificar al owner
      if (subbotConfig.owner) {
        sock.sendMessage(subbotConfig.owner, {
          text: `✅ *${subbotConfig.name} conectado!*\n\n🤖 Número: ${sock.user.id.split(':')[0]}\n⚙️ Prefijo: ${subbotConfig.prefix}\n\nUsa ${subbotConfig.prefix}menu para ver comandos.`
        }).catch(() => {})
      }
    }

    if (connection === 'close') {
      const reason = lastDisconnect?.error?.output?.statusCode
      if (reason !== DisconnectReason.loggedOut) {
        console.log(`SubBot ${sessionId} reconnecting...`)
        setTimeout(startSubBot, 5000)
      }
    }
  })

  // Handler simple de mensajes para SubBot
  sock.ev.on('messages.upsert', async ({ messages }) => {
    const msg = messages[0]
    if (!msg?.message) return
    if (msg.key.fromMe) return

    const body = (
      msg.message.conversation ||
      msg.message.extendedTextMessage?.text ||
      ''
    ).trim()

    if (!body.startsWith(subbotConfig.prefix)) return

    const args = body.slice(subbotConfig.prefix.length).trim().split(/\s+/)
    const command = args.shift()?.toLowerCase()

    // Comandos básicos del SubBot
    if (command === 'menu') {
      await sock.sendMessage(msg.key.remoteJid, {
        text: `*${subbotConfig.name}*\n\nComandos disponibles:\n${subbotConfig.prefix}menu - Ver menú\n${subbotConfig.prefix}ping - Ver velocidad\n${subbotConfig.prefix}info - Info del bot`
      }, { quoted: msg })
    }

    if (command === 'ping') {
      await sock.sendMessage(msg.key.remoteJid, {
        text: `Pong! 🏓\nVelocidad: ${Date.now() - msg.messageTimestamp}ms`
      }, { quoted: msg })
    }

    if (command === 'info') {
      await sock.sendMessage(msg.key.remoteJid, {
        text: `*${subbotConfig.name}*\n🤖 SubBot de AstaBot\n👤 Owner: @${subbotConfig.owner?.split('@')[0] || 'Desconocido'}\n⚙️ Prefijo: ${subbotConfig.prefix}`,
        mentions: subbotConfig.owner ? [subbotConfig.owner] : []
      }, { quoted: msg })
    }
  })
}

startSubBot()
