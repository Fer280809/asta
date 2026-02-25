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

let pedirCode=false
let numeroPair=null
let usarQR=true

function ask(q){

return new Promise(r=>{

const rl=readline.createInterface({
input:process.stdin,
output:process.stdout
})

rl.question(q,a=>{

rl.close()
r(a)

})

})

}

function limpiarNumero(n){

let num=n.replace(/[^0-9]/g,'')

if(num.startsWith('521')){

num='52'+num.slice(3)

}

return num

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

const op=(await ask('Opción (1 o 2): ')).trim()

if(op==='1'){

usarQR=false
pedirCode=true

numeroPair=limpiarNumero(
await ask('\nNúmero con código país:\n> ')
)

console.log(`\nNúmero registrado: ${numeroPair}`)

}

}

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

console.log('\nEscanea QR:\n')

qrcode.generate(qr,{small:true})

}

if(pedirCode&&numeroPair){

try{

const code=await sock.requestPairingCode(numeroPair)

console.log(`\n╔════════════════════════════════════╗`)
console.log(`║ CÓDIGO DE VINCULACIÓN              ║`)
console.log(`║ ${code}                            ║`)
console.log(`╚════════════════════════════════════╝\n`)

pedirCode=false
numeroPair=null

}catch(e){

console.log('Error obteniendo código:',e.message)

}

}

if(connection==='open'){

console.log(`\n${global.namebot} conectado\n`)

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

sock.ev.on('messages.upsert',async m=>{

await handler(sock,m)

})

sock.ev.on('group-participants.update',async u=>{

await onGroupUpdate(sock,u)

})

}

start().catch(console.error)
