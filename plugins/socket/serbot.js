import { createSubbot, getSubbot } from '../../lib/subbotSocket.js'

let handler = async (m, { conn, args, usedPrefix, command }) => {
  let userId = m.sender.split('@')[0]
  
  // Verificar si ya tiene subbot activo
  let existingBot = getSubbot(userId)
  if (existingBot && existingBot.isConnected) {
    return conn.sendMessage(m.chat, {
      text: `> . ﹡ ﹟ ⚠️ ׄ ⬭ *¡ʏᴀ ᴛɪᴇɴᴇs ᴜɴ sᴜʙʙᴏᴛ ᴀᴄᴛɪᴠᴏ!*
      
*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜📱* ㅤ֢ㅤ⸱ㅤᯭִ*
ׅㅤ𓏸𓈒ㅤׄ *ᴇsᴛᴀᴅᴏ* :: Conectado
ׅㅤ𓏸𓈒ㅤׄ *ɪᴅ* :: ${userId}

> • .stopsocket - Detener subbot
> • .listbots - Ver tus bots`,
      mentions: [m.sender]
    }, { quoted: m })
  }

  // Determinar tipo de conexión
  let connectionType = 'qr'
  
  if (command === 'code') {
    connectionType = 'code'
  } else if (args[0] === 'code' || args[0] === '--code') {
    connectionType = 'code'
  }

  try {
    let subbot = createSubbot(userId, conn)
    
    // Mensaje inicial
    if (connectionType === 'code') {
      await conn.sendMessage(m.chat, {
        text: `> . ﹡ ﹟ ⏳ ׄ ⬭ *¡ɪɴɪᴄɪᴀɴᴅᴏ ᴍᴏᴅᴏ ᴄᴏᴅᴇ!*
        
*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜📱* ㅤ֢ㅤ⸱ㅤᯭִ*
ׅㅤ𓏸𓈒ㅤׄ *ᴍᴏᴅᴏ* :: Código de 8 dígitos
ׅㅤ𓏸𓈒ㅤׄ *ɴúᴍᴇʀᴏ* :: ${userId}
ׅㅤ𓏸𓈒ㅤׄ *ᴇsᴛᴀᴅᴏ* :: Generando código...

> *Espera un momento...*`,
        mentions: [m.sender]
      }, { quoted: m })
    } else {
      await conn.sendMessage(m.chat, {
        text: `> . ﹡ ﹟ ⏳ ׄ ⬭ *¡ɪɴɪᴄɪᴀɴᴅᴏ ᴍᴏᴅᴏ ǫʀ!*
        
*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜📱* ㅤ֢ㅤ⸱ㅤᯭִ*
ׅㅤ𓏸𓈒ㅤׄ *ᴍᴏᴅᴏ* :: QR Code
ׅㅤ𓏸𓈒ㅤׄ *ɴúᴍᴇʀᴏ* :: ${userId}
ׅㅤ𓏸𓈒ㅤׄ *ᴇsᴛᴀᴅᴏ* :: Generando QR...

> *Espera un momento...*`,
        mentions: [m.sender]
      }, { quoted: m })
    }

    // Inicializar subbot
    await subbot.initialize(connectionType)

    // Si es modo code, esperar conexión y solicitar código
    if (connectionType === 'code') {
      let intentos = 0
      const maxIntentos = 15
      
      while (intentos < maxIntentos) {
        if (subbot.sock?.ws?.readyState === 1) break
        await new Promise(r => setTimeout(r, 1000))
        intentos++
      }

      if (subbot.sock?.ws?.readyState !== 1) {
        throw new Error('Timeout esperando conexión del socket')
      }

      try {
        let code = await subbot.requestPairingCode(userId)
        let formattedCode = code.match(/.{1,4}/g)?.join("-") || code
        
        await conn.sendMessage(m.chat, {
          text: `> . ﹡ ﹟ 🔢 ׄ ⬭ *¡ᴄóᴅɪɢᴏ ᴅᴇ ᴇᴍᴘᴀʀᴇᴊᴀᴍɪᴇɴᴛᴏ!*
            
*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜🔢* ㅤ֢ㅤ⸱ㅤᯭִ*
ׅㅤ𓏸𓈒ㅤׄ *ᴄóᴅɪɢᴏ* :: *${formattedCode}*
ׅㅤ𓏸𓈒ㅤׄ *ɴúᴍᴇʀᴏ* :: ${userId}
ׅㅤ𓏸𓈒ㅤׄ *ᴛɪᴇᴍᴘᴏ* :: 60 segundos

> 1. Abre WhatsApp en tu teléfono
> 2. Toca los 3 puntos ⋮ → Dispositivos vinculados
> 3. Toca "Vincular con número de teléfono"
> 4. Ingresa el código: *${formattedCode}*

> *No compartas este código*`,
          mentions: [m.sender]
        }, { quoted: m })
        
      } catch (error) {
        console.error('Error generando código:', error)
        await conn.sendMessage(m.chat, {
          text: `> . ﹡ ﹟ ❌ ׄ ⬭ *¡ᴇʀʀᴏʀ ᴄᴏᴅᴇ!*
            
No se pudo generar el código: ${error.message}
Intenta con: ${usedPrefix}qr`,
          mentions: [m.sender]
        }, { quoted: m })
      }
    }

  } catch (error) {
    console.error('Error serbot:', error)
    conn.sendMessage(m.chat, {
      text: `> . ﹡ ﹟ ❌ ׄ ⬭ *¡ᴇʀʀᴏʀ!*
      
${error.message}

> Intenta de nuevo o usa el otro método.`,
      mentions: [m.sender]
    }, { quoted: m })
  }
}

handler.help = ['qr', 'code']
handler.tags = ['socket']
handler.command = ['qr', 'code', 'serbot']

export default handler
