// plugins/economy/daily.js
// Recompensa diaria

import { getUser, addMoney, checkCooldown, formatTime } from '../../lib/economy.js'

let handler = async (m, { conn }) => {
  let userId = m.sender.split('@')[0]
  let cooldown = checkCooldown(userId, 'Daily', 24 * 60 * 60 * 1000)

  if (!cooldown.canUse) {
    return conn.sendMessage(m.chat, {
      text: `> . ﹡ ﹟ ⏰ ׄ ⬭ *¡ᴇsᴘᴇʀᴀ!*

*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜⏳* ㅤ֢ㅤ⸱ㅤᯭִ*
ׅㅤ𓏸𓈒ㅤׄ *ᴛɪᴇᴍᴘᴏ ʀᴇsᴛᴀɴᴛᴇ* :: ${formatTime(cooldown.remaining)}

> ## \`ᴠᴜᴇʟᴠᴇ ᴍᴀ́s ᴛᴀʀᴅᴇ ⚔️\`
> ʟᴀ ʀᴇᴄᴏᴍᴘᴇɴsᴀ ᴅɪᴀʀɪᴀ ᴇs ᴄᴀᴅᴀ 24ʜ`
    }, { quoted: m })
  }

  let user = getUser(userId)
  let streak = user.streak || 0
  let lastDaily = user.lastDaily || 0
  let now = Date.now()

  // Verificar si mantuvo racha (menos de 48h)
  if (now - lastDaily < 48 * 60 * 60 * 1000 && lastDaily !== 0) {
    streak++
  } else {
    streak = 1
  }

  let baseAmount = 1000
  let streakBonus = Math.min(streak * 100, 1000) // Máx $1000 extra
  let totalAmount = baseAmount + streakBonus

  addMoney(userId, totalAmount)

  conn.sendMessage(m.chat, {
    text: `> . ﹡ ﹟ 🎁 ׄ ⬭ *¡ʀᴇᴄᴏᴍᴘᴇɴsᴀ ᴅɪᴀʀɪᴀ!*

*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜💰* ㅤ֢ㅤ⸱ㅤᯭִ*
ׅㅤ𓏸𓈒ㅤׄ *ʙᴀsᴇ* :: $${baseAmount.toLocaleString()}
ׅㅤ𓏸𓈒ㅤׄ *ʀᴀᴄʜᴀ* :: x${streak} (+$${streakBonus.toLocaleString()})
ׅㅤ𓏸𓈒ㅤׄ *ᴛᴏᴛᴀʟ* :: $${totalAmount.toLocaleString()}

*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜🔥* ㅤ֢ㅤ⸱ㅤᯭִ*
ׅㅤ𓏸𓈒ㅤׄ *ᴅɪ́ᴀs ᴄᴏɴsᴇᴄᴜᴛɪᴠᴏs* :: ${streak}

> ## \`sɪɢᴜᴇ ᴀsɪ́ ⚔️\`
> ᴄᴀᴅᴀ ᴅɪ́ᴀ ǫᴜᴇ ᴄʟᴀɪᴍᴇᴀs, ᴍᴀ́s ᴅɪɴᴇʀᴏ ɢᴀɴᴀs`,
    mentions: [m.sender]
  }, { quoted: m })
}

handler.help = ['daily']
handler.tags = ['economy']
handler.command = ['daily', 'diario']

export default handler