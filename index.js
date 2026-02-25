import './setting.js'
import makeWASocket,{
useMultiFileAuthState,
fetchLatestBaileysVersion,
DisconnectReason
} from '@whiskeysockets/baileys'
import Pino from 'pino'
import qrcode from 'qrcode-terminal'
import readline from 'readline'
import { handler } from './lib/handler.js'
import { onGroupUpdate } from './plugins/eventos/group-events.js'
import fs from 'fs'
import path from 'path'

let pedirCode=false
let numeroGuardado=null
let usarQR=true

function question(q){

return new Promise(resolve=>{

const rl=readline.createInterface({

input:process.stdin,
output:process.stdout

})

rl.question(q,(answer)=>{

rl.close()
resolve(answer)

})

})

}

function limpiarNumero(numero){

let limpio=numero.replace(/[^0-9]/g,'')

if(limpio.startsWith('521')){

limpio='52'+limpio.slice(3)

}

return limpio

}

async function verificarPlugins(){

const pluginsDir=path.join(process.cwd(),'plugins')

let errores=0

function buscar(dir){

let archivos=[]

if(!fs.existsSync(dir)) return archivos

for(const item of fs.readdirSync(dir)){

const full=path.join(dir,item)

if(fs.statSync(full).isDirectory()){

archivos=archivos.concat(buscar(full))

}else if(item.endsWith('.js')){

archivos.push(full)

}

}

return archivos

}

const archivos=buscar(pluginsDir)

for(const file of archivos){

try{

await import(file)

}catch{

errores++

}

}

if(errores){

console.log(`⚠️ ${errores} plugins con error`)

}else{

console.log(`✅ Plugins cargados correctamente\n`)

}

}

async function start(){

const {state,saveCreds}=await useMultiFileAuthState('./session')

const {version}=await fetchLatestBaileysVersion()

const sesionExiste=state.creds.registered||state.creds.me?.id

if(!sesionExiste){

console.log(`\n╔════════════════════════════════════╗`)
console.log(`║ ${global.namebot} v${global.vs} ║`)
console.log(`╚════════════════════════════════════╝\n`)

console.log('1. Vinculación por código')
console.log('2. QR\n')

const opcion=(await question('Opción (1 o 2): ')).trim()

if(opcion==='1'){

usarQR=false
pedirCode=true

numeroGuardado=limpiarNumero(
await question('\nNúmero con código país:\n> ')
)

console.log(`\nNúmero registrado: ${numeroGuardado}`)

}

}else{

console.log(`\nReconectando ${global.namebot}...\n`)

}

await verificarPlugins()

const sock=makeWASocket({

auth:state,
logger:Pino({level:'silent'}),
browser:[global.namebot,'Chrome',global.vs],
version,
printQRInTerminal:false

})

sock.ev.on('connection.update',async(update)=>{

const {connection,qr,lastDisconnect}=update

if(qr&&usarQR&&!sesionExiste){

console.log('\nEscanea el QR:\n')

qrcode.generate(qr,{small:true})

}

if(pedirCode&&numeroGuardado){

try{

const code=await sock.requestPairingCode(numeroGuardado)

console.log(`\n╔════════════════════════════════════╗`)
console.log(`║ CÓDIGO DE VINCULACIÓN              ║`)
console.log(`║ ${code}                            ║`)
console.log(`╚════════════════════════════════════╝\n`)

pedirCode=false
numeroGuardado=null

}catch(e){

console.log('Error obteniendo código:',e.message)

}

}

if(connection==='open'){

console.log(`\n${global.namebot} conectado\n`)

try{

const botId=sock.user?.id?.replace(/:.*@/,'@')||''

if(botId){

await sock.sendMessage(botId,{

text:`🤖 ${global.namebot} en línea\n${new Date().toLocaleString()}`

})

}

}catch{}

}

if(connection==='close'){

const reason=lastDisconnect?.error?.output?.statusCode

if(reason===DisconnectReason.loggedOut){

console.log('Sesión cerrada')

process.exit(0)

}

console.log('Reconectando...')

setTimeout(start,5000)

}

})

sock.ev.on('creds.update',saveCreds)

sock.ev.on('messages.upsert',async m=>await handler(sock,m))

sock.ev.on('group-participants.update',async update=>{

await onGroupUpdate(sock,update)

})

}

start().catch(console.error)
