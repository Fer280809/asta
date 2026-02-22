import config from '../../config.js'

let handler = async (m, { sock, usedPrefix }) => {
  const buttons = [
    {
      buttonId: `${usedPrefix}daily`,
      buttonText: { displayText: '🎁 Recompensa Diaria' },
      type: 1
    },
    {
      buttonId: `${usedPrefix}balance`,
      buttonText: { displayText: '💰 Mi Cartera' },
      type: 1
    },
    {
      buttonId: `${usedPrefix}inventory`,
      buttonText: { displayText: '📦 Inventario' },
      type: 1
    },
    {
      buttonId: `${usedPrefix}shop`,
      buttonText: { displayText: '🏪 Tienda' },
      type: 1
    }
  ]

  const text = `💰 *MENÚ DE ECONOMÍA* 💰

⛏️ *Recolección:*
• ${usedPrefix}mine - Minar minerales
• ${usedPrefix}chop - Talar madera
• ${usedPrefix}hunt - Cazar animales

🛠️ *Crafteo:*
• ${usedPrefix}craft - Ver recetas
• ${usedPrefix}craft <item> - Craftear item

⚔️ *Aventura:*
• ${usedPrefix}adventure - Explorar mundo
• ${usedPrefix}mission - Ver misiones

❤️ *Vitalidad:*
• ${usedPrefix}heal - Curarte
• ${usedPrefix}heal <item> - Usar item específico

💼 *Gestión:*
• ${usedPrefix}balance - Ver tu dinero
• ${usedPrefix}inventory - Ver inventario
• ${usedPrefix}daily - Recompensa diaria

🛒 *Comercio:*
• ${usedPrefix}shop - Tienda de items
• ${usedPrefix}shop buy <item> - Comprar
• ${usedPrefix}shop sell <item> - Vender`

  await sock.sendMessage(m.chat, {
    text,
    footer: `${config.botname} • By ${config.etiqueta}`,
    buttons,
    headerType: 1
  }, { quoted: m })
}

handler.help = ['menueconomia', 'menu-economia']
handler.tags = ['main']
handler.command = ['menueconomia', 'menu-economia', 'economia']

export default handler
