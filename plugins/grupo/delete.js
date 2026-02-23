/**
 * Code Recreated by Orion Wolf
 * Comando: delete.js - Eliminar mensajes del grupo
 */

let handler = async (m, { conn }) => {
  if (!m.isGroup) return

  // Validar que sea respuesta a un mensaje
  if (!m.quoted) {
    return conn.sendMessage(m.chat, { text: `❀ Por favor, cita el mensaje que deseas eliminar.` }, { quoted: m })
  }

  try {
    const participant = m.quoted.sender
    const stanzaId = m.quoted.id

    await conn.sendMessage(m.chat, {
      delete: { remoteJid: m.chat, fromMe: false, id: stanzaId, participant: participant }
    })
  } catch (e) {
    try {
      await conn.sendMessage(m.chat, { delete: m.key })
    } catch (err) {
      conn.sendMessage(m.chat, { text: `⚠️ Error al eliminar: ${err.message}` }, { quoted: m })
    }
  }
}

handler.help = ['delete']
handler.tags = ['group']
handler.command = ['del', 'delete']
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler
