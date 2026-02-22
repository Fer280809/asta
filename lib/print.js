import chalk from 'chalk'

function getTipoMensaje(msg) {
  const tipos = [
    'conversation', 'imageMessage', 'videoMessage', 'audioMessage',
    'stickerMessage', 'documentMessage', 'extendedTextMessage',
    'reactionMessage', 'locationMessage', 'contactMessage',
    'pollCreationMessage', 'buttonsResponseMessage', 'listResponseMessage'
  ]
  for (const tipo of tipos) {
    if (msg.message?.[tipo]) return tipo
  }
  return null
}

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
  listResponseMessage:    '📋'
}

export function printMensaje(msg, conn) {
  try {
    const tipo = getTipoMensaje(msg)
    if (!tipo) return

    const jid         = msg.key?.remoteJid || ''
    const esGrupo     = jid.endsWith('@g.us')
    const participante = msg.key?.participant || msg.participant || jid
    const numero      = participante.replace('@s.whatsapp.net', '').replace('@g.us', '')
    const texto       = getTexto(msg)
    const hora        = new Date().toLocaleTimeString()
    const icono       = iconos[tipo] || '💬'

    console.log(chalk.gray('─'.repeat(50)))

    if (esGrupo) {
      const nombreGrupo = conn?.chats?.[jid]?.name || jid.replace('@g.us', '')
      console.log(chalk.cyan('👥 Grupo:'),   chalk.bold(nombreGrupo))
      console.log(chalk.yellow('👤 De:'),    chalk.bold(numero))
    } else {
      const nombreContacto = conn?.chats?.[jid]?.name || numero
      console.log(
        chalk.green('👤 Usuario:'),
        chalk.bold(nombreContacto),
        chalk.gray(`(${numero})`)
      )
    }

    console.log(chalk.magenta(`${icono} Tipo:`), chalk.bold(tipo))
    if (texto) console.log(chalk.blue('📝 Mensaje:'), chalk.white(texto))
    console.log(chalk.gray(`🕐 ${hora}`))

  } catch {}
}

export function printComando(usedPrefix, command, args, relativo) {
  console.log(
    chalk.bgBlue.white(`\n⚡ Comando: ${usedPrefix}${command}`),
    chalk.gray(`[${relativo}]`),
    chalk.gray(`args: [${args.join(', ')}]`)
  )
}

export function printError(relativo, err) {
  console.error(chalk.red(`\n❌ ERROR en [${relativo}]`))
  console.error(chalk.red(err.stack || err.message))
}

export function printConexion(namebot) {
  console.log(chalk.green(`\n✅ ${namebot} conectado\n`))
}

export function printReconectando() {
  console.log(chalk.yellow('🔄 Reconectando...'))
}
