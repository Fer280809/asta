// plugins/economy/mine.js
// Sistema de minería

import { addMoney, checkCooldown, formatTime } from '../../lib/economy.js'

const minerales = [
  { nombre: 'ᴄᴀʀʙᴏ́ɴ', emoji: '⚫', min: 50, max: 200, prob: 40 },
  { nombre: 'ʜɪᴇʀʀᴏ', emoji: '🔩', min: 100, max: 400, prob: 30 },
  { nombre: 'ᴏʀᴏ', emoji: '🏆', min: 300, max: 800, prob: 15 },
  { nombre: 'ᴅɪᴀᴍᴀɴᴛᴇ', emoji: '💎', min: 800, max: 2000, prob: 8 },
  { nombre: 'ᴇsᴍᴇʀᴀʟᴅᴀ', emoji: '💚', min: 1500, max: 3500, prob: 5 },
  { nombre: 'ʀᴜʙɪ́', emoji: '❤️', min: 2500, max: 5000, prob: 2 }
]

function getMineral() {
  let rand = Math.random() * 100
  let acum = 0

  for (let min of minerales) {
    acum += min.prob
    if (rand <= acum) return min
  }
  return minerales[0]
}

let handler = async (m, { conn }) => {
  let userId = m.sender.split('@')[0]
  let cooldown = checkCooldown(userId, 'Mine', 15 * 60 * 1000) // 15 minutos

  if (!cooldown.canUse) {
    return conn.sendMessage(m.chat, {
      text: `> . ﹡ ﹟ ⏰ ׄ ⬭ *¡ᴘɪᴄᴏ ʀᴏᴛᴏ!*

*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜⛏️* ㅤ֢ㅤ⸱ㅤᯭִ*
ׅㅤ𓏸𓈒ㅤׄ *ᴛɪᴇᴍᴘᴏ ʀᴇsᴛᴀɴᴛᴇ* :: ${formatTime(cooldown.remaining)}

> ## \`ʀᴇᴘᴀʀᴀɴᴅᴏ... ⚔️\`
> ᴛᴜ ᴘɪᴄᴏ ɴᴇᴄᴇsɪᴛᴀ ʀᴇᴘᴀʀᴀᴄɪᴏ́ɴ`
    }, { quoted: m })
  }

  let mineral = getMineral()
  let cantidad = Math.floor(Math.random() * 3) + 1
  let ganancia = Math.floor(Math.random() * (mineral.max - mineral.min + 1)) + mineral.min
  let total = ganancia * cantidad

  addMoney(userId, total)

  conn.sendMessage(m.chat, {
    text: `> . ﹡ ﹟ ⛏️ ׄ ⬭ *¡ᴍɪɴᴀsᴛᴇ!*

*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜${mineral.emoji}* ㅤ֢ㅤ⸱ㅤᯭִ*
ׅㅤ𓏸𓈒ㅤׄ *ᴍɪɴᴇʀᴀʟ* :: ${mineral.nombre}
ׅㅤ𓏸𓈒ㅤׄ *ᴄᴀɴᴛɪᴅᴀᴅ* :: ${cantidad} ᴜɴɪᴅᴀᴅᴇs
ׅㅤ𓏸𓈒ㅤׄ *ᴠᴀʟᴏʀ* :: $${total.toLocaleString()}

> ## \`sɪɢᴜᴇ ᴍɪɴᴀɴᴅᴏ ⚔️\`
> ᴘᴜᴇᴅᴇs ᴍɪɴᴀʀ ᴅᴇ ɴᴜᴇᴠᴏ ᴇɴ 15 ᴍɪɴᴜᴛᴏs`,
    mentions: [m.sender]
  }, { quoted: m })
}

handler.help = ['mine', 'minar']
handler.tags = ['economy']
handler.command = ['mine', 'minar']

export default handler