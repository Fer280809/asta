import fs from 'fs'
import path from 'path'

const file = './data/actividad.json'

function load() {
  if (!fs.existsSync(file)) return {}
  try {
    return JSON.parse(fs.readFileSync(file))
  } catch {
    return {}
  }
}

let handler = async (m, { sock }) => {
  if (!m.chat.endsWith('@g.us')) return

  try {
    const metadata = await sock.groupMetadata(m.chat)
    const members = metadata.participants || []
    const db = load()

    let lista = []

    for (const p of members) {
      const user = p.id
      if (!db[user]) continue
      const mensajes = db[user].messages ?? 0
      if (mensajes <= 0) continue

      lista.push({ user, mensajes })
    }

    if (!lista.length) {
      return sock.sendMessage(m.chat, {
        text: '✧ No hay actividad registrada'
      }, { quoted: m })
    }

    lista.sort((a, b) => b.mensajes - a.mensajes)
    const top = lista.slice(0, 10)

    let texto = '✧ *Top 10 usuarios más activos*

'
    top.forEach((u, i) => {
      texto += `${i + 1}. @${u.user.split('@')[0]} — ${u.mensajes} mensajes
`
    })

    await sock.sendMessage(m.chat, {
      text: texto,
      mentions: top.map(x => x.user)
    }, { quoted: m })

  } catch (e) {
    console.error(e)
  }
}

handler.help = ['activos', 'top', 'actividad']
handler.tags = ['group', 'info']
handler.command = ['activos', 'top', 'actividad']

export default handler
