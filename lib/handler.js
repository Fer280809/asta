import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

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
        console.error(`Error en ${file}:`, err.message)
      }
    }

  } catch (error) {
    console.error('Handler error:', error)
  }
}
