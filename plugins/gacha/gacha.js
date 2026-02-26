// plugins/gacha/gacha.js
// Sistema de invocación con Safebooru API
import { getUser, updateUser } from '../../lib/economy.js'
import fetch from 'node-fetch'

// Sistema de rarezas
const RARITIES = {
  COMMON: { name: '⭐ Común', chance: 50, color: '#9E9E9E', multiplier: 1 },
  UNCOMMON: { name: '⭐⭐ Poco Común', chance: 30, color: '#4CAF50', multiplier: 2 },
  RARE: { name: '⭐⭐⭐ Rara', chance: 15, color: '#2196F3', multiplier: 5 },
  EPIC: { name: '⭐⭐⭐⭐ Épica', chance: 4, color: '#9C27B0', multiplier: 10 },
  LEGENDARY: { name: '⭐⭐⭐⭐⭐ Legendaria', chance: 0.9, color: '#FF9800', multiplier: 50 },
  MYTHIC: { name: '✨🌟 Mítica', chance: 0.1, color: '#FFD700', multiplier: 200 }
}

// Waifus de respaldo locales (imágenes confiables)
const BACKUP_WAIFUS = [
  { name: 'Hatsune Miku', series: 'Vocaloid', image: 'https://safebooru.org/images/4142/d0127f50f49f5d6c5023030b97ffb2f1180fd75c.jpg', tags: '1girl, twintails, aqua_hair' },
  { name: 'Sakura', series: 'Original', image: 'https://safebooru.org/images/4142/ca373c1a5a933f25ad26a6da109d7d8fc09e4dc1.jpg', tags: '1girl, pink_hair, school_uniform' },
  { name: 'Hifumi', series: 'Blue Archive', image: 'https://safebooru.org/images/4142/a66e0b84a48e5fe4d19b219811594080bc366e79.png', tags: '1girl, brown_hair, halo' },
  { name: 'Shiroko', series: 'Blue Archive', image: 'https://safebooru.org/images/4142/346bcfd013b014828c7cfe10d5d04c90a497384c.jpg', tags: '1girl, grey_hair, wolf_ears' },
  { name: 'Nahida', series: 'Genshin Impact', image: 'https://safebooru.org/images/4142/ca373c1a5a933f25ad26a6da109d7d8fc09e4dc1.jpg', tags: '1girl, green_hair, elf' }
]

// Costos de invocación
const COSTS = {
  single: 100,
  multi: 900
}

let handler = async (m, { conn, args, command }) => {
  let userId = m.sender.split('@')[0]
  let user = getUser(userId)
  
  // Detectar tipo de invocación
  let isMulti = command === 'multigacha' || command === 'mgacha' || args[0] === '10'
  let isRW = command === 'rw' || command === 'reroll' // rw hace lo mismo que gacha
  
  let cost = isMulti ? COSTS.multi : COSTS.single
  let rolls = isMulti ? 10 : 1
  
  // Verificar dinero
  if (user.balance < cost) {
    return conn.sendMessage(m.chat, {
      text: `> . ﹡ ﹟ ❌ ׄ ⬭ *¡Fondos Insuficientes!*
      
*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜💸* ㅤ֢ㅤ⸱ㅤᯭִ*
ׅㅤ𓏸𓈒ㅤׄ *ɴᴇᴄᴇsɪᴛᴀs* :: $${cost.toLocaleString()}
ׅㅤ𓏸𓈒ㅤׄ *ᴛɪᴇɴᴇs* :: $${user.balance.toLocaleString()}
ׅㅤ𓏸𓈒ㅤׄ *ғᴀʟᴛᴀ* :: $${(cost - user.balance).toLocaleString()}

> ## \`sᴜɢᴇʀᴇɴᴄɪᴀ 💡\`
> • .daily - Recompensa diaria
> • .work - Trabajar para ganar`,
      mentions: [m.sender]
    }, { quoted: m })
  }
  
  // Descontar dinero
  updateUser(userId, { balance: user.balance - cost })
  
  // Realizar invocaciones
  let results = []
  let totalValue = 0
  
  for (let i = 0; i < rolls; i++) {
    let waifu = await summonWaifu()
    results.push(waifu)
    totalValue += waifu.value
  }
  
  // Mostrar resultados
  if (isMulti) {
    await sendMultiResults(conn, m, results, cost, totalValue)
  } else {
    await sendSingleResult(conn, m, results[0], cost, isRW)
  }
  
  // Guardar en inventario temporal para claim
  global.gachaTemp = global.gachaTemp || {}
  global.gachaTemp[userId] = {
    waifus: results,
    timestamp: Date.now(),
    cost: cost
  }
}

