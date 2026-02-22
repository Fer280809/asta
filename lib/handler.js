import fs from 'fs'
import path from 'path'
import { pathToFileURL } from 'url'
import config from '../config.js'
import { loadData, getUser } from './database.js'

// Cargar datos al iniciar
loadData()

// Almacenamiento de plugins
const plugins = {}

// Función recursiva para cargar plugins de todas las subcarpetas
async function loadPluginsFromDir(dir, baseDir = dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true })

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)

    if (entry.isDirectory()) {
      await loadPluginsFromDir(fullPath, baseDir)
    } else if (entry.isFile() && entry.name.endsWith('.js')) {
      try {
        const fileUrl = pathToFileURL(fullPath).href
        const module = await import(fileUrl + '?t=' + Date.now())
        const plugin = module.default

        if (plugin && plugin.command && typeof plugin.execute === 'function') {
          const commands = Array.isArray(plugin.command) 
            ? plugin.command 
            : [plugin.command]

          commands.forEach(cmd => {
            plugins[cmd.toLowerCase()] = plugin
            console.log(`✅ Comando cargado: ${cmd}`)
          })
        }
      } catch (error) {
        console.error(`❌ Error cargando ${fullPath}:`, error.message)
      }
    }
  }
}

// Cargar todos los plugins
export async function loadPlugins() {
  const pluginsDir = path.resolve('./plugins')

  if (!fs.existsSync(pluginsDir)) {
    console.log('⚠️ Carpeta plugins no existe')
    return
  }

  console.log('🔄 Cargando plugins...')
  await loadPluginsFromDir(pluginsDir)
  console.log(`✅ Total comandos cargados: ${Object.keys(plugins).length}`)
}

// Procesar mensaje y ejecutar comandos
export async function handleMessage(sock, msg) {
  try {
    if (!msg.message) return
    if (msg.key.fromMe) return

    // Extraer texto del mensaje
    const body = (
      msg.message.conversation ||
      msg.message.extendedTextMessage?.text ||
      msg.message.imageMessage?.caption ||
      msg.message.videoMessage?.caption ||
      ''
    ).trim()

    if (!body) return

    // Verificar prefijo
    if (!body.startsWith(config.prefix)) return

    // Extraer comando y argumentos
    const args = body.slice(config.prefix.length).trim().split(/\s+/)
    const command = args.shift()?.toLowerCase()

    if (!command || !plugins[command]) return

    // Preparar objeto m (similar al estilo del ejemplo)
    const m = {
      chat: msg.key.remoteJid,
      sender: msg.key.participant || msg.key.remoteJid,
      fromMe: msg.key.fromMe,
      id: msg.key.id,
      timestamp: msg.messageTimestamp,
      pushName: msg.pushName,
      body: body,
      text: args.join(' '),
      args: args,
      command: command,
      quoted: msg.message.extendedTextMessage?.contextInfo?.quotedMessage || null,
      mentionedJid: msg.message.extendedTextMessage?.contextInfo?.mentionedJid || [],
      key: msg.key,
      message: msg.message
    }

    // Añadir propiedad from al quoted si existe
    if (m.quoted) {
      m.quoted.sender = msg.message.extendedTextMessage?.contextInfo?.participant
      m.quoted.id = msg.message.extendedTextMessage?.contextInfo?.stanzaId
    }

    // Ejecutar plugin
    try {
      await plugins[command].execute(sock, m, args)
    } catch (error) {
      console.error(`❌ Error en comando ${command}:`, error)
      await sock.sendMessage(m.chat, { 
        text: `❌ Error ejecutando el comando: ${error.message}` 
      })
    }

  } catch (err) {
    console.error('❌ Error en handleMessage:', err)
  }
}

// Manejar eventos de grupo (participants update)
export async function handleEvent(sock, update) {
  if (update.event === 'group-participants.update') {
    console.log('👥 Evento de grupo:', update)

    // Aquí se pueden agregar handlers de eventos (welcome, goodbye, etc.)
  }
}

// Función para recargar plugins (hot reload)
export async function reloadPlugins() {
  console.log('🔄 Recargando plugins...')
  Object.keys(plugins).forEach(key => delete plugins[key])
  await loadPlugins()
  return Object.keys(plugins).length
}
