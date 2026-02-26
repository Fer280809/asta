// plugins/gacha/waifustore.js
// Tienda para comprar waifus específicas
import { getUser, updateUser } from '../../lib/economy.js'
import { addWaifu } from '../../lib/gacha.js'
import fetch from 'node-fetch'

// Stock de la tienda (se regenera cada hora)
global.waifuStore = global.waifuStore || {
  lastUpdate: 0,
  stock: []
}

const STORE_PRICES = {
  COMMON: 150,
  UNCOMMON: 300,
  RARE: 800,
  EPIC: 2500,
  LEGENDARY: 10000,
  MYTHIC: 50000
}

async function refreshStock() {
  let now = Date.now()
  if (now - global.waifuStore.lastUpdate > 3600000) { // 1 hora
    try {
      let response = await fetch('https://safebooru.org/index.php?page=dapi&s=post&q=index&json=1&limit=20&tags=rating:general')
      let data = await response.json()
      
      global.waifuStore.stock = data.map(post => {
        let rarity = determineStoreRarity()
        return {
          id: 'store_' + post.id,
          image: post.file_url,
          preview: post.preview_url,
          name: extractName(post.tags),
          series: extractSeries(post.tags),
          rarity: rarity,
          price: STORE_PRICES[rarity],
          tags: post.tags
        }
      }).slice(0, 8) // 8 waifus en stock
      
      global.waifuStore.lastUpdate = now
    } catch (e) {
      console.error('Error refrescando tienda:', e)
    }
  }
}

function determineStoreRarity() {
  let rand = Math.random() * 100
  if (rand < 40) return 'COMMON'
  if (rand < 70) return 'UNCOMMON'
  if (rand < 90) return 'RARE'
  if (rand < 98) return 'EPIC'
  if (rand < 99.9) return 'LEGENDARY'
  return 'MYTHIC'
}

