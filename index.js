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
return numero.replace(/[^0-9]/g,'')
}

async function verificarPlugins(){

const pluginsDir=path.join(process.cwd(),'plugins')

let errores=0

function buscar(dir){
let archivos=[]
if(!fs.existsSync(dir))return archivos
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

for(const file of buscar(pluginsDir)){
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

let usarQR=true
let numeroGuardado=null
let pairingRequested=false

const sesionExiste=
Boolean(state.creds?.registered)&&
Boolean(state.creds?.me?.id)

if(!sesionExiste){

console.log(`\n╔════════════════════════════════════╗`)
console.log(`║ ${global.namebot} v${global.vs} ║`)
console.log(`╚════════════════════════════════════╝\n`)

console.log('1. Vinculación por código')
console.log('2. QR\n')

const opcion=(await question('Opción (1 o 2): ')).trim()

if(opcion==='1'){

usarQR=false

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

if(
connection==='connecting' &&
!pairingRequested &&
!usarQR &&
numeroGuardado &&
!state.creds.registered
){

pairingRequested=true

try{

const pairing=
await sock.requestPairingCode(numeroGuardado)

const code=
pairing?.match(/.{1,4}/g)?.join('-') || pairing

console.log(`\n╔════════════════════════════════════╗`)
console.log(`║ CÓDIGO DE VINCULACIÓN              ║`)
console.log(`║ ${code}                            ║`)
console.log(`╚════════════════════════════════════╝\n`)

}catch(e){
console.log('Error obteniendo código:',e.message)
}

}

if(connection==='open'){

console.log(`\n${global.namebot} conectado\n`)

try{
const botId=
sock.user?.id?.replace(/:.*@/,'@')||''
if(botId){
await sock.sendMessage(botId,{
text:`🤖 ${global.namebot} en línea\n${new Date().toLocaleString()}`
})
}
}catch{}

}

if(connection==='close'){

const reason=
lastDisconnect?.error?.output?.statusCode

if(reason===DisconnectReason.loggedOut){
console.log('Sesión cerrada')
process.exit(0)
}

console.log('Reconectando...')
setTimeout(start,5000)

}

})

sock.ev.on('creds.update',saveCreds)

sock.ev.on('messages.upsert',
async m=>await handler(sock,m)
)

sock.ev.on(
'group-participants.update',
async u=>await onGroupUpdate(sock,u)
)

}

start().catch(console.error)
 
