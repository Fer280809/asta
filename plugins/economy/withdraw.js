// plugins/economy/withdraw.js
// Retirar dinero del banco

import { getUser, removeMoney, addMoney } from '../../lib/economy.js'

let handler = async (m, { conn, args }) => {
  let userId = m.sender.split('@')[0]
  let user = getUser(userId)

  if (!args[0]) {
    return conn.sendMessage(m.chat, {
      text: `> . ﹡ ﹟ 🏧 ׄ ⬭ *¡ʀᴇᴛɪʀᴀʀ!*

*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜📋* ㅤ֢ㅤ⸱ㅤᯭִ*
ׅㅤ𓏸𓈒ㅤׄ *ᴜsᴏ* :: *.withdraw <cantidad> | all*
ׅㅤ𓏸𓈒ㅤׄ *ᴇᴊᴇᴍᴘʟᴏ* :: *.withdraw 1000*
ׅㅤ𓏸𓈒ㅤׄ *ᴇɴ ʙᴀɴᴄᴏ* :: $${user.bank.toLocaleString()}

> ## \`ɴᴏᴛᴀ ⚔️\`
> ɴᴏ ʜᴀʏ ᴄᴏᴍɪsɪᴏ́ɴ ᴘᴏʀ ʀᴇᴛɪʀᴏ`
    }, { quoted: m })
  }

  let amount = args[0].toLowerCase() === 'all' ? user.bank : parseInt(args[0].replace(/[^0-9]/g, ''))

  if (!amount || amount <= 0) {
    return conn.sendMessage(m.chat, {
      text: `> . ﹡ ﹟ ❌ ׄ ⬭ *¡ᴄᴀɴᴛɪᴅᴀᴅ ɪɴᴠᴀ́ʟɪᴅᴀ!*`
    }, { quoted: m })
  }

  if (amount > user.bank) {
    return conn.sendMessage(m.chat, {
      text: `> . ﹡ ﹟ ❌ ׄ ⬭ *¡ғᴏɴᴅᴏs ɪɴsᴜғɪᴄɪᴇɴᴛᴇs!*

*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜💸* ㅤ֢ㅤ⸱ㅤᯭִ*
ׅㅤ𓏸𓈒ㅤׄ *ɴᴇᴄᴇsɪᴛᴀs* :: $${amount.toLocaleString()}
ׅㅤ𓏸𓈒ㅤׄ *ᴇɴ ʙᴀɴᴄᴏ* :: $${user.bank.toLocaleString()}`
    }, { quoted: m })
  }

  removeMoney(userId, amount, true)
  addMoney(userId, amount)

  let updated = getUser(userId)

  conn.sendMessage(m.chat, {
    text: `> . ﹡ ﹟ ✅ ׄ ⬭ *¡ʀᴇᴛɪʀᴏ ᴇxɪᴛᴏsᴏ!*

*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜🏧* ㅤ֢ㅤ⸱ㅤᯭִ*
ׅㅤ𓏸𓈒ㅤׄ *ʀᴇᴛɪʀᴏ* :: $${amount.toLocaleString()}
ׅㅤ𓏸𓈒ㅤׄ *ᴇғᴇᴄᴛɪᴠᴏ* :: $${updated.balance.toLocaleString()}
ׅㅤ𓏸𓈒ㅤׄ *ʙᴀɴᴄᴏ* :: $${updated.bank.toLocaleString()}

> ## \`ʟɪsᴛᴏ ⚔️\`
> ᴅɪɴᴇʀᴏ ʀᴇᴛɪʀᴀᴅᴏ ᴅᴇʟ ʙᴀɴᴄᴏ`,
    mentions: [m.sender]
  }, { quoted: m })
}

handler.help = ['withdraw <cantidad>']
handler.tags = ['economy']
handler.command = ['withdraw', 'with', 'retirar']

export default handler