export async function handler(conn, chat) {
  const m = chat.messages[0]
  if (!m?.message) return
  
  const from = m.key.remoteJid
  const isGroup = from.endsWith('@g.us')

  if (!isGroup) return

  const text =
    m.message?.conversation ||
    m.message?.extendedTextMessage?.text ||
    ''

  const args = text.trim().split(/\s+/).slice(1)
  const command = text.trim().split(/\s+/)[0].toLowerCase().replace(global.prefix, '')

  // Validar que sea comando de admins
  if (!['admins', '@admins'].includes(command)) return

  try {
    const metadata = await conn.groupMetadata(from)
    const participants = metadata.participants || []
    const groupAdmins = participants.filter((p) => p.admin)
    
    const listAdmin = groupAdmins.map(v => `● @${v.id.split('@')[0]}`).join('\n')
    const owner = metadata.owner || groupAdmins.find((p) => p.admin === 'superadmin')?.id || from.split('-')[0] + '@s.whatsapp.net'
    
    const pesan = args.join(' ')
    const oi = `» ${pesan}`
    const text_msg = `『✦』Admins del grupo:  
  
${listAdmin}

❍ Mensaje ${oi || 'Sin especificar'}`

    const mentions = [...groupAdmins.map((v) => v.id), owner]
    
    await conn.sendMessage(from, { 
      text: text_msg,
      mentions: mentions
    }, { quoted: m })
  } catch (e) {
    conn.sendMessage(from, { text: `⚠️ Error: ${e.message}` }, { quoted: m })
  }
}

export const config = {
  help: ['admins'],
  tags: ['group'],
  command: ['admins', '@admins'],
  group: true
}
