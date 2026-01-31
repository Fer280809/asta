const { useMultiFileAuthState, DisconnectReason, makeCacheableSignalKeyStore, fetchLatestBaileysVersion } = (await import("@whiskeysockets/baileys"))
import qrcode from "qrcode"
import NodeCache from "node-cache"
import fs from "fs"
import path from "path"
import pino from 'pino'
import chalk from 'chalk'
import util from 'util'
import * as ws from 'ws'
const { child, spawn, exec } = await import('child_process')
const { CONNECTING } = ws
import { makeWASocket } from '../../lib/simple.js'
import { fileURLToPath } from 'url'

let crm1 = "Y2QgcGx1Z2lucy"
let crm2 = "A7IG1kNXN1b"
let crm3 = "CBpbmZvLWRvbmFyLmpz"
let crm4 = "IF9hdXRvcmVzcG9uZGVyLmpzIGluZm8tYm90Lmpz"
let drm1 = ""
let drm2 = ""

const imagenSerBot = 'https://files.catbox.moe/gptlxc.jpg'

let rtx = `╭─〔 💻 𝘼𝙎𝙏𝘼 𝘽𝙊𝙏 • 𝙈𝙊𝘿𝙊 𝙌𝙍 〕─╮
│
│  📲 Escanea este *QR* desde otro celular o PC
│  para convertirte en un *Sub-Bot Temporal* de Asta.
│
│  1️⃣  Pulsa los ⋮ tres puntos arriba a la derecha
│  2️⃣  Ve a *Dispositivos vinculados*
│  3️⃣  Escanea el QR y ¡listo! ⚡
│
│  ⏳  *Expira en 45 segundos.*
╰───────────────────────`

let rtx2 = `╭─[ 💻 𝘼𝙎𝙏𝘼 𝘽𝙊𝙏 • 𝙈𝙊𝘿𝙊 𝘾𝙊𝘿𝙀 ]─╮
│
│  🧠  Este es el *Modo CODE* de Asta Bot.
│  Escanea el *QR* desde otro celular o PC
│  para convertirte en un *Sub-Bot Temporal*.
│
│  1️⃣  Pulsa los ⋮ tres puntos arriba a la derecha
│  2️⃣  Entra en *Dispositivos vinculados*
│  3️⃣  Escanea el QR y ¡listo! ⚡
│
│  ⏳  *Expira en 45 segundos.*
╰────────────────────────╯`

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const AstaJBOptions = {}

// ============= INICIALIZAR VARIABLES GLOBALES =============
if (!global.conns || !Array.isArray(global.conns)) {
    console.log(chalk.yellow('⚠️ Inicializando global.conns como array vacío'))
    global.conns = []
}

if (!global.activeSubBots) global.activeSubBots = new Map()
if (!global.subBotsData) global.subBotsData = new Map()

// ============= FUNCIÓN OPTIMIZADA PARA VERIFICAR CONEXIÓN =============
function isSubBotConnected(jid) { 
    if (!global.conns?.length) return false
    const targetJid = jid.split("@")[0]
    
    return global.conns.some(sock => {
        try {
            return sock?.user?.jid?.split("@")[0] === targetJid && 
                   sock.ws?.readyState <= 1 // 0=CONNECTING, 1=OPEN
        } catch { return false }
    })
}

