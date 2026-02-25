// plugins/admin/unmute.js
// Quitar silencio a usuario

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

  let users = m.mentionedJid || []

  if (users.length === 0 && args[0]) {
    let num = args[0].replace(/\D/g, '')
    let participant = participants.find(p => p.id.split('@')[0] === num)
    if (participant) users.push(participant.id)
  }

  if (users.length === 0) {
    return conn.sendMessage(m.chat, {
      text: `> . ﹡ ﹟ 🔊 ׄ ⬭ *¡ᴅᴇsɪʟᴇɴᴄɪᴀʀ!*

*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜📋* ㅤ֢ㅤ⸱ㅤᯭִ*
ׅㅤ𓏸𓈒ㅤׄ *ᴜsᴏ* :: *.unmute @usuario*
ׅㅤ𓏸𓈒ㅤׄ *ᴀʟɪᴀs* :: *.dessilenciar*

> ## \`ɴᴏᴛᴀ ⚔️\`
> ǫᴜɪᴛᴀ ᴇʟ sɪʟᴇɴᴄɪᴏ ᴅᴇ ᴜɴ ᴜsᴜᴀʀɪᴏ`
    }, { quoted: m })
  }

  let res = []
  for (let user of users) {
    try {
      await conn.groupParticipantsUpdate(m.chat, [user], 'unrestrict')
      res.push(`🔊 @${user.split('@')[0]} ʏᴀ ᴘᴜᴇᴅᴇ ʜᴀʙʟᴀʀ`)
    } catch (e) {
      res.push(`❌ ᴇʀʀᴏʀ ᴄᴏɴ @${user.split('@')[0]}`)
    }
  }

  conn.sendMessage(m.chat, {
    text: `> . ﹡ ﹟ 🔊 ׄ ⬭ *¡sɪʟᴇɴᴄɪᴏ ʀᴇᴍᴏᴠɪᴅᴏ!*

*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜📊* ㅤ֢ㅤ⸱ㅤᯭִ*
${res.map(r => `ׅㅤ𓏸𓈒ㅤׄ ${r}`).join('\n')}`,
    mentions: users
  }, { quoted: m })
}

handler.help = ['unmute @usuario']
handler.tags = ['admin']
handler.command = ['unmute', 'dessilenciar']

handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler