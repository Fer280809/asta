import fs from 'fs'
import path from 'path'
import fetch from 'node-fetch'
import { fileURLToPath } from 'url'
import chalk from 'chalk'
import NodeCache from 'node-cache'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

global.botLogoCache = null

const erroresRuntimeFile = path.join(process.cwd(), 'data', 'errores-runtime.json')
const groupCache = new NodeCache({ stdTTL: 25 })
const pluginsCache = new Map()

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
    'conversation','imageMessage','videoMessage','audioMessage',
    'stickerMessage','documentMessage','extendedTextMessage',
    'reactionMessage','locationMessage','contactMessage',
    'pollCreationMessage','buttonsResponseMessage',
    'listResponseMessage','templateButtonReplyMessage',
    'interactiveResponseMessage'
  ]
  for (const tipo of tipos) {
    if (msg.message?.[tipo]) return tipo
  }
  return null
}

function cargarPlugins(dir) {
  let archivos = []
  if (!fs.existsSync(dir)) return archivos
  for (const item of fs.readdirSync(dir)) {
    const full = path.join(dir, item)
    const stat = fs.statSync(full)
    if (stat.isDirectory()) {
      archivos = archivos.concat(cargarPlugins(full))
    } else if (item.endsWith('.js') && !item.startsWith('_')) {
      archivos.push(full)
    }
  }
  return archivos
}

function checkOwner(sender) {
  try {
    const senderNum = normalize(sender)
    const owners = Array.isArray(global.owner) ? global.owner : []
    const ownerNums = owners.map(e => normalize(Array.isArray(e) ? e[0] : String(e)))
    return ownerNums.includes(senderNum)
  } catch {
    return false
  }
}

async function getAdminInfo(conn, groupJid, senderJid) {
  try {
    let metadata = groupCache.get(groupJid)
    if (!metadata) {
      metadata = await conn.groupMetadata(groupJid)
      groupCache.set(groupJid, metadata)
    }

    const participants = metadata.participants || []
    const senderNum = normalize(senderJid)

    const botJid = conn.user?.id || conn.user?.jid || ''
    const botNum = normalize(botJid)

    const botP = participants.find(p => normalize(p.id) === botNum)
    const userP = participants.find(p => normalize(p.id) === senderNum)

    const isAdmin = userP?.admin === 'admin' || userP?.admin === 'superadmin'
    const isBotAdmin = botP?.admin === 'admin' || botP?.admin === 'superadmin'

    return { isAdmin, isBotAdmin, participants, metadata }
  } catch {
    return { isAdmin:false,isBotAdmin:false,participants:[],metadata:null }
  }
}

async function dfail(tipo,m,conn,cmd='') {

  const mensajes = {
    owner:'👑 Solo owners.',
    group:'👥 Solo grupos.',
    private:'👤 Solo privado.',
    admin:'🛡️ Necesitas admin.',
    botAdmin:'🤖 Necesito admin.',
    premium:'⭐ Premium.',
    invalid:`❌ El comando ${cmd} no existe.`
  }

  let mensaje = mensajes[tipo] || '🚫 Sin permiso.'

  const chatId = m.chat

  let logoBuffer = global.botLogoCache

  if (!logoBuffer && global.icono) {
    try {
      const res = await fetch(global.icono)
      logoBuffer = Buffer.from(await res.arrayBuffer())
      global.botLogoCache = logoBuffer
    } catch {}
  }

  try {
    await conn.sendMessage(chatId,{
      text:mensaje,
      contextInfo:{
        externalAdReply:{
          title:global.namebot || 'Bot',
          body:'Canal Oficial',
          thumbnail:logoBuffer,
          mediaType:1,
          renderLargerThumbnail:false,
          showAdAttribution:false,
          sourceUrl:global.channel
        }
      }
    })
  } catch {
    await conn.sendMessage(chatId,{text:mensaje})
  }
}

export async function handler(conn,chat){

try{

if(!conn || !chat) return

if(!conn.processedMessages) conn.processedMessages=new Set()

const messageId=chat.messages?.[0]?.key?.id
if(!messageId) return

if(conn.processedMessages.has(messageId)) return

conn.processedMessages.add(messageId)

setTimeout(()=>{
conn.processedMessages.delete(messageId)
},5000)

const m=chat.messages[0]

if(!m?.message) return

if(m.message?.ephemeralMessage){
m.message=m.message.ephemeralMessage.message
}

if(m.message?.viewOnceMessage){
m.message=m.message.viewOnceMessage.message
}

if(m.key?.remoteJid==='status@broadcast') return

const tipo=getTipoMensaje(m)
if(!tipo) return

const from=m.key.remoteJid
const sender=m.key.participant || from

const isGroup=from.endsWith('@g.us')

const fromMe=m.key?.fromMe || false

const usedPrefix=global.prefix || '.'

let text=
m.message?.conversation ||
m.message?.extendedTextMessage?.text ||
m.message?.imageMessage?.caption ||
m.message?.videoMessage?.caption ||
m.message?.documentMessage?.caption ||
''

if(!text.startsWith(usedPrefix)) return

const args=text.slice(usedPrefix.length).trim().split(/\s+/)

const command=args.shift()?.toLowerCase()

if(!command) return

const isOwner=checkOwner(sender)

if(!global.modoPublico && !isOwner && !fromMe) return

if(!isGroup && global.antiPrivado && !isOwner) return

let isAdmin=false
let isBotAdmin=false
let groupMetadata=null
let participants=[]

if(isGroup){

const info=await getAdminInfo(conn,from,sender)

isAdmin=info.isAdmin
isBotAdmin=info.isBotAdmin
groupMetadata=info.metadata
participants=info.participants

}

m.chat=from
m.sender=sender
m.isGroup=isGroup
m.isAdmin=isAdmin
m.isBotAdmin=isBotAdmin
m.isOwner=isOwner
m.text=text

const pluginsDir=path.join(process.cwd(),'plugins')

const archivos=cargarPlugins(pluginsDir)

let found=false

for(const filePath of archivos){

try{

let plugin

if(pluginsCache.has(filePath)){
plugin=pluginsCache.get(filePath)
}else{
const module=await import(global.debug?`${filePath}?${Date.now()}`:filePath)
plugin=module.default || module
pluginsCache.set(filePath,plugin)
}

if(!plugin?.command) continue

const cmds=[
...(Array.isArray(plugin.command)?plugin.command:[plugin.command]),
...(Array.isArray(plugin.aliases)?plugin.aliases:[])
].map(c=>c.toLowerCase())

if(!cmds.includes(command)) continue

found=true

if(plugin.owner && !isOwner){await dfail('owner',m,conn);return}
if(plugin.group && !isGroup){await dfail('group',m,conn);return}
if(plugin.private && isGroup){await dfail('private',m,conn);return}
if(plugin.admin && !isAdmin){await dfail('admin',m,conn);return}
if(plugin.botAdmin && !isBotAdmin){await dfail('botAdmin',m,conn);return}
if(plugin.premium && !isOwner){await dfail('premium',m,conn);return}

try{

await plugin(m,{
conn,
args,
usedPrefix,
command,
isOwner,
isGroup,
isAdmin,
isBotAdmin,
groupMetadata,
participants,
text:args.join(' ')
})

}catch(err){

registrarError(filePath,command,sender,err)

await conn.sendMessage(from,{
text:global.msj?.error || '❌ Error.'
})

}

return

}catch(e){}

}

if(!found){

await dfail('invalid',m,conn,command)

}

}catch(e){

console.log(chalk.red('ERROR HANDLER'),e.message)

}

}
