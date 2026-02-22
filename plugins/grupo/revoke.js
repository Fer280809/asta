/**
 * Code Recreated by Orion Wolf
 *  * ║              Comando: revoke.js                             ║
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

  // Validar que sea comando de revoke
  if (!['revoke', 'restablecer'].includes(command)) return

  try {
    // Revocar el enlace anterior
    await conn.groupRevokeInvite(from)
    
    // Obtener el nuevo código de invitación
    const newCode = await conn.groupInviteCode(from)
    const newLink = 'https://chat.whatsapp.com/' + newCode

    // Enviar el nuevo enlace al remitente
    await conn.sendMessage(sender, { text: newLink })
    
    // Confirmación en el grupo
    conn.sendMessage(from, { text: `❀ Enlace del grupo revocado y restablecido correctamente.` }, { quoted: m })
  } catch (e) {
    conn.sendMessage(from, { text: `⚠️ Error: ${e.message}` }, { quoted: m })
  }
}

export const config = {
  help: ['revoke'],
  tags: ['group'],
  command: ['revoke', 'restablecer'],
  group: true,
  admin: true,
  botAdmin: true
}
