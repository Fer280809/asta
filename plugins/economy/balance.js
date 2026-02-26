// plugins/economy/balance.js
// Ver balance y estadísticas
import { getUser, getTop } from '../../lib/economy.js'

let handler = async (m, { conn, args }) => {
  let target = (m.mentionedJid && m.mentionedJid[0]) || m.sender
  let userId = target.split('@')[0]
  let user = getUser(userId)
  let top = getTop(100)
  let position = top.findIndex(u => u.id === userId) + 1

  let text = `> . ﹡ ﹟ 💰 ׄ ⬭ *¡ʙᴀʟᴀɴᴄᴇ!*
*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜👤* ㅤ֢ㅤ⸱ㅤᯭִ*
ׅㅤ𓏸𓈒ㅤׄ *ᴜsᴜᴀʀɪᴏ* :: @${userId}
ׅㅤ𓏸𓈒ㅤׄ *ɴɪᴠᴇʟ* :: ${user.level} ⭐
ׅㅤ𓏸𓈒ㅤׄ *ᴇxᴘ* :: ${user.exp.toLocaleString()} / ${(user.level * 1000).toLocaleString()}
*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜💵* ㅤ֢ㅤ⸱ㅤᯭִ*
ׅㅤ𓏸𓈒ㅤׄ *ᴇғᴇᴄᴛɪᴠᴏ* :: $${user.balance.toLocaleString()}
ׅㅤ𓏸𓈒ㅤׄ *ʙᴀɴᴄᴏ* :: $${user.bank.toLocaleString()}
ׅㅤ𓏸𓈒ㅤׄ *ᴛᴏᴛᴀʟ* :: $${(user.balance + user.bank).toLocaleString()}
*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜📊* ㅤ֢ㅤ⸱ㅤᯭִ*
ׅㅤ𓏸𓈒ㅤׄ *ᴘᴏsɪᴄɪᴏ́ɴ* :: #${position || 'N/A'}
ׅㅤ𓏸𓈒ㅤׄ *sᴛʀᴇᴀᴋ* :: ${user.streak} días
> ## \`ᴄᴏᴍᴀɴᴅᴏs ⚔️\`
> • .daily - Recompensa diaria
> • .work - Trabajar
> • .mine - Minar
> • .tatar - Jugar tatar`

  conn.sendMessage(m.chat, { text, mentions: [target] }, { quoted: m })
}

handler.help = ['balance [@usuario]']
handler.tags = ['economy']
handler.command = ['balance', 'bal', 'dinero', 'money']

export default handler
