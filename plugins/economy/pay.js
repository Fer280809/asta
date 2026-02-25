// plugins/economy/pay.js
// Transferir dinero a otros usuarios

import { getUser, transfer, addMoney } from '../../lib/economy.js'

let handler = async (m, { conn, args }) => {
  let senderId = m.sender.split('@')[0]

  if (!args[0] || !args[1]) {
    return conn.sendMessage(m.chat, {
      text: `> . ﹡ ﹟ 💸 ׄ ⬭ *¡ᴛʀᴀɴsғᴇʀɪʀ!*

*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜📋* ㅤ֢ㅤ⸱ㅤᯭִ*
ׅㅤ𓏸𓈒ㅤׄ *ᴜsᴏ* :: *.pay @usuario <cantidad>*
ׅㅤ𓏸𓈒ㅤׄ *ᴇᴊᴇᴍᴘʟᴏ* :: *.pay @user 1000*

> ## \`ɴᴏᴛᴀ ⚔️\`
> sᴇ ᴄᴏʙʀᴀ ᴜɴ 5% ᴅᴇ ᴄᴏᴍɪsɪᴏ́ɴ`
    }, { quoted: m })
  }

  let target = m.mentionedJid[0]
  if (!target) {
    return conn.sendMessage(m.chat, {
      text: `> . ﹡ ﹟ ❌ ׄ ⬭ *¡ᴅᴇʙᴇs ᴍᴇɴᴄɪᴏɴᴀʀ!*

*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜⚠️* ㅤ֢ㅤ⸱ㅤᯭִ*
ׅㅤ𓏸𓈒ㅤׄ *ᴅᴇᴛᴀʟʟᴇ* :: ᴍᴇɴᴄɪᴏɴᴀ ᴀʟ ᴜsᴜᴀʀɪᴏ ᴄᴏɴ @`
    }, { quoted: m })
  }

  let amount = parseInt(args[1].replace(/[^0-9]/g, ''))
  if (!amount || amount <= 0) {
    return conn.sendMessage(m.chat, {
      text: `> . ﹡ ﹟ ❌ ׄ ⬭ *¡ᴄᴀɴᴛɪᴅᴀᴅ ɪɴᴠᴀ́ʟɪᴅᴀ!*`
    }, { quoted: m })
  }

  let sender = getUser(senderId)
  let fee = Math.floor(amount * 0.05) // 5% comisión
  let total = amount + fee

  if (sender.balance < total) {
    return conn.sendMessage(m.chat, {
      text: `> . ﹡ ﹟ ❌ ׄ ⬭ *¡sɪɴ ᴅɪɴᴇʀᴏ!*

*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜💸* ㅤ֢ㅤ⸱ㅤᯭִ*
ׅㅤ𓏸𓈒ㅤׄ *ɴᴇᴄᴇsɪᴛᴀs* :: $${total.toLocaleString()} (ɪɴᴄʟᴜʏᴇ ᴄᴏᴍɪsɪᴏ́ɴ)
ׅㅤ𓏸𓈒ㅤׄ *ᴛɪᴇɴᴇs* :: $${sender.balance.toLocaleString()}`
    }, { quoted: m })
  }

  let targetId = target.split('@')[0]

  if (transfer(senderId, targetId, amount)) {
    conn.sendMessage(m.chat, {
      text: `> . ﹡ ﹟ ✅ ׄ ⬭ *¡ᴛʀᴀɴsғᴇʀᴇɴᴄɪᴀ ᴇxɪᴛᴏsᴀ!*

*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜💸* ㅤ֢ㅤ⸱ㅤᯭִ*
ׅㅤ𓏸𓈒ㅤׄ *ᴅᴇ* :: @${senderId}
ׅㅤ𓏸𓈒ㅤׄ *ᴘᴀʀᴀ* :: @${targetId}
ׅㅤ𓏸𓈒ㅤׄ *ᴍᴏɴᴛᴏ* :: $${amount.toLocaleString()}
ׅㅤ𓏸𓈒ㅤׄ *ᴄᴏᴍɪsɪᴏ́ɴ* :: $${fee.toLocaleString()}
ׅㅤ𓏸𓈒ㅤׄ *ᴛᴏᴛᴀʟ* :: $${total.toLocaleString()}

> ## \`ɢʀᴀᴄɪᴀs ⚔️\`
> ᴛʀᴀɴsᴀᴄᴄɪᴏ́ɴ ʀᴇᴀʟɪᴢᴀᴅᴀ ᴄᴏɴ ᴇ́xɪᴛᴏ`,
      mentions: [m.sender, target]
    }, { quoted: m })
  } else {
    conn.sendMessage(m.chat, {
      text: `> . ﹡ ﹟ ❌ ׄ ⬭ *¡ᴇʀʀᴏʀ ᴇɴ ʟᴀ ᴛʀᴀɴsғᴇʀᴇɴᴄɪᴀ!*`
    }, { quoted: m })
  }
}

handler.help = ['pay @usuario <cantidad>']
handler.tags = ['economy']
handler.command = ['pay', 'pagar', 'transfer']

export default handler