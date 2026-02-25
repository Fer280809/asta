// plugins/admin/del.js
// Eliminar mensaje (requiere responder)

let handler = async (m, { conn, isAdmin, isBotAdmin }) => {
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

  if (!isBotAdmin) {
    return conn.sendMessage(m.chat, {
      text: `> . ﹡ ﹟ ⚠️ ׄ ⬭ *¡ᴀᴛᴇɴᴄɪᴏ́ɴ!*

*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜🤖* ㅤ֢ㅤ⸱ㅤᯭִ*
ׅㅤ𓏸𓈒ㅤׄ *ʙᴏᴛ* :: ɴᴇᴄᴇsɪᴛᴏ sᴇʀ ᴀᴅᴍɪɴɪsᴛʀᴀᴅᴏʀ`
    }, { quoted: m })
  }

  if (!m.quoted) {
    return conn.sendMessage(m.chat, {
      text: `> . ﹡ ﹟ 🗑️ ׄ ⬭ *¡ᴇʟɪᴍɪɴᴀʀ ᴍᴇɴsᴀᴊᴇ!*

*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜📋* ㅤ֢ㅤ⸱ㅤᯭִ*
ׅㅤ𓏸𓈒ㅤׄ *ᴜsᴏ* :: ʀᴇsᴘᴏɴᴅᴇ ᴀʟ ᴍᴇɴsᴀᴊᴇ ᴄᴏɴ *.del*
ׅㅤ𓏸𓈒ㅤׄ *ᴀʟɪᴀs* :: *.delete*

> ## \`ɴᴏᴛᴀ ⚔️\`
> ᴅᴇʙᴇs ʀᴇsᴘᴏɴᴅᴇʀ ᴀʟ ᴍᴇɴsᴀᴊᴇ ǫᴜᴇ ᴅᴇsᴇᴀs ᴇʟɪᴍɪɴᴀʀ`
    }, { quoted: m })
  }

  try {
    await conn.sendMessage(m.chat, { delete: m.quoted.key })
    conn.sendMessage(m.chat, {
      text: `> . ﹡ ﹟ ✅ ׄ ⬭ *¡ᴍᴇɴsᴀᴊᴇ ᴇʟɪᴍɪɴᴀᴅᴏ!*

*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜🗑️* ㅤ֢ㅤ⸱ㅤᯭִ*
ׅㅤ𓏸𓈒ㅤׄ *ᴀᴄᴄɪᴏ́ɴ* :: ᴍᴇɴsᴀᴊᴇ ʙᴏʀʀᴀᴅᴏ ᴄᴏʀʀᴇᴄᴛᴀᴍᴇɴᴛᴇ
ׅㅤ𓏸𓈒ㅤׄ *ᴀᴅᴍɪɴ* :: @${m.sender.split('@')[0]}`,
      mentions: [m.sender]
    }, { quoted: m })
  } catch (e) {
    conn.sendMessage(m.chat, {
      text: `> . ﹡ ﹟ ❌ ׄ ⬭ *¡ᴇʀʀᴏʀ!*

*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜⚠️* ㅤ֢ㅤ⸱ㅤᯭִ*
ׅㅤ𓏸𓈒ㅤׄ *ᴅᴇᴛᴀʟʟᴇ* :: ɴᴏ sᴇ ᴘᴜᴅᴏ ᴇʟɪᴍɪɴᴀʀ ᴇʟ ᴍᴇɴsᴀᴊᴇ`
    }, { quoted: m })
  }
}

handler.help = ['del (responder msg)']
handler.tags = ['admin']
handler.command = ['del', 'delete']

handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler