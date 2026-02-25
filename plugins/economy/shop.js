// plugins/economy/shop.js
// Tienda de items

import { getUser, removeMoney, updateUser } from '../../lib/economy.js'

const items = [
  { id: 'fishing_rod', name: 'ᴄᴀñᴀ ᴅᴇ ᴘᴇsᴄᴀʀ', emoji: '🎣', price: 5000, desc: 'ᴘᴇsᴄᴀ ᴘᴀʀᴀ ɢᴀɴᴀʀ ᴅɪɴᴇʀᴏ' },
  { id: 'pickaxe', name: 'ᴘɪᴄᴏ ᴍᴇᴊᴏʀᴀᴅᴏ', emoji: '⛏️', price: 8000, desc: 'ᴍɪɴᴀ ᴍás ʀáᴘɪᴅᴏ' },
  { id: 'laptop', name: 'ʟᴀᴘᴛᴏᴘ ɢᴀᴍᴇʀ', emoji: '💻', price: 15000, desc: 'ᴛʀᴀʙᴀᴊᴀ ᴄᴏᴍᴏ ᴅᴇᴠ' },
  { id: 'car', name: 'ᴀᴜᴛᴏ ᴅᴇᴘᴏʀᴛɪᴠᴏ', emoji: '🏎️', price: 50000, desc: 'sᴛᴀᴛᴜs sʏᴍʙᴏʟ' },
  { id: 'mansion', name: 'ᴍᴀɴsɪóɴ', emoji: '🏰', price: 100000, desc: 'ʟᴀ ᴍᴇᴊᴏʀ ᴄᴀsᴀ' },
  { id: 'yacht', name: 'ʏᴀᴛᴇ', emoji: '🛥️', price: 250000, desc: 'ʟᴜᴊᴏ ᴇxᴛʀᴇᴍᴏ' }
]

let handler = async (m, { conn, args }) => {
  let userId = m.sender.split('@')[0]
  let user = getUser(userId)

  if (!args[0] || args[0] === 'list') {
    let text = `> . ﹡ ﹟ 🏪 ׄ ⬭ *¡ᴛɪᴇɴᴅᴀ ᴀsᴛᴀ!*

*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜💰* ㅤ֢ㅤ⸱ㅤᯭִ*
ׅㅤ𓏸𓈒ㅤׄ *ᴛᴜ ᴅɪɴᴇʀᴏ* :: $${user.balance.toLocaleString()}

`

    for (let item of items) {
      text += `*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜${item.emoji}* ㅤ֢ㅤ⸱ㅤᯭִ* ${item.name}
`
      text += `ׅㅤ𓏸𓈒ㅤׄ *ᴘʀᴇᴄɪᴏ* :: $${item.price.toLocaleString()}
`
      text += `ׅㅤ𓏸𓈒ㅤׄ *ɪᴅ* :: ${item.id}
`
      text += `ׅㅤ𓏸𓈒ㅤׄ *ᴅᴇsᴄ* :: ${item.desc}

`
    }

    text += `> ## \`ᴄᴏᴍᴘʀᴀʀ ⚔️\`
> .shop buy <id>`

    return conn.sendMessage(m.chat, { text, mentions: [m.sender] }, { quoted: m })
  }

  if (args[0] === 'buy' && args[1]) {
    let itemId = args[1].toLowerCase()
    let item = items.find(i => i.id === itemId)

    if (!item) {
      return conn.sendMessage(m.chat, {
        text: `> . ﹡ ﹟ ❌ ׄ ⬭ *¡ɪᴛᴇᴍ ɴᴏ ᴇɴᴄᴏɴᴛʀᴀᴅᴏ!*

*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜⚠️* ㅤ֢ㅤ⸱ㅤᯭִ*
ׅㅤ𓏸𓈒ㅤׄ *ᴜsᴏ* :: *.shop buy <id>*
ׅㅤ𓏸𓈒ㅤׄ *ᴠᴇʀ* :: *.shop list*`
      }, { quoted: m })
    }

    if (user.inventory.includes(itemId)) {
      return conn.sendMessage(m.chat, {
        text: `> . ﹡ ﹟ ❌ ׄ ⬭ *¡ʏᴀ ᴛɪᴇɴᴇs ᴇsᴛᴇ ɪᴛᴇᴍ!*`
      }, { quoted: m })
    }

    if (user.balance < item.price) {
      return conn.sendMessage(m.chat, {
        text: `> . ﹡ ﹟ ❌ ׄ ⬭ *¡sɪɴ ᴅɪɴᴇʀᴏ!*

*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜💸* ㅤ֢ㅤ⸱ㅤᯭִ*
ׅㅤ𓏸𓈒ㅤׄ *ɴᴇᴄᴇsɪᴛᴀs* :: $${item.price.toLocaleString()}
ׅㅤ𓏸𓈒ㅤׄ *ᴛɪᴇɴᴇs* :: $${user.balance.toLocaleString()}`
      }, { quoted: m })
    }

    removeMoney(userId, item.price)
    user.inventory.push(itemId)
    updateUser(userId, { inventory: user.inventory })

    return conn.sendMessage(m.chat, {
      text: `> . ﹡ ﹟ ✅ ׄ ⬭ *¡ᴄᴏᴍᴘʀᴀ ᴇxɪᴛᴏsᴀ!*

*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜${item.emoji}* ㅤ֢ㅤ⸱ㅤᯭִ*
ׅㅤ𓏸𓈒ㅤׄ *ɪᴛᴇᴍ* :: ${item.name}
ׅㅤ𓏸𓈒ㅤׄ *ᴘʀᴇᴄɪᴏ* :: $${item.price.toLocaleString()}

> ## \`ғᴇʟɪᴄɪᴅᴀᴅᴇs ⚔️\`
> ɪᴛᴇᴍ ᴀɢʀᴇɢᴀᴅᴏ ᴀ ᴛᴜ ɪɴᴠᴇɴᴛᴀʀɪᴏ`,
      mentions: [m.sender]
    }, { quoted: m })
  }

  // Inventario del usuario
  if (args[0] === 'inv' || args[0] === 'inventory') {
    let inv = user.inventory || []
    if (inv.length === 0) {
      return conn.sendMessage(m.chat, {
        text: `> . ﹡ ﹟ 📦 ׄ ⬭ *¡ɪɴᴠᴇɴᴛᴀʀɪᴏ ᴠᴀᴄɪ́ᴏ!*

*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜📭* ㅤ֢ㅤ⸱ㅤᯭִ*
ׅㅤ𓏸𓈒ㅤׄ *ᴇsᴛᴀᴅᴏ* :: ɴᴏ ᴛɪᴇɴᴇs ɪᴛᴇᴍs

> ## \`ᴄᴏᴍᴘʀᴀ ⚔️\`
> .shop list`
      }, { quoted: m })
    }

    let text = `> . ﹡ ﹟ 📦 ׄ ⬭ *¡ᴛᴜ ɪɴᴠᴇɴᴛᴀʀɪᴏ!*

`
    for (let itemId of inv) {
      let item = items.find(i => i.id === itemId)
      if (item) {
        text += `*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜${item.emoji}* ㅤ֢ㅤ⸱ㅤᯭִ* ${item.name}
`
      }
    }

    return conn.sendMessage(m.chat, { text, mentions: [m.sender] }, { quoted: m })
  }
}

handler.help = ['shop', 'tienda']
handler.tags = ['economy']
handler.command = ['shop', 'tienda', 'store']

export default handler