async function summonWaifu() {
  try {
    // Tags aleatorios para variedad
    const tags = ['1girl', 'solo', 'cute', 'beautiful', 'anime_girl']
    const randomTag = tags[Math.floor(Math.random() * tags.length)]
    
    // Intentar obtener de Safebooru con timeout
    let controller = new AbortController()
    let timeout = setTimeout(() => controller.abort(), 5000)
    
    let response = await fetch(`https://safebooru.org/index.php?page=dapi&s=post&q=index&json=1&limit=100&tags=${randomTag}_rating:general`, {
      signal: controller.signal
    }).catch(() => null)
    
    clearTimeout(timeout)
    
    if (!response || !response.ok) {
      throw new Error('API no responde')
    }
    
    let data = await response.json().catch(() => null)
    
    if (!data || !Array.isArray(data) || data.length === 0) {
      throw new Error('Datos inválidos')
    }
    
    let post = data[Math.floor(Math.random() * data.length)]
    
    // Verificar que la imagen existe
    let imgCheck = await fetch(post.file_url, { method: 'HEAD' }).catch(() => null)
    if (!imgCheck || !imgCheck.ok) {
      throw new Error('Imagen no accesible')
    }
    
    // Determinar rareza
    let rarity = determineRarity()
    
    // Calcular valor base
    let baseValue = Math.floor(Math.random() * 100) + 50
    let value = Math.floor(baseValue * rarity.multiplier)
    
    // Extraer nombre de personaje de los tags
    let characterName = extractCharacterName(post.tags)
    let series = extractSeries(post.tags)
    
    return {
      id: post.id,
      image: post.file_url,
      preview: post.preview_url,
      name: characterName,
      series: series,
      rarity: rarity,
      value: value,
      tags: post.tags.split(' ').slice(0, 5).join(', '),
      width: post.width,
      height: post.height
    }
    
  } catch (error) {
    console.log('Usando waifu de respaldo:', error.message)
    // Waifu de respaldo aleatoria
    let backup = BACKUP_WAIFUS[Math.floor(Math.random() * BACKUP_WAIFUS.length)]
    let rarity = determineRarity()
    let value = Math.floor((Math.random() * 100 + 50) * rarity.multiplier)
    
    return {
      id: 'backup_' + Date.now(),
      image: backup.image,
      preview: backup.image,
      name: backup.name,
      series: backup.series,
      rarity: rarity,
      value: value,
      tags: backup.tags,
      width: 800,
      height: 600
    }
  }
}

function determineRarity() {
  let rand = Math.random() * 100
  let cumulative = 0
  
  for (let [key, rarity] of Object.entries(RARITIES)) {
    cumulative += rarity.chance
    if (rand <= cumulative) return rarity
  }
  
  return RARITIES.COMMON
}

