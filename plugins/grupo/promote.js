/**
 * Code Recreated by Orion Wolf
 * Comando: promote.js - Promover administrador del grupo
 */

let handler = async (m, { conn, usedPrefix }) => {
  if (!m.isGroup) return

  let user = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : null

  if (!user) {
    return conn.sendMessage(m.chat, { text: `❀ Debes mencionar a un usuario para poder promoverlo a administrador.` }, { quoted: m })
  }

  try {
    const groupInfo = await conn.groupMetadata(m.chat)
    const ownerGroup = groupInfo.owner || m.chat.split('-')[0] + '@s.whatsapp.net'
    
    // Verificar si ya es admin
    const isAlreadyAdmin = groupInfo.participants.some(p => p.id === user && p.admin)
    
    if (user === ownerGroup || isAlreadyAdmin) {
      return conn.sendMessage(m.chat, { text: 'ꕥ El usuario mencionado ya tiene privilegios de administrador.' }, { quoted: m })
    }

    await conn.groupParticipantsUpdate(m.chat, [user], 'promote')
    conn.sendMessage(m.chat, { text: `❀ Fue agregado como admin del grupo con éxito.` }, { quoted: m })
  } catch (e) {
    conn.sendMessage(m.chat, { text: `⚠︎ Se ha producido un problema.\n> Usa *${usedPrefix}report* para informarlo.\n\n${e.message}` }, { quoted: m })
  }
}

handler.help = ['promote']
handler.tags = ['group']
handler.command = ['promote', 'promover']
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler
