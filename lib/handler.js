import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import chalk from 'chalk'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// ✅ Función para verificar si un usuario está muteado
async function verificarMute(conn, from, sender) {
  // Solo aplica en grupos
  if (!from.endsWith('@g.us')) return false
  
  // Verificar si existe registro de mute
  if (!global.db.data.chats?.[from]?.mutes?.[sender]) return false
  
  const muteData = global.db.data.chats[from].mutes[sender]
  
  // Si tiene expiración y ya pasó, eliminar el mute
  if (muteData.expiresAt && Date.now() > muteData.expiresAt) {
    delete global.db.data.chats[from].mutes[sender]
    console.log(chalk.yellow(`⏰ Mute expirado para ${sender.split('@')[0]} en ${from.split('-')[0]}`))
    return false
  }
  
  // Si está activo, retorna true
  return muteData.active === true
}

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
  return null
}

function printMensaje(m, conn, texto, tipo) {
  try {
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
      listResponseMessage: '📋'
    }

    console.log(chalk.gray('─'.repeat(50)))

    if (esGrupo) {
      const nombreGrupo = conn?.chats?.[jid]?.name || jid.replace('@g.us', '')
      console.log(chalk.cyan('👥 Grupo:'), chalk.bold(nombreGrupo))
      console.log(chalk.yellow('👤 De:'), chalk.bold(numero))
    } else {
      const nombreContacto = conn?.chats?.[jid]?.name || numero
      console.log(chalk.green('👤 Usuario:'), chalk.bold(nombreContacto), chalk.gray(`(${numero})`))
    }

    console.log(chalk.magenta(`${iconos[tipo] || '💬'} Tipo:`), chalk.bold(tipo))
    if (texto) console.log(chalk.blue('📝 Mensaje:'), chalk.white(texto))
    console.log(chalk.gray(`🕐 ${hora}`))
  } catch {}
}

// ✅ Carga recursiva de plugins en todas las subcarpetas
function cargarPlugins(dir) {
  let archivos = []
  if (!fs.existsSync(dir)) return archivos

  const items = fs.readdirSync(dir)
  for (const item of items) {
    const fullPath = path.join(dir, item)
    const stat = fs.statSync(fullPath)
    if (stat.isDirectory()) {
      // Entrar recursivamente en subcarpetas
      archivos = archivos.concat(cargarPlugins(fullPath))
    } else if (item.endsWith('.js')) {
      archivos.push(fullPath)
    }
  }
  return archivos
}

export async function handler(conn, chat) {
  try {
    const m = chat.messages[0]
    if (!m?.message) return
    if (m.key?.remoteJid === 'status@broadcast') return
    if (m.message?.protocolMessage) return

    const tipo = getTipoMensaje(m)
    if (!tipo) return

    const from = m.key.remoteJid
    const sender = m.key.participant || from
    const isGroup = from.endsWith('@g.us')
    const fromMe = m.key?.fromMe || false
    const usedPrefix = global.prefix

    const text =
      m.message?.conversation ||
      m.message?.extendedTextMessage?.text ||
      m.message?.imageMessage?.caption ||
      m.message?.videoMessage?.caption ||
      ''

    if (!fromMe) printMensaje(m, conn, text, tipo)

    // ✅ VERIFICAR SI EL USUARIO ESTÁ MUTEADO
    const estaMuteado = await verificarMute(conn, from, sender)
    
    if (estaMuteado) {
      try {
        // Eliminar el mensaje automáticamente
        await conn.sendMessage(from, { delete: m.key })
        
        // Mensaje informativo aleatorio (50% probabilidad para evitar flood)
        if (Math.random() < 0.5) {
          await conn.sendMessage(from, {
            text: `🔇 @${sender.split('@')[0]} está silenciado y no puede enviar mensajes.`,
            mentions: [sender]
          }).catch(() => null)
        }
        
        console.log(chalk.dim(`🔇 Mensaje eliminado de usuario muteado: ${sender.split('@')[0]}`))
      } catch (e) {
        console.error(chalk.red('Error al eliminar mensaje muteado:'), e.message)
      }
      return
    }

    if (!text || !text.startsWith(usedPrefix)) return

    const args = text.slice(usedPrefix.length).trim().split(/\s+/)
    const command = args.shift().toLowerCase()

    const isOwner = global.owner.some(([numero]) => sender.includes(numero))

    m.chat = from
    m.sender = sender
    m.timestamp = Date.now()
    m.isGroup = isGroup

    // ✅ Cargar plugins de todas las carpetas y subcarpetas
    const pluginsDir = path.join(process.cwd(), 'plugins')
    const archivos = cargarPlugins(pluginsDir)

    for (const filePath of archivos) {
      try {
        const { default: plugin } = await import(`${filePath}?update=${Date.now()}`)

        if (!plugin?.command) continue

        const cmds = Array.isArray(plugin.command) ? plugin.command : [plugin.command]

        if (cmds.includes(command)) {
          // Mostrar de qué carpeta viene el plugin
          const relativo = path.relative(pluginsDir, filePath)
          console.log(
            chalk.bgBlue.white(`\n⚡ Comando: ${usedPrefix}${command}`),
            chalk.gray(`[${relativo}]`),
            chalk.gray(`args: [${args.join(', ')}]`)
          )

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
        console.error(chalk.red(`❌ Error en ${path.relative(pluginsDir, filePath)}:`), err.message)
      }
    }

  } catch (error) {
    console.error(chalk.red('❌ Handler error:'), error)
  }
}
