// plugins/admin/kick.js
// Expulsar miembros del grupo

let handler = async (m, { conn, args, participants, isAdmin, isBotAdmin }) => {
  if (!m.isGroup) return m.reply('⚠️ Este comando solo funciona en grupos.')
  if (!isAdmin) return m.reply('⛔ Solo administradores del grupo pueden usar este comando.')
  if (!isBotAdmin) return m.reply('🤖 Necesito ser administrador para expulsar miembros.')

  let users = m.mentionedJid || []
  
  if (users.length === 0 && args[0]) {
    let num = args[0].replace(/\D/g, '')
    let participant = participants.find(p => p.id.split('@')[0] === num)
    if (participant) users.push(participant.id)
  }

  if (users.length === 0) {
    return m.reply(`✳️ *Uso correcto:*\n• Menciona: *.kick @usuario*\n• Número: *.kick 521234567890*`)
  }

  let admins = participants.filter(p => p.admin === 'admin' || p.admin === 'superadmin').map(p => p.id)
  let usersToKick = users.filter(id => !admins.includes(id) && id !== conn.user.jid)

  if (usersToKick.length === 0) {
    return m.reply('❌ No se puede expulsar a administradores ni al bot.')
  }

  let res = []
  for (let user of usersToKick) {
    try {
      await conn.groupParticipantsUpdate(m.chat, [user], 'remove')
      res.push(`✅ @${user.split('@')[0]} expulsado.`)
    } catch (e) {
      res.push(`❌ Error al expulsar a @${user.split('@')[0]}: ${e.message}`)
    }
  }

  m.reply(res.join('\n'))
}

handler.help = ['kick @usuario']
handler.tags = ['admin']
handler.command = ['kick', 'expulsar']

handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler