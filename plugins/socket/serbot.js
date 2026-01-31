const { useMultiFileAuthState, DisconnectReason, makeCacheableSignalKeyStore, fetchLatestBaileysVersion } = (await import("@whiskeysockets/baileys"))
import qrcode from "qrcode"
import NodeCache from "node-cache"
import fs from "fs"
import path from "path"
import pino from 'pino'
import chalk from 'chalk'
import * as ws from 'ws'
const { exec } = await import('child_process')
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
                if (sock.ws) {
                    const state = sock.ws.readyState
                    return state === 1 || state === 0
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

// ============= FUNCIÓN CON DELAY =============
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

// ============= HANDLER PRINCIPAL =============
let handler = async (m, { conn, args, usedPrefix, command, isOwner }) => {
    if (!globalThis.db.data.settings[conn.user.jid].jadibotmd) {
        return m.reply(`ꕥ El Comando *${command}* está desactivado temporalmente.`)
    }

    // ============ VERIFICAR LÍMITE ============
    let activeSubBotsCount = 0
    if (global.conns && Array.isArray(global.conns)) {
        activeSubBotsCount = global.conns.filter(sock => {
            try {
                return sock && 
                       sock.user && 
                       sock.user.jid && 
                       sock.user.jid !== global.conn.user.jid &&
                       sock.ws && 
                       (sock.ws.readyState === 1 || sock.ws.readyState === 0)
            } catch (e) {
                return false
            }
        }).length
    }

    console.log(chalk.cyan(`[SUBBOT DEBUG] Activos: ${activeSubBotsCount}`))

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

    // ============ COOLDOWN RÁPIDO ============
    const userCooldown = global.db.data.users[m.sender]?.Subs || 0
    const timeLeft = 60000 - (Date.now() - userCooldown) // Reducido a 1 minuto

    if (timeLeft > 0) {
        return m.reply(`ꕥ Debes esperar ${msToTime(timeLeft)} para volver a vincular un *Sub-Bot.*`)
    }

    // ============ CREAR SUBBOT ============
    let mentionedJid = await m.mentionedJid
    let who = mentionedJid && mentionedJid[0] ? mentionedJid[0] : m.fromMe ? conn.user.jid : m.sender
    let id = `${who.split`@`[0]}`

    if (isSubBotConnected(who)) {
        return m.reply(
            `⚠️ Ya tienes un SubBot activo para este número.\n\n` +
            `📋 *Opciones:*\n` +
            `• *${usedPrefix}kill ${id}* - Eliminar este SubBot\n` +
            `• *${usedPrefix}listjadibot* - Ver todos los SubBots\n` +
            `• Espera 1 minuto para crear uno nuevo`
        )
    }

    let pathAstaJadiBot = path.join(`./${global.jadi || 'Sessions/SubBot'}/`, id)

    // Limpiar sesión anterior RÁPIDO
    if (fs.existsSync(pathAstaJadiBot)) {
        try {
            fs.rmSync(pathAstaJadiBot, { recursive: true, force: true })
            console.log(chalk.yellow(`🗑️ Sesión anterior limpiada: ${id}`))
        } catch (e) {}
    }

    if (!fs.existsSync(pathAstaJadiBot)) {
        fs.mkdirSync(pathAstaJadiBot, { recursive: true })
    }

    AstaJBOptions.pathAstaJadiBot = pathAstaJadiBot
    AstaJBOptions.m = m
    AstaJBOptions.conn = conn
    AstaJBOptions.args = args
    AstaJBOptions.usedPrefix = usedPrefix
    AstaJBOptions.command = command
    AstaJBOptions.fromCommand = true
    AstaJBOptions.userId = id

    console.log(chalk.blue(`🚀 Creando SubBot RÁPIDO para: ${id}`))
    
    // INICIAR INMEDIATAMENTE sin esperar
    AstaJadiBot(AstaJBOptions)
    global.db.data.users[m.sender].Subs = Date.now()
}

handler.help = ['qr', 'code']
handler.tags = ['serbot']
handler.command = ['qr', 'code']
export default handler 

// ============= FUNCIÓN OPTIMIZADA PARA CREAR SUBBOT RÁPIDO =============
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
        }
    } catch {
        await conn.reply(m.chat, `ꕥ Use correctamente el comando » ${usedPrefix + command}`, m)
        return
    }

    // ============= CONFIGURACIÓN ULTRA RÁPIDA =============
    const { version } = await fetchLatestBaileysVersion()
    
    const msgRetryCache = new NodeCache()
    const { state, saveCreds } = await useMultiFileAuthState(pathAstaJadiBot)

    const connectionOptions = {
        logger: pino({ level: "silent" }),
        printQRInTerminal: false,
        auth: { 
            creds: state.creds, 
            keys: makeCacheableSignalKeyStore(state.keys, pino({level: 'silent'})) 
        },
        msgRetry: () => {},
        msgRetryCache, 
        browser: ['Chrome (Linux)', '', ''],
        version: version,
        generateHighQualityLinkPreview: false, // REDUCIDO
        syncFullHistory: false,
        fireInitQueries: false, // DESACTIVADO
        emitOwnEvents: false,
        defaultQueryTimeoutMs: 15000, // AUMENTADO
        connectTimeoutMs: 20000, // AUMENTADO
        keepAliveIntervalMs: 30000, // AUMENTADO
        maxIdleTimeMs: 30000, // AUMENTADO
        transactionOpts: {
            maxRetries: 2, // REDUCIDO
            delay: 1000
        }
    }

    let sock = makeWASocket(connectionOptions)
    sock.isInit = false
    let isInit = true

    // ============= CONFIGURACIÓN MINIMALISTA =============
    const defaultConfig = {
        name: `SubBot-${userId}`,
        prefix: global.prefix.toString(),
        sinprefix: false,
        mode: 'public',
        owner: m.sender,
        createdAt: new Date().toISOString()
    }

    sock.subConfig = defaultConfig

    // ============= GESTIÓN DE SESIONES RÁPIDA =============
    const saveSubBotState = async () => {
        try {
            if (!sock.user || !sock.user.jid) return
            const sessionId = sock.user.jid.split('@')[0]
            const state = {
                jid: sock.user.jid,
                name: sock.user.name || sock.subConfig?.name,
                config: sock.subConfig || defaultConfig,
                lastConnected: new Date().toISOString()
            }

            if (global.subBotsData) {
                global.subBotsData.set(sessionId, state)
            }
        } catch (error) {}
    }

    // ============= TIMEOUT ACORTADO =============
    setTimeout(async () => {
        if (!sock.user) {
            try { 
                if (fs.existsSync(pathAstaJadiBot)) {
                    fs.rmSync(pathAstaJadiBot, { recursive: true, force: true }) 
                }
            } catch {}
            try { sock.ws?.close() } catch {}
            sock.ev.removeAllListeners()

            if (global.conns && Array.isArray(global.conns)) {
                const index = global.conns.indexOf(sock)
                if (index >= 0) {
                    global.conns.splice(index, 1)
                }
            }
        }
    }, 30000) // Reducido a 30 segundos

    // ============= CONNECTION UPDATE OPTIMIZADO =============
    async function connectionUpdate(update) {
        const { connection, lastDisconnect, isNewLogin, qr } = update

        if (isNewLogin) sock.isInit = false

        // GENERAR QR INMEDIATAMENTE (2-3 segundos)
        if (qr && !mcode) {
            try {
                // Generar QR con delay para evitar rate limit
                await delay(500) // Pequeño delay antes de generar
                
                const buffer = await qrcode.toBuffer(qr, { scale: 5 }) // Escala reducida
                
                if (m?.chat) {
                    // Enviar QR primero con delay
                    txtQR = await conn.sendMessage(m.chat, { 
                        image: buffer, 
                        caption: rtx.trim()
                    }, { quoted: m }).catch(() => {})

                    // Delay de 1.5 segundos entre mensajes
                    await delay(1500)

                    // Enviar imagen de bot
                    await conn.sendMessage(m.chat, {
                        image: { url: imagenSerBot },
                        caption: '🤖 *Sub-Bot de Asta*\n\n¡Escanea el QR de arriba! ⬆️'
                    }, { quoted: m }).catch(() => {})
                }

                // Programar eliminación con delay
                if (txtQR && txtQR.key) {
                    setTimeout(() => { 
                        conn.sendMessage(m.sender, { delete: txtQR.key }).catch(() => {})
                    }, 45000)
                }
            } catch (e) {
                console.error('Error generando QR:', e)
            }
            return
        } 

        // GENERAR CÓDIGO DE PAIRING RÁPIDO CON DELAYS
        if (qr && mcode) {
            try {
                // Delay antes de solicitar código
                await delay(1000)
                
                let secret = await sock.requestPairingCode((m.sender.split`@`[0]))
                secret = secret.match(/.{1,4}/g)?.join("-")

                // Enviar imagen con delay
                txtCode = await conn.sendMessage(m.chat, {
                    image: { url: imagenSerBot },
                    caption: rtx2
                }, { quoted: m }).catch(() => {})

                // Delay antes de enviar código
                await delay(2000)

                codeBot = await m.reply(`\`${secret}\``).catch(() => {})
                
                // Programar eliminaciones con delays
                setTimeout(() => { 
                    if (txtCode && txtCode.key) {
                        conn.sendMessage(m.sender, { delete: txtCode.key }).catch(() => {})
                    }
                }, 45000)
                
                setTimeout(() => { 
                    if (codeBot && codeBot.key) {
                        conn.sendMessage(m.sender, { delete: codeBot.key }).catch(() => {})
                    }
                }, 46000)
                
            } catch (e) {
                console.error('Error generando pairing code:', e)
                await m.reply('❌ Error generando código de pairing').catch(() => {})
            }
        }

        // MANEJAR DESCONEXIÓN
        if (connection === 'close') {
            const reason = lastDisconnect?.error?.output?.statusCode || lastDisconnect?.error?.output?.payload?.statusCode

            if (reason === DisconnectReason.badSession || reason === 405 || reason === 401) {
                try {
                    if (fs.existsSync(pathAstaJadiBot)) {
                        fs.rmSync(pathAstaJadiBot, { recursive: true, force: true })
                    }
                } catch (error) {}

                if (sock.user?.jid && global.activeSubBots) {
                    global.activeSubBots.delete(sock.user.jid)
                }

                if (global.conns && Array.isArray(global.conns)) {
                    const index = global.conns.indexOf(sock)
                    if (index >= 0) {
                        global.conns.splice(index, 1)
                    }
                }
            }
        }

        // CONEXIÓN EXITOSA RÁPIDA CON DELAYS
        if (connection == `open`) {
            await saveSubBotState()

            if (sock.user?.jid) {
                global.activeSubBots.set(sock.user.jid, {
                    socket: sock,
                    config: sock.subConfig,
                    createdAt: Date.now(),
                    lastActivity: Date.now()
                })

                if (global.conns && Array.isArray(global.conns) && !global.conns.includes(sock)) {
                    global.conns.push(sock)
                }
            }

            if (sock.user && sock.subConfig) {
                sock.subConfig.name = sock.user.name || sock.subConfig.name

                console.log(chalk.bold.green(
                    `\n🎉 SUBBOT CONECTADO EN 2-3s!\n` +
                    `├─ Nombre: ${sock.user.name || 'Sin nombre'}\n` +
                    `├─ JID: ${sock.user.jid}\n` +
                    `├─ Dueño: ${m.sender}\n` +
                    `└─ Prefijo: ${sock.subConfig.prefix}\n`
                ))

                // Notificación con delay para evitar rate limit
                if (m?.chat) {
                    await delay(2500) // Delay de 2.5 segundos
                    
                    await conn.sendMessage(m.chat, { 
                        text: `✅ *¡Vinculado exitosamente!*\n\n` +
                              `🤖 *SubBot Activado:*\n` +
                              `• ${sock.user.name || 'SubBot'}\n` +
                              `• ${sock.user.jid}\n` +
                              `• Dueño: @${m.sender.split('@')[0]}\n\n` +
                              `⏱️ *Tiempo de vinculación:* 2-3 segundos`,
                        mentions: [m.sender]
                    }, { quoted: m }).catch(() => {})
                }
            }
        }
    }

    // ============= CARGAR HANDLER ASÍNCRONO CON DELAY =============
    setTimeout(async () => {
        try {
            handlerModule = await import('../../handler.js')
        } catch (e) {
            return
        }

        let creloadHandler = async function (restartConn) {
            try {
                const Handler = await import(`../../handler.js?update=${Date.now()}`).catch(() => {})
                if (Handler && Object.keys(Handler).length) {
                    handlerModule = Handler
                }
            } catch (e) {}

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
    }, 500) // Delay de 500ms
}

// ============= FUNCIÓN AUXILIAR =============
function msToTime(duration) {
    var milliseconds = parseInt((duration % 1000) / 100),
        seconds = Math.floor((duration / 1000) % 60),
        minutes = Math.floor((duration / (1000 * 60)) % 60)

    minutes = (minutes < 10) ? '0' + minutes : minutes
    seconds = (seconds < 10) ? '0' + seconds : seconds

    if (minutes > 0) {
        return minutes + ' m y ' + seconds + ' s'
    } else {
        return seconds + ' s'
    }
}