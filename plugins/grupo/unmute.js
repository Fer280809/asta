/**
 * Code Recreated by Orion Wolf
 * Comando: unmute.js - Desmuteador usuarios del grupo
 */

let handler = async (m, { conn, usedPrefix }) => {
  if (!m.isGroup) return

  let user = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : null

  if (!user) {
    return conn.sendMessage(m.chat, { 
      text: `❀ Debes mencionar a un usuario para desmutearlo.` 
    }, { quoted: m })
  }

  try {
    // Inicializar estructura de datos si no existe
    if (!global.db.data.chats) global.db.data.chats = {}
    if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = {}
    if (!global.db.data.chats[m.chat].mutes) global.db.data.chats[m.chat].mutes = {}

    // Verificar si el usuario está muteado
    if (!global.db.data.chats[m.chat].mutes[user]) {
      return conn.sendMessage(m.chat, { 
        text: `ꕥ Este usuario no está silenciado.` 
      }, { quoted: m })
    }

    // Obtener datos del mute
    const muteData = global.db.data.chats[m.chat].mutes[user]
    const userName = muteData.name || user.split('@')[0]

    // Eliminar del registro de mutes
    delete global.db.data.chats[m.chat].mutes[user]

    // Mensaje de confirmación
    await conn.sendMessage(m.chat, {
      text: `✓ Usuario @${userName} ha sido desmuteado y puede volver a enviar mensajes.`,
      mentions: [user]
    }, { quoted: m })

    console.log(`✓ Desmute ejecutado para ${user}`)

  } catch (e) {
    console.error('Error en unmute:', e)
    conn.sendMessage(m.chat, { 
      text: `⚠︎ Se ha producido un problema.\n> Usa *${usedPrefix}report* para informarlo.\n\n${e.message}` 
    }, { quoted: m })
  }
}

handler.help = ['unmute', 'dessilenciar']
handler.tags = ['group']
handler.command = ['unmute', 'dessilenciar']
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler
