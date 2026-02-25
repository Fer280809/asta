// plugins/admin/kicknum.js
// Expulsar por código de país

let kickNumActive = new Map()

let handler = async (m, { conn, args, participants, isAdmin, isBotAdmin }) => {
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

  if (!args[0]) {
    return conn.sendMessage(m.chat, {
      text: `> . ﹡ ﹟ 🌍 ׄ ⬭ *¡ᴇxᴘᴜʟsɪᴏ́ɴ ᴘᴏʀ ᴘᴀɪ́s!*

*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜📋* ㅤ֢ㅤ⸱ㅤᯭִ*
ׅㅤ𓏸𓈒ㅤׄ *ᴜsᴏ* :: *.kicknum <prefijo>*
ׅㅤ𓏸𓈒ㅤׄ *ᴇᴊᴇᴍᴘʟᴏ* :: *.kicknum 212*
ׅㅤ𓏸𓈒ㅤׄ *ᴘᴀʀᴀ ᴅᴇᴛᴇɴᴇʀ* :: *.stopkicknum*

> ## \`ᴇᴊᴇᴍᴘʟᴏs ᴅᴇ ᴘʀᴇғɪᴊᴏs ⚔️\`
> • 212 - ᴍᴀʀʀᴜᴇᴄᴏs
> • 92 - ᴘᴀᴋɪsᴛᴀ́ɴ
> • 1 - ᴇᴇ.ᴜᴜ/ᴄᴀɴᴀᴅᴀ́
> • 52 - ᴍᴇ́xɪᴄᴏ`
    }, { quoted: m })
  }

  let prefix = args[0].replace(/\D/g, '')
  if (!prefix) {
    return conn.sendMessage(m.chat, {
      text: `> . ﹡ ﹟ ❌ ׄ ⬭ *¡ᴇʀʀᴏʀ!*

*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜⚠️* ㅤ֢ㅤ⸱ㅤᯭִ*
ׅㅤ𓏸𓈒ㅤׄ *ᴅᴇᴛᴀʟʟᴇ* :: ᴘʀᴇғɪᴊᴏ ɪɴᴠᴀ́ʟɪᴅᴏ`
    }, { quoted: m })
  }

  let admins = participants.filter(p => p.admin === 'admin' || p.admin === 'superadmin').map(p => p.id)
  let toKick = participants.filter(p => {
    let num = p.id.split('@')[0]
    return num.startsWith(prefix) && !admins.includes(p.id) && p.id !== conn.user.jid
  })

  if (toKick.length === 0) {
    return conn.sendMessage(m.chat, {
      text: `> . ﹡ ﹟ ❌ ׄ ⬭ *¡sɪɴ ʀᴇsᴜʟᴛᴀᴅᴏs!*

*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜🔍* ㅤ֢ㅤ⸱ㅤᯭִ*
ׅㅤ𓏸𓈒ㅤׄ *ᴘʀᴇғɪᴊᴏ* :: +${prefix}
ׅㅤ𓏸𓈒ㅤׄ *ᴇsᴛᴀᴅᴏ* :: ɴᴏ sᴇ ᴇɴᴄᴏɴᴛʀᴀʀᴏɴ ᴍɪᴇᴍʙʀᴏs

> ## \`ɴᴏᴛᴀ ⚔️\`
> ɴᴏ sᴇ ᴘᴜᴇᴅᴇ ᴇxᴘᴜʟsᴀʀ ᴀᴅᴍɪɴs ɴɪ ᴀʟ ʙᴏᴛ`
    }, { quoted: m })
  }

  kickNumActive.set(m.chat, true)

  conn.sendMessage(m.chat, {
    text: `> . ﹡ ﹟ 🚀 ׄ ⬭ *¡ɪɴɪᴄɪᴀɴᴅᴏ ᴇxᴘᴜʟsɪᴏ́ɴ!*

*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜🌍* ㅤ֢ㅤ⸱ㅤᯭִ*
ׅㅤ𓏸𓈒ㅤׄ *ᴘʀᴇғɪᴊᴏ* :: +${prefix}
ׅㅤ𓏸𓈒ㅤׄ *ᴏʙᴊᴇᴛɪᴠᴏ* :: ${toKick.length} ᴍɪᴇᴍʙʀᴏs
ׅㅤ𓏸𓈒ㅤׄ *ᴘᴀʀᴀ ᴅᴇᴛᴇɴᴇʀ* :: *.stopkicknum*

> ## \`ᴘʀᴏᴄᴇsᴀɴᴅᴏ... ⚔️\``
  }, { quoted: m })

  let kicked = 0
  let failed = 0

  for (let user of toKick) {
    if (!kickNumActive.get(m.chat)) {
      conn.sendMessage(m.chat, {
        text: `> . ﹡ ﹟ 🛑 ׄ ⬭ *¡ᴘʀᴏᴄᴇsᴏ ᴅᴇᴛᴇɴɪᴅᴏ!*

*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜📊* ㅤ֢ㅤ⸱ㅤᯭִ*
ׅㅤ𓏸𓈒ㅤׄ *ᴇxᴘᴜʟsᴀᴅᴏs* :: ${kicked}
ׅㅤ𓏸𓈒ㅤׄ *ғᴀʟʟɪᴅᴏs* :: ${failed}
ׅㅤ𓏸𓈒ㅤׄ *ᴘᴇɴᴅɪᴇɴᴛᴇs* :: ${toKick.length - kicked - failed}`
      }, { quoted: m })
      return
    }

    try {
      await conn.groupParticipantsUpdate(m.chat, [user.id], 'remove')
      kicked++
      await new Promise(r => setTimeout(r, 1000))
    } catch (e) {
      failed++
    }
  }

  kickNumActive.delete(m.chat)

  conn.sendMessage(m.chat, {
    text: `> . ﹡ ﹟ ✅ ׄ ⬭ *¡ᴇxᴘᴜʟsɪᴏ́ɴ ᴄᴏᴍᴘʟᴇᴛᴀ!*

*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜📊* ㅤ֢ㅤ⸱ㅤᯭִ*
ׅㅤ𓏸𓈒ㅤׄ *ᴘʀᴇғɪᴊᴏ* :: +${prefix}
ׅㅤ𓏸𓈒ㅤׄ *ᴇxᴘᴜʟsᴀᴅᴏs* :: ${kicked} ✅
ׅㅤ𓏸𓈒ㅤׄ *ғᴀʟʟɪᴅᴏs* :: ${failed} ❌
ׅㅤ𓏸𓈒ㅤׄ *ᴛᴏᴛᴀʟ* :: ${toKick.length} ᴍɪᴇᴍʙʀᴏs`
  }, { quoted: m })
}

handler.help = ['kicknum <prefijo>']
handler.tags = ['admin']
handler.command = ['kicknum']

handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler
export { kickNumActive }