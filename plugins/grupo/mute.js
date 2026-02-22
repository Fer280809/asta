export async function handler(conn, chat) {
  const m = chat.messages[0]
  if (!m?.message) return
  
  const from = m.key.remoteJid
  const sender = m.key.participant || from
  const isGroup = from.endsWith('@g.us')

  if (!isGroup) return

  const text =
    m.message?.conversation ||
    m.message?.extendedTextMessage?.text ||
    ''

  const args = text.trim().split(/\s+/).slice(1)
  const command = text.trim().split(/\s+/)[0].toLowerCase().replace(global.prefix, '')
  const usedPrefix = global.prefix

  // Validar que sea comando de mute
  if (!['mute', 'silenciar'].includes(command)) return

  // Obtener menciones
  const mentions = m.message?.extendedTextMessage?.contextInfo?.mentionedJid || []
  let user = null

  // Buscar usuario mencionado
  if (mentions.length > 0) {
    user = mentions[0]
  } else if (m.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
    // Si es respuesta a un mensaje, usar el remitente de ese mensaje
    const quotedParticipant = m.message.extendedTextMessage.contextInfo.participant
    user = quotedParticipant
  }

  if (!user) {
    return conn.sendMessage(from, { text: `❀ Debes mencionar a un usuario para silenciarlo.` }, { quoted: m })
  }

  // Extraer tiempo del comando
  let time = text.match(/(\d+)([smhd])/i)
  let duration = 0
  let durationText = 'indefinidamente'

  if (time) {
    let value = parseInt(time[1])
    let unit = time[2].toLowerCase()

    switch (unit) {
      case 's':
        duration = value * 1000
        durationText = `${value} segundo${value > 1 ? 's' : ''}`
        break
      case 'm':
        duration = value * 60 * 1000
        durationText = `${value} minuto${value > 1 ? 's' : ''}`
        break
      case 'h':
        duration = value * 60 * 60 * 1000
        durationText = `${value} hora${value > 1 ? 's' : ''}`
        break
      case 'd':
        duration = value * 24 * 60 * 60 * 1000
        durationText = `${value} día${value > 1 ? 's' : ''}`
        break
    }
  }

  try {
    const groupInfo = await conn.groupMetadata(from)
    const ownerGroup = groupInfo.owner || from.split('-')[0] + '@s.whatsapp.net'
    const ownerBot = global.owner[0][0] + '@s.whatsapp.net'
    const botJid = conn.user.id
    const participants = groupInfo.participants || []

    // Verificaciones de seguridad
    if (user === botJid) {
      return conn.sendMessage(from, { text: `ꕥ No puedo silenciar al bot.` }, { quoted: m })
    }

    if (user === ownerGroup) {
      return conn.sendMessage(from, { text: `ꕥ No puedo silenciar al propietario del grupo.` }, { quoted: m })
    }

    if (user === ownerBot) {
      return conn.sendMessage(from, { text: `ꕥ No puedo silenciar al propietario del bot.` }, { quoted: m })
    }

    // Verificar si el usuario es admin
    const isAdmin = participants.find(p => p.id === user)?.admin
    if (isAdmin) {
      return conn.sendMessage(from, { text: `ꕥ No puedo silenciar a un administrador del grupo.` }, { quoted: m })
    }

    // Inicializar estructura de datos si no existe
    if (!global.db.data.chats) global.db.data.chats = {}
    if (!global.db.data.chats[from]) global.db.data.chats[from] = {}
    if (!global.db.data.chats[from].mutes) global.db.data.chats[from].mutes = {}

    // Verificar si ya está muteado
    if (global.db.data.chats[from].mutes[user]) {
      const muteData = global.db.data.chats[from].mutes[user]
      const remainingTime = muteData.expiresAt ? Math.max(0, muteData.expiresAt - Date.now()) : null
      
      if (remainingTime === null) {
        return conn.sendMessage(from, { text: `ꕥ Este usuario ya está silenciado indefinidamente.` }, { quoted: m })
      } else if (remainingTime > 0) {
        const timeLeft = formatTime(remainingTime)
        return conn.sendMessage(from, { text: `ꕥ Este usuario ya está silenciado. Tiempo restante: ${timeLeft}` }, { quoted: m })
      }
    }

    // Obtener nombre del usuario
    const userName = await conn.getName(user).catch(() => user.split('@')[0])

    // Registrar el mute
    global.db.data.chats[from].mutes[user] = {
      mutedAt: Date.now(),
      mutedBy: sender,
      duration: duration,
      expiresAt: duration > 0 ? Date.now() + duration : null,
      name: userName
    }

    // Mensaje de confirmación
    await conn.sendMessage(from, {
      text: `✓ Usuario @${user.split('@')[0]} ha sido silenciado ${durationText}.\n\n_No podrá enviar mensajes en este grupo._`,
      mentions: [user]
    }, { quoted: m })

    // Si hay duración, programar unmute automático
    if (duration > 0) {
      setTimeout(() => {
        if (global.db.data.chats[from]?.mutes?.[user]) {
          delete global.db.data.chats[from].mutes[user]
          conn.sendMessage(from, {
            text: `✓ El silencio de @${user.split('@')[0]} ha expirado.`,
            mentions: [user]
          }).catch(() => null)
        }
      }, duration)
    }
  } catch (e) {
    console.error('Error en mute:', e)
    conn.sendMessage(from, { text: `⚠︎ Se ha producido un problema.\n> Usa *${usedPrefix}report* para informarlo.\n\n${e.message}` }, { quoted: m })
  }
}

// Función auxiliar para formatear tiempo
function formatTime(ms) {
  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) return `${days}d ${hours % 24}h`
  if (hours > 0) return `${hours}h ${minutes % 60}m`
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`
  return `${seconds}s`
}

export const config = {
  help: ['mute'],
  tags: ['group'],
  command: ['mute', 'silenciar'],
  group: true,
  admin: true,
  botAdmin: true
}