// ============= HANDLER PRINCIPAL OPTIMIZADO =============
let handler = async (m, { conn, args, usedPrefix, command, isOwner }) => {
    if (!globalThis.db.data.settings[conn.user.jid].jadibotmd) {
        return m.reply(`ꕥ El Comando *${command}* está desactivado temporalmente.`)
    }

    // ============ VERIFICAR LÍMITE OPTIMIZADO ============
    const activeSubBotsCount = global.conns?.filter(sock => 
        sock?.user?.jid && 
        sock.user.jid !== global.conn.user.jid &&
        sock.ws?.readyState <= 1
    ).length || 0

    const maxLimit = global.supConfig?.maxSubBots || 100

    if (activeSubBotsCount >= maxLimit) {
        return m.reply(
            `⚠️ *LÍMITE DE SUBBOTS ALCANZADO*\n\n` +
            `• SubBots activos: ${activeSubBotsCount}\n` +
            `• Límite máximo: ${maxLimit}\n\n` +
            `📋 Usa *${usedPrefix}listjadibot* para ver SubBots\n` +
            `🗑️ Usa *${usedPrefix}killall* para limpiar inactivos`
        )
    }

    // ============ COOLDOWN OPTIMIZADO ============
    const userCooldown = global.db.data.users[m.sender]?.Subs || 0
    const timeLeft = 120000 - (Date.now() - userCooldown)

    if (timeLeft > 0) {
        return m.reply(`ꕥ Debes esperar ${msToTime(timeLeft)} para volver a vincular un *Sub-Bot.*`)
    }

    // ============ CREAR SUBBOT OPTIMIZADO ============
    const mentionedJid = await m.mentionedJid
    const who = mentionedJid?.[0] || (m.fromMe ? conn.user.jid : m.sender)
    const id = who.split('@')[0]

    // Verificación rápida de conexión existente
    if (isSubBotConnected(who)) {
        return m.reply(
            `⚠️ Ya tienes un SubBot activo.\n\n` +
            `📋 *Opciones:*\n` +
            `• *${usedPrefix}kill ${id}* - Eliminar este SubBot\n` +
            `• *${usedPrefix}listjadibot* - Ver todos los SubBots`
        )
    }

    const pathAstaJadiBot = path.join(`./${global.jadi || 'Sessions/SubBot'}/`, id)

    // Limpieza rápida de sesión anterior
    if (fs.existsSync(pathAstaJadiBot)) {
        fs.rmSync(pathAstaJadiBot, { recursive: true, force: true })
    }

    fs.mkdirSync(pathAstaJadiBot, { recursive: true })

    AstaJBOptions.pathAstaJadiBot = pathAstaJadiBot
    AstaJBOptions.m = m
    AstaJBOptions.conn = conn
    AstaJBOptions.args = args
    AstaJBOptions.usedPrefix = usedPrefix
    AstaJBOptions.command = command
    AstaJBOptions.fromCommand = true
    AstaJBOptions.userId = id

    console.log(chalk.blue(`🚀 Creando SubBot para: ${id}`))

    AstaJadiBot(AstaJBOptions)
    global.db.data.users[m.sender].Subs = Date.now()
}

handler.help = ['qr', 'code']
handler.tags = ['serbot']
handler.command = ['qr', 'code']
export default handler 

