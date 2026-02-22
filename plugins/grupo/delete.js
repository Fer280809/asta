/**
 * Code Recreated by Orion Wolf
 *  * ║              Comando: delete.js                             ║
 */

export async function handler(conn, chat) {
  const m = chat.messages[0]
  if (!m?.message) return
  
  const from = m.key.remoteJid
  const isGroup = from.endsWith('@g.us')
  const sender = m.key.participant || from

  if (!isGroup) return

  const text =
    m.message?.conversation ||
    m.message?.extendedTextMessage?.text ||
    ''

  const command = text.trim().split(/\s+/)[0].toLowerCase().replace(global.prefix, '')

  // Validar que sea comando de delete
  if (!['del', 'delete'].includes(command)) return

  // Validar que sea respuesta a un mensaje
  if (!m.message?.extendedTextMessage?.contextInfo?.stanzaId) {
    return conn.sendMessage(from, { text: `❀ Por favor, cita el mensaje que deseas eliminar.` }, { quoted: m })
  }

  try {
    const participant = m.message.extendedTextMessage.contextInfo.participant
    const stanzaId = m.message.extendedTextMessage.contextInfo.stanzaId

    await conn.sendMessage(from, {
      delete: { remoteJid: from, fromMe: false, id: stanzaId, participant: participant }
    })
  } catch (e) {
    try {
      await conn.sendMessage(from, { delete: m.key })
    } catch (err) {
      conn.sendMessage(from, { text: `⚠️ Error al eliminar: ${err.message}` }, { quoted: m })
    }
  }
}

export const config = {
  help: ['delete'],
  tags: ['group'],
  command: ['del', 'delete'],
  group: true,
  admin: true,
  botAdmin: true
}
