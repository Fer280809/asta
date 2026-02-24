import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import chalk from 'chalk'

const __filename = fileURLToPath(import.meta.url)
const __dirname  = path.dirname(__filename)

const erroresRuntimeFile = path.join(process.cwd(), 'data', 'errores-runtime.json')
const pluginsCache = new Map() // Cache de plugins

// -------------------- Funciones auxiliares --------------------
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
    'pollCreationMessage', 'buttonsResponseMessage', 'listResponseMessage',
    'templateButtonReplyMessage', 'interactiveResponseMessage'
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
    const numero       = extraerNumero(participante)
    const hora = new Date().toLocaleTimeString('es-ES', { hour12: false })

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
    if (texto) console.log(chalk.blue('📝 Texto:'), chalk.white(texto.slice(0, 100) + (texto.length > 100 ? '...' : '')))
    console.log(chalk.gray(`🕐 ${hora}`))
  } catch (e) {
    console.error(chalk.red('Error en printMensaje:'), e.message)
  }
}

function cargarPlugins(dir) {
  let archivos = []
  if (!fs.existsSync(dir)) {
    console.log(chalk.yellow(`⚠️ Directorio plugins no existe: ${dir}`))
    return archivos
  }
  
  try {
    for (const item of fs.readdirSync(dir)) {
      const fullPath = path.join(dir, item)
      const stat = fs.statSync(fullPath)
      
      if (stat.isDirectory()) {
        archivos = archivos.concat(cargarPlugins(fullPath))
      } else if (item.endsWith('.js') && !item.startsWith('_')) {
        archivos.push(fullPath)
      }
    }
  } catch (e) {
    console.error(chalk.red('Error cargando plugins:'), e.message)
  }
  
  return archivos
}

// -------------------- Función clave: Extraer solo número --------------------
function extraerNumero(jid) {
  if (!jid) return ''
  // Manejar diferentes formatos: "123@s.whatsapp.net", "123:1@s.whatsapp.net", etc.
  const match = String(jid).match(/(\d+)/)
  return match ? match[1] : ''
}

// -------------------- Obtener número del bot de forma segura --------------------
function getBotNumber(conn) {
  try {
    // Intentar diferentes ubicaciones donde puede estar el JID del bot
    const possibleJids = [
      conn.user?.jid,
      conn.user?.id,
      conn.authState?.creds?.me?.id,
      conn.state?.creds?.me?.id,
      conn.ws?.socket?.user?.jid,
      conn?.user
    ]
    
    for (const jid of possibleJids) {
      if (jid) {
        const num = extraerNumero(jid)
        if (num) return num
      }
    }
    
    return ''
  } catch (e) {
    console.error(chalk.red('Error obteniendo número del bot:'), e.message)
    return ''
  }
}

// -------------------- Detección de owner --------------------
function checkOwner(sender) {
  try {
    const senderNum = extraerNumero(sender)
    if (!senderNum) return false
    
    // Múltiples fuentes posibles para owners
    const owners = global.owner || global.owners || global.config?.owner || []
    
    if (!Array.isArray(owners) || owners.length === 0) {
      console.log(chalk.yellow('⚠️ No hay owners configurados en global.owner'))
      return false
    }

    return owners.some(entry => {
      // Manejar diferentes formatos: ["123", "Nombre"], "123", {numero: "123"}
      let ownerRaw
      if (Array.isArray(entry)) {
        ownerRaw = entry[0]
      } else if (typeof entry === 'object' && entry !== null) {
        ownerRaw = entry.numero || entry.number || entry.id || entry
      } else {
        ownerRaw = entry
      }
      
      return extraerNumero(ownerRaw) === senderNum
    })
  } catch (e) {
    console.error(chalk.red('Error en checkOwner:'), e)
    return false
  }
}

// -------------------- Mensajes de error --------------------
async function dfail(tipo, m, conn) {
  const mapa = {
    owner: 'soloOwner',
    group: 'soloGrupo',
    private: 'soloPrivado',
    admin: 'sinPermisos',
    botAdmin: 'botNoAdmin',
    premium: 'sinPermisos',
    restrict: 'restringido'
  };

  const clave = mapa[tipo] || 'sinPermisos';
  const texto = global.msj?.[clave] || global.msgs?.[clave] || 
                `⛔ No tienes permiso para usar este comando (${tipo})`;

  try {
    const chatId = m.key?.remoteJid || m.chat
    await conn.sendMessage(chatId, {
      text: texto,
      contextInfo: {
        externalAdReply: {
          title: `『${global.namebot || 'Bot'}』`,
          body: global.etiqueta || 'By Fernando',
          thumbnailUrl: global.icono || '',
          sourceUrl: global.channel || '',
          mediaType: 1,
          renderLargerThumbnail: true,
          showAdAttribution: true
        },
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: global.IDchannel || '120363399175402285@newsletter',
          newsletterName: global.namebot || 'Asta-Bot',
          serverMessageId: -1
        }
      }
    }, { quoted: m });
  } catch (e) {
    // Fallback simple si falla el mensaje con contextInfo
    try {
      const chatId = m.key?.remoteJid || m.chat
      await conn.sendMessage(chatId, { text: texto }, { quoted: m });
    } catch (e2) {
      console.error(chalk.red('Error enviando mensaje de permiso:'), e2.message)
    }
  }
}

