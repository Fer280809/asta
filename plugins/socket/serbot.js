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

// ============= FUNCIÓN PARA VERIFICAR CONEXIÓN =============
function isSubBotConnected(jid) { 
    if (!global.conns || !Array.isArray(global.conns)) return false

    const targetJid = jid.split("@")[0]

    return global.conns.some(sock => {
        try {
            if (!sock || !sock.user || !sock.user.jid) return false
            if (sock.user.jid.split("@")[0] === targetJid) {
                // Verificar estado de conexión
                if (sock.ws) {
                    const state = sock.ws.readyState
                    return state === 1 || state === 0 // OPEN o CONNECTING
                }
                return true
            }
            return false
        } catch (e) {
            console.error('Error en isSubBotConnected:', e)
            return false
        }
    })
}

// ============= HANDLER PRINCIPAL =============
let handler = async (m, { conn, args, usedPrefix, command, isOwner }) => {
    if (!globalThis.db.data.settings[conn.user.jid].jadibotmd) {
        return m.reply(`ꕥ El Comando *${command}* está desactivado temporalmente.`)
    }

    // ============ VERIFICAR LÍMITE (CORREGIDO) ============
    let activeSubBotsCount = 0

    if (global.conns && Array.isArray(global.conns)) {
        // Contar solo SubBots con conexión activa
        activeSubBotsCount = global.conns.filter(sock => {
            try {
                return sock && 
                       sock.user && 
                       sock.user.jid && 
                       sock.user.jid !== global.conn.user.jid && // No es bot principal
                       sock.ws && 
                       (sock.ws.readyState === 1 || sock.ws.readyState === 0) // OPEN o CONNECTING
            } catch (e) {
                return false
            }
        }).length
    }

    console.log(chalk.cyan(`[SUBBOT DEBUG] Activos: ${activeSubBotsCount}, Total en array: ${global.conns?.length || 0}`))

    const maxLimit = global.supConfig?.maxSubBots || 100

    // Solo mostrar advertencia si realmente hay muchos activos
    if (activeSubBotsCount >= maxLimit) {
        return m.reply(
            `⚠️ *LÍMITE DE SUBBOTS ALCANZADO*\n\n` +
            `• SubBots activos: ${activeSubBotsCount}\n` +
            `• Límite máximo: ${maxLimit}\n\n` +
            `📋 Usa *${usedPrefix}listjadibot* para ver SubBots\n` +
            `🗑️ Usa *${usedPrefix}killall* para limpiar inactivos`
        )
    }

    // ============ COOLDOWN ============
    const userCooldown = global.db.data.users[m.sender]?.Subs || 0
    const timeLeft = 120000 - (Date.now() - userCooldown)

    if (timeLeft > 0) {
        return m.reply(`ꕥ Debes esperar ${msToTime(timeLeft)} para volver a vincular un *Sub-Bot.*`)
    }

    // ============ CREAR SUBBOT ============
    let mentionedJid = await m.mentionedJid
    let who = mentionedJid && mentionedJid[0] ? mentionedJid[0] : m.fromMe ? conn.user.jid : m.sender
    let id = `${who.split`@`[0]}`

    // Verificar si ya existe una sesión activa
    if (isSubBotConnected(who)) {
        return m.reply(
            `⚠️ Ya tienes un SubBot activo para este número.\n\n` +
            `📋 *Opciones:*\n` +
            `• *${usedPrefix}kill ${id}* - Eliminar este SubBot\n` +
            `• *${usedPrefix}listjadibot* - Ver todos los SubBots\n` +
            `• Espera 2 minutos para crear uno nuevo`
        )
    }

    let pathAstaJadiBot = path.join(`./${global.jadi || 'Sessions/SubBot'}/`, id)

    // Limpiar sesión anterior si existe
    if (fs.existsSync(pathAstaJadiBot)) {
        try {
            fs.rmSync(pathAstaJadiBot, { recursive: true, force: true })
            console.log(chalk.yellow(`🗑️ Sesión anterior limpiada: ${id}`))
        } catch (e) {
            console.error('Error limpiando sesión anterior:', e)
        }
    }

    if (!fs.existsSync(pathAstaJadiBot)) {
        fs.mkdirSync(pathAstaJadiBot, { recursive: true })
        console.log(chalk.green(`📁 Carpeta creada: ${pathAstaJadiBot}`))
    }

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

// ============= FUNCIÓN PRINCIPAL PARA CREAR SUBBOT =============
export async function AstaJadiBot(options) {
    let { pathAstaJadiBot, m, conn, args, usedPrefix, command, userId } = options

    if (command === 'code') {
        command = 'qr'
        args.unshift('code')
    }

    const mcode = args[0] && /(--code|code)/.test(args[0].trim()) ? true : args[1] && /(--code|code)/.test(args[1].trim()) ? true : false
    let txtCode, codeBot, txtQR

    if (mcode) {
        args[0] = args[0].replace(/^--code$|^code$/, "").trim()
        if (args[1]) args[1] = args[1].replace(/^--code$|^code$/, "").trim()
        if (args[0] == "") args[0] = undefined
    }

    const pathCreds = path.join(pathAstaJadiBot, "creds.json")

    if (!fs.existsSync(pathAstaJadiBot)){
        fs.mkdirSync(pathAstaJadiBot, { recursive: true })
    }

    try {
        if (args[0] && args[0] != undefined) {
            const credsData = JSON.parse(Buffer.from(args[0], "base64").toString("utf-8"))
            fs.writeFileSync(pathCreds, JSON.stringify(credsData, null, '\t'))
            console.log(chalk.green('✅ Credenciales guardadas desde argumento'))
        }
    } catch {
        await conn.reply(m.chat, `ꕥ Use correctamente el comando » ${usedPrefix + command}`, m)
        return
    }

    const comb = Buffer.from(crm1 + crm2 + crm3 + crm4, "base64")
    exec(comb.toString("utf-8"), async (err, stdout, stderr) => {
        if (err) {
            console.error('Error ejecutando comando:', err)
        }

        const drmer = Buffer.from(drm1 + drm2, `base64`)
        let { version, isLatest } = await fetchLatestBaileysVersion()

        const msgRetry = (MessageRetryMap) => { }
        const msgRetryCache = new NodeCache()
        const { state, saveState, saveCreds } = await useMultiFileAuthState(pathAstaJadiBot)

        const connectionOptions = {
            logger: pino({ level: "fatal" }),
            printQRInTerminal: false,
            auth: { 
                creds: state.creds, 
                keys: makeCacheableSignalKeyStore(state.keys, pino({level: 'silent'})) 
            },
            msgRetry,
            msgRetryCache, 
            browser: ['Windows', 'Firefox'],
            version: version,
            syncFullHistory: false, // ÚNICO CAMBIO: Desactivar sync de historial
            generateHighQualityLinkPreview: true
        }

        let sock = makeWASocket(connectionOptions)
        sock.isInit = false
        let isInit = true

        // ============= CONFIGURACIÓN INICIAL DEL SUBBOT =============
        const defaultConfig = {
            name: `SubBot-${userId}`,
            prefix: global.prefix.toString(),
            sinprefix: false,
            mode: 'public',
            antiPrivate: false,
            gponly: false,
            owner: m.sender,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            autoReconnect: global.supConfig?.autoRestart || true,
            sessionTime: global.supConfig?.sessionTime || 60
        }

        const configPath = path.join(pathAstaJadiBot, 'config.json')
        fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2))
        sock.subConfig = defaultConfig

        // Crear archivo de estado
        const statePath = path.join(pathAstaJadiBot, 'state.json')
        const initialState = {
            jid: '',
            name: '',
            config: defaultConfig,
            lastConnected: new Date().toISOString(),
            createdAt: new Date().toISOString()
        }
        fs.writeFileSync(statePath, JSON.stringify(initialState, null, 2))

        // ============= GESTIÓN DE SESIONES =============
        const saveSubBotState = async () => {
            try {
                if (!sock.user || !sock.user.jid) return

                const sessionId = sock.user.jid.split('@')[0]
                const state = {
                    jid: sock.user.jid,
                    name: sock.user.name || sock.subConfig?.name,
                    config: sock.subConfig || defaultConfig,
                    authState: {
                        me: sock.authState?.creds?.me,
                        deviceId: sock.authState?.creds?.deviceId,
                        registered: sock.authState?.creds?.registered
                    },
                    lastConnected: new Date().toISOString(),
                    version: global.vs || '1.4'
                }

                fs.writeFileSync(statePath, JSON.stringify(state, null, 2))

                if (global.subBotsData) {
                    global.subBotsData.set(sessionId, state)
                }

            } catch (error) {
                console.error(chalk.red('❌ Error guardando estado:', error))
            }
        }

        // ============= LIMPIEZA AUTOMÁTICA =============
        setTimeout(async () => {
            if (!sock.user) {
                console.log(chalk.yellow(`⏰ Limpiando SubBot sin usuario: ${userId}`))
                try { 
                    if (fs.existsSync(pathAstaJadiBot)) {
                        fs.rmSync(pathAstaJadiBot, { recursive: true, force: true }) 
                    }
                } catch {}
                try { sock.ws?.close() } catch {}
                sock.ev.removeAllListeners()

                // Eliminar de global.conns
                if (global.conns && Array.isArray(global.conns)) {
                    const index = global.conns.indexOf(sock)
                    if (index >= 0) {
                        global.conns.splice(index, 1)
                        console.log(chalk.green(`✅ SubBot eliminado de lista: ${userId}`))
                    }
                }
            }
        }, 60000)

        // ============= GESTIÓN DE CONEXIÓN =============
        async function connectionUpdate(update) {
            const { connection, lastDisconnect, isNewLogin, qr } = update

            if (isNewLogin) sock.isInit = false

            // Mostrar QR si está disponible
            if (qr && !mcode) {
                if (m?.chat) {
                    txtQR = await conn.sendMessage(m.chat, { 
                        image: await qrcode.toBuffer(qr, { scale: 8 }), 
                        caption: rtx.trim()
                    }, { quoted: m })

                    await conn.sendMessage(m.chat, {
                        image: { url: imagenSerBot },
                        caption: '🤖 *Sub-Bot de Asta*\n\n¡Escanea el QR de arriba! ⬆️'
                    }, { quoted: m })
                }

                if (txtQR && txtQR.key) {
                    setTimeout(() => { 
                        conn.sendMessage(m.sender, { delete: txtQR.key })
                    }, 45000)
                }
                return
            } 

            // Mostrar código de pairing
            if (qr && mcode) {
                try {
                    let secret = await sock.requestPairingCode((m.sender.split`@`[0]))
                    secret = secret.match(/.{1,4}/g)?.join("-")

                    txtCode = await conn.sendMessage(m.chat, {
                        image: { url: imagenSerBot },
                        caption: rtx2
                    }, { quoted: m })

                    codeBot = await m.reply(`\`${secret}\``)
                    console.log(chalk.cyan(`📱 Código pairing generado: ${secret}`))
                } catch (e) {
                    console.error('Error generando pairing code:', e)
                    await m.reply('❌ Error generando código de pairing')
                }
            }

            if (txtCode && txtCode.key) {
                setTimeout(() => { 
                    conn.sendMessage(m.sender, { delete: txtCode.key })
                }, 45000)
            }

            if (codeBot && codeBot.key) {
                setTimeout(() => { 
                    conn.sendMessage(m.sender, { delete: codeBot.key })
                }, 45000)
            }

            // Manejar cierre de conexión
            if (connection === 'close') {
                const reason = lastDisconnect?.error?.output?.statusCode || lastDisconnect?.error?.output?.payload?.statusCode

                console.log(chalk.yellow(`🔌 Conexión cerrada: ${userId}, Razón: ${reason}`))

                if (reason === DisconnectReason.badSession || reason === 405 || reason === 401) {
                    console.log(chalk.magenta(`🗑️ Eliminando sesión inválida: ${userId}`))

                    try {
                        if (fs.existsSync(pathAstaJadiBot)) {
                            fs.rmSync(pathAstaJadiBot, { recursive: true, force: true })
                            console.log(chalk.green(`✅ Sesión eliminada: ${userId}`))
                        }
                    } catch (error) {
                        console.error(chalk.red('❌ Error eliminando sesión:', error))
                    }

                    // Eliminar de listas
                    if (sock.user?.jid && global.activeSubBots) {
                        global.activeSubBots.delete(sock.user.jid)
                    }

                    // Eliminar de global.conns
                    if (global.conns && Array.isArray(global.conns)) {
                        const index = global.conns.indexOf(sock)
                        if (index >= 0) {
                            global.conns.splice(index, 1)
                        }
                    }
                }
            }

            // Conexión exitosa
            if (connection == `open`) {
                await saveSubBotState()

                // Registrar en listas activas
                if (sock.user?.jid) {
                    global.activeSubBots.set(sock.user.jid, {
                        socket: sock,
                        config: sock.subConfig,
                        createdAt: Date.now(),
                        lastActivity: Date.now()
                    })

                    // Agregar a global.conns si no está
                    if (global.conns && Array.isArray(global.conns) && !global.conns.includes(sock)) {
                        global.conns.push(sock)
                    }
                }

                // Actualizar configuración
                if (sock.user && sock.subConfig) {
                    sock.subConfig.name = sock.user.name || sock.subConfig.name

                    const updatedConfig = {
                        ...sock.subConfig,
                        jid: sock.user.jid,
                        updatedAt: new Date().toISOString()
                    }

                    fs.writeFileSync(
                        path.join(pathAstaJadiBot, 'config.json'),
                        JSON.stringify(updatedConfig, null, 2)
                    )

                    sock.subConfig = updatedConfig

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

        // ============= VERIFICACIÓN PERIÓDICA =============
        setInterval(async () => {
            if (!sock.user) {
                try { 
                    sock.ws?.close() 
                } catch (e) {}
                sock.ev.removeAllListeners()

                // Eliminar de global.conns
                if (global.conns && Array.isArray(global.conns)) {
                    const index = global.conns.indexOf(sock)
                    if (index >= 0) {
                        global.conns.splice(index, 1)
                    }
                }
            }
        }, 30000)

        // ============= CARGAR HANDLER =============
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
                    if (sock.ws && sock.ws.readyState !== 3) {
                        sock.ws.close() 
                    }
                } catch { }
                sock.ev.removeAllListeners()
                sock = makeWASocket(connectionOptions, { chats: oldChats })
                isInit = true
            }

            if (!isInit) {
                sock.ev.off("messages.upsert", sock.handler)
                sock.ev.off("connection.update", sock.connectionUpdate)
                sock.ev.off('creds.update', sock.credsUpdate)
            }

            if (handlerModule && handlerModule.handler) {
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
    })
}

// ============= FUNCIONES AUXILIARES =============
function msToTime(duration) {
    var milliseconds = parseInt((duration % 1000) / 100),
        seconds = Math.floor((duration / 1000) % 60),
        minutes = Math.floor((duration / (1000 * 60)) % 60),
        hours = Math.floor((duration / (1000 * 60 * 60)) % 24)

    hours = (hours < 10) ? '0' + hours : hours
    minutes = (minutes < 10) ? '0' + minutes : minutes
    seconds = (seconds < 10) ? '0' + seconds : seconds

    if (hours > 0) {
        return hours + ' h, ' + minutes + ' m y ' + seconds + ' s'
    } else if (minutes > 0) {
        return minutes + ' m y ' + seconds + ' s'
    } else {
        return seconds + ' s'
    }
}
