import { isAdmin, isOwner } from '../../lib/permissions.js'

let handler = async (m, { sock }) => {
  if (!m.chat.endsWith('@g.us')) return

  const sender = m.sender

  if (!isOwner(sender) && !await isAdmin(sock, m.chat, sender)) {
    return sock.sendMessage(m.chat, {
      text: '✧ *Permiso denegado*
❀ No tienes autorización'
    }, { quoted: m })
  }

  const target = m.quoted?.sender || m.mentionedJid?.[0]

  if (!target) {
    return sock.sendMessage(m.chat, {
      text: '✧ *Menciona o responde* al usuario a expulsar'
    }, { quoted: m })
  }

  if (target === sock.user.id) {
    return sock.sendMessage(m.chat, {
      text: '✧ No puedo expulsarme a mí misma'
    }, { quoted: m })
  }

  try {
    await sock.groupParticipantsUpdate(m.chat, [target], 'remove')
    await sock.sendMessage(m.chat, {
      text: `✧ *Expulsión realizada*
❀ @${target.split('@')[0]} eliminado`,
      mentions: [target]
    }, { quoted: m })
  } catch (e) {
    await sock.sendMessage(m.chat, {
      text: '✧ No se pudo expulsar al usuario'
    }, { quoted: m })
  }
}

handler.help = ['kick', 'expulsar', 'remove']
handler.tags = ['group', 'admin']
handler.command = ['kick', 'expulsar', 'ban']

export default handler