// -------------------- Handler principal --------------------
export async function handler(conn, chat) {
  try {
    // Validaciones iniciales
    if (!conn || !chat) {
      console.error(chalk.red('❌ Handler recibió conn o chat undefined'))
      return
    }

    // Evitar procesar el mismo mensaje varias veces
    if (!conn.processedMessages) conn.processedMessages = new Set()
    
    const messageId = chat.messages?.[0]?.key?.id
    if (!messageId) return
    
    if (conn.processedMessages.has(messageId)) return
    conn.processedMessages.add(messageId)
    setTimeout(() => conn.processedMessages.delete(messageId), 5000) // Aumentado a 5s

    const m = chat.messages[0]
    if (!m?.message) return
    
    // Ignorar ciertos tipos de mensajes
    if (m.key?.remoteJid === 'status@broadcast') return
    if (m.message?.protocolMessage) return
    if (m.message?.senderKeyDistributionMessage) return

    const tipo = getTipoMensaje(m)
    if (!tipo) return

    const from       = m.key.remoteJid
    const sender     = m.key.participant || from
    const isGroup    = from.endsWith('@g.us')
    const fromMe     = m.key?.fromMe || false
    
    // Obtener prefijo de múltiples fuentes posibles
    const usedPrefix = global.prefix || global.prefijo || '.'

    // Extraer texto del mensaje
    let text = ''
    try {
      text = m.message?.conversation ||
             m.message?.extendedTextMessage?.text ||
             m.message?.imageMessage?.caption ||
             m.message?.videoMessage?.caption ||
             m.message?.documentMessage?.caption ||
             ''
    } catch (e) {
      text = ''
    }

    // Imprimir mensaje recibido (excepto si es del bot)
    if (!fromMe) printMensaje(m, conn, text, tipo)
    
    // Si no hay texto o no empieza con prefijo, no es comando
    if (!text || !text.startsWith(usedPrefix)) return

    // Parsear comando y argumentos
    const args    = text.slice(usedPrefix.length).trim().split(/\s+/)
    const command = args.shift()?.toLowerCase()
    
    if (!command) return

    // Verificar owner
    const isOwner = checkOwner(sender)
    const senderNum = extraerNumero(sender)
    
    // Debug de owner en desarrollo
    if (global.debug || process.env.DEBUG) {
      console.log(chalk.gray(`🔍 Debug - Sender: ${senderNum}, isOwner: ${isOwner}`))
    }

    // ========== OBTENER INFORMACIÓN DEL GRUPO ==========
    let groupMetadata = null
    let participants = []
    let isAdmin = false
    let isBotAdmin = false

    if (isGroup) {
      try {
        // Obtener metadata del grupo
        groupMetadata = await conn.groupMetadata(from).catch(e => {
          console.error(chalk.red('Error groupMetadata:'), e.message)
          return null
        })
        
        if (!groupMetadata) {
          console.log(chalk.yellow('⚠️ No se pudo obtener metadata del grupo'))
        } else {
          participants = groupMetadata.participants || []
          
          // Número del bot (solo dígitos)
          const botNum = getBotNumber(conn)
          
          if (!botNum) {
            console.error(chalk.red('❌ No se pudo obtener número del bot'))
          }

          // Debug de participantes
          if (global.debug || process.env.DEBUG) {
            console.log(chalk.cyan('📊 PARTICIPANTES:'))
            participants.forEach(p => {
              const num = extraerNumero(p.id)
              console.log(chalk.gray(`  - ${num}: ${p.admin || 'member'}`))
            })
            console.log(chalk.cyan(`🤖 Bot: ${botNum} | 👤 Usuario: ${senderNum}`))
          }

          // Buscar usuario por NÚMERO
          const userParticipant = participants.find(p => {
            return extraerNumero(p.id) === senderNum
          })

          isAdmin = !!(userParticipant?.admin === 'admin' || userParticipant?.admin === 'superadmin')

          // Buscar bot por NÚMERO
          const botParticipant = participants.find(p => {
            return extraerNumero(p.id) === botNum
          })

          isBotAdmin = !!(botParticipant?.admin === 'admin' || botParticipant?.admin === 'superadmin')

          if (global.debug || process.env.DEBUG) {
            console.log(chalk.yellow('✅ PERMISOS:'))
            console.log(chalk.gray(`  Usuario ${senderNum}: Admin=${isAdmin}`))
            console.log(chalk.gray(`  Bot ${botNum}: Encontrado=${botParticipant ? 'SÍ' : 'NO'}, Admin=${isBotAdmin}`))
          }
        }
      } catch (e) {
        console.error(chalk.red('Error al obtener metadata del grupo:'), e.message)
      }
    }

    // Adjuntar propiedades útiles al mensaje
    m.chat        = from
    m.sender      = sender
    m.senderNum   = senderNum
    m.timestamp   = Date.now()
    m.isGroup     = isGroup
    m.isAdmin     = isAdmin
    m.isBotAdmin  = isBotAdmin
    m.isOwner     = isOwner
    m.text        = text

    // ========== BUSCAR Y EJECUTAR PLUGIN ==========
    const pluginsDir = path.join(process.cwd(), 'plugins')
    const archivos   = cargarPlugins(pluginsDir)
    
    let comandoEncontrado = false

    for (const filePath of archivos) {
      try {
        let plugin
        
        // Usar cache en producción, recargar en desarrollo
        const useCache = !global.debug && !process.env.DEBUG
        const cacheKey = `${filePath}?${command}`
        
        if (useCache && pluginsCache.has(cacheKey)) {
          plugin = pluginsCache.get(cacheKey)
        } else {
          // Importar plugin (con cache busting en desarrollo)
          const importUrl = global.debug ? 
            `${filePath}?update=${Date.now()}` : 
            filePath
            
          const module = await import(importUrl)
          plugin = module.default || module
          
          if (useCache && plugin?.command) {
            pluginsCache.set(cacheKey, plugin)
          }
        }

        if (!plugin?.command) continue

        // Verificar si el comando coincide
        const cmds = Array.isArray(plugin.command) ? plugin.command : [plugin.command]
        const aliases = Array.isArray(plugin.aliases) ? plugin.aliases : []
        const allCommands = [...cmds, ...aliases].map(c => c.toLowerCase())
        
        if (!allCommands.includes(command)) continue
        
        comandoEncontrado = true
        const relativo = path.relative(pluginsDir, filePath)

        console.log(
          chalk.bgBlue.white(`\n⚡ COMANDO: ${usedPrefix}${command}`),
          chalk.gray(`[${relativo}]`)
        )

        // ========== VERIFICACIONES DE PERMISOS ==========
        if (plugin.owner && !isOwner) {
          await dfail('owner', m, conn)
          return
        }

        if (plugin.group && !isGroup) {
          await dfail('group', m, conn)
          return
        }

        if (plugin.private && isGroup) {
          await dfail('private', m, conn)
          return
        }

        if (plugin.admin && !isAdmin) {
          await dfail('admin', m, conn)
          return
        }

        if (plugin.botAdmin && !isBotAdmin) {
          await dfail('botAdmin', m, conn)
          return
        }

        if (plugin.premium && !isOwner) { // Ajusta según tu sistema de premium
          await dfail('premium', m, conn)
          return
        }

        // ========== EJECUCIÓN DEL PLUGIN ==========
        try {
          const context = { 
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
            text: args.join(" "),
            senderNum,
            fromMe
          }
          
          await plugin(m, context)
          
        } catch (err) {
          console.error(chalk.red(`\n❌ ERROR EN PLUGIN [${relativo}]:`))
          console.error(chalk.red(err.stack || err.message))
          
          registrarError(relativo, command, sender, err)

          const errorMsg = global.msj?.error || global.msgs?.error || 
                          '❌ Error al ejecutar el comando. Intenta de nuevo.'
          
          try {
            await conn.sendMessage(m.chat, { text: errorMsg }, { quoted: m })
          } catch (e) {
            console.error(chalk.red('Error enviando mensaje de error:'), e.message)
          }
        }

        return // Comando ejecutado, salir

      } catch (err) {
        console.error(chalk.red(`❌ Error cargando plugin ${filePath}:`), err.message)
        // Continuar con el siguiente plugin
      }
    }

    // Comando no encontrado (opcional: notificar)
    if (!comandoEncontrado && global.comandoNoEncontrado) {
      // await conn.sendMessage(from, { text: `❌ Comando *${command}* no encontrado` }, { quoted: m })
    }

  } catch (error) {
    console.error(chalk.red('\n❌ ERROR CRÍTICO EN HANDLER:'))
    console.error(chalk.red(error.stack || error.message))
  }
}
