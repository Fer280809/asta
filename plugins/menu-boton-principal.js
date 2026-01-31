let handler = async (m, { conn, usedPrefix }) => {
  try {
    // ============= DATOS DEL BOT =============
    const totalUsers = Object.keys(global.db.data.users || {}).length || 0
    const totalCommands = Object.values(global.plugins || {}).filter(v => v.help && v.tags).length || 0
    const isSubBot = conn.user.jid !== global.conn.user.jid

    // ============= CONFIGURACIÓN DINÁMICA =============
    const botConfig = conn.subConfig || {}

    // Nombre del bot
    const botName = botConfig.name || 
                   (isSubBot ? `SubBot ${conn.user.jid.split('@')[0].slice(-4)}` : 
                   global.botname || 'ᴀsᴛᴀ-ʙᴏᴛ')

    // Prefijo
    const botPrefix = botConfig.prefix || 
                     (typeof global.prefix === 'string' ? global.prefix : '#')

    // Modo
    const botMode = isSubBot ? (botConfig.mode || 'public') : 'private'

    // Versión y librería desde global
    const version = global.vs || '1.3'
    const libreria = global.libreria || 'Baileys Multi Device'

    // ============= OBTENER LOGO =============
    let botIcon

    if (isSubBot && botConfig.logoUrl) {
      // Logo desde URL del SubBot
      botIcon = { url: botConfig.logoUrl }
    } else if (isSubBot && botConfig.logo) {
      // Logo local del SubBot (se enviará como buffer más adelante)
      try {
        const fs = await import('fs')
        if (fs.existsSync(botConfig.logo)) {
          botIcon = fs.readFileSync(botConfig.logo)
        }
      } catch (e) {
        console.error('Error leyendo logo local:', e)
      }
    }

    // Si no hay logo del SubBot, usar el global
    if (!botIcon) {
      botIcon = { url: global.icono || 'https://raw.githubusercontent.com/Fer280809/Asta_bot/main/lib/catalogo.jpg' }
    }

    // ============= TEXTO DEL MENÚ =============
    const infoText = `╭━━━━━━━━━━━━━━━━━━╮
│  🎭 *${botName.toUpperCase()}* ⚡
╰━━━━━━━━━━━━━━━━━━╯

👋 ¡Hola @${m.sender.split('@')[0]}!

╭─═⊰ 📡 *ESTADO ACTIVO*
│ 🤖 *Tipo:* ${isSubBot ? '🔗 SUB-BOT' : '🟢 BOT PRINCIPAL'}
│ ⚙️ *Prefijo:* ${botPrefix}
│ 🔧 *Modo:* ${botMode === 'private' ? '🔐 PRIVADO' : '🔓 PÚBLICO'}
│ 👥 *Usuarios:* ${totalUsers.toLocaleString()}
│ 🛠️ *Comandos:* ${totalCommands}
│ 📚 *Librería:* ${libreria}
│ 🌍 *Servidor:* México 🇲🇽
│ ⚡ *Ping:* ${Date.now() - m.timestamp}ms
│ 🔄 *Versión:* ${version}
╰───────────────────

👑 *Creador:* ${global.etiqueta || 'ғᴇʀɴᴀɴᴅᴏ'}
💰 *Moneda:* ${global.currency || '¥enes'}

Selecciona una opción:`

    // ============= BOTONES DEL BOT PRINCIPAL (SIEMPRE) =============
    const buttons = [
      { 
        buttonId: `${usedPrefix}menu2`, 
        buttonText: { displayText: '📜 MENÚ' }, 
        type: 1 
      },
      { 
        buttonId: `${usedPrefix}nuevos`, 
        buttonText: { displayText: '📌 ACTUALIZACIONES' }, 
        type: 1 
      },
      { 
        buttonId: `${usedPrefix}serbot`, 
        buttonText: { displayText: '🤖 SUB-BOT' }, 
        type: 1 
      },
      { 
        buttonId: `${usedPrefix}creador`, 
        buttonText: { displayText: '👑 CREADOR' }, 
        type: 1 
      },
      { 
        buttonId: `${usedPrefix}menu+`, 
        buttonText: { displayText: '🔞 MENÚ +18' }, 
        type: 1 
      }
    ]

    // ============= ENVIAR MENSAJE =============
    const messageOptions = {
      caption: infoText,
      footer: `${global.botname || 'ᴀsᴛᴀ-ʙᴏᴛ'} • v${version}`,
      buttons: buttons,
      headerType: 4,
      mentions: [m.sender]
    }

    // Agregar imagen según el tipo
    if (Buffer.isBuffer(botIcon)) {
      // Si es un buffer (imagen local)
      messageOptions.image = botIcon
    } else {
      // Si es una URL
      messageOptions.image = botIcon
    }

    await conn.sendMessage(m.chat, messageOptions, { quoted: m })

  } catch (error) {
    console.error('❌ Error en el menú:', error)

    // MENSAJE DE FALLBACK EN CASO DE ERROR
    const fallbackText = `🎭 *${global.botname || 'ASTA-BOT'}*\n\n` +
      `¡Hola! Soy ${global.botname || 'Asta Bot'}.\n` +
      `🚀 Usa ${usedPrefix}menu2 para ver el menú completo\n` +
      `🤖 Usa ${usedPrefix}serbot para crear un Sub-Bot\n\n` +
      `👑 Creador: ${global.etiqueta || 'ғᴇʀɴᴀɴᴅᴏ'}\n` +
      `🔧 Versión: ${global.vs || '1.3'}`

    await conn.sendMessage(m.chat, { 
      text: fallbackText,
      mentions: [m.sender]
    }, { quoted: m })
  }
}

// ============= CONFIGURACIÓN DEL COMANDO =============
handler.help = ['menu', 'menú', 'help', 'start']
handler.tags = ['main']
handler.command = ['menu', 'menú', 'help', 'start', 'iniciar']

export default handler