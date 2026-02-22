import { isAdmin, isOwner } from '../../lib/permissions.js'

let handler = async (m, { sock }) => {
  if (!m.chat.endsWith('@g.us')) return

  if (!isOwner(m.sender) && !await isAdmin(sock, m.chat, m.sender)) {
    return sock.sendMessage(m.chat, {
      text: '✧ *Permiso denegado*
❀ No tienes autorización'
    }, { quoted: m })
  }

  const target = m.quoted?.sender || m.mentionedJid?.[0]

  if (!target) {
    return sock.sendMessage(m.chat, {
      text: '✧ *Menciona o responde* al usuario a promover'
    }, { quoted: m })
  }

  try {
    await sock.groupParticipantsUpdate(m.chat, [target], 'promote')
    await sock.sendMessage(m.chat, {
      text: `✧ *Promoción realizada*
❀ @${target.split('@')[0]} es ahora admin`,
      mentions: [target, m.sender]
    }, { quoted: m })
  } catch (e) {
    await sock.sendMessage(m.chat, {
      text: '✧ No se pudo promover al usuario'
    }, { quoted: m })
  }
}

handler.help = ['promote', 'admin', 'daradmin']
handler.tags = ['group', 'admin']
handler.command = ['promote', 'admin', 'daradmin']

export default handler
