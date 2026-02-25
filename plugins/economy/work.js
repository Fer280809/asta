// plugins/economy/work.js
// Sistema de trabajo

import { addMoney, checkCooldown, formatTime } from '../../lib/economy.js'

const trabajos = [
  { nombre: 'ᴅᴇsᴀʀʀᴏʟʟᴀᴅᴏʀ', emoji: '💻', min: 500, max: 1500 },
  { nombre: 'ᴅᴏᴄᴛᴏʀ', emoji: '🩺', min: 800, max: 2000 },
  { nombre: 'ᴘᴏʟɪᴄɪ́ᴀ', emoji: '👮', min: 600, max: 1800 },
  { nombre: 'ʙᴏᴍʙᴇʀᴏ', emoji: '🚒', min: 700, max: 1900 },
  { nombre: 'ᴄʜᴇғ', emoji: '👨‍🍳', min: 400, max: 1200 },
  { nombre: 'ᴀʀᴛɪsᴛᴀ', emoji: '🎨', min: 300, max: 1000 },
  { nombre: 'ᴍᴜ́sɪᴄᴏ', emoji: '🎸', min: 350, max: 1100 },
  { nombre: 'ᴘɪʟᴏᴛᴏ', emoji: '✈️', min: 900, max: 2500 },
  { nombre: 'ᴀsᴛʀᴏɴᴀᴜᴛᴀ', emoji: '🚀', min: 1000, max: 3000 },
  { nombre: 'ʟᴇɴ̃ᴀᴅᴏʀ', emoji: '🪓', min: 200, max: 800 }
]

let handler = async (m, { conn }) => {
  let userId = m.sender.split('@')[0]
  let cooldown = checkCooldown(userId, 'Work', 30 * 60 * 1000) // 30 minutos

  if (!cooldown.canUse) {
    return conn.sendMessage(m.chat, {
      text: `> . ﹡ ﹟ ⏰ ׄ ⬭ *¡ᴅᴇsᴄᴀɴsᴀɴᴅᴏ!*

*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜😴* ㅤ֢ㅤ⸱ㅤᯭִ*
ׅㅤ𓏸𓈒ㅤׄ *ᴛɪᴇᴍᴘᴏ ʀᴇsᴛᴀɴᴛᴇ* :: ${formatTime(cooldown.remaining)}

> ## \`ᴇsᴛᴀ́s ᴄᴀɴsᴀᴅᴏ ⚔️\`
> ᴠᴜᴇʟᴠᴇ ᴄᴜᴀɴᴅᴏ ᴛᴇ ʀᴇsᴛᴀᴜʀᴇs`
    }, { quoted: m })
  }

  let trabajo = trabajos[Math.floor(Math.random() * trabajos.length)]
  let ganancia = Math.floor(Math.random() * (trabajo.max - trabajo.min + 1)) + trabajo.min

  addMoney(userId, ganancia)

  conn.sendMessage(m.chat, {
    text: `> . ﹡ ﹟ 💼 ׄ ⬭ *¡ᴛʀᴀʙᴀᴊᴀsᴛᴇ!*

*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜${trabajo.emoji}* ㅤ֢ㅤ⸱ㅤᯭִ*
ׅㅤ𓏸𓈒ㅤׄ *ᴛʀᴀʙᴀᴊᴏ* :: ${trabajo.nombre}
ׅㅤ𓏸𓈒ㅤׄ *ɢᴀɴᴀɴᴄɪᴀ* :: $${ganancia.toLocaleString()}

> ## \`ʙᴜᴇɴ ᴛʀᴀʙᴀᴊᴏ ⚔️\`
> ᴘᴜᴇᴅᴇs ᴛʀᴀʙᴀᴊᴀʀ ᴅᴇ ɴᴜᴇᴠᴏ ᴇɴ 30 ᴍɪɴᴜᴛᴏs`,
    mentions: [m.sender]
  }, { quoted: m })
}

handler.help = ['work', 'trabajar']
handler.tags = ['economy']
handler.command = ['work', 'trabajar']

export default handler