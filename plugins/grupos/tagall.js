import { isAdmin, isOwner } from '../../lib/permissions.js'

let handler = async (m, { sock, text }) => {
  if (!m.chat.endsWith('@g.us')) return

  if (!isOwner(m.sender) && !await isAdmin(sock, m.chat, m.sender)) {
    return sock.sendMessage(m.chat, { 
      text: '✧ Solo admins pueden usar este comando' 
    }, { quoted: m })
  }

  try {
    const metadata = await sock.groupMetadata(m.chat)
    const users = metadata.participants.map(p => p.id)

    const message = text || '📢 ¡Atención a todos!'

    await sock.sendMessage(m.chat, {
      text: `${message}

${users.map(u => `@${u.split('@')[0]}`).join(' ')}`,
      mentions: users
    }, { quoted: m })

  } catch (e) {
    console.error(e)
  }
}

handler.help = ['tagall', 'todos', 'invocar']
handler.tags = ['group', 'admin']
handler.command = ['tagall', 'todos', 'invocar']

export default handler
