// plugins/admin/listnum.js
// Listar números por prefijo de país

let handler = async (m, { conn, args, participants, isAdmin }) => {
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

  if (!args[0]) {
    return conn.sendMessage(m.chat, {
      text: `> . ﹡ ﹟ 📋 ׄ ⬭ *¡ʟɪsᴛᴀʀ ᴘᴏʀ ᴘᴀɪ́s!*

*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜📋* ㅤ֢ㅤ⸱ㅤᯭִ*
ׅㅤ𓏸𓈒ㅤׄ *ᴜsᴏ* :: *.listnum <prefijo>*
ׅㅤ𓏸𓈒ㅤׄ *ᴇᴊᴇᴍᴘʟᴏ* :: *.listnum 212*
ׅㅤ𓏸𓈒ㅤׄ *ᴀʟɪᴀs* :: *.listanum*

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

  let matched = participants.filter(p => p.id.split('@')[0].startsWith(prefix))

  if (matched.length === 0) {
    return conn.sendMessage(m.chat, {
      text: `> . ﹡ ﹟ ❌ ׄ ⬭ *¡sɪɴ ʀᴇsᴜʟᴛᴀᴅᴏs!*

*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜🔍* ㅤ֢ㅤ⸱ㅤᯭִ*
ׅㅤ𓏸𓈒ㅤׄ *ᴘʀᴇғɪᴊᴏ* :: +${prefix}
ׅㅤ𓏸𓈒ㅤׄ *ᴇsᴛᴀᴅᴏ* :: ɴᴏ ʜᴀʏ ᴍɪᴇᴍʙʀᴏs ᴄᴏɴ ᴇsᴛᴇ ᴘʀᴇғɪᴊᴏ`
    }, { quoted: m })
  }

  let list = matched.map((p, i) => {
    let num = p.id.split('@')[0]
    let isAdmin = p.admin ? (p.admin === 'superadmin' ? '👑' : '🛡️') : '👤'
    return `ׅㅤ𓏸𓈒ㅤׄ *${i + 1}.* ${isAdmin} @${num}`
  }).join('\n')

  conn.sendMessage(m.chat, {
    text: `> . ﹡ ﹟ 📋 ׄ ⬭ *¡ᴍɪᴇᴍʙʀᴏs ᴇɴᴄᴏɴᴛʀᴀᴅᴏs!*

*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜🌍* ㅤ֢ㅤ⸱ㅤᯭִ*
ׅㅤ𓏸𓈒ㅤׄ *ᴘʀᴇғɪᴊᴏ* :: +${prefix}
ׅㅤ𓏸𓈒ㅤׄ *ᴛᴏᴛᴀʟ* :: ${matched.length} ᴍɪᴇᴍʙʀᴏs

${list}

> ## \`ʟᴇʏᴇɴᴅᴀ ⚔️\`
> 👑 = ᴄʀᴇᴀᴅᴏʀ
> 🛡️ = ᴀᴅᴍɪɴ
> 👤 = ᴍɪᴇᴍʙʀᴏ`,
    mentions: matched.map(p => p.id)
  }, { quoted: m })
}

handler.help = ['listnum <prefijo>']
handler.tags = ['admin']
handler.command = ['listnum', 'listanum']

handler.group = true
handler.admin = true

export default handler