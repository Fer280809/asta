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

let vinculando=false

function question(q){
return new Promise(resolve=>{
const rl=readline.createInterface({
input:process.stdin,
output:process.stdout
})
rl.question(q,(a)=>{
rl.close()
resolve(a)
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

const errores=[]

for(const file of archivos){

try{

const mod=await import(file)

const plugin=mod.default

if(!plugin||typeof plugin!=='function'){

errores.push(file)

}

}catch{

errores.push(file)

}

}

if(errores.length){

console.log(`⚠️ ${errores.length} plugins con error`)

}else{

console.log(`✅ Plugins cargados correctamente\n`)

}

}

async function start(){

const {state,saveCreds}=await useMultiFileAuthState('./session')

const {version}=await fetchLatestBaileysVersion()

let usarQR=true
let numero=null

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
vinculando=true

const raw=await question('\nNúmero con código país:\n> ')

numero=limpiarNumero(raw)

console.log(`\nNúmero registrado: ${numero}`)

}

}else{

console.log(`\nReconectando ${global.namebot}...\n`)

}

await verificarPlugins()

const sock=makeWASocket({

logger:Pino({level:'silent'}),

auth:state,

browser:[global.namebot,'Chrome',global.vs],

version,

printQRInTerminal:false

})

if(!sesionExiste&&!usarQR&&numero){

try{

const code=await sock.requestPairingCode(numero)

console.log(`\n╔════════════════════════════════════╗`)
console.log(`║ CÓDIGO DE VINCULACIÓN              ║`)
console.log(`║ ${code}                            ║`)
console.log(`╚════════════════════════════════════╝\n`)

}catch(e){

console.log('Error obteniendo código:',e.message)

}

}

sock.ev.on('connection.update',async(update)=>{

const {connection,qr,lastDisconnect}=update

if(qr&&usarQR&&!sesionExiste){

console.log('\nEscanea el QR:\n')

qrcode.generate(qr,{small:true})

}

if(connection==='open'){

vinculando=false

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

if(vinculando){

console.log('Esperando vinculación...')

return

}

console.log('Reconectando...')

setTimeout(()=>{

start()

},4000)

}

})

sock.ev.on('creds.update',saveCreds)

sock.ev.on('messages.upsert',async m=>{

await handler(sock,m)

})

sock.ev.on('group-participants.update',async update=>{

await onGroupUpdate(sock,update)

})

}

start().catch(console.error)
