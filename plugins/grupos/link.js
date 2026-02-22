import { isAdmin, isOwner } from '../../lib/permissions.js'

let handler = async (m, { sock }) => {
  if (!m.chat.endsWith('@g.us')) return

  if (!isOwner(m.sender) && !await isAdmin(sock, m.chat, m.sender)) {
    return sock.sendMessage(m.chat, { 
      text: '✧ Solo admins pueden usar este comando' 
    }, { quoted: m })
  }

  try {
    const code = await sock.groupInviteCode(m.chat)
    const link = `https://chat.whatsapp.com/${code}`

    await sock.sendMessage(m.chat, {
      text: `✧ *Enlace del grupo*
❀ ${link}`
    }, { quoted: m })

  } catch {
    await sock.sendMessage(m.chat, {
      text: '✧ No se pudo obtener el enlace'
    }, { quoted: m })
  }
}

handler.help = ['link', 'enlace']
handler.tags = ['group', 'admin']
handler.command = ['link', 'enlace']

export default handler
