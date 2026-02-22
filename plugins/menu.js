import fs from 'fs'
import path from 'path'

let handler = async (m, { conn, usedPrefix }) => {
  try {
    const totalUsers = Object.keys(global.db?.data?.users || {}).length || 0
    const totalCommands = Object.values(global.plugins || {}).filter(v => v.help && v.tags).length || 0
    
    const botName = global.namebot
    const botPrefix = global.prefix
    const botMode = global.modoPublico ? 'public' : 'private'
    const version = global.vs

    let imageBuffer = null
    let imageUrl = global.icono

    try {
      const logoPath = path.join(process.cwd(), 'src', 'logo.jpg')
      if (fs.existsSync(logoPath)) {
        imageBuffer = fs.readFileSync(logoPath)
      }
    } catch {}

    const infoText = `╭━━━━━━━━━━━━━━━━━━╮
│  🎭 *${botName.toUpperCase()}* ⚡
╰━━━━━━━━━━━━━━━━━━╯

👋 ¡Hola @${m.sender.split('@')[0]}!

╭─═⊰ 📡 *ESTADO ACTIVO*
│ 🤖 *Bot:* ${botName}
│ ⚙️ *Prefijo:* ${botPrefix}
│ 🔧 *Modo:* ${botMode}
│ 👥 *Usuarios:* ${totalUsers.toLocaleString()}
│ 🛠️ *Comandos:* ${totalCommands}
│ 📚 *Librería:* ${global.libreria}
│ ⚡ *Ping:* ${Date.now() - m.timestamp}ms
│ 🔄 *Versión:* ${version}
╰──────────────────

📌 *Selecciona una categoría:*`

    const buttons = [
      { 
        buttonId: `${usedPrefix}menu-descargas`, 
        buttonText: { displayText: '📥 Descargas' }, 
        type: 1 
      },
      { 
        buttonId: `${usedPrefix}menu-juegos`, 
        buttonText: { displayText: '🎮 Juegos' }, 
        type: 1 
      },
      { 
        buttonId: `${usedPrefix}menu-grupos`, 
        buttonText: { displayText: '👥 Grupos' }, 
        type: 1 
      }
    ]

    const messageOptions = {
      caption: infoText,
      footer: global.firma,
      buttons: buttons,
      headerType: 4,
      mentions: [m.sender]
    }

    if (imageBuffer) {
      messageOptions.image = imageBuffer
    } else {
      messageOptions.image = { url: imageUrl }
    }

    await conn.sendMessage(m.chat, messageOptions, { quoted: m })

  } catch (error) {
    console.error('Error menú:', error)
    await conn.sendMessage(m.chat, { text: '❌ Error al cargar menú' })
  }
}

handler.help = ['menu', 'menú', 'help']
handler.tags = ['main']
handler.command = ['menu', 'menú', 'help', 'start']

export default handler