function extractName(tags) {
  let tagList = tags.split(' ')
  let names = ['Sakura', 'Hana', 'Yuki', 'Aoi', 'Rei', 'Mio', 'Rin', 'Len']
  let charTag = tagList.find(t => t.includes('(') || names.some(n => t.toLowerCase().includes(n.toLowerCase())))
  return charTag ? charTag.replace(/_/g, ' ').replace(/\(.*/, '').trim() : names[Math.floor(Math.random() * names.length)]
}

function extractSeries(tags) {
  let seriesList = ['Genshin Impact', 'Blue Archive', 'Fate', 'Re:Zero', 'Vocaloid', 'Touhou', 'Original']
  let tagList = tags.split(' ')
  let found = seriesList.find(s => tagList.some(t => t.toLowerCase().includes(s.toLowerCase().replace(' ', '_'))))
  return found || 'Original'
}

let handler = async (m, { conn, args, command }) => {
  let userId = m.sender.split('@')[0]
  let user = getUser(userId)
  
  await refreshStock()
  
  if (command === 'waifustore' || command === 'wstore' || command === 'tienda') {
    // Mostrar tienda
    let stock = global.waifuStore.stock
    
    let listText = stock.map((w, i) => {
      let rarityStars = w.rarity === 'COMMON' ? '⭐' : 
                       w.rarity === 'UNCOMMON' ? '⭐⭐' :
                       w.rarity === 'RARE' ? '⭐⭐⭐' :
                       w.rarity === 'EPIC' ? '⭐⭐⭐⭐' :
                       w.rarity === 'LEGENDARY' ? '⭐⭐⭐⭐⭐' : '✨🌟'
      return `${i + 1}. ${rarityStars} ${w.name} | ${w.series} | $${w.price.toLocaleString()}`
    }).join('\n')
    
    let text = `> . ﹡ ﹟ 🏪 ׄ ⬭ *¡ᴛɪᴇɴᴅᴀ ᴅᴇ ᴡᴀɪғᴜs!*
    
*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜💰* ㅤ֢ㅤ⸱ㅤᯭִ*
ׅㅤ𓏸𓈒ㅤׄ *ᴛᴜ sᴀʟᴅᴏ* :: $${user.balance.toLocaleString()}
*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜📦* ㅤ֢ㅤ⸱ㅤᯭִ* (Se renueva cada hora)
${listText}

> ## \`ᴘʀᴇᴄɪᴏs 💎\`
> • ⭐ Común :: $150
> • ⭐⭐ Poco Común :: $300  
> • ⭐⭐⭐ Rara :: $800
> • ⭐⭐⭐⭐ Épica :: $2,500
> • ⭐⭐⭐⭐⭐ Legendaria :: $10,000
> • ✨🌟 Mítica :: $50,000

> ## \`ᴄᴏᴍᴀɴᴅᴏs ⚔️\`
> • .buywaifu [número] - Comprar
> • .viewwaifu [número] - Ver imagen`

    conn.sendMessage(m.chat, {
      text,
      mentions: [m.sender]
    }, { quoted: m })
    
  } else if (command === 'buywaifu' || command === 'buy' || command === 'comprar') {
    // Comprar waifu
    let index = parseInt(args[0]) - 1
    
    if (isNaN(index) || index < 0 || index >= global.waifuStore.stock.length) {
      return conn.sendMessage(m.chat, {
        text: `> . ﹡ ﹟ ❌ ׄ ⬭ *¡Número inválido!*
        
> ## \`ᴜsᴏ 📝\`
> • .buywaifu [número]
> • .waifustore - Ver stock`,
        mentions: [m.sender]
      }, { quoted: m })
    }
    
    let waifu = global.waifuStore.stock[index]
    
    if (user.balance < waifu.price) {
      return conn.sendMessage(m.chat, {
        text: `> . ﹡ ﹟ ❌ ׄ ⬭ *¡Fondos insuficientes!*
        
*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜💸* ㅤ֢ㅤ⸱ㅤᯭִ*
ׅㅤ𓏸𓈒ㅤׄ *ɴᴇᴄᴇsɪᴛᴀs* :: $${waifu.price.toLocaleString()}
ׅㅤ𓏸𓈒ㅤׄ *ᴛɪᴇɴᴇs* :: $${user.balance.toLocaleString()}
ׅㅤ𓏸𓈒ㅤׄ *ғᴀʟᴛᴀ* :: $${(waifu.price - user.balance).toLocaleString()}`,
        mentions: [m.sender]
      }, { quoted: m })
    }
    
    // Descontar y entregar
    updateUser(userId, { balance: user.balance - waifu.price })
    
    let waifuData = {
      id: waifu.id,
      image: waifu.image,
      preview: waifu.preview,
      name: waifu.name,
      series: waifu.series,
      rarity: { name: waifu.rarity.replace('_', ' '), color: '#FFD700' },
      value: Math.floor(waifu.price * 1.2),
      tags: waifu.tags,
      acquired: Date.now()
    }
    
    addWaifu(userId, waifuData)
    
    // Eliminar del stock
    global.waifuStore.stock.splice(index, 1)
    
    let text = `> . ﹡ ﹟ ✅ ׄ ⬭ *¡ᴄᴏᴍᴘʀᴀ ᴇxɪᴛᴏsᴀ!*
    
*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜💸* ㅤ֢ㅤ⸱ㅤᯭִ*
ׅㅤ𓏸𓈒ㅤׄ *ᴘᴀɢᴀᴅᴏ* :: $${waifu.price.toLocaleString()}
ׅㅤ𓏸𓈒ㅤׄ *sᴀʟᴅᴏ* :: $${(user.balance - waifu.price).toLocaleString()}
*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜👤* ㅤ֢ㅤ⸱ㅤᯭִ*
ׅㅤ𓏸𓈒ㅤׄ *ɴᴏᴍʙʀᴇ* :: ${waifu.name}
ׅㅤ𓏸𓈒ㅤׄ *sᴇʀɪᴇ* :: ${waifu.series}
ׅㅤ𓏸𓈒ㅤׄ *ʀᴀʀᴇᴢᴀ* :: ${waifu.rarity}

> ## \`ᴄᴏᴍᴀɴᴅᴏs ⚔️\`
> • .inv - Ver inventario
> • .waifustore - Seguir comprando`

    await conn.sendMessage(m.chat, {
      image: { url: waifu.image },
      caption: text,
      mentions: [m.sender]
    }, { quoted: m })
    
  } else if (command === 'viewwaifu' || command === 'vw') {
    // Ver imagen de waifu en tienda
    let index = parseInt(args[0]) - 1
    
    if (isNaN(index) || index < 0 || index >= global.waifuStore.stock.length) {
      return conn.sendMessage(m.chat, {
        text: `> . ﹡ ﹟ ❌ ׄ ⬭ *¡Número inválido!*`,
        mentions: [m.sender]
      }, { quoted: m })
    }
    
    let waifu = global.waifuStore.stock[index]
    
    conn.sendMessage(m.chat, {
      image: { url: waifu.image },
      caption: `> . ﹡ ﹟ 👁️ ׄ ⬭ *${waifu.name}*
      
Rareza: ${waifu.rarity}
Precio: $${waifu.price.toLocaleString()}
Serie: ${waifu.series}

> .buywaifu ${index + 1} - Comprar esta waifu`
    }, { quoted: m })
  }
}

handler.help = ['waifustore', 'buywaifu [número]', 'viewwaifu [número]']
handler.tags = ['gacha']
handler.command = ['waifustore', 'wstore', 'tienda', 'buywaifu', 'buy', 'comprar', 'viewwaifu', 'vw']

export default handler