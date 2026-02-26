// plugins/gacha/topwaifus.js
// Ranking de coleccionistas
import { getAllInventories } from '../../lib/gacha.js'

let handler = async (m, { conn, args }) => {
  let allData = getAllInventories()
  
  // Calcular rankings
  let byCount = [...allData].sort((a, b) => b.count - a.count).slice(0, 10)
  let byValue = [...allData].sort((a, b) => b.totalValue - a.totalValue).slice(0, 10)
  let byRarity = [...allData].sort((a, b) => b.legendaries - a.legendaries).slice(0, 10)
  
  let page = args[0] || 'cantidad'
  
  let text = `> . ﹡ ﹟ 🏆 ׄ ⬭ *¡ʀᴀɴᴋɪɴɢ ᴅᴇ ᴄᴏʟᴇᴄᴄɪᴏɴɪsᴛᴀs!*
  
`
  
  if (page === 'cantidad' || page === 'count') {
    text += `*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜📦* ㅤ֢ㅤ⸱ㅤᯭִ* Por Cantidad\n`
    text += byCount.map((u, i) => {
      let medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`
      return `${medal} @${u.id} :: ${u.count} waifus`
    }).join('\n')
  } else if (page === 'valor' || page === 'value') {
    text += `*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜💎* ㅤ֢ㅤ⸱ㅤᯭִ* Por Valor Total\n`
    text += byValue.map((u, i) => {
      let medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`
      return `${medal} @${u.id} :: $${u.totalValue.toLocaleString()}`
    }).join('\n')
  } else if (page === 'rareza' || page === 'rarity') {
    text += `*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜⭐* ㅤ֢ㅤ⸱ㅤᯭִ* Por Legendarias\n`
    text += byRarity.map((u, i) => {
      let medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`
      return `${medal} @${u.id} :: ${u.legendaries} ⭐⭐⭐⭐⭐`
    }).join('\n')
  }
  
  text += `

> ## \`ᴄᴀᴛᴇɢᴏʀɪᴀs 📊\`
> • .topwaifus cantidad - Por cantidad
> • .topwaifus valor - Por valor total  
> • .topwaifus rareza - Por legendarias`
  
  let mentions = []
  if (page === 'cantidad') mentions = byCount.map(u => u.id + '@s.whatsapp.net')
  else if (page === 'valor') mentions = byValue.map(u => u.id + '@s.whatsapp.net')
  else mentions = byRarity.map(u => u.id + '@s.whatsapp.net')
  
  conn.sendMessage(m.chat, {
    text,
    mentions
  }, { quoted: m })
}

handler.help = ['topwaifus [cantidad/valor/rareza]']
handler.tags = ['gacha']
handler.command = ['topwaifus', 'topw', 'rankingwaifus', 'waifurank']

export default handler