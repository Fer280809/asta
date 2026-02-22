import chalk from 'chalk'

// Detecta el tipo de mensaje
function getTipoMensaje(msg) {
  const tipos = [
    'conversation',
    'imageMessage',
    'videoMessage',
    'audioMessage',
    'stickerMessage',
    'documentMessage',
    'extendedTextMessage',
    'reactionMessage',
    'locationMessage',
    'contactMessage',
    'pollCreationMessage',
    'buttonsResponseMessage',
    'listResponseMessage'
  ]

  for (const tipo of tipos) {
    if (msg.message?.[tipo]) return tipo
  }

  return 'desconocido'
}

// Obtiene el texto del mensaje si existe
function getTexto(msg) {
  const m = msg.message
  if (!m) return ''

  return (
    m.conversation ||
    m.extendedTextMessage?.text ||
    m.imageMessage?.caption ||
    m.videoMessage?.caption ||
    m.documentMessage?.caption ||
    m.buttonsResponseMessage?.selectedDisplayText ||
    m.listResponseMessage?.title ||
    ''
  )
}

export function printMensaje(msg, sock) {
  try {
    const tipo = getTipoMensaje(msg)
    const jid  = msg.key?.remoteJid || ''
    const esGrupo = jid.endsWith('@g.us')
    const participante = msg.key?.participant || msg.participant || jid
    const numero = participante.replace('@s.whatsapp.net', '').replace('@g.us', '')
    const texto = getTexto(msg)
    const hora = new Date().toLocaleTimeString()

    // Iconos por tipo
    const iconos = {
      conversation:           '💬',
      extendedTextMessage:    '💬',
      imageMessage:           '🖼️',
      videoMessage:           '🎥',
      audioMessage:           '🎵',
      stickerMessage:         '🎭',
      documentMessage:        '📄',
      reactionMessage:        '❤️',
      locationMessage:        '📍',
      contactMessage:         '👤',
      pollCreationMessage:    '📊',
      buttonsResponseMessage: '🔘',
      listResponseMessage:    '📋',
      desconocido:            '❓'
    }

    const icono = iconos[tipo] || '❓'

    console.log(chalk.gray('─'.repeat(50)))

    if (esGrupo) {
      // Intentar obtener nombre del grupo
      const nombreGrupo = sock?.chats?.[jid]?.name || jid.replace('@g.us', '')
      console.log(
        chalk.cyan('👥 Grupo:'),
        chalk.bold(nombreGrupo)
      )
      console.log(
        chalk.yellow('👤 De:'),
        chalk.bold(numero)
      )
    } else {
      // Chat privado
      const nombreContacto = sock?.chats?.[jid]?.name || numero
      console.log(
        chalk.green('👤 Usuario:'),
        chalk.bold(nombreContacto),
        chalk.gray(`(${numero})`)
      )
    }

    console.log(
      chalk.magenta(`${icono} Tipo:`),
      chalk.bold(tipo)
    )

    if (texto) {
      console.log(
        chalk.blue('📝 Mensaje:'),
        chalk.white(texto)
      )
    }

    console.log(chalk.gray(`🕐 ${hora}`))

  } catch (e) {
    // Silencioso para no romper el bot
  }
}
