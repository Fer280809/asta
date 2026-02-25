// plugins/admin/admins.js
// Mencionar a todos los administradores

let handler = async (m, { conn, args, participants, isGroup }) => {
  if (!isGroup) {
    return conn.sendMessage(m.chat, {
      text: `> . ﹡ ﹟ ⚠️ ׄ ⬭ *¡ᴀᴛᴇɴᴄɪᴏ́ɴ!*

*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜🚫* ㅤ֢ㅤ⸱ㅤᯭִ*
ׅㅤ𓏸𓈒ㅤׄ *ᴇʀʀᴏʀ* :: ${global.msj?.soloGrupo || '👥 Solo en grupos'}`
    }, { quoted: m })
  }

  let admins = participants.filter(p => p.admin === 'admin' || p.admin === 'superadmin')

  if (admins.length === 0) {
    return conn.sendMessage(m.chat, {
      text: `> . ﹡ ﹟ ⚠️ ׄ ⬭ *¡sɪɴ ᴀᴅᴍɪɴs!*

*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜🤷* ㅤ֢ㅤ⸱ㅤᯭִ*
ׅㅤ𓏸𓈒ㅤׄ *ᴇsᴛᴀᴅᴏ* :: ɴᴏ ʜᴀʏ ᴀᴅᴍɪɴɪsᴛʀᴀᴅᴏʀᴇs ᴇɴ ᴇʟ ɢʀᴜᴘᴏ`
    }, { quoted: m })
  }

  let message = args.join(' ') || 'ʟʟᴀᴍᴀᴅᴏ ᴀ ᴀᴅᴍɪɴɪsᴛʀᴀᴅᴏʀᴇs 📢'
  let adminList = admins.map(a => `ׅㅤ𓏸𓈒ㅤׄ 👑 @${a.id.split('@')[0]}`).join('\n')

  let mentions = admins.map(a => a.id)
  mentions.push(m.sender)

  conn.sendMessage(m.chat, {
    text: `> . ﹡ ﹟ 📢 ׄ ⬭ *¡ʟʟᴀᴍᴀᴅᴏ ᴀ ᴀᴅᴍɪɴs!*

*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜📣* ㅤ֢ㅤ⸱ㅤᯭִ*
ׅㅤ𓏸𓈒ㅤׄ *ᴅᴇ* :: @${m.sender.split('@')[0]}
ׅㅤ𓏸𓈒ㅤׄ *ᴍᴇɴsᴀᴊᴇ* :: ${message}

*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜👑* ㅤ֢ㅤ⸱ㅤᯭִ*
${adminList}

> ## \`ᴀᴅᴍɪɴɪsᴛʀᴀᴅᴏʀᴇs ⚔️\`
> ᴘᴏʀ ғᴀᴠᴏʀ ʀᴇsᴘᴏɴᴅᴀɴ ᴀʟ ᴍᴇɴsᴀᴊᴇ`,
    mentions: mentions
  }, { quoted: m })
}

handler.help = ['admins [mensaje]']
handler.tags = ['group']
handler.command = ['admins', '@admins']

handler.group = true

export default handler