import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import chalk from 'chalk'
import NodeCache from 'node-cache'

const __filename = fileURLToPath(import.meta.url)
const __dirname  = path.dirname(__filename)

const erroresRuntimeFile = path.join(process.cwd(), 'data', 'errores-runtime.json')
const groupCache = new NodeCache({ stdTTL: 25 })

// -------------------- Utilidades --------------------

function normalize(jid = '') {
  return String(jid).split('@')[0].split(':')[0].trim()
}

function registrarError(archivo, comando, sender, err) {
  try {
    let errores = []
    if (fs.existsSync(erroresRuntimeFile)) {
      errores = JSON.parse(fs.readFileSync(erroresRuntimeFile, 'utf-8'))
    }
    errores.unshift({
      archivo,
      comando,
      sender,
      error: err.message,
      stack: err.stack?.slice(0, 400) || '',
      fecha: new Date().toLocaleString()
    })
    fs.mkdirSync(path.dirname(erroresRuntimeFile), { recursive: true })
    fs.writeFileSync(erroresRuntimeFile, JSON.stringify(errores.slice(0, 30), null, 2))
  } catch {}
}

function getTipoMensaje(msg) {
  if (!msg?.message) return null
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

function printMensaje(m, conn, texto, tipo) {
  try {
    const jid          = m.key?.remoteJid || ''
    const esGrupo      = jid.endsWith('@g.us')
    const participante = m.key?.participant || jid
    const numero       = normalize(participante)
    const hora         = new Date().toLocaleTimeString('es-ES', { hour12: false })

    const iconos = {
      conversation: '💬', extendedTextMessage: '💬',
      imageMessage: '🖼️', videoMessage: '🎥',
      audioMessage: '🎵', stickerMessage: '🎭',
      documentMessage: '📄', reactionMessage: '❤️',
      locationMessage: '📍', contactMessage: '👤',
      pollCreationMessage: '📊', buttonsResponseMessage: '🔘',
      listResponseMessage: '📋'
    }

    console.log(chalk.gray('─'.repeat(60)))
    if (esGrupo) {
      const nombreGrupo = conn?.chats?.[jid]?.name || jid.replace('@g.us', '')
      console.log(chalk.cyan('👥 Grupo:'), chalk.bold(nombreGrupo))
      console.log(chalk.yellow('👤 De:'), chalk.bold(numero))
    } else {
      const nombreContacto = conn?.chats?.[jid]?.name || numero
      console.log(chalk.green('👤 Privado:'), chalk.bold(nombreContacto), chalk.gray(`(${numero})`))
    }
    console.log(chalk.magenta(`${iconos[tipo] || '💬'} Tipo:`), chalk.bold(tipo))
    if (texto) console.log(chalk.blue('📝 Texto:'), chalk.white(texto.slice(0, 100)))
    console.log(chalk.gray(`🕐 ${hora}`))
  } catch {}
}

function cargarPlugins(dir) {
  let archivos = []
  if (!fs.existsSync(dir)) return archivos
  for (const item of fs.readdirSync(dir)) {
    const fullPath = path.join(dir, item)
    if (fs.statSync(fullPath).isDirectory()) {
      archivos = archivos.concat(cargarPlugins(fullPath))
    } else if (item.endsWith('.js') && !item.startsWith('_')) {
      archivos.push(fullPath)
    }
  }
  return archivos
}

// -------------------- Owner --------------------

function checkOwner(sender) {
  try {
    const senderNum = normalize(sender)
    if (!senderNum) return false

    const owners = Array.isArray(global.owner) ? global.owner : []
    if (!owners.length) return false

    const ownerNums = owners.map(e => normalize(Array.isArray(e) ? e[0] : String(e)))
    return ownerNums.some(num => num === senderNum)
  } catch {
    return false
  }
}

// -------------------- Admin con cache --------------------

async function getAdminInfo(conn, groupJid, senderJid) {
  try {
    let metadata = groupCache.get(groupJid)
    if (!metadata) {
      metadata = await conn.groupMetadata(groupJid)
      groupCache.set(groupJid, metadata)
    }

    const participants = metadata.participants || []
    const senderNum    = normalize(senderJid)

    // ✅ Obtener todos los posibles números/IDs del bot
    const botJid    = conn.user?.id || conn.user?.jid || ''
    const botNum    = normalize(botJid)
    const botLid    = conn.user?.lid ? normalize(conn.user.lid) : null

    // ✅ Buscar bot por número O por LID — Baileys usa LID en grupos nuevos
    const botP = participants.find(p => {
      const pNum = normalize(p.id)
      return pNum === botNum || (botLid && pNum === botLid)
    })

    const userP = participants.find(p => normalize(p.id) === senderNum)

    const isAdmin    = userP?.admin === 'admin' || userP?.admin === 'superadmin'
    const isBotAdmin = botP?.admin  === 'admin' || botP?.admin  === 'superadmin'

    return { isAdmin, isBotAdmin, participants, metadata }
  } catch (e) {
    console.error(chalk.red('Error getAdminInfo:'), e.message)
    return { isAdmin: false, isBotAdmin: false, participants: [], metadata: null }
  }
}

// -------------------- Mensaje de permiso denegado --------------------

async function dfail(tipo, m, conn) {
  const mapa = {
    owner:    'soloOwner',
    group:    'soloGrupo',
    private:  'soloPrivado',
    admin:    'sinPermisos',
    botAdmin: 'sinPermisos'
  }
  const texto = global.msj?.[mapa[tipo]] || `⛔ Sin permiso (${tipo})`
  try {
    await conn.sendMessage(m.key.remoteJid, { text: texto }, { quoted: m })
  } catch {}
}

// -------------------- Handler principal --------------------

export async function handler(conn, chat) {
  try {
    if (!conn || !chat) return

    // Evitar duplicados
    if (!conn.processedMessages) conn.processedMessages = new Set()
    const messageId = chat.messages?.[0]?.key?.id
    if (!messageId) return
    if (conn.processedMessages.has(messageId)) return
    conn.processedMessages.add(messageId)
    setTimeout(() => conn.processedMessages?.delete(messageId), 5000)

    const m = chat.messages[0]
    if (!m?.message) return
    if (m.key?.remoteJid === 'status@broadcast') return
    if (m.message?.protocolMessage) return
    if (m.message?.senderKeyDistributionMessage) return

    const tipo = getTipoMensaje(m)
    if (!tipo) return

    const from       = m.key.remoteJid
    const sender     = m.key.participant || from
    const isGroup    = from.endsWith('@g.us')
    const fromMe     = m.key?.fromMe || false
    const usedPrefix = global.prefix || '.'

    const text =
      m.message?.conversation ||
      m.message?.extendedTextMessage?.text ||
      m.message?.imageMessage?.caption ||
      m.message?.videoMessage?.caption ||
      ''

    if (!fromMe) printMensaje(m, conn, text, tipo)
    if (!text || !text.startsWith(usedPrefix)) return

    const args    = text.slice(usedPrefix.length).trim().split(/\s+/)
    const command = args.shift()?.toLowerCase()
    if (!command) return

    const isOwner   = checkOwner(sender)
    const senderNum = normalize(sender)

    let isAdmin       = false
    let isBotAdmin    = false
    let groupMetadata = null
    let participants  = []

    if (isGroup) {
      const info = await getAdminInfo(conn, from, sender)
      isAdmin       = info.isAdmin
      isBotAdmin    = info.isBotAdmin
      groupMetadata = info.metadata
      participants  = info.participants
    }

    m.chat        = from
    m.sender      = sender
    m.senderNum   = senderNum
    m.timestamp   = Date.now()
    m.isGroup     = isGroup
    m.isAdmin     = isAdmin
    m.isBotAdmin  = isBotAdmin
    m.isOwner     = isOwner
    m.text        = text

    const pluginsDir = path.join(process.cwd(), 'plugins')
    const archivos   = cargarPlugins(pluginsDir)

    for (const filePath of archivos) {
      try {
        const { default: plugin } = await import(`${filePath}?update=${Date.now()}`)
        if (!plugin?.command) continue

        const cmds = [
          ...(Array.isArray(plugin.command) ? plugin.command : [plugin.command]),
          ...(Array.isArray(plugin.aliases)  ? plugin.aliases  : [])
        ].map(c => c.toLowerCase())

        if (!cmds.includes(command)) continue

        const relativo = path.relative(pluginsDir, filePath)

        console.log(
          chalk.bgBlue.white(`\n⚡ COMANDO: ${usedPrefix}${command}`),
          chalk.gray(`[${relativo}]`),
          chalk.gray(`args: [${args.join(', ')}]`)
        )

        if (plugin.owner    && !isOwner)    { await dfail('owner',    m, conn); return }
        if (plugin.group    && !isGroup)    { await dfail('group',    m, conn); return }
        if (plugin.private  && isGroup)     { await dfail('private',  m, conn); return }
        if (plugin.admin    && !isAdmin)    { await dfail('admin',    m, conn); return }
        if (plugin.botAdmin && !isBotAdmin) { await dfail('botAdmin', m, conn); return }

        try {
          await plugin(m, {
            conn,
            args,
            usedPrefix,
            isOwner,
            command,
            isGroup,
            isAdmin,
            isBotAdmin,
            groupMetadata,
            participants,
            senderNum,
            fromMe,
            text: args.join(' ')
          })
        } catch (err) {
          console.error(chalk.red(`\n❌ ERROR EN [${relativo}]:`), err.message)
          registrarError(relativo, command, sender, err)
          await conn.sendMessage(from, {
            text: `❌ Error en *${usedPrefix}${command}*\n🔴 ${err.message}`
          }, { quoted: m }).catch(() => {})
        }

        return

      } catch (err) {
        console.error(chalk.red(`❌ Error cargando plugin:`), err.message)
      }
    }

  } catch (error) {
    console.error(chalk.red('\n❌ ERROR CRÍTICO EN HANDLER:'), error.message)
  }
}
