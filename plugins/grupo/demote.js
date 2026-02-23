/**
 * Code Recreated by Orion Wolf
 * Comando: demote.js - Degradar administrador del grupo
 */

let handler = async (m, { conn, usedPrefix }) => {
  if (!m.isGroup) return

  let user = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : null

  if (!user) {
    return conn.sendMessage(m.chat, { text: `❀ Debes mencionar a un usuario para poder degradarlo de administrador.` }, { quoted: m })
  }

  try {
    const groupInfo = await conn.groupMetadata(m.chat)
    const ownerGroup = groupInfo.owner || m.chat.split('-')[0] + '@s.whatsapp.net'
    const ownerBot = global.owner[0][0] + '@s.whatsapp.net'
    const botJid = conn.user.id

    if (user === botJid) {
      return conn.sendMessage(m.chat, { text: `ꕥ No puedes degradar al bot.` }, { quoted: m })
    }

    if (user === ownerGroup) {
      return conn.sendMessage(m.chat, { text: `ꕥ No puedes degradar al creador del grupo.` }, { quoted: m })
    }

    if (user === ownerBot) {
      return conn.sendMessage(m.chat, { text: `ꕥ No puedes degradar al propietario del bot.` }, { quoted: m })
    }

    await conn.groupParticipantsUpdate(m.chat, [user], 'demote')
    conn.sendMessage(m.chat, { text: `❀ Fue descartado como admin.` }, { quoted: m })
  } catch (e) {
    conn.sendMessage(m.chat, { text: `⚠︎ Se ha producido un problema.\n> Usa *${usedPrefix}report* para informarlo.\n\n${e.message}` }, { quoted: m })
  }
}

handler.help = ['demote']
handler.tags = ['group']
handler.command = ['demote', 'degradar']
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler
