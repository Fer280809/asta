import config from '../../config.js'

let handler = async (m, { sock, usedPrefix }) => {
  const buttons = [
    {
      buttonId: `${usedPrefix}adventure`,
      buttonText: { displayText: '🗺️ Explorar' },
      type: 1
    },
    {
      buttonId: `${usedPrefix}mission list`,
      buttonText: { displayText: '📜 Misiones' },
      type: 1
    },
    {
      buttonId: `${usedPrefix}craft`,
      buttonText: { displayText: '🔨 Craftear' },
      type: 1
    }
  ]

  const text = `⚔️ *MENÚ DE AVENTURA* ⚔️

🗺️ *Exploración:*
• ${usedPrefix}adventure - Aventura aleatoria
• ${usedPrefix}adventure <lugar> - Ir a ubicación específica

📍 *Lugares disponibles:*
⛏️ Mina Abandonada (Fácil)
🌲 Bosque Oscuro (Medio)
🕳️ Cueva Profunda (Difícil)
🔥 Nether (Muy difícil)
🌑 End (Extremo)

📜 *Misiones:*
• ${usedPrefix}mission list - Ver misiones
• ${usedPrefix}mission start <id> - Iniciar misión
• ${usedPrefix}mission complete - Completar misión activa

🔨 *Crafteo:*
• ${usedPrefix}craft - Ver recetas disponibles
• ${usedPrefix}craft <nombre> - Craftear item

⚔️ *Equipamiento:*
Craftea armas y armaduras para mejorar tus stats en combate.

🧪 *Pociones:*
• Poción de Curación (+50 HP)
• Poción de Maná (+50 MANA)`

  await sock.sendMessage(m.chat, {
    text,
    footer: `${config.botname} • By ${config.etiqueta}`,
    buttons,
    headerType: 1
  }, { quoted: m })
}

handler.help = ['menuaventura', 'menu-aventura']
handler.tags = ['main']
handler.command = ['menuaventura', 'menu-aventura', 'aventura']

export default handler
