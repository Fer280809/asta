import fs from 'fs'
import path from 'path'
import config from '../../config.js'
import { getUser } from '../../lib/database.js'

let handler = async (m, { sock, usedPrefix }) => {
  try {
    const user = getUser(m.sender)
    const botName = config.botname
    const botPrefix = config.prefix

    // Obtener imagen
    let imageUrl = config.icono || 'https://raw.githubusercontent.com/Fer280809/Asta_bot/main/lib/catalogo.jpg'

    const infoText = `╭━━━━━━━━━━━━━━━━━━╮
│  🎭 *${botName.toUpperCase()}* ⚡
╰━━━━━━━━━━━━━━━━━━╯

👋 ¡Hola @${m.sender.split('@')[0]}!

╭─═⊰ 📊 *TU PERFIL*
│ 💰 Yenes: ${user.yenes.toLocaleString()}
│ ⭐ Nivel: ${user.level}
│ ❤️ HP: ${user.hp}/${user.maxHp}
│ 💙 Maná: ${user.mana}/${user.maxMana}
│ 📦 Inventario: ${Object.keys(user.inventory).length}/${config.economyConfig.maxInventory}
╰───────────────────

╭─═⊰ 📡 *ESTADO DEL BOT*
│ 🤖 Tipo: 🟢 PRINCIPAL
│ ⚙️ Prefijo: ${botPrefix}
│ 🌍 Servidor: México 🇲🇽
│ ⚡ Ping: ${Date.now() - m.timestamp}ms
╰───────────────────

📌 *Selecciona una categoría:*`

    const buttons = [
      { 
        buttonId: `${usedPrefix}menu-economia`, 
        buttonText: { displayText: '💰 Economía & RPG' }, 
        type: 1 
      },
      { 
        buttonId: `${usedPrefix}menu-aventura`, 
        buttonText: { displayText: '⚔️ Aventura & Crafteo' }, 
        type: 1 
      },
      { 
        buttonId: `${usedPrefix}menu-admin`, 
        buttonText: { displayText: '👑 Administración' }, 
        type: 1 
      },
      { 
        buttonId: `${usedPrefix}menu-utils`, 
        buttonText: { displayText: '🛠️ Utilidades' }, 
        type: 1 
      },
      { 
        buttonId: `${usedPrefix}subbots`, 
        buttonText: { displayText: '🔗 SubBots' }, 
        type: 1 
      }
    ]

    await sock.sendMessage(m.chat, {
      image: { url: imageUrl },
      caption: infoText,
      footer: `${botName} • By ${config.etiqueta} • v2.0`,
      buttons: buttons,
      headerType: 4,
      mentions: [m.sender]
    }, { quoted: m })

  } catch (error) {
    console.error('❌ Error menú:', error)
    await sock.sendMessage(m.chat, { 
      text: `❌ Error al cargar el menú`
    }, { quoted: m })
  }
}

handler.help = ['menu', 'menú', 'help', 'start']
handler.tags = ['main']
handler.command = ['menu', 'menú', 'help', 'start', 'iniciar']

export default handler