function extractCharacterName(tags) {
  let tagList = tags.split(' ')
  let characterTags = tagList.filter(tag => 
    tag.includes('(') || 
    /^(hatsune_miku|rem|ram|emilia|asuna|miku|zero_two|marin|nezuko|ganyu|raiden|ayaka|yor|mikasa|saber|rin_tohsaka|megumin|darkness|aqua|chika|kaguya|marin|kitagawa|mai|sakurajima|zero_two|02|ichigo|hiro|miku_nakano|nino|miku|yotsuba|itsuki|fuutarou)$/i.test(tag)
  )
  
  if (characterTags.length > 0) {
    return characterTags[0].replace(/_/g, ' ').replace(/\(.*/, '').trim()
  }
  
  const genericNames = ['Sakura', 'Hana', 'Yuki', 'Aoi', 'Rei', 'Mio', 'Rin', 'Len', 'Miku', 'Kaito', 'Asuka', 'Rei', 'Misato', 'Homura', 'Madoka', 'Sayaka', 'Kyoko', 'Mami']
  return genericNames[Math.floor(Math.random() * genericNames.length)]
}

function extractSeries(tags) {
  let tagList = tags.toLowerCase().split(' ')
  let seriesMap = {
    'genshin_impact': 'Genshin Impact',
    'blue_archive': 'Blue Archive',
    'fate': 'Fate Series',
    're_zero': 'Re:Zero',
    'naruto': 'Naruto',
    'dragon_ball': 'Dragon Ball',
    'one_piece': 'One Piece',
    'pokemon': 'Pokemon',
    'zelda': 'The Legend of Zelda',
    'touhou': 'Touhou',
    'vocaloid': 'Vocaloid',
    'umamusume': 'Umamusume',
    'kantai_collection': 'Kantai Collection',
    'honkai': 'Honkai Star Rail',
    'zenless_zone_zero': 'Zenless Zone Zero',
    'bocchi_the_rock': 'Bocchi the Rock!',
    'lycoris_recoil': 'Lycoris Recoil',
    'spy_x_family': 'Spy x Family',
    'chainsaw_man': 'Chainsaw Man',
    'jujutsu_kaisen': 'Jujutsu Kaisen',
    'demon_slayer': 'Demon Slayer',
    'my_hero_academia': 'My Hero Academia',
    'attack_on_titan': 'Attack on Titan',
    'sword_art_online': 'Sword Art Online',
    'love_live': 'Love Live!',
    'idolmaster': 'The Idolmaster',
    'precure': 'Pretty Cure'
  }
  
  for (let [tag, series] of Object.entries(seriesMap)) {
    if (tagList.some(t => t.includes(tag))) return series
  }
  
  return 'Serie Desconocida'
}

async function sendSingleResult(conn, m, waifu, cost, isRW = false) {
  let title = isRW ? '¡ʀᴡ - ɴᴜᴇᴠᴀ ɪɴᴠᴏᴄᴀᴄɪᴏ́ɴ!' : '¡ɪɴᴠᴏᴄᴀᴄɪᴏ́ɴ!'
  let cmdText = isRW ? '.rw - Invocar otra' : '.gacha - Invocar otra'
  
  let text = `> . ﹡ ﹟ 🎲 ׄ ⬭ *${title}*
  
*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜✨* ㅤ֢ㅤ⸱ㅤᯭִ*
ׅㅤ𓏸𓈒ㅤׄ *ᴄᴏsᴛᴏ* :: $${cost.toLocaleString()}
ׅㅤ𓏸𓈒ㅤׄ *ᴠᴀʟᴏʀ* :: $${waifu.value.toLocaleString()}
*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜👤* ㅤ֢ㅤ⸱ㅤᯭִ*
ׅㅤ𓏸𓈒ㅤׄ *ɴᴏᴍʙʀᴇ* :: ${waifu.name}
ׅㅤ𓏸𓈒ㅤׄ *sᴇʀɪᴇ* :: ${waifu.series}
ׅㅤ𓏸𓈒ㅤׄ *ʀᴀʀᴇᴢᴀ* :: ${waifu.rarity.name}
ׅㅤ𓏸𓈒ㅤׄ *ɪᴅ* :: #${waifu.id}

> ## \`ᴄᴏᴍᴀɴᴅᴏs ⚔️\`
> • .claim - Reclamar esta waifu ($50)
> • ${cmdText} ($100)
> • .multigacha - x10 invocaciones ($900)`
  
  await conn.sendMessage(m.chat, {
    image: { url: waifu.image },
    caption: text,
    mentions: [m.sender]
  }, { quoted: m })
}

async function sendMultiResults(conn, m, waifus, cost, totalValue) {
  // Calcular estadísticas
  let rarityCount = {}
  waifus.forEach(w => {
    rarityCount[w.rarity.name] = (rarityCount[w.rarity.name] || 0) + 1
  })
  
  let statsText = Object.entries(rarityCount)
    .map(([rarity, count]) => `ׅㅤ𓏸𓈒ㅤׄ ${rarity} :: x${count}`)
    .join('\n')
  
  let text = `> . ﹡ ﹟ 🎲 ׄ ⬭ *¡ɪɴᴠᴏᴄᴀᴄɪᴏ́ɴ x10!*
  
*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜💸* ㅤ֢ㅤ⸱ㅤᯭִ*
ׅㅤ𓏸𓈒ㅤׄ *ᴄᴏsᴛᴏ* :: $${cost.toLocaleString()}
ׅㅤ𓏸𓈒ㅤׄ *ᴠᴀʟᴏʀ ᴛᴏᴛᴀʟ* :: $${totalValue.toLocaleString()}
*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜📊* ㅤ֢ㅤ⸱ㅤᯭִ*
${statsText}

> ## \`ʀᴇsᴜʟᴛᴀᴅᴏs 📦\`
${waifus.map((w, i) => `${i + 1}. ${w.rarity.name.split(' ')[0]} ${w.name}`).join('\n')}

> ## \`ᴄᴏᴍᴀɴᴅᴏs ⚔️\`
> • .claim [número] - Reclamar específica
> • .claimall - Reclamar todas
> • .gacha - Invocar de nuevo
> • .rw - Invocar rápido`
  
  // Enviar collage o primera imagen
  await conn.sendMessage(m.chat, {
    image: { url: waifus[0].image },
    caption: text,
    mentions: [m.sender]
  }, { quoted: m })
  
  // Enviar las demás como galería (máximo 3 adicionales)
  if (waifus.length > 1) {
    for (let i = 1; i < Math.min(waifus.length, 4); i++) {
      await conn.sendMessage(m.chat, {
        image: { url: waifus[i].image },
        caption: `${i + 1}. ${waifus[i].rarity.name} - ${waifus[i].name} | .claim ${i + 1}`
      }, { quoted: m })
    }
  }
}

handler.help = ['gacha', 'multigacha', 'mgacha', 'rw']
handler.tags = ['gacha']
handler.command = ['gacha', 'summon', 'roll', 'multigacha', 'mgacha', 'x10', 'rw', 'reroll']

export default handler
