/**
 * Code Recreated by Orion Wolf
 *  * ║              Comando: promote.js                            ║
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

  // Validar que sea comando de promote
  if (!['promote', 'promover'].includes(command)) return

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
    return conn.sendMessage(from, { text: `❀ Debes mencionar a un usuario para poder promoverlo a administrador.` }, { quoted: m })
  }

  try {
    const groupInfo = await conn.groupMetadata(from)
    const ownerGroup = groupInfo.owner || from.split('-')[0] + '@s.whatsapp.net'
    
    // Verificar si ya es admin
    const isAlreadyAdmin = groupInfo.participants.some(p => p.id === user && p.admin)
    
    if (user === ownerGroup || isAlreadyAdmin) {
      return conn.sendMessage(from, { text: 'ꕥ El usuario mencionado ya tiene privilegios de administrador.' }, { quoted: m })
    }

    await conn.groupParticipantsUpdate(from, [user], 'promote')
    conn.sendMessage(from, { text: `❀ Fue agregado como admin del grupo con éxito.` }, { quoted: m })
  } catch (e) {
    conn.sendMessage(from, { text: `⚠︎ Se ha producido un problema.\n> Usa *${usedPrefix}report* para informarlo.\n\n${e.message}` }, { quoted: m })
  }
}

export const config = {
  help: ['promote'],
  tags: ['group'],
  command: ['promote', 'promover'],
  group: true,
  admin: true,
  botAdmin: true
}
