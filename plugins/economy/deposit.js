// plugins/economy/deposit.js
// Depositar dinero en el banco

import { getUser, removeMoney, addMoney } from '../../lib/economy.js'

let handler = async (m, { conn, args }) => {
  let userId = m.sender.split('@')[0]
  let user = getUser(userId)

  if (!args[0]) {
    return conn.sendMessage(m.chat, {
      text: `> . ﹡ ﹟ 🏦 ׄ ⬭ *¡ᴅᴇᴘᴏsɪᴛᴀʀ!*

*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜📋* ㅤ֢ㅤ⸱ㅤᯭִ*
ׅㅤ𓏸𓈒ㅤׄ *ᴜsᴏ* :: *.deposit <cantidad> | all*
ׅㅤ𓏸𓈒ㅤׄ *ᴇᴊᴇᴍᴘʟᴏ* :: *.deposit 1000*
ׅㅤ𓏸𓈒ㅤׄ *ᴅɪsᴘᴏɴɪʙʟᴇ* :: $${user.balance.toLocaleString()}

> ## \`ʙᴀɴᴄᴏ ⚔️\`
> ᴇʟ ᴅɪɴᴇʀᴏ ᴇɴ ᴇʟ ʙᴀɴᴄᴏ ᴇsᴛᴀ́ sᴇɢᴜʀᴏ`
    }, { quoted: m })
  }

  let amount = args[0].toLowerCase() === 'all' ? user.balance : parseInt(args[0].replace(/[^0-9]/g, ''))

  if (!amount || amount <= 0) {
    return conn.sendMessage(m.chat, {
      text: `> . ﹡ ﹟ ❌ ׄ ⬭ *¡ᴄᴀɴᴛɪᴅᴀᴅ ɪɴᴠᴀ́ʟɪᴅᴀ!*`
    }, { quoted: m })
  }

  if (amount > user.balance) {
    return conn.sendMessage(m.chat, {
      text: `> . ﹡ ﹟ ❌ ׄ ⬭ *¡sɪɴ sᴀʟᴅᴏ!*

*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜💸* ㅤ֢ㅤ⸱ㅤᯭִ*
ׅㅤ𓏸𓈒ㅤׄ *ɴᴇᴄᴇsɪᴛᴀs* :: $${amount.toLocaleString()}
ׅㅤ𓏸𓈒ㅤׄ *ᴛɪᴇɴᴇs* :: $${user.balance.toLocaleString()}`
    }, { quoted: m })
  }

  removeMoney(userId, amount)
  addMoney(userId, amount, true)

  let updated = getUser(userId)

  conn.sendMessage(m.chat, {
    text: `> . ﹡ ﹟ ✅ ׄ ⬭ *¡ᴅᴇᴘᴏ́sɪᴛᴏ ᴇxɪᴛᴏsᴏ!*

*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜🏦* ㅤ֢ㅤ⸱ㅤᯭִ*
ׅㅤ𓏸𓈒ㅤׄ *ᴅᴇᴘᴏ́sɪᴛᴏ* :: $${amount.toLocaleString()}
ׅㅤ𓏸𓈒ㅤׄ *ʙᴀɴᴄᴏ ᴛᴏᴛᴀʟ* :: $${updated.bank.toLocaleString()}
ׅㅤ𓏸𓈒ㅤׄ *ᴇғᴇᴄᴛɪᴠᴏ* :: $${updated.balance.toLocaleString()}

> ## \`sᴇɢᴜʀᴏ ⚔️\`
> ᴛᴜ ᴅɪɴᴇʀᴏ ᴇsᴛᴀ́ ᴘʀᴏᴛᴇɢɪᴅᴏ ᴇɴ ᴇʟ ʙᴀɴᴄᴏ`,
    mentions: [m.sender]
  }, { quoted: m })
}

handler.help = ['deposit <cantidad>']
handler.tags = ['economy']
handler.command = ['deposit', 'dep', 'depositar']

export default handler