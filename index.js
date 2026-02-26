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

return n.replace(/\D/g,'')

}

async function verificarPlugins(){

const dir=path.join(process.cwd(),'plugins')

if(!fs.existsSync(dir)) return

for(const f of fs.readdirSync(dir)){

if(!f.endsWith('.js')) continue

try{

await import(path.join(dir,f))

}catch{}

}

console.log('✅ Plugins cargados correctamente\n')

}

async function start(){

const {state,saveCreds}=
await useMultiFileAuthState('./session')

const {version}=
await fetchLatestBaileysVersion()

let usarQR=true
let numero=null
let pairingPedido=false

const sesionExiste=
fs.existsSync('./session/creds.json')

if(!sesionExiste){

console.log(`\n${global.namebot} v${global.vs}\n`)

console.log('1 Código')
console.log('2 QR\n')

const op=(await ask('Opción: ')).trim()

if(op==='1'){

usarQR=false

numero=
limpiarNumero(
await ask('Número con código país:\n> ')
)

}

}

await verificarPlugins()

const sock=makeWASocket({

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

if(
connection==='connecting'
&& !usarQR
&& numero
&& !pairingPedido
&& !state.creds.registered
){

pairingPedido=true

try{

await new Promise(r=>setTimeout(r,7000))

const pairing=
await sock.requestPairingCode(numero)

const code=
pairing.match(/.{1,4}/g).join('-')

console.log(`\n══════ CÓDIGO ══════`)

console.log(code)

console.log(`════════════════════\n`)

}catch(e){

console.log('Error obteniendo código:',e.message)

}

}

if(connection==='open'){

console.log(`\n${global.namebot} conectado\n`)

}

if(connection==='close'){

const reason=
lastDisconnect?.error?.
output?.statusCode

if(reason===DisconnectReason.loggedOut){

console.log('Sesión cerrada')

process.exit()

}

console.log('Reconectando...')

setTimeout(start,4000)

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
