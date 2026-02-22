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
      text: '✧ *Menciona o responde* al usuario a degradar'
    }, { quoted: m })
  }

  try {
    await sock.groupParticipantsUpdate(m.chat, [target], 'demote')
    await sock.sendMessage(m.chat, {
      text: `✧ *Degradación realizada*
❀ @${target.split('@')[0]} ya no es admin`,
      mentions: [target, m.sender]
    }, { quoted: m })
  } catch (e) {
    await sock.sendMessage(m.chat, {
      text: '✧ No se pudo degradar al usuario'
    }, { quoted: m })
  }
}

handler.help = ['demote', 'degradar', 'quitaradmin']
handler.tags = ['group', 'admin']
handler.command = ['demote', 'degradar', 'quitaradmin']

export default handler