// ============= FUNCIÓN PRINCIPAL OPTIMIZADA PARA CREAR SUBBOT =============
export async function AstaJadiBot(options) {
    let { pathAstaJadiBot, m, conn, args, usedPrefix, command, userId } = options

    if (command === 'code') {
        command = 'qr'
        args.unshift('code')
    }

    const mcode = args[0]?.trim().match(/(--code|code)/) || args[1]?.trim().match(/(--code|code)/)
    let txtCode, codeBot, txtQR
    let qrSent = false // ⚡ Control para evitar múltiples QR
    let codeSent = false // ⚡ Control para evitar múltiples códigos

    if (mcode) {
        args[0] = args[0]?.replace(/^--code$|^code$/, "").trim()
        args[1] = args[1]?.replace(/^--code$|^code$/, "").trim()
        if (args[0] === "") args[0] = undefined
    }

    const pathCreds = path.join(pathAstaJadiBot, "creds.json")

    if (!fs.existsSync(pathAstaJadiBot)){
        fs.mkdirSync(pathAstaJadiBot, { recursive: true })
    }

    try {
        // Si hay código base64, procesarlo directamente
        if (args[0]) {
            const credsData = JSON.parse(Buffer.from(args[0], "base64").toString("utf-8"))
            
            await fs.promises.writeFile(pathCreds, JSON.stringify(credsData, null, '\t'))
            console.log(chalk.green(`✅ Credenciales cargadas desde código`))
            
            await m.reply('⏳ Conectando SubBot...')
        }

        const { state, saveCreds } = await useMultiFileAuthState(pathAstaJadiBot)
        const msgRetry = (MessageRetryMap) => { }
        const msgRetryCache = new NodeCache()
        
        // ⚡ OPTIMIZACIÓN: Obtener versión de forma asíncrona pero no bloquear
        const { version } = await fetchLatestBaileysVersion()

        // ⚡ OPTIMIZACIÓN: Configuración mejorada del socket
        const connectionOptions = {
            logger: pino({ level: 'silent' }), // Silenciar logs innecesarios
            printQRInTerminal: false,
            auth: {
                creds: state.creds,
                keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "silent" })),
            },
            msgRetry,
            msgRetryCache,
            version,
            syncFullHistory: false, // ⚡ No sincronizar historial completo
            browser: ['Ubuntu', 'Chrome', '20.0.04'],
            defaultQueryTimeoutMs: 15000, // ⚡ Reducido para conexión más rápida
            connectTimeoutMs: 10000, // ⚡ Timeout de conexión reducido
            qrTimeout: 40000, // ⚡ Timeout del QR reducido
            getMessage: async (key) => {
                if (store) {
                    const msg = await store.loadMessage(key.remoteJid, key.id)
                    return msg?.message || ""
                }
                return { conversation: '' }
            },
            patchMessageBeforeSending: (message) => {
                const requiresPatch = !!(
                    message.buttonsMessage ||
                    message.templateMessage ||
                    message.listMessage
                )
                if (requiresPatch) {
                    message = {
                        viewOnceMessage: {
                            message: {
                                messageContextInfo: {
                                    deviceListMetadataVersion: 2,
                                    deviceListMetadata: {},
                                },
                                ...message,
                            },
                        },
                    }
                }
                return message
            },
        }

        let sock = makeWASocket(connectionOptions)
        let isInit = true

        // Configuración inicial del SubBot
        sock.subConfig = {
            name: 'SubBot',
            prefix: '.',
            sinprefix: true,
            mode: 'público',
            owner: m.sender,
            createdBy: userId,
            createdAt: new Date().toISOString()
        }

        // Guardar configuración inicial
        async function saveSubBotState() {
            try {
                await fs.promises.writeFile(
                    path.join(pathAstaJadiBot, 'config.json'),
                    JSON.stringify(sock.subConfig, null, 2)
                )
            } catch (e) {
                console.error('Error guardando config:', e)
            }
        }

        // ⚡ OPTIMIZACIÓN: Procesamiento de QR/Code más rápido
        sock.ev.on('creds.update', saveCreds)

        const connectionUpdate = async (update) => {
            const { connection, lastDisconnect, qr, isNewLogin } = update

            // ⚡ SOLO ENVIAR QR SI SE PIDIÓ QR (no code) y NO SE HA ENVIADO AÚN
            if (qr && !mcode && !qrSent && !args[0]) {
                qrSent = true // ⚡ Marcar como enviado
                try {
                    const qrImage = await qrcode.toDataURL(qr, { scale: 8 })
                    const qrBuffer = Buffer.from(qrImage.split(',')[1], 'base64')
                    
                    txtQR = await conn.sendMessage(m.chat, {
                        image: qrBuffer,
                        caption: rtx.trim()
                    }, { quoted: m })

                    // ⚡ Auto-eliminar QR
                    setTimeout(() => {
                        if (txtQR?.key) conn.sendMessage(m.sender, { delete: txtQR.key })
                    }, 30000)
                } catch (e) {
                    console.error('Error generando QR:', e)
                    qrSent = false // Permitir reintento si falla
                }
            }

            // ⚡ SOLO ENVIAR CODE SI SE PIDIÓ CODE y NO SE HA ENVIADO AÚN
            if (mcode && !codeSent && !args[0] && !sock.authState?.creds?.registered) {
                codeSent = true // ⚡ Marcar como enviado
                try {
                    let codeA = await sock.requestPairingCode(m.sender.split('@')[0])
                    codeA = codeA?.match(/.{1,4}/g)?.join('-') || codeA
                    
                    // Enviar el texto de instrucciones
                    await conn.sendMessage(m.chat, {
                        text: rtx2.trim()
                    }, { quoted: m })
                    
                    // Enviar el código en mensaje separado
                    await new Promise(resolve => setTimeout(resolve, 500)) // Pequeña pausa
                    
                    codeBot = await conn.sendMessage(m.chat, {
                        text: `*Código:*\n\`\`\`${codeA}\`\`\``
                    }, { quoted: m })

                    // ⚡ Auto-eliminar código
                    setTimeout(() => {
                        if (codeBot?.key) conn.sendMessage(m.sender, { delete: codeBot.key })
                    }, 30000)
                } catch (e) {
                    console.error('Error generando código:', e)
                    codeSent = false // Permitir reintento si falla
                }
            }

            // Manejar cierre de conexión
            if (connection === 'close') {
                const reason = lastDisconnect?.error?.output?.statusCode

                console.log(chalk.yellow(`🔌 Conexión cerrada: ${userId}, Razón: ${reason}`))

                if (reason === DisconnectReason.badSession || reason === 405 || reason === 401) {
                    console.log(chalk.magenta(`🗑️ Eliminando sesión inválida: ${userId}`))

                    try {
                        if (fs.existsSync(pathAstaJadiBot)) {
                            fs.rmSync(pathAstaJadiBot, { recursive: true, force: true })
                        }
                    } catch (error) {
                        console.error(chalk.red('❌ Error eliminando sesión:', error))
                    }

                    // Limpiar referencias
                    if (sock.user?.jid) {
                        global.activeSubBots?.delete(sock.user.jid)
                    }

                    const index = global.conns?.indexOf(sock)
                    if (index >= 0) {
                        global.conns.splice(index, 1)
                    }
                }
            }

            // ⚡ Conexión exitosa optimizada
            if (connection === 'open') {
                await saveSubBotState()

                // Registrar en listas activas
                if (sock.user?.jid) {
                    global.activeSubBots.set(sock.user.jid, {
                        socket: sock,
                        config: sock.subConfig,
                        createdAt: Date.now(),
                        lastActivity: Date.now()
                    })

                    if (!global.conns.includes(sock)) {
                        global.conns.push(sock)
                    }
                }

                // Actualizar configuración
                if (sock.user && sock.subConfig) {
                    sock.subConfig.name = sock.user.name || sock.subConfig.name
                    sock.subConfig.jid = sock.user.jid
                    sock.subConfig.updatedAt = new Date().toISOString()

                    await fs.promises.writeFile(
                        path.join(pathAstaJadiBot, 'config.json'),
                        JSON.stringify(sock.subConfig, null, 2)
                    )

                    console.log(chalk.bold.green(
                        `\n🎉 SUBBOT CONECTADO EXITOSAMENTE\n` +
                        `├─ Nombre: ${sock.user.name || 'Sin nombre'}\n` +
                        `├─ JID: ${sock.user.jid}\n` +
                        `├─ Dueño: ${m.sender}\n` +
                        `├─ Prefijo: ${sock.subConfig.prefix}\n` +
                        `└─ Sin prefijo: ${sock.subConfig.sinprefix ? '✅' : '❌'}\n`
                    ))

                    // Notificar al usuario
                    if (m?.chat) {
                        await conn.sendMessage(m.chat, { 
                            text: `✅ *SubBot conectado exitosamente!*\n\n` +
                                  `🤖 *Información:*\n` +
                                  `• Nombre: ${sock.user.name || 'SubBot'}\n` +
                                  `• Número: ${sock.user.jid}\n` +
                                  `• Dueño: @${m.sender.split('@')[0]}\n\n` +
                                  `⚙️ *Configuración:*\n` +
                                  `• Prefijo: \`${sock.subConfig.prefix}\`\n` +
                                  `• Sin prefijo: ${sock.subConfig.sinprefix ? '✅' : '❌'}\n` +
                                  `• Modo: ${sock.subConfig.mode}\n\n` +
                                  `📋 *Comandos disponibles:*\n` +
                                  `• *${usedPrefix}config* - Configurar SubBot\n` +
                                  `• *${usedPrefix}infobot* - Ver información\n` +
                                  `• *${usedPrefix}kill ${userId}* - Eliminar SubBot`,
                            mentions: [m.sender]
                        }, { quoted: m })
                    }
                }

                // Unirse a canales automáticamente
                try {
                    if (global.ch) {
                        for (const value of Object.values(global.ch)) {
                            if (typeof value === 'string' && value.endsWith('@newsletter')) {
                                await sock.newsletterFollow(value).catch(() => {})
                            }
                        }
                    }
                } catch (e) {
                    console.error('Error uniéndose a canales:', e)
                }
            }
        }

        sock.ev.on('connection.update', connectionUpdate)

        // ⚡ OPTIMIZACIÓN: Verificación periódica más eficiente
        setInterval(() => {
            if (!sock.user && sock.ws) {
                try { sock.ws.close() } catch {}
                sock.ev.removeAllListeners()

                const index = global.conns?.indexOf(sock)
                if (index >= 0) global.conns.splice(index, 1)
            }
        }, 60000) // Cada 60 segundos en vez de 30

        // ⚡ OPTIMIZACIÓN: Cargar handler de forma asíncrona
        let handlerModule
        try {
            handlerModule = await import('../../handler.js')
        } catch (e) {
            console.error('Error cargando handler:', e)
            return
        }

        let creloadHandler = async function (restartConn) {
            try {
                const Handler = await import(`../../handler.js?update=${Date.now()}`).catch(console.error)
                if (Handler && Object.keys(Handler).length) {
                    handlerModule = Handler
                }
            } catch (e) {
                console.error('Error recargando handler:', e)
            }

            if (restartConn) {
                const oldChats = sock.chats
                try { 
                    if (sock.ws?.readyState !== 3) sock.ws.close()
                } catch {}
                sock.ev.removeAllListeners()
                sock = makeWASocket(connectionOptions, { chats: oldChats })
                isInit = true
            }

            if (!isInit) {
                sock.ev.off("messages.upsert", sock.handler)
                sock.ev.off("connection.update", sock.connectionUpdate)
                sock.ev.off('creds.update', sock.credsUpdate)
            }

            if (handlerModule?.handler) {
                sock.handler = handlerModule.handler.bind(sock)
                sock.connectionUpdate = connectionUpdate.bind(sock)
                sock.credsUpdate = saveCreds.bind(sock, true)

                sock.ev.on("messages.upsert", sock.handler)
                sock.ev.on("connection.update", sock.connectionUpdate)
                sock.ev.on("creds.update", sock.credsUpdate)

                isInit = false
                return true
            }
            return false
        }

        creloadHandler(false)
    } catch (error) {
        console.error(chalk.red('❌ Error en AstaJadiBot:', error))
        
        // Limpiar en caso de error
        try {
            if (fs.existsSync(pathAstaJadiBot)) {
                fs.rmSync(pathAstaJadiBot, { recursive: true, force: true })
            }
        } catch {}
        
        await m.reply('❌ Error al crear el SubBot. Intenta nuevamente.')
    }
}

// ============= FUNCIÓN AUXILIAR OPTIMIZADA =============
function msToTime(duration) {
    const seconds = Math.floor((duration / 1000) % 60)
    const minutes = Math.floor((duration / (1000 * 60)) % 60)
    const hours = Math.floor(duration / (1000 * 60 * 60))

    if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`
    if (minutes > 0) return `${minutes}m ${seconds}s`
    return `${seconds}s`
}
