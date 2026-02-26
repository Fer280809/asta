// plugins/economy/top.js
// Top usuarios y recompensas

import { getTop, getUser } from '../../lib/economy.js'
import fs from 'fs'
import path from 'path'

const topPath = path.join(process.cwd(), 'data', 'top-rewards.json')

function getTopData() {
  if (!fs.existsSync(topPath)) {
    fs.mkdirSync(path.dirname(topPath), { recursive: true })
    fs.writeFileSync(topPath, JSON.stringify({ 
      lastDaily: 0, 
      lastWeekly: 0, 
      lastBiDaily: 0,
      history: []
    }, null, 2))
  }
  return JSON.parse(fs.readFileSync(topPath, 'utf-8'))
}

let handler = async (m, { conn, args }) => {
  let top = getTop(10)
  let userId = m.sender.split('@')[0]
  let user = getUser(userId)
  let topData = getTopData()

  if (args[0] === 'rewards') {
    let now = Date.now()
    let day = 24 * 60 * 60 * 1000
    let nextBiDaily = topData.lastBiDaily + (2 * day) - now
    let nextWeekly = topData.lastWeekly + (7 * day) - now

    let formatNext = (ms) => {
      if (ms <= 0) return '¡Disponible ahora!'
      let hours = Math.floor(ms / (60 * 60 * 1000))
      let days = Math.floor(hours / 24)
      let remainingHours = hours % 24
      if (days > 0) return `${days}d ${remainingHours}h`
      return `${hours}h`
    }

    return conn.sendMessage(m.chat, {
      text: `> . ﹡ ﹟ 🏆 ׄ ⬭ *¡ʀᴇᴄᴏᴍᴘᴇɴsᴀs ᴅᴇʟ ᴛᴏᴘ!*

*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜🎁* ㅤ֢ㅤ⸱ㅤᯭִ*
ׅㅤ𓏸𓈒ㅤׄ *ᴄᴀᴅᴀ 2 ᴅɪ́ᴀs* ::
  • 🥇 #1: $3,000
  • 🥈 #2: $2,000
  • 🥉 #3: $1,000
  • ᴘʀᴏ́xɪᴍᴀ: ${formatNext(nextBiDaily)}

*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜🎉* ㅤ֢ㅤ⸱ㅤᯭִ*
ׅㅤ𓏸𓈒ㅤׄ *sᴇᴍᴀɴᴀʟ* ::
  • 🥇 #1: $15,000
  • 🥈 #2: $10,000
  • 🥉 #3: $5,000
  • ᴘʀᴏ́xɪᴍᴀ: ${formatNext(nextWeekly)}

> ## \`ᴀᴜᴛᴏᴍᴀ́ᴛɪᴄᴏ ⚔️\`
> ʟᴀs ʀᴇᴄᴏᴍᴘᴇɴsᴀs sᴇ ᴇɴᴠɪ́ᴀɴ ᴀᴜᴛᴏᴍᴀ́ᴛɪᴄᴀᴍᴇɴᴛᴇ ᴀʟ ʙᴀɴᴄᴏ`
    }, { quoted: m })
  }

  // Mostrar top
  let medals = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟']
  let text = `> . ﹡ ﹟ 🏆 ׄ ⬭ *¡ᴛᴏᴘ 10 ᴍɪʟʟᴏɴᴀʀɪᴏs!*

`

  for (let i = 0; i < top.length; i++) {
    // ✅ Fix: usar solo el número, igual que balance.js con @${userId}
    let topUser = top[i]
    let medal = medals[i] || `${i + 1}.`
    // user.id ya viene sin @s.whatsapp.net desde getTop()
    text += `*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜${medal}* ㅤ֢ㅤ⸱ㅤᯭִ* @${topUser.id}
`
    text += `ׅㅤ𓏸𓈒ㅤׄ *ᴛᴏᴛᴀʟ* :: $${topUser.total.toLocaleString()}
`
    text += `ׅㅤ𓏸𓈒ㅤׄ *ɴɪᴠᴇʟ* :: ${topUser.level} ⭐ | *ᴇxᴘ* :: ${topUser.exp.toLocaleString()}

`
  }

  // Posición del usuario
  let allTop = getTop(1000)
  let userPos = allTop.findIndex(u => u.id === userId) + 1

  if (userPos > 10) {
    text += `*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜📍* ㅤ֢ㅤ⸱ㅤᯭִ* ᴛᴜ ᴘᴏsɪᴄɪᴏ́ɴ
`
    text += `ׅㅤ𓏸𓈒ㅤׄ *ʀᴀɴᴋ* :: #${userPos}
`
    text += `ׅㅤ𓏸𓈒ㅤׄ *ᴛᴏᴛᴀʟ* :: $${(user.balance + user.bank).toLocaleString()}

`
  }

  text += `> ## \`ᴘʀᴇᴍɪᴏs ⚔️\`
> ᴇʟ ᴛᴏᴘ 3 ʀᴇᴄɪʙᴇ ʀᴇᴄᴏᴍᴘᴇɴsᴀs ᴀᴜᴛᴏᴍᴀ́ᴛɪᴄᴀs
> ᴠᴇʀ: .top rewards`

  // ✅ Fix: sin mentions, solo texto plano con el número
  conn.sendMessage(m.chat, { text }, { quoted: m })
}

handler.help = ['top', 'ranking', 'leaderboard']
handler.tags = ['economy']
handler.command = ['top', 'ranking', 'leaderboard', 'baltop']

export default handler
