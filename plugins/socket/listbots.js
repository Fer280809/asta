import { listSubbots, getSubbot } from '../../lib/subbotSocket.js'

let handler = async (m, { conn }) => {
  let userId = m.sender.split('@')[0]
  let allBots = listSubbots()
  let userBot = getSubbot(userId)
  
  let text = `> . ﹡ ﹟ 🤖 ׄ ⬭ *sᴜʙʙᴏᴛs ᴀᴄᴛɪᴠᴏs*

*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜📊* ㅤ֢ㅤ⸱ㅤᯭִ*
ׅㅤ𓏸𓈒ㅤׄ *ᴛᴏᴛᴀʟ ᴀᴄᴛɪᴠᴏs* :: ${allBots.length}

`

  if (userBot) {
    let status = userBot.getStatus()
    text += `*ᴛᴜ sᴜʙʙᴏᴛ:*
ׅㅤ𓏸𓈒ㅤׄ *ɪᴅ* :: ${status.userId}
ׅㅤ𓏸𓈒ㅤׄ *ᴇsᴛᴀᴅᴏ* :: ${status.isConnected ? '✅ Conectado' : '⏳ Conectando...'}
ׅㅤ𓏸𓈒ㅤׄ *ᴛɪᴘᴏ* :: ${status.connectionType.toUpperCase()}
${status.user ? `ׅㅤ𓏸𓈒ㅤׄ *ɴúᴍᴇʀᴏ* :: ${status.user.id?.split(':')[0] || 'Desconocido'}` : ''}

`
  } else {
    text += `*ᴛᴜ ᴇsᴛᴀᴅᴏ:* No tienes subbot activo

`
  }

  if (allBots.length > 0) {
    text += `*ʀᴇsᴜᴍᴇɴ ɢʟᴏʙᴀʟ:*
${allBots.map((bot, i) => 
  `${i + 1}. ${bot.userId} - ${bot.isConnected ? '🟢' : '🟡'} (${bot.connectionType})`
).join('\n')}`
  }

  await conn.sendMessage(m.chat, {
    text: text,
    mentions: [m.sender]
  }, { quoted: m })
}

handler.help = ['listbots']
handler.tags = ['socket']
handler.command = ['listbots', 'bots', 'misbots', 'subbots']

export default handler
