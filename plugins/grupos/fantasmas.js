import fs from 'fs'
import { isOwner } from '../../lib/permissions.js'

const file = './data/actividad.json'
const day = 24 * 60 * 60 * 1000

function load() {
  if (!fs.existsSync(file)) return {}
  return JSON.parse(fs.readFileSync(file))
}

let handler = async (m, { sock }) => {
  if (!m.chat.endsWith('@g.us')) return

  try {
    const metadata = await sock.groupMetadata(m.chat)
    const members = metadata.participants || []
    const botJid = sock.user.id.split(':')[0] + '@s.whatsapp.net'

    const db = load()
    const now = Date.now()

    let ghostList = []
    let kicked = 0

    for (const p of members) {
      const user = p.id

      if (user === botJid) continue
      if (isOwner(user)) continue
      if (p.admin) continue
      if (!db[user]) continue

      const baseTime = db[user].last || db[user].join
      const days = Math.floor((now - baseTime) / day)

      if (days >= 1) {
        ghostList.push(`@${user.split('@')[0]} — ${days} días`)
      }

      // Auto-kick si tiene 5+ días inactivo
      if (days >= 5) {
        try {
          await sock.groupParticipantsUpdate(m.chat, [user], 'remove')
          await new Promise(r => setTimeout(r, 1200))
          kicked++
        } catch {}
      }
    }

    if (!ghostList.length) {
      return sock.sendMessage(m.chat, {
        text: '✧ No hay usuarios inactivos'
      }, { quoted: m })
    }

    let text = `✧ *Lista de inactivos*

${ghostList.join('
')}`
    if (kicked > 0) text += `

✧ *Expulsados automáticamente:* ${kicked}`

    await sock.sendMessage(m.chat, {
      text: text,
      mentions: ghostList.map(x => x.match(/@(\d+)/)[1] + '@s.whatsapp.net')
    }, { quoted: m })

  } catch (e) {
    console.error(e)
  }
}

handler.help = ['fantasmas', 'inactivos', 'ghosts']
handler.tags = ['group', 'admin']
handler.command = ['fantasmas', 'inactivos', 'ghosts']

export default handler
