// plugins/admin/mute.js
// Silenciar usuario temporalmente

let mutedUsers = new Map()

function parseTime(timeStr) {
  if (!timeStr) return 60000
  const match = timeStr.match(/^(\d+)([smhd])$/)
  if (!match) return null

  const [, num, unit] = match
  const multipliers = { s: 1000, m: 60000, h: 3600000, d: 86400000 }
  return parseInt(num) * multipliers[unit]
}

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
      text: `> . ﹡ ﹟ 🔇 ׄ ⬭ *¡sɪʟᴇɴᴄɪᴀʀ ᴜsᴜᴀʀɪᴏ!*

*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜📋* ㅤ֢ㅤ⸱ㅤᯭִ*
ׅㅤ𓏸𓈒ㅤׄ *ᴜsᴏ* :: *.mute @usuario [tiempo]*
ׅㅤ𓏸𓈒ㅤׄ *ᴇᴊᴇᴍᴘʟᴏ* :: *.mute @user 10m*
ׅㅤ𓏸𓈒ㅤׄ *ᴜɴɪᴅᴀᴅᴇs* :: s (sᴇɢ), ᴍ (ᴍɪɴ), ʜ (ʜᴏʀᴀ), ᴅ (ᴅɪ́ᴀ)
ׅㅤ𓏸𓈒ㅤׄ *ᴀʟɪᴀs* :: *.silenciar*

> ## \`ɴᴏᴛᴀ ⚔️\`
> sɪ ɴᴏ ᴇsᴘᴇᴄɪғɪᴄᴀs ᴛɪᴇᴍᴘᴏ, sᴇʀᴀ́ 1 ᴍɪɴᴜᴛᴏ`
    }, { quoted: m })
  }

  let timeArg = args.find(arg => /^\d+[smhd]$/.test(arg))
  let duration = parseTime(timeArg) || 60000

  if (!timeArg) {
    duration = 60000
  }

  let timeText = ''
  if (duration < 60000) timeText = `${duration/1000}s`
  else if (duration < 3600000) timeText = `${duration/60000}m`
  else if (duration < 86400000) timeText = `${duration/3600000}h`
  else timeText = `${duration/86400000}d`

  let res = []
  for (let user of users) {
    try {
      await conn.groupParticipantsUpdate(m.chat, [user], 'restrict')

      let key = `${m.chat}-${user}`
      mutedUsers.set(key, true)

      setTimeout(async () => {
        try {
          await conn.groupParticipantsUpdate(m.chat, [user], 'unrestrict')
          mutedUsers.delete(key)
          conn.sendMessage(m.chat, {
            text: `> . ﹡ ﹟ 🔊 ׄ ⬭ *¡ᴛɪᴇᴍᴘᴏ ᴄᴜᴍᴘʟɪᴅᴏ!*

*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜⏰* ㅤ֢ㅤ⸱ㅤᯭִ*
ׅㅤ𓏸𓈒ㅤׄ *ᴜsᴜᴀʀɪᴏ* :: @${user.split('@')[0]}
ׅㅤ𓏸𓈒ㅤׄ *ᴀᴄᴄɪᴏ́ɴ* :: sɪʟᴇɴᴄɪᴏ ʀᴇᴍᴏᴠɪᴅᴏ ✅`,
            mentions: [user]
          })
        } catch (e) {}
      }, duration)

      res.push(`🔇 @${user.split('@')[0]} sɪʟᴇɴᴄɪᴀᴅᴏ ᴘᴏʀ ${timeText}`)
    } catch (e) {
      res.push(`❌ ᴇʀʀᴏʀ ᴄᴏɴ @${user.split('@')[0]}`)
    }
  }

  conn.sendMessage(m.chat, {
    text: `> . ﹡ ﹟ 🔇 ׄ ⬭ *¡ᴜsᴜᴀʀɪᴏ sɪʟᴇɴᴄɪᴀᴅᴏ!*

*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜⏱️* ㅤ֢ㅤ⸱ㅤᯭִ*
${res.map(r => `ׅㅤ𓏸𓈒ㅤׄ ${r}`).join('\n')}
ׅㅤ𓏸𓈒ㅤׄ *ᴅᴜʀᴀᴄɪᴏ́ɴ* :: ${timeText}

> ## \`ᴀᴅᴠᴇʀᴛᴇɴᴄɪᴀ ⚔️\`
> ᴇʟ sɪʟᴇɴᴄɪᴏ sᴇ ʀᴇᴍᴏᴠᴇʀᴀ́ ᴀᴜᴛᴏᴍᴀ́ᴛɪᴄᴀᴍᴇɴᴛᴇ`,
    mentions: users
  }, { quoted: m })
}

handler.help = ['mute @usuario [tiempo]']
handler.tags = ['admin']
handler.command = ['mute', 'silenciar']

handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler