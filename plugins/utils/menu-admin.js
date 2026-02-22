import config from '../../config.js'
import { isOwner, isAdmin } from '../../lib/permissions.js'

let handler = async (m, { sock, usedPrefix }) => {
  const isAdminUser = await isAdmin(sock, m.chat, m.sender)
  const isOwnerUser = isOwner(m.sender)

  if (!isAdminUser && !isOwnerUser) {
    return sock.sendMessage(m.chat, {
      text: '❌ Este menú es solo para administradores.'
    }, { quoted: m })
  }

  const buttons = [
    {
      buttonId: `${usedPrefix}admins`,
      buttonText: { displayText: '👥 Ver Admins' },
      type: 1
    },
    {
      buttonId: `${usedPrefix}kick`,
      buttonText: { displayText: '🦶 Expulsar' },
      type: 1
    },
    {
      buttonId: `${usedPrefix}tagall`,
      buttonText: { displayText: '📢 Mencionar Todos' },
      type: 1
    }
  ]

  const text = `👑 *MENÚ DE ADMINISTRACIÓN* 👑

⚠️ *Comandos de Admin:*
• ${usedPrefix}kick @user - Expulsar usuario
• ${usedPrefix}promote @user - Dar admin
• ${usedPrefix}demote @user - Quitar admin
• ${usedPrefix}del - Borrar mensaje
• ${usedPrefix}tagall <mensaje> - Mencionar todos
• ${usedPrefix}admins - Ver lista de admins
• ${usedPrefix}link - Obtener enlace del grupo
• ${usedPrefix}fantasmas - Ver inactivos

🔒 *Protección:*
• ${usedPrefix}antilink on/off - Anti-enlaces
• ${usedPrefix}welcome on/off - Bienvenida
• ${usedPrefix}goodbye on/off - Despedida

📊 *Información:*
• ${usedPrefix}info - Info del grupo
• ${usedPrefix}activos - Top activos
• ${usedPrefix}proteger @user - Proteger usuario`

  await sock.sendMessage(m.chat, {
    text,
    footer: `${config.botname} • By ${config.etiqueta}`,
    buttons,
    headerType: 1
  }, { quoted: m })
}

handler.help = ['menuadmin', 'menu-admin']
handler.tags = ['main']
handler.command = ['menuadmin', 'menu-admin', 'adminmenu']

export default handler
