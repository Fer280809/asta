import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import chalk from 'chalk'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

function getTipoMensaje(msg) {
  const tipos = [
    'conversation', 'imageMessage', 'videoMessage', 'audioMessage',
    'stickerMessage', 'documentMessage', 'extendedTextMessage',
    'reactionMessage', 'locationMessage', 'contactMessage',
    'pollCreationMessage', 'buttonsResponseMessage', 'listResponseMessage'
  ]
  for (const tipo of tipos) {
    if (msg.message?.[tipo]) return tipo
  }
  return 'desconocido'
}

function printMensaje(m, conn, texto) {
  try {
    const tipo = getTipoMensaje(m)
    const jid = m.key?.remoteJid || ''
    const esGrupo = jid.endsWith('@g.us')
    const participante = m.key?.participant || jid
    const numero = participante.replace('@s.whatsapp.net', '').replace('@g.us', '')
    const hora = new Date().toLocaleTimeString()

    const iconos = {
      conversation: '💬', extendedTextMessage: '💬',
      imageMessage: '🖼️', videoMessage: '🎥',
      audioMessage: '🎵', stickerMessage: '🎭',
      documentMessage: '📄', reactionMessage: '❤️',
      locationMessage: '📍', contactMessage: '👤',
      pollCreationMessage: '📊', buttonsResponseMessage: '🔘',
      listResponseMessage: '📋', desconocido: '❓'
    }

    const icono = iconos[tipo] || '❓'

    console.log(chalk.gray('─'.repeat(50)))

    if (esGrupo) {
      const nombreGrupo = conn?.chats?.[jid]?.name || jid.replace('@g.us', '')
      console.log(chalk.cyan('👥 Grupo:'), chalk.bold(nombreGrupo))
      console.log(chalk.yellow('👤 De:'), chalk.bold(numero))
    } else {
      const nombreContacto = conn?.chats?.[jid]?.name || numero
      console.log(chalk.green('👤 Usuario:'), chalk.bold(nombreContacto), chalk.gray(`(${numero})`))
    }

    console.log(chalk.magenta(`${icono} Tipo:`), chalk.bold(tipo))

    if (texto) {
      console.log(chalk.blue('📝 Mensaje:'), chalk.white(texto))
    }

    console.log(chalk.gray(`🕐 ${hora}`))
  } catch {}
}

export async function handler(conn, chat) {
  try {
    const m = chat.messages[0]
    if (!m.message) return

    const from = m.key.remoteJid
    const sender = m.key.participant || from
    const isGroup = from.endsWith('@g.us')
    const usedPrefix = global.prefix

    const text =
      m.message?.conversation ||
      m.message?.extendedTextMessage?.text ||
      m.message?.imageMessage?.caption ||
      m.message?.videoMessage?.caption ||
      ''

    // ✅ Print de todos los mensajes entrantes (con o sin comando)
    printMensaje(m, conn, text)

    if (!text) return
    if (!text.startsWith(usedPrefix)) return

    const args = text.slice(usedPrefix.length).trim().split(/\s+/)
    const command = args.shift().toLowerCase()

    const isOwner = global.owner.some(([numero]) =>
      sender.includes(numero)
    )

    m.chat = from
    m.sender = sender
    m.timestamp = Date.now()
    m.isGroup = isGroup

    const pluginsDir = path.join(process.cwd(), 'plugins')
    const files = fs.readdirSync(pluginsDir).filter(f => f.endsWith('.js'))

    for (const file of files) {
      try {
        const { default: plugin } = await import(`../plugins/${file}?update=${Date.now()}`)

        if (!plugin.command) continue

        const cmds = Array.isArray(plugin.command) ? plugin.command : [plugin.command]

        if (cmds.includes(command)) {
          // ✅ Resaltar cuando se ejecuta un comando
          console.log(chalk.bgBlue.white(`\n⚡ Comando: ${usedPrefix}${command}`), chalk.gray(`args: [${args.join(', ')}]`))

          if (plugin.owner && !isOwner) {
            await conn.sendMessage(from, { text: global.msj.soloOwner })
            return
          }

          if (plugin.group && !isGroup) {
            await conn.sendMessage(from, { text: global.msj.soloGrupo })
            return
          }

          await plugin(m, { conn, args, usedPrefix, isOwner })
          return
        }
      } catch (err) {
        console.error(chalk.red(`❌ Error en ${file}:`), err.message)
      }
    }

  } catch (error) {
    console.error(chalk.red('❌ Handler error:'), error)
  }
}
