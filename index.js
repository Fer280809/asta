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

let filtroActivo=false

const _stdoutWrite=process.stdout.write.bind(process.stdout)
const _stderrWrite=process.stderr.write.bind(process.stderr)

const iniciosFiltro=[
'Closing session:',
'Closing open session',
'Decrypted message with closed session',
'registrationId:',
'currentRatchet:',
'indexInfo:',
'pendingPreKey:'
]

const filtrosLinea=[
'prekey bundle',
'SessionEntry',
'signedKeyId',
'preKeyId'
]

let bufOut=''
let bufErr=''

const estadoOut={activo:false,depth:0}
const estadoErr={activo:false,depth:0}

function procesarChunk(buf,writeFn,estado){

const lineas=buf.split('\n')
const ultimo=lineas.pop()

for(const linea of lineas){

if(iniciosFiltro.some(f=>linea.includes(f))){
estado.activo=true
estado.depth=0
continue
}

if(estado.activo){

const abre=(linea.match(/{/g)||[]).length
const cierra=(linea.match(/}/g)||[]).length

estado.depth+=abre-cierra

if(estado.depth<=0&&cierra>0){

estado.activo=false
estado.depth=0

}

continue

}

if(filtrosLinea.some(f=>linea.includes(f)))continue

writeFn(linea+'\n')

}

return ultimo

}

function activarFiltro(){

filtroActivo=true

process.stdout.write=(chunk)=>{

bufOut+=chunk.toString()

if(bufOut.includes('\n')){

bufOut=procesarChunk(bufOut,_stdoutWrite,estadoOut)

}

return true

}

process.stderr.write=(chunk)=>{

bufErr+=chunk.toString()

if(bufErr.includes('\n')){

bufErr=procesarChunk(bufErr,_stderrWrite,estadoErr)

}

return true

}

}

async function verificarPlugins(){

const pluginsDir=path.join(process.cwd(),'plugins')

const errores=[]

function buscarArchivos(dir){

let archivos=[]

if(!fs.existsSync(dir))return archivos

for(const item of fs.readdirSync(dir)){

const fullPath=path.join(dir,item)

if(fs.statSync(fullPath).isDirectory()){

archivos=archivos.concat(buscarArchivos(fullPath))

}else if(item.endsWith('.js')){

archivos.push(fullPath)

}

}

return archivos

}

const archivos=buscarArchivos(pluginsDir)

for(const filePath of archivos){

try{

const mod=await import(filePath)

if(!mod.default)continue

const plugin=mod.default

if(typeof plugin!=='function'){

errores.push({

archivo:path.relative(pluginsDir,filePath),

error:'export default no es función'

})

continue

}

if(!plugin.command){

errores.push({

archivo:path.relative(pluginsDir,filePath),

error:'Sin handler.command'

})

}

}catch(err){

errores.push({

archivo:path.relative(pluginsDir,filePath),

error:err.message

})

}

}

const dataDir=path.join(process.cwd(),'data')

fs.mkdirSync(dataDir,{recursive:true})

fs.writeFileSync(

path.join(dataDir,'errores-inicio.json'),

JSON.stringify(errores,null,2)

)

if(errores.length){

console.log(`\n⚠️ ${errores.length} plugin(s) con problema:`)

for(const e of errores){

console.log(`❌ ${e.archivo}: ${e.error}`)

}

}else{

console.log(`✅ Plugins cargados correctamente\n`)

}

}

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

return numero.replace(/[^0-9]/g,'')

}

async function start(){

const {state,saveCreds}=await useMultiFileAuthState('./session')

const {version}=await fetchLatestBaileysVersion()

let usarQR=true
let numeroGuardado=null

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

const raw=await question('\nNúmero con código país:\n> ')

numeroGuardado=limpiarNumero(raw)

console.log(`\nNúmero registrado: ${numeroGuardado}`)

}

}else{

console.log(`\nReconectando ${global.namebot}...\n`)

}

activarFiltro()

await verificarPlugins()

const logger=Pino({level:'silent'})

const sock=makeWASocket({

logger,

auth:state,

browser:[global.namebot,'Chrome',global.vs],

version,

printQRInTerminal:false

})

if(!sesionExiste&&!usarQR&&numeroGuardado){

try{

await new Promise(r=>setTimeout(r,3000))

const code=await sock.requestPairingCode(numeroGuardado)

console.log(`\n╔════════════════════════════════════╗`)
console.log(`║ CÓDIGO DE VINCULACIÓN              ║`)
console.log(`║ ${code}                            ║`)
console.log(`╚════════════════════════════════════╝\n`)

}catch(err){

console.log('Error obteniendo código:',err.message)

}

}

sock.ev.on('connection.update',async(update)=>{

const {connection,qr,lastDisconnect}=update

if(qr&&usarQR&&!sesionExiste){

console.log('\nEscanea el QR:\n')

qrcode.generate(qr,{small:true})

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

if(reason!==DisconnectReason.loggedOut){

console.log('Reconectando...')

start()

}else{

console.log('Sesión cerrada')

process.exit(0)

}

}

})

sock.ev.on('creds.update',saveCreds)

sock.ev.on('messages.upsert',async m=>await handler(sock,m))

sock.ev.on('group-participants.update',async update=>{

await onGroupUpdate(sock,update)

})

}

start().catch(console.error)
