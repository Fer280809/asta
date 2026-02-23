/**
 * Code Recreated by Orion Wolf
 * Comando: revoke.js - Revocar y restablecer enlace del grupo
 */

let handler = async (m, { conn }) => {
  if (!m.isGroup) return

  try {
    // Revocar el enlace anterior
    await conn.groupRevokeInvite(m.chat)
    
    // Obtener el nuevo código de invitación
    const newCode = await conn.groupInviteCode(m.chat)
    const newLink = 'https://chat.whatsapp.com/' + newCode

    // Enviar el nuevo enlace al remitente
    await conn.sendMessage(m.sender, { text: newLink })
    
    // Confirmación en el grupo
    conn.sendMessage(m.chat, { text: `❀ Enlace del grupo revocado y restablecido correctamente.` }, { quoted: m })
  } catch (e) {
    conn.sendMessage(m.chat, { text: `⚠️ Error: ${e.message}` }, { quoted: m })
  }
}

handler.help = ['revoke']
handler.tags = ['group']
handler.command = ['revoke', 'restablecer']
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler
