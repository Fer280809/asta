// plugins/admin/stopkicknum.js
// Detener expulsión por número

import { kickNumActive } from './kicknum.js'

let handler = async (m, { conn, isAdmin }) => {
  if (!m.isGroup) {
    return conn.sendMessage(m.chat, {
      text: `> . ﹡ ﹟ ⚠️ ׄ ⬭ *¡ᴀᴛᴇɴᴄɪᴏ́ɴ!*

*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜🚫* ㅤ֢ㅤ⸱ㅤᯭִ*
ׅㅤ𓏸𓈒ㅤׄ *ᴇʀʀᴏʀ* :: ${global.msj?.soloGrupo || '👥 Solo en grupos'}`
    }, { quoted: m })
  }

  if (!isAdmin) {
    return conn.sendMessage(m.chat, {
      text: `> . ﹡ ﹟ ⚠️ ׄ ⬭ *¡ᴀᴛᴇɴᴄɪᴏ́ɴ!*

*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜🛡️* ㅤ֢ㅤ⸱ㅤᯭִ*
ׅㅤ𓏸𓈒ㅤׄ *ᴘᴇʀᴍɪsᴏ* :: ${global.msj?.sinPermisos || '🚫 No tienes permisos'}`
    }, { quoted: m })
  }

  if (kickNumActive.has(m.chat)) {
    kickNumActive.delete(m.chat)
    conn.sendMessage(m.chat, {
      text: `> . ﹡ ﹟ 🛑 ׄ ⬭ *¡ᴘʀᴏᴄᴇsᴏ ᴅᴇᴛᴇɴɪᴅᴏ!*

*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜✋* ㅤ֢ㅤ⸱ㅤᯭִ*
ׅㅤ𓏸𓈒ㅤׄ *ᴇsᴛᴀᴅᴏ* :: ᴇxᴘᴜʟsɪᴏ́ɴ ᴍᴀsɪᴠᴀ ᴅᴇᴛᴇɴɪᴅᴀ

> ## \`ᴀᴠɪsᴏ ⚔️\`
> ʟᴏs ᴜsᴜᴀʀɪᴏs ʏᴀ ᴇxᴘᴜʟsᴀᴅᴏs ɴᴏ sᴇ ʀᴇsᴛᴀᴜʀᴀɴ`
    }, { quoted: m })
  } else {
    conn.sendMessage(m.chat, {
      text: `> . ﹡ ﹟ ⚠️ ׄ ⬭ *¡sɪɴ ᴘʀᴏᴄᴇsᴏs!*

*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜🤷* ㅤ֢ㅤ⸱ㅤᯭִ*
ׅㅤ𓏸𓈒ㅤׄ *ᴇsᴛᴀᴅᴏ* :: ɴᴏ ʜᴀʏ ᴇxᴘᴜʟsɪᴏɴ ᴀᴄᴛɪᴠᴀ

> ## \`ɴᴏᴛᴀ ⚔️\`
> ᴜsᴀ ᴇsᴛᴇ ᴄᴏᴍᴀɴᴅᴏ ᴅᴜʀᴀɴᴛᴇ ᴜɴᴀ ᴇxᴘᴜʟsɪᴏ́ɴ ᴘᴏʀ *.kicknum*`
    }, { quoted: m })
  }
}

handler.help = ['stopkicknum']
handler.tags = ['admin']
handler.command = ['stopkicknum']

handler.group = true
handler.admin = true

export default handler