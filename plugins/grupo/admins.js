/**
 * Code Recreated by Orion Wolf
 * Comando: admins.js - Listar administradores del grupo
 */

let handler = async (m, { conn, args }) => {
  if (!m.isGroup) return

  try {
    const metadata = await conn.groupMetadata(m.chat)
    const participants = metadata.participants || []
    const groupAdmins = participants.filter((p) => p.admin)
    
    const listAdmin = groupAdmins.map(v => `● @${v.id.split('@')[0]}`).join('\n')
    const owner = metadata.owner || groupAdmins.find((p) => p.admin === 'superadmin')?.id || m.chat.split('-')[0] + '@s.whatsapp.net'
    
    const pesan = args.join(' ')
    const oi = `» ${pesan}`
    const text_msg = `『✦』Admins del grupo:  
  
${listAdmin}

❍ Mensaje ${oi || 'Sin especificar'}`

    const mentions = [...groupAdmins.map((v) => v.id), owner]
    
    await conn.sendMessage(m.chat, { 
      text: text_msg,
      mentions: mentions
    }, { quoted: m })
  } catch (e) {
    conn.sendMessage(m.chat, { text: `⚠️ Error: ${e.message}` }, { quoted: m })
  }
}

handler.help = ['admins']
handler.tags = ['group']
handler.command = ['admins', '@admins']
handler.group = true

export default handler
