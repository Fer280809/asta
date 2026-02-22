/**
 * Code Recreated by Orion Wolf
 * Comando: kick.js - Expulsar usuarios del grupo
 */

export async function handler(conn, chat) {
  const m = chat.messages[0]
  if (!m?.message) return
  
  const from = m.key.remoteJid
  const sender = m.key.participant || from
  const isGroup = from.endsWith('@g.us')

  if (!isGroup) return

  const text =
    m.message?.conversation ||
    m.message?.extendedTextMessage?.text ||
    ''

  const command = text.trim().split(/\s+/)[0].toLowerCase().replace(global.prefix, '')
  const usedPrefix = global.prefix

  // Validar que sea comando de kick
  if (!['kick', 'echar', 'hechar', 'sacar', 'ban'].includes(command)) return

  // Obtener menciones
  const mentions = m.message?.extendedTextMessage?.contextInfo?.mentionedJid || []
  let user = null

  // Buscar usuario mencionado
  if (mentions.length > 0) {
    user = mentions[0]
  } else if (m.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
    // Si es respuesta a un mensaje, usar el remitente de ese mensaje
    const quotedParticipant = m.message.extendedTextMessage.contextInfo.participant
    user = quotedParticipant
  }

  if (!user) {
    return conn.sendMessage(from, { text: `❀ Debes mencionar a un usuario para poder expulsarlo del grupo.` }, { quoted: m })
  }

  try {
    const groupInfo = await conn.groupMetadata(from)
    const ownerGroup = groupInfo.owner || from.split('-')[0] + '@s.whatsapp.net'
    const ownerBot = global.owner[0][0] + '@s.whatsapp.net'
    const botJid = conn.user.id

    if (user === botJid) {
      return conn.sendMessage(from, { text: `ꕥ No puedo eliminar el bot del grupo.` }, { quoted: m })
    }

    if (user === ownerGroup) {
      return conn.sendMessage(from, { text: `ꕥ No puedo eliminar al propietario del grupo.` }, { quoted: m })
    }

    if (user === ownerBot) {
      return conn.sendMessage(from, { text: `ꕥ No puedo eliminar al propietario del bot.` }, { quoted: m })
    }

    await conn.groupParticipantsUpdate(from, [user], 'remove')
    conn.sendMessage(from, { text: `❀ Usuario expulsado del grupo.` }, { quoted: m })
  } catch (e) {
    conn.sendMessage(from, { text: `⚠︎ Se ha producido un problema.\n> Usa *${usedPrefix}report* para informarlo.\n\n${e.message}` }, { quoted: m })
  }
}

export const config = {
  help: ['kick'],
  tags: ['group'],
  command: ['kick', 'echar', 'hechar', 'sacar', 'ban'],
  admin: true,
  group: true,
  botAdmin: true
}
