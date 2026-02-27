import { getSubbot, removeSubbot } from '../../lib/subbotSocket.js'

let handler = async (m, { conn }) => {
  let userId = m.sender.split('@')[0]
  
  let subbot = getSubbot(userId)
  if (!subbot) {
    return conn.sendMessage(m.chat, {
      text: `> . ﹡ ﹟ ⚠️ ׄ ⬭ *ɴᴏ ᴛɪᴇɴᴇs sᴜʙʙᴏᴛ ᴀᴄᴛɪᴠᴏ*
      
No hay ningún subbot vinculado a tu número.`,
      mentions: [m.sender]
    }, { quoted: m })
  }

  try {
    await removeSubbot(userId)
    await conn.sendMessage(m.chat, {
      text: `> . ﹡ ﹟ ✅ ׄ ⬭ *¡sᴜʙʙᴏᴛ ᴅᴇᴛᴇɴɪᴅᴏ!*
      
*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜🗑️* ㅤ֢ㅤ⸱ㅤᯭִ*
ׅㅤ𓏸𓈒ㅤׄ *ᴇsᴛᴀᴅᴏ* :: Desconectado
ׅㅤ𓏸𓈒ㅤׄ *sᴇsɪóɴ* :: Eliminada

> Tu subbot ha sido detenido correctamente.`,
      mentions: [m.sender]
    }, { quoted: m })
  } catch (error) {
    conn.sendMessage(m.chat, {
      text: `> . ﹡ ﹟ ❌ ׄ ⬭ *ᴇʀʀᴏʀ ᴀʟ ᴅᴇᴛᴇɴᴇʀ*
      
${error.message}`,
      mentions: [m.sender]
    }, { quoted: m })
  }
}

handler.help = ['stopsocket']
handler.tags = ['socket']
handler.command = ['stopsocket', 'delsocket', 'stopsubbot']

export default handler
