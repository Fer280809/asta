import makeWASocket,{
useMultiFileAuthState,
fetchLatestBaileysVersion,
makeCacheableSignalKeyStore
} from '@whiskeysockets/baileys'

import Pino from 'pino'
import readline from 'readline'
import qrcode from 'qrcode-terminal'
import pkg from 'google-libphonenumber'

const {PhoneNumberUtil}=pkg
const phoneUtil=PhoneNumberUtil.getInstance()

const rl=readline.createInterface({

input:process.stdin,
output:process.stdout

})

function ask(q){

return new Promise(r=>{

rl.question(q,a=>r(a.trim()))

})

}

function validarNumero(n){

try{

if(!n.startsWith('+'))
n='+'+n

return phoneUtil.isValidNumber(

phoneUtil.parseAndKeepRawInput(n)

)

}catch{

return false

}

}

async function start(){

const {state,saveCreds}=
await useMultiFileAuthState('./session')

const {version}=
await fetchLatestBaileysVersion()

console.log('1 Código')
console.log('2 QR')

let opcion=await ask('Opción:')

let numero=null

if(opcion==='1'){

do{

numero=await ask('Número país:\n> ')

}while(!validarNumero(numero))

numero=numero.replace(/\D/g,'')

}

const sock=makeWASocket({

auth:{

creds:state.creds,

keys:makeCacheableSignalKeyStore(
state.keys,
Pino({level:'fatal'})
)

},

logger:Pino({level:'silent'}),

browser:['asta-MD','Edge','20.0.04'],

version,

printQRInTerminal:opcion==='2',

mobile:false

})

sock.ev.on('connection.update',
({qr})=>{

if(qr && opcion==='2'){

qrcode.generate(qr,{small:true})

}

})

if(opcion==='1'
&& !state.creds.registered){

setTimeout(async()=>{

let code=
await sock.requestPairingCode(numero)

console.log('\nCódigo:\n')

console.log(
code.match(/.{1,4}/g).join('-')
)

},2000)

}

sock.ev.on('creds.update',saveCreds)

}

start()
