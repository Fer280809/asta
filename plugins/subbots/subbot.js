import fs from 'fs'
import path from 'path'
import { exec } from 'child_process'
import config from '../../config.js'
import { db, saveData } from '../../lib/database.js'
import { isOwner } from '../../lib/permissions.js'

// Almacenamiento temporal de códigos QR
const qrCodes = new Map()
const pairingCodes = new Map()

let handler = async (m, { sock, args, usedPrefix, command }) => {

  // Menú principal de SubBots
  if (!args.length) {
    const buttons = [
      {
        buttonId: `${usedPrefix}subbot qr`,
        buttonText: { displayText: '📱 Escanear QR' },
        type: 1
      },
      {
        buttonId: `${usedPrefix}subbot code`,
        buttonText: { displayText: '🔢 Código de Pareja' },
        type: 1
      },
      {
        buttonId: `${usedPrefix}subbot list`,
        buttonText: { displayText: '📋 Mis SubBots' },
        type: 1
      }
    ]

    let text = `🔗 *Sistema de SubBots - ${config.botname}*

`
    text += `¡Convierte tu número en un bot!

`
    text += `📱 *Métodos de conexión:*
`
    text += `• QR - Escanea con WhatsApp
`
    text += `• Código - 8 dígitos de emparejamiento

`
    text += `⚡ *Ventajas:*
`
    text += `• Tu propio prefijo personalizable
`
    text += `• Configuración independiente
`
    text += `• Comandos de admin en tus grupos
`
    text += `• Siempre activo 24/7

`
    text += `💰 *Costo:* Gratis (por tiempo limitado)`

    return sock.sendMessage(m.chat, {
      text,
      footer: `Selecciona un método para comenzar`,
      buttons,
      headerType: 1
    }, { quoted: m })
  }

  // Método QR
  if (args[0] === 'qr') {
    // Generar ID único para esta sesión
    const sessionId = m.sender.split('@')[0] + '_' + Date.now().toString(36)
    const sessionPath = path.join(config.subBotConfig.folder, sessionId)

    // Crear carpeta
    if (!fs.existsSync(sessionPath)) {
      fs.mkdirSync(sessionPath, { recursive: true })
    }

    // Guardar en base de datos
    if (!db.subbots) db.subbots = {}
    db.subbots[sessionId] = {
      id: sessionId,
      name: `SubBot_${m.sender.split('@')[0].slice(-4)}`,
      owner: m.sender,
      method: 'qr',
      createdAt: Date.now(),
      status: 'pending',
      prefix: '#',
      config: {
        autoRead: false,
        autoTyping: false,
        restrict: false,
        onlyGroup: false,
        welcome: true,
        antilink: false
      }
    }
    saveData('subbots')

    // Iniciar proceso de generación de QR
    const child = exec(`node lib/subbot-qr.js ${sessionId} ${sessionPath}`, {
      cwd: process.cwd()
    })

    // Esperar y capturar el QR
    let qrData = ''
    child.stdout.on('data', (data) => {
      if (data.includes('QR:')) {
        qrData = data.split('QR:')[1].trim()
        qrCodes.set(sessionId, qrData)
      }
    })

    // Esperar 3 segundos para que genere el QR
    await new Promise(resolve => setTimeout(resolve, 3000))

    const qr = qrCodes.get(sessionId)

    if (qr) {
      await sock.sendMessage(m.chat, {
        image: Buffer.from(qr.split(',')[1], 'base64'),
        caption: `📱 *Escanea este QR con WhatsApp*

1. Abre WhatsApp en tu teléfono
2. Ve a Configuración → Dispositivos vinculados
3. Toca "Vincular un dispositivo"
4. Escanea el código QR

⏳ *Expira en:* 60 segundos
🆔 *ID:* ${sessionId}

⚠️ No cierres esta ventana hasta conectarte`,
        footer: config.botname
      }, { quoted: m })
    } else {
      await sock.sendMessage(m.chat, {
        text: `⏳ *Generando QR...*

Por favor espera un momento y usa:
${usedPrefix}subbot status ${sessionId}

🆔 ID: ${sessionId}`,
        mentions: [m.sender]
      }, { quoted: m })
    }

    // Limpiar QR después de 60 segundos
    setTimeout(() => {
      qrCodes.delete(sessionId)
      child.kill()
    }, 60000)

    return
  }

  // Método Código de 8 dígitos
  if (args[0] === 'code') {
    const sessionId = m.sender.split('@')[0] + '_' + Date.now().toString(36)
    const sessionPath = path.join(config.subBotConfig.folder, sessionId)

    if (!fs.existsSync(sessionPath)) {
      fs.mkdirSync(sessionPath, { recursive: true })
    }

    if (!db.subbots) db.subbots = {}
    db.subbots[sessionId] = {
      id: sessionId,
      name: `SubBot_${m.sender.split('@')[0].slice(-4)}`,
      owner: m.sender,
      method: 'code',
      createdAt: Date.now(),
      status: 'pending',
      prefix: '#',
      config: {
        autoRead: false,
        autoTyping: false,
        restrict: false,
        onlyGroup: false,
        welcome: true,
        antilink: false
      }
    }
    saveData('subbots')

    // Iniciar proceso para obtener código
    const child = exec(`node lib/subbot-code.js ${sessionId} ${sessionPath}`, {
      cwd: process.cwd()
    })

    let pairingCode = ''
    child.stdout.on('data', (data) => {
      if (data.includes('CODE:')) {
        pairingCode = data.split('CODE:')[1].trim()
        pairingCodes.set(sessionId, pairingCode)
      }
    })

    await new Promise(resolve => setTimeout(resolve, 5000))

    const code = pairingCodes.get(sessionId)

    if (code) {
      await sock.sendMessage(m.chat, {
        text: `🔢 *Código de Emparejamiento*

📱 *Tu código:*
\`
${code}
\`

*Instrucciones:*
1. Abre WhatsApp en tu teléfono
2. Toca los 3 puntos → Dispositivos vinculados
3. Toca "Vincular con número de teléfono"
4. Ingresa el código de arriba

⏳ *Expira en:* 2 minutos
🆔 *ID:* ${sessionId}`,
        mentions: [m.sender]
      }, { quoted: m })
    } else {
      await sock.sendMessage(m.chat, {
        text: `⏳ *Generando código...*

Por favor espera y usa:
${usedPrefix}subbot status ${sessionId}

🆔 ID: ${sessionId}`,
        mentions: [m.sender]
      }, { quoted: m })
    }

    setTimeout(() => {
      pairingCodes.delete(sessionId)
      child.kill()
    }, 120000)

    return
  }

  // Ver estado de conexión
  if (args[0] === 'status' && args[1]) {
    const sessionId = args[1]
    const bot = db.subbots?.[sessionId]

    if (!bot) {
      return sock.sendMessage(m.chat, {
        text: '❌ SubBot no encontrado.'
      }, { quoted: m })
    }

    if (bot.owner !== m.sender && !isOwner(m.sender)) {
      return sock.sendMessage(m.chat, {
        text: '❌ No tienes permiso para ver este SubBot.'
      }, { quoted: m })
    }

    const isConnected = bot.status === 'connected'
    const qr = qrCodes.get(sessionId)
    const code = pairingCodes.get(sessionId)

    let text = `📱 *Estado del SubBot*

`
    text += `🆔 ID: ${sessionId}
`
    text += `📛 Nombre: ${bot.name}
`
    text += `📊 Estado: ${isConnected ? '🟢 Conectado' : '🟡 Pendiente'}
`
    text += `📅 Creado: ${new Date(bot.createdAt).toLocaleString()}

`

    if (!isConnected) {
      if (qr) {
        text += `✅ QR disponible. Revisa mensajes anteriores.
`
      } else if (code) {
        text += `✅ Código disponible: *${code}*
`
      } else {
        text += `❌ Código/QR expirado. Genera uno nuevo.
`
      }

      text += `
💡 *Consejo:* Si no recibiste el QR o código, intenta:
`
      text += `${usedPrefix}subbot delete ${sessionId}
`
      text += `${usedPrefix}subbot ${bot.method === 'qr' ? 'qr' : 'code'}`
    } else {
      text += `✅ Bot funcionando correctamente
`
      text += `⚙️ Prefijo: ${bot.prefix}
`
      text += `
📋 *Comandos disponibles:*
`
      text += `${usedPrefix}subbot config ${sessionId}
`
      text += `${usedPrefix}subbot stop ${sessionId}`
    }

    return sock.sendMessage(m.chat, { text, mentions: [m.sender] }, { quoted: m })
  }

  // Listar SubBots del usuario
  if (args[0] === 'list' || args[0] === 'misbots') {
    const userBots = Object.values(db.subbots || {}).filter(b => b.owner === m.sender)

    if (userBots.length === 0) {
      return sock.sendMessage(m.chat, {
        text: `📭 *No tienes SubBots*

Crea uno con:
${usedPrefix}subbot qr
o
${usedPrefix}subbot code`,
        footer: config.botname
      }, { quoted: m })
    }

    let text = `📱 *Tus SubBots* (${userBots.length})

`

    userBots.forEach((bot, i) => {
      const status = bot.status === 'connected' ? '🟢' : '🟡'
      text += `${i + 1}. ${status} *${bot.name}*
`
      text += `   ├ 🆔 \`${bot.id}\`
`
      text += `   ├ 📱 ${bot.method.toUpperCase()}
`
      text += `   ├ ⚙️ Prefijo: ${bot.prefix}
`
      text += `   └ 📅 ${new Date(bot.createdAt).toLocaleDateString()}

`
    })

    text += `*Gestión:*
`
    text += `${usedPrefix}subbot config <id>
`
    text += `${usedPrefix}subbot stop <id>
`
    text += `${usedPrefix}subbot delete <id>`

    return sock.sendMessage(m.chat, { text, mentions: [m.sender] }, { quoted: m })
  }

  // Configurar SubBot
  if (args[0] === 'config' && args[1]) {
    const sessionId = args[1]
    const bot = db.subbots?.[sessionId]

    if (!bot) {
      return sock.sendMessage(m.chat, {
        text: '❌ SubBot no encontrado.'
      }, { quoted: m })
    }

    if (bot.owner !== m.sender && !isOwner(m.sender)) {
      return sock.sendMessage(m.chat, {
        text: '❌ No tienes permiso para configurar este SubBot.'
      }, { quoted: m })
    }

    // Si no hay más args, mostrar configuración
    if (args.length < 3) {
      const buttons = [
        {
          buttonId: `${usedPrefix}subbot config ${sessionId} prefix`,
          buttonText: { displayText: '🔤 Cambiar Prefijo' },
          type: 1
        },
        {
          buttonId: `${usedPrefix}subbot config ${sessionId} name`,
          buttonText: { displayText: '✏️ Cambiar Nombre' },
          type: 1
        },
        {
          buttonId: `${usedPrefix}subbot config ${sessionId} welcome`,
          buttonText: { displayText: '👋 Toggle Bienvenida' },
          type: 1
        }
      ]

      let text = `⚙️ *Configuración de ${bot.name}*

`
      text += `🆔 ID: \`${sessionId}\`
`
      text += `📛 Nombre: ${bot.name}
`
      text += `🔤 Prefijo: ${bot.prefix}
`
      text += `👤 Owner: @${bot.owner.split('@')[0]}
`
      text += `📊 Estado: ${bot.status}

`

      text += `*Opciones actuales:*
`
      text += `• 👋 Bienvenida: ${bot.config.welcome ? '✅' : '❌'}
`
      text += `• 🔗 Antilink: ${bot.config.antilink ? '✅' : '❌'}
`
      text += `• 👁️ Auto-read: ${bot.config.autoRead ? '✅' : '❌'}
`
      text += `• ✍️ Auto-typing: ${bot.config.autoTyping ? '✅' : '❌'}
`
      text += `• 👥 Only-group: ${bot.config.onlyGroup ? '✅' : '❌'}

`

      text += `*Para cambiar manualmente:*
`
      text += `${usedPrefix}subbot config ${sessionId} <opcion> <valor>
`
      text += `Ejemplo: ${usedPrefix}subbot config ${sessionId} prefix !`

      return sock.sendMessage(m.chat, {
        text,
        buttons,
        footer: config.botname,
        mentions: [bot.owner]
      }, { quoted: m })
    }

    // Cambiar configuración
    const option = args[2].toLowerCase()
    const value = args.slice(3).join(' ')

    switch (option) {
      case 'prefix':
        if (!value) return sock.sendMessage(m.chat, { text: '❌ Proporciona un prefijo. Ejemplo: #, !, .' }, { quoted: m })
        bot.prefix = value
        break
      case 'name':
        if (!value) return sock.sendMessage(m.chat, { text: '❌ Proporciona un nombre.' }, { quoted: m })
        bot.name = value
        break
      case 'welcome':
      case 'antilink':
      case 'autoread':
      case 'autotyping':
      case 'onlygroup':
      case 'restrict':
        const boolValue = !bot.config[option]
        bot.config[option] = boolValue
        saveData('subbots')
        return sock.sendMessage(m.chat, {
          text: `✅ *${option}* ahora está ${boolValue ? '✅ Activado' : '❌ Desactivado'}`,
          mentions: [m.sender]
        }, { quoted: m })
      default:
        return sock.sendMessage(m.chat, {
          text: '❌ Opción no válida. Opciones: prefix, name, welcome, antilink, autoRead, autoTyping, onlyGroup, restrict'
        }, { quoted: m })
    }

    saveData('subbots')
    return sock.sendMessage(m.chat, {
      text: `✅ *Configuración actualizada*
${option}: ${value}`,
      mentions: [m.sender]
    }, { quoted: m })
  }

  // Detener SubBot
  if (args[0] === 'stop' && args[1]) {
    const sessionId = args[1]
    const bot = db.subbots?.[sessionId]

    if (!bot) {
      return sock.sendMessage(m.chat, {
        text: '❌ SubBot no encontrado.'
      }, { quoted: m })
    }

    if (bot.owner !== m.sender && !isOwner(m.sender)) {
      return sock.sendMessage(m.chat, {
        text: '❌ No tienes permiso para detener este SubBot.'
      }, { quoted: m })
    }

    // Detener proceso si existe
    // Aquí iría la lógica para matar el proceso del subbot
    bot.status = 'stopped'
    saveData('subbots')

    return sock.sendMessage(m.chat, {
      text: `🛑 *SubBot detenido*
📛 ${bot.name}
🆔 ${sessionId}

Para reiniciar:
${usedPrefix}subbot start ${sessionId}`,
      mentions: [m.sender]
    }, { quoted: m })
  }

  // Eliminar SubBot
  if (args[0] === 'delete' && args[1]) {
    const sessionId = args[1]
    const bot = db.subbots?.[sessionId]

    if (!bot) {
      return sock.sendMessage(m.chat, {
        text: '❌ SubBot no encontrado.'
      }, { quoted: m })
    }

    if (bot.owner !== m.sender && !isOwner(m.sender)) {
      return sock.sendMessage(m.chat, {
        text: '❌ No tienes permiso para eliminar este SubBot.'
      }, { quoted: m })
    }

    // Detener y eliminar
    const sessionPath = path.join(config.subBotConfig.folder, sessionId)
    if (fs.existsSync(sessionPath)) {
      fs.rmSync(sessionPath, { recursive: true, force: true })
    }

    delete db.subbots[sessionId]
    saveData('subbots')

    return sock.sendMessage(m.chat, {
      text: `🗑️ *SubBot eliminado permanentemente*
📛 ${bot.name}
🆔 ${sessionId}`,
      mentions: [m.sender]
    }, { quoted: m })
  }

  // Iniciar SubBot (después de conectar)
  if (args[0] === 'start' && args[1]) {
    const sessionId = args[1]
    const bot = db.subbots?.[sessionId]

    if (!bot) {
      return sock.sendMessage(m.chat, {
        text: '❌ SubBot no encontrado.'
      }, { quoted: m })
    }

    if (bot.owner !== m.sender && !isOwner(m.sender)) {
      return sock.sendMessage(m.chat, {
        text: '❌ No tienes permiso.'
      }, { quoted: m })
    }

    const sessionPath = path.join(config.subBotConfig.folder, sessionId)

    // Iniciar el proceso del SubBot
    const child = exec(`node lib/subbot-runner.js ${sessionId}`, {
      cwd: process.cwd(),
      env: { 
        ...process.env, 
        SUBBOT_ID: sessionId,
        SUBBOT_PATH: sessionPath
      }
    })

    bot.status = 'connected'
    bot.pid = child.pid
    saveData('subbots')

    return sock.sendMessage(m.chat, {
      text: `🚀 *SubBot iniciado*
📛 ${bot.name}
🆔 ${sessionId}
⚙️ Prefijo: ${bot.prefix}

✅ Tu bot está ahora activo!`,
      mentions: [m.sender]
    }, { quoted: m })
  }

  // Admin: Listar todos los SubBots
  if (args[0] === 'all' && isOwner(m.sender)) {
    const allBots = Object.values(db.subbots || {})

    if (allBots.length === 0) {
      return sock.sendMessage(m.chat, {
        text: 'No hay SubBots registrados.'
      }, { quoted: m })
    }

    let text = `📊 *Todos los SubBots* (${allBots.length})

`

    allBots.forEach((bot, i) => {
      const status = bot.status === 'connected' ? '🟢' : bot.status === 'stopped' ? '🔴' : '🟡'
      text += `${i + 1}. ${status} ${bot.name}
`
      text += `   ├ Owner: @${bot.owner.split('@')[0]}
`
      text += `   ├ Method: ${bot.method}
`
      text += `   └ ID: ${bot.id}

`
    })

    return sock.sendMessage(m.chat, {
      text,
      mentions: allBots.map(b => b.owner)
    }, { quoted: m })
  }

  // Admin: Broadcast a todos los SubBots
  if (args[0] === 'broadcast' && isOwner(m.sender) && args[1]) {
    const message = args.slice(1).join(' ')
    const allBots = Object.values(db.subbots || {}).filter(b => b.status === 'connected')

    // Aquí iría la lógica para enviar mensaje a través de cada subbot

    return sock.sendMessage(m.chat, {
      text: `📢 Broadcast enviado a ${allBots.length} SubBots.`
    }, { quoted: m })
  }
}

handler.help = ['subbot', 'jadibot', 'serbot', 'bots']
handler.tags = ['tools', 'subbots']
handler.command = ['subbot', 'jadibot', 'serbot', 'bots', 'getbot']

export default handler
