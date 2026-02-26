// plugins/gacha/invgacha.js
// Alias de inventario con nombre alternativo
import { getInventory, formatWaifuList } from '../../lib/gacha.js'

let handler = async (m, { conn, args }) => {
  let target = (m.mentionedJid && m.mentionedJid[0]) || m.sender
  let userId = target.split('@')[0]
  
  let inventory = getInventory(userId)
  
  if (inventory.length === 0) {
    return conn.sendMessage(m.chat, {
      text: `> . ﹡ ﹟ 📦 ׄ ⬭ *¡Inventario Vacío!*
      
*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜👤* ㅤ֢ㅤ⸱ㅤᯭִ*
ׅㅤ𓏸𓈒ㅤׄ *ᴜsᴜᴀʀɪᴏ* :: @${userId}
ׅㅤ𓏸𓈒ㅤׄ *ᴡᴀɪғᴜs* :: 0
ׅㅤ𓏸𓈒ㅤׄ *ᴠᴀʟᴏʀ* :: $0

> ## \`sᴜɢᴇʀᴇɴᴄɪᴀ 💡\`
> • .gacha - Invocar waifus
> • .waifustore - Comprar específicas`,
      mentions: [target]
    }, { quoted: m })
  }
  
  // Calcular estadísticas
  let totalValue = inventory.reduce((sum, w) => sum + (w.value || 0), 0)
  let rarityCount = {}
  inventory.forEach(w => {
    if (w.rarity && w.rarity.name) {
      rarityCount[w.rarity.name] = (rarityCount[w.rarity.name] || 0) + 1
    }
  })
  
  // Paginación
  let page = parseInt(args[0]) || 1
  let perPage = 5
  let totalPages = Math.ceil(inventory.length / perPage)
  let start = (page - 1) * perPage
  let end = start + perPage
  let pageItems = inventory.slice(start, end)
  
  let statsText = Object.entries(rarityCount)
    .map(([rarity, count]) => `ׅㅤ𓏸𓈒ㅤׄ ${rarity} :: x${count}`)
    .join('\n')
  
  let listText = pageItems.map((w, i) => {
    let rarityIcon = w.rarity ? w.rarity.name.split(' ')[0] : '⭐'
    let lockIcon = w.locked ? '🔒' : ''
    let favIcon = w.favorite ? '⭐' : ''
    return `${start + i + 1}. ${rarityIcon} ${lockIcon}${favIcon} ${w.name} | ${w.series} | $${(w.value || 0).toLocaleString()}`
  }).join('\n')
  
  let text = `> . ﹡ ﹟ 📦 ׄ ⬭ *¡ɪɴᴠᴇɴᴛᴀʀɪᴏ ᴅᴇ ᴡᴀɪғᴜs!*
  
*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜👤* ㅤ֢ㅤ⸱ㅤᯭִ*
ׅㅤ𓏸𓈒ㅤׄ *ᴅᴜᴇñᴏ* :: @${userId}
ׅㅤ𓏸𓈒ㅤׄ *ᴛᴏᴛᴀʟ* :: ${inventory.length} waifus
ׅㅤ𓏸𓈒ㅤׄ *ᴠᴀʟᴏʀ* :: $${totalValue.toLocaleString()}
*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜📊* ㅤ֢ㅤ⸱ㅤᯭִ*
${statsText}
*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜📋* ㅤ֢ㅤ⸱ㅤᯭִ* (Pág. ${page}/${totalPages})
${listText}

> ## \`ʟᴇʏᴇɴᴅᴀ 🔑\`
> • 🔒 = Protegida | ⭐ = Favorita

> ## \`ᴄᴏᴍᴀɴᴅᴏs ⚔️\`
> • .inv [página] - Cambiar página
> • .waifuinfo [número] - Ver detalles
> • .sell [número] - Vender
> • .trade @user [número] - Intercambiar`
  
  conn.sendMessage(m.chat, {
    text,
    mentions: [target]
  }, { quoted: m })
}

handler.help = ['invgacha [página]', 'ginv']
handler.tags = ['gacha']
handler.command = ['invgacha', 'ginv', 'gachainv']

export default handler