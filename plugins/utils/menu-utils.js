import config from '../../config.js'

let handler = async (m, { sock, usedPrefix }) => {
  const buttons = [
    {
      buttonId: `${usedPrefix}sticker`,
      buttonText: { displayText: '🎨 Crear Sticker' },
      type: 1
    },
    {
      buttonId: `${usedPrefix}subbot`,
      buttonText: { displayText: '🔗 Crear SubBot' },
      type: 1
    },
    {
      buttonId: `${usedPrefix}info`,
      buttonText: { displayText: 'ℹ️ Info Grupo' },
      type: 1
    }
  ]

  const text = `🛠️ *MENÚ DE UTILIDADES* 🛠️

🎨 *Creador:*
• ${usedPrefix}sticker - Crear sticker de imagen
• ${usedPrefix}s - Alias de sticker

🔗 *SubBots:*
• ${usedPrefix}subbot - Menú de SubBots
• ${usedPrefix}subbot qr - Crear con QR
• ${usedPrefix}subbot code - Crear con código
• ${usedPrefix}subbot list - Mis SubBots

📱 *Información:*
• ${usedPrefix}info - Info del grupo
• ${usedPrefix}admins - Lista de admins
• ${usedPrefix}link - Enlace del grupo

⚙️ *Bot:*
• ${usedPrefix}ping - Velocidad del bot
• ${usedPrefix}menu - Menú principal
• ${usedPrefix}help - Ayuda

💡 *Consejo:* Usa los botones de abajo para navegar rápido!`

  await sock.sendMessage(m.chat, {
    text,
    footer: `${config.botname} • By ${config.etiqueta}`,
    buttons,
    headerType: 1
  }, { quoted: m })
}

handler.help = ['menuutils', 'menu-utils']
handler.tags = ['main']
handler.command = ['menuutils', 'menu-utils', 'utils']

export default handler
