// plugins/economy/rob.js
// Intentar robar a otro usuario

import { getUser, removeMoney, addMoney, checkCooldown, formatTime } from '../../lib/economy.js'

let handler = async (m, { conn, args }) => {
  let userId = m.sender.split('@')[0]
  let cooldown = checkCooldown(userId, 'Rob', 2 * 60 * 60 * 1000) // 2 horas

  if (!cooldown.canUse) {
    return conn.sendMessage(m.chat, {
      text: `> . ﹡ ﹟ ⏰ ׄ ⬭ *¡ᴇsᴛᴀ́s ʙᴜsᴄᴀᴅᴏ!*

*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜🚔* ㅤ֢ㅤ⸱ㅤᯭִ*
ׅㅤ𓏸𓈒ㅤׄ *ᴛɪᴇᴍᴘᴏ ʀᴇsᴛᴀɴᴛᴇ* :: ${formatTime(cooldown.remaining)}

> ## \`ᴇsᴄᴀᴘᴀɴᴅᴏ... ⚔️\`
> ʟᴀ ᴘᴏʟɪᴄɪ́ᴀ ᴛᴇ ʙᴜsᴄᴀ, ᴇsᴄᴏ́ɴᴅᴇᴛᴇ`
    }, { quoted: m })
  }

  if (!m.mentionedJid[0]) {
    return conn.sendMessage(m.chat, {
      text: `> . ﹡ ﹟ 🦹 ׄ ⬭ *¡ʀᴏʙᴀʀ!*

*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜📋* ㅤ֢ㅤ⸱ㅤᯭִ*
ׅㅤ𓏸𓈒ㅤׄ *ᴜsᴏ* :: *.rob @usuario*

> ## \`ᴀᴅᴠᴇʀᴛᴇɴᴄɪᴀ ⚔️\`
> 50% ᴅᴇ ᴇ́xɪᴛᴏ | sɪ ғᴀʟʟᴀs, ᴘᴀɢᴀs ᴍᴜʟᴛᴀ`
    }, { quoted: m })
  }

  let target = m.mentionedJid[0]
  let targetId = target.split('@')[0]

  if (target === m.sender) {
    return conn.sendMessage(m.chat, {
      text: `> . ﹡ ﹟ ❌ ׄ ⬭ *¡ɴᴏ ᴘᴜᴇᴅᴇs ʀᴏʙᴀʀᴛᴇ ᴀ ᴛɪ ᴍɪsᴍᴏ!*`
    }, { quoted: m })
  }

  let targetUser = getUser(targetId)

  if (targetUser.balance < 100) {
    return conn.sendMessage(m.chat, {
      text: `> . ﹡ ﹟ ❌ ׄ ⬭ *¡ᴏʙᴊᴇᴛɪᴠᴏ ᴘᴏʙʀᴇ!*

*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜😢* ㅤ֢ㅤ⸱ㅤᯭִ*
ׅㅤ𓏸𓈒ㅤׄ *ᴅᴇᴛᴀʟʟᴇ* :: @${targetId} ɴᴏ ᴛɪᴇɴᴇ ᴅɪɴᴇʀᴏ`,
      mentions: [target]
    }, { quoted: m })
  }

  // 50% de éxito
  let exito = Math.random() < 0.5

  if (exito) {
    let maxRobo = Math.floor(targetUser.balance * 0.3) // Máximo 30%
    let minRobo = Math.min(100, targetUser.balance)
    let robado = Math.floor(Math.random() * (maxRobo - minRobo + 1)) + minRobo

    removeMoney(targetId, robado)
    addMoney(userId, robado)

    conn.sendMessage(m.chat, {
      text: `> . ﹡ ﹟ 🎭 ׄ ⬭ *¡ʀᴏʙᴏ ᴇxɪᴛᴏsᴏ!*

*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜💰* ㅤ֢ㅤ⸱ㅤᯭִ*
ׅㅤ𓏸𓈒ㅤׄ *ᴠɪ́ᴄᴛɪᴍᴀ* :: @${targetId}
ׅㅤ𓏸𓈒ㅤׄ *ʀᴏʙᴀᴅᴏ* :: $${robado.toLocaleString()}

> ## \`ᴄᴜɪᴅᴀᴅᴏ ⚔️\`
> ᴘᴜᴇᴅᴇɴ ʀᴇᴘᴏʀᴛᴀʀᴛᴇ ᴀ ʟᴀ ᴘᴏʟɪᴄɪ́ᴀ`,
      mentions: [m.sender, target]
    }, { quoted: m })
  } else {
    // Multa por fallar
    let multa = Math.min(500, getUser(userId).balance)
    if (multa > 0) removeMoney(userId, multa)

    conn.sendMessage(m.chat, {
      text: `> . ﹡ ﹟ 🚔 ׄ ⬭ *¡ᴀᴛʀᴀᴘᴀᴅᴏ!*

*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜👮* ㅤ֢ㅤ⸱ㅤᯭִ*
ׅㅤ𓏸𓈒ㅤׄ *ᴇsᴛᴀᴅᴏ* :: ғᴀʟʟɪᴅᴏ ʏ ᴄᴀᴘᴛᴜʀᴀᴅᴏ
ׅㅤ𓏸𓈒ㅤׄ *ᴍᴜʟᴛᴀ* :: $${multa.toLocaleString()}

> ## \`ᴍᴇᴊᴏʀ sᴜᴇʀᴛᴇ ⚔️\`
> ᴠᴜᴇʟᴠᴇ ᴇɴ 2 ʜᴏʀᴀs`,
      mentions: [m.sender]
    }, { quoted: m })
  }
}

handler.help = ['rob @usuario']
handler.tags = ['economy']
handler.command = ['rob', 'robar', 'steal']

export default handler