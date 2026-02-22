/**
 * Code Recreated by Orion Wolf
 * Comando: unmute.js - Desmuteador usuarios del grupo
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

  // Validar que sea comando de unmute
  if (!['unmute', 'dessilenciar'].includes(command)) return

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
    return conn.sendMessage(from, { 
      text: `❀ Debes mencionar a un usuario para desmutearlo.` 
    }, { quoted: m })
  }

  try {
    // Inicializar estructura de datos si no existe
    if (!global.db.data.chats) global.db.data.chats = {}
    if (!global.db.data.chats[from]) global.db.data.chats[from] = {}
    if (!global.db.data.chats[from].mutes) global.db.data.chats[from].mutes = {}

    // Verificar si el usuario está muteado
    if (!global.db.data.chats[from].mutes[user]) {
      return conn.sendMessage(from, { 
        text: `ꕥ Este usuario no está silenciado.` 
      }, { quoted: m })
    }

    // Obtener datos del mute
    const muteData = global.db.data.chats[from].mutes[user]
    const userName = muteData.name || user.split('@')[0]

    // Eliminar del registro de mutes
    delete global.db.data.chats[from].mutes[user]

    // Mensaje de confirmación
    await conn.sendMessage(from, {
      text: `✓ Usuario @${userName} ha sido desmuteado y puede volver a enviar mensajes.`,
      mentions: [user]
    }, { quoted: m })

    console.log(`✓ Desmute ejecutado para ${user}`)

  } catch (e) {
    console.error('Error en unmute:', e)
    conn.sendMessage(from, { 
      text: `⚠︎ Se ha producido un problema.\n> Usa *${usedPrefix}report* para informarlo.\n\n${e.message}` 
    }, { quoted: m })
  }
}

export const config = {
  help: ['unmute', 'dessilenciar'],
  tags: ['group'],
  command: ['unmute', 'dessilenciar'],
  group: true,
  admin: true,
  botAdmin: true
}
