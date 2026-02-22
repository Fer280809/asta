import { isAdmin, isOwner } from '../../lib/permissions.js'

let handler = async (m, { sock }) => {
  if (!m.chat.endsWith('@g.us')) return

  if (!isOwner(m.sender) && !await isAdmin(sock, m.chat, m.sender)) {
    return sock.sendMessage(m.chat, {
      text: '✧ Solo admins pueden borrar mensajes'
    }, { quoted: m })
  }

  if (!m.quoted) {
    return sock.sendMessage(m.chat, {
      text: '✧ Responde al mensaje que quieres borrar'
    }, { quoted: m })
  }

  try {
    await sock.sendMessage(m.chat, {
      delete: {
        remoteJid: m.chat,
        fromMe: m.quoted.fromMe,
        id: m.quoted.id,
        participant: m.quoted.sender
      }
    })
  } catch (e) {
    await sock.sendMessage(m.chat, {
      text: '✧ No se pudo borrar el mensaje'
    }, { quoted: m })
  }
}

handler.help = ['del', 'delete', 'borrar']
handler.tags = ['group', 'admin']
handler.command = ['del', 'delete', 'borrar']

export default handler
