// plugins/admin/revoke.js
// Revocar y restablecer enlace del grupo

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

  try {
    await conn.groupRevokeInvite(m.chat)
    let newLink = await conn.groupInviteCode(m.chat)

    conn.sendMessage(m.chat, {
      text: `> . ﹡ ﹟ 🔗 ׄ ⬭ *¡ᴇɴʟᴀᴄᴇ ʀᴇsᴛᴀʙʟᴇᴄɪᴅᴏ!*

*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜🔄* ㅤ֢ㅤ⸱ㅤᯭִ*
ׅㅤ𓏸𓈒ㅤׄ *ᴀᴄᴄɪᴏ́ɴ* :: ᴇɴʟᴀᴄᴇ ᴀɴᴛᴇʀɪᴏʀ ʀᴇᴠᴏᴄᴀᴅᴏ
ׅㅤ𓏸𓈒ㅤׄ *ɴᴜᴇᴠᴏ* :: https://chat.whatsapp.com/${newLink}
ׅㅤ𓏸𓈒ㅤׄ *ᴀᴅᴍɪɴ* :: @${m.sender.split('@')[0]}

> ## \`ᴀᴅᴠᴇʀᴛᴇɴᴄɪᴀ ⚔️\`
> ᴇʟ ᴀɴᴛɪɢᴜᴏ ᴇɴʟᴀᴄᴇ ʏᴀ ɴᴏ ғᴜɴᴄɪᴏɴᴀ`,
      mentions: [m.sender]
    }, { quoted: m })
  } catch (e) {
    conn.sendMessage(m.chat, {
      text: `> . ﹡ ﹟ ❌ ׄ ⬭ *¡ᴇʀʀᴏʀ!*

*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜⚠️* ㅤ֢ㅤ⸱ㅤᯭִ*
ׅㅤ𓏸𓈒ㅤׄ *ᴅᴇᴛᴀʟʟᴇ* :: ${e.message}`
    }, { quoted: m })
  }
}

handler.help = ['revoke']
handler.tags = ['admin']
handler.command = ['revoke', 'restablecer']

handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler