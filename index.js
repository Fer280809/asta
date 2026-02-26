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

numero = numero.replace(/[^0-9]/g,'')

if(numero.startsWith('521')){
numero = '52' + numero.slice(3)
}

return numero
}

async function verificarPlugins(){

const pluginsDir=path.join(process.cwd(),'plugins')

let errores=0

if(fs.existsSync(pluginsDir)){

for(const file of fs.readdirSync(pluginsDir)){

if(!file.endsWith('.js')) continue

try{
await import(path.join(pluginsDir,file))
}catch{
errores++
}

}

}

if(errores){

console.log(`⚠️ ${errores} plugins con error`)

}else{

console.log(`✅ Plugins cargados correctamente\n`)

}

}

async function start(){

const {state,saveCreds}=
await useMultiFileAuthState('./session')

const {version}=
await fetchLatestBaileysVersion()

let usarQR=true
let numeroGuardado=null

const sesionExiste =
fs.existsSync('./session/creds.json')

if(!sesionExiste){

console.log(`\n╔══════════════════════════════╗`)
console.log(`║ ${global.namebot} v${global.vs} ║`)
console.log(`╚══════════════════════════════╝\n`)

console.log('1. Vinculación por código')
console.log('2. QR\n')

const opcion =
(await question('Opción (1 o 2): ')).trim()

if(opcion==='1'){

usarQR=false

numeroGuardado=
limpiarNumero(
await question('\nNúmero con código país:\n> ')
)

console.log(`\nNúmero registrado: ${numeroGuardado}`)

}

}

await verificarPlugins()

const sock = makeWASocket({

auth:state,

logger:Pino({level:'silent'}),

browser:[
global.namebot,
'Chrome',
global.vs
],

version,

printQRInTerminal:false

})

sock.ev.on('connection.update',
async({connection,qr,lastDisconnect})=>{

if(qr && usarQR && !sesionExiste){

console.log('\nEscanea QR:\n')

qrcode.generate(qr,{small:true})

}

if(connection==='connecting'){

if(!sesionExiste && !usarQR && numeroGuardado){

try{

const pairing =
await sock.requestPairingCode(numeroGuardado)

const code =
pairing.match(/.{1,4}/g).join('-')

console.log(`\n╔══════════════════════════════╗`)
console.log(`║ CÓDIGO DE VINCULACIÓN        ║`)
console.log(`║ ${code}                      ║`)
console.log(`╚══════════════════════════════╝\n`)

}catch(e){

console.log('Error obteniendo código:',e.message)

}

}

}

if(connection==='open'){

console.log(`\n${global.namebot} conectado\n`)

}

if(connection==='close'){

const reason =
lastDisconnect?.error?.
output?.statusCode

if(reason===DisconnectReason.loggedOut){

console.log('Sesión cerrada')

process.exit(0)

}

console.log('Reconectando...')

setTimeout(start,5000)

}

})

sock.ev.on('creds.update',saveCreds)

sock.ev.on(
'messages.upsert',
async m=>await handler(sock,m)
)

sock.ev.on(
'group-participants.update',
async u=>await onGroupUpdate(sock,u)
)

}

start().catch(console.error)
