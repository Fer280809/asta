// plugins/gacha/claim.js
// Reclamar waifus del gacha (con costo)
import { getUser, updateUser } from '../../lib/economy.js'
import { addWaifu, getInventory } from '../../lib/gacha.js'

// Costo adicional por reclamar (para balancear economía)
const CLAIM_COST = 50

let handler = async (m, { conn, args }) => {
  let userId = m.sender.split('@')[0]
  let user = getUser(userId)
  
  // Verificar si hay waifus pendientes
  global.gachaTemp = global.gachaTemp || {}
  let pending = global.gachaTemp[userId]
  
  if (!pending || Date.now() - pending.timestamp > 300000) { // 5 minutos de expiración
    return conn.sendMessage(m.chat, {
      text: `> . ﹡ ﹟ ❌ ׄ ⬭ *¡Nada que reclamar!*
      
*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜🎲* ㅤ֢ㅤ⸱ㅤᯭִ*
ׅㅤ𓏸𓈒ㅤׄ *ᴇsᴛᴀᴅᴏ* :: No hay invocaciones pendientes
ׅㅤ𓏸𓈒ㅤׄ *ᴛɪᴇᴍᴘᴏ* :: Expirado o no existe

> ## \`sᴜɢᴇʀᴇɴᴄɪᴀ 💡\`
> • .gacha - Invocar waifus
> • .inv - Ver tu inventario`,
      mentions: [m.sender]
    }, { quoted: m })
  }
  
  let waifus = pending.waifus
  
  // Verificar dinero para reclamar
  let totalClaimCost = CLAIM_COST * waifus.length
  
  if (user.balance < totalClaimCost) {
    return conn.sendMessage(m.chat, {
      text: `> . ﹡ ﹟ ❌ ׄ ⬭ *¡Fondos Insuficientes!*
      
*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜💸* ㅤ֢ㅤ⸱ㅤᯭִ*
ׅㅤ𓏸𓈒ㅤׄ *ᴄᴏsᴛᴏ ᴘᴏʀ ʀᴇᴄʟᴀᴍᴀʀ* :: $${CLAIM_COST} c/u
ׅㅤ𓏸𓈒ㅤׄ *ᴛᴏᴛᴀʟ ɴᴇᴄᴇsᴀʀɪᴏ* :: $${totalClaimCost.toLocaleString()}
ׅㅤ𓏸𓈒ㅤׄ *ᴛɪᴇɴᴇs* :: $${user.balance.toLocaleString()}
ׅㅤ𓏸𓈒ㅤׄ *ғᴀʟᴛᴀ* :: $${(totalClaimCost - user.balance).toLocaleString()}

> ## \`sᴜɢᴇʀᴇɴᴄɪᴀ 💡\`
> • .daily - Recompensa diaria
> • .work - Trabajar`,
      mentions: [m.sender]
    }, { quoted: m })
  }
  
  // Descontar dinero de reclamo
  updateUser(userId, { balance: user.balance - totalClaimCost })
  
  // Reclamar específica o todas
  let index = args[0] ? parseInt(args[0]) - 1 : -1
  
  if (index >= 0 && index < waifus.length) {
    // Reclamar una específica
    let waifu = waifus[index]
    addWaifu(userId, waifu)
    
    // Eliminar de pendientes
    waifus.splice(index, 1)
    if (waifus.length === 0) delete global.gachaTemp[userId]
    
    let text = `> . ﹡ ﹟ ✅ ׄ ⬭ *¡ᴡᴀɪғᴜ ʀᴇᴄʟᴀᴍᴀᴅᴀ!*
    
*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜💸* ㅤ֢ㅤ⸱ㅤᯭִ*
ׅㅤ𓏸𓈒ㅤׄ *ᴄᴏsᴛᴏ* :: $${CLAIM_COST.toLocaleString()}
ׅㅤ𓏸𓈒ㅤׄ *sᴀʟᴅᴏ* :: $${(user.balance - totalClaimCost).toLocaleString()}
*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜👤* ㅤ֢ㅤ⸱ㅤᯭִ*
ׅㅤ𓏸𓈒ㅤׄ *ɴᴏᴍʙʀᴇ* :: ${waifu.name}
ׅㅤ𓏸𓈒ㅤׄ *sᴇʀɪᴇ* :: ${waifu.series}
ׅㅤ𓏸𓈒ㅤׄ *ʀᴀʀᴇᴢᴀ* :: ${waifu.rarity.name}
ׅㅤ𓏸𓈒ㅤׄ *ᴠᴀʟᴏʀ* :: $${waifu.value.toLocaleString()}
*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜📦* ㅤ֢ㅤ⸱ㅤᯭִ*
ׅㅤ𓏸𓈒ㅤׄ *ᴘᴇɴᴅɪᴇɴᴛᴇs* :: ${waifus.length} waifus

> ## \`ᴄᴏᴍᴀɴᴅᴏs ⚔️\`
> • .inv - Ver inventario
> • .claim [número] - Reclamar otra
> • .claimall - Reclamar restantes`
    
    await conn.sendMessage(m.chat, {
      image: { url: waifu.image },
      caption: text,
      mentions: [m.sender]
    }, { quoted: m })
    
  } else {
    // Reclamar todas
    let claimedCount = waifus.length
    let totalValue = waifus.reduce((sum, w) => sum + w.value, 0)
    
    waifus.forEach(waifu => addWaifu(userId, waifu))
    delete global.gachaTemp[userId]
    
    let inventory = getInventory(userId)
    
    let text = `> . ﹡ ﹟ ✅ ׄ ⬭ *¡ᴛᴏᴅᴀs ʀᴇᴄʟᴀᴍᴀᴅᴀs!*
    
*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜💸* ㅤ֢ㅤ⸱ㅤᯭִ*
ׅㅤ𓏸𓈒ㅤׄ *ᴄᴏsᴛᴏ ᴛᴏᴛᴀʟ* :: $${totalClaimCost.toLocaleString()}
ׅㅤ𓏸𓈒ㅤׄ *ʀᴇᴄʟᴀᴍᴀᴅᴀs* :: x${claimedCount}
ׅㅤ𓏸𓈒ㅤׄ *ᴠᴀʟᴏʀ ᴛᴏᴛᴀʟ* :: $${totalValue.toLocaleString()}
*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜📦* ㅤ֢ㅤ⸱ㅤᯭִ*
ׅㅤ𓏸𓈒ㅤׄ *ᴛᴏᴛᴀʟ ᴡᴀɪғᴜs* :: ${inventory.length}
ׅㅤ𓏸𓈒ㅤׄ *ᴠᴀʟᴏʀ ɪɴᴠ* :: $${inventory.reduce((s, w) => s + w.value, 0).toLocaleString()}

> ## \`ᴄᴏᴍᴀɴᴅᴏs ⚔️\`
> • .inv - Ver colección
> • .gacha - Invocar más
> • .sell - Vender duplicados`
    
    conn.sendMessage(m.chat, {
      text,
      mentions: [m.sender]
    }, { quoted: m })
  }
}

handler.help = ['claim [número]', 'claimall']
handler.tags = ['gacha']
handler.command = ['claim', 'claimall', 'c', 'reclamar']

export default handler