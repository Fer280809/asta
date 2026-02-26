// plugins/gacha/sell.js
// Vender waifus por dinero
import { getUser, updateUser } from '../../lib/economy.js'
import { getInventory, removeWaifu } from '../../lib/gacha.js'

let handler = async (m, { conn, args, command }) => {
  let userId = m.sender.split('@')[0]
  let user = getUser(userId)
  let inventory = getInventory(userId)
  
  if (inventory.length === 0) {
    return conn.sendMessage(m.chat, {
      text: `> . ﹡ ﹟ ❌ ׄ ⬭ *¡Inventario vacío!*
      
No tienes waifus para vender.`,
      mentions: [m.sender]
    }, { quoted: m })
  }
  
  if (command === 'sellall' || command === 'vendertodo') {
    // Vender todas excepto las bloqueadas (favoritas)
    let sellable = inventory.filter(w => !w.locked)
    
    if (sellable.length === 0) {
      return conn.sendMessage(m.chat, {
        text: `> . ﹡ ﹟ ❌ ׄ ⬭ *¡Todas bloqueadas!*
        
Todas tus waifus están protegidas.
Usa .waifuinfo [número] para desbloquear.`,
        mentions: [m.sender]
      }, { quoted: m })
    }
    
    let totalValue = sellable.reduce((sum, w) => sum + Math.floor(w.value * 0.7), 0)
    
    // Eliminar del inventario (de atrás hacia adelante para no afectar índices)
    for (let i = inventory.length - 1; i >= 0; i--) {
      if (!inventory[i].locked) {
        removeWaifu(userId, i)
      }
    }
    
    // Dar dinero (70% del valor)
    updateUser(userId, { balance: user.balance + totalValue })
    
    let text = `> . ﹡ ﹟ 💰 ׄ ⬭ *¡ᴠᴇɴᴛᴀ ᴍᴀsɪᴠᴀ!*
    
*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜📦* ㅤ֢ㅤ⸱ㅤᯭִ*
ׅㅤ𓏸𓈒ㅤׄ *ᴠᴇɴᴅɪᴅᴀs* :: x${sellable.length}
ׅㅤ𓏸𓈒ㅤׄ *ᴠᴀʟᴏʀ ᴏʀɪɢɪɴᴀʟ* :: $${sellable.reduce((s, w) => s + w.value, 0).toLocaleString()}
*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜💸* ㅤ֢ㅤ⸱ㅤᯭִ*
ׅㅤ𓏸𓈒ㅤׄ *ɢᴀɴᴀɴᴄɪᴀ (70%)* :: $${totalValue.toLocaleString()}
ׅㅤ𓏸𓈒ㅤׄ *ɴᴜᴇᴠᴏ sᴀʟᴅᴏ* :: $${(user.balance + totalValue).toLocaleString()}

> ## \`ᴄᴏᴍᴀɴᴅᴏs ⚔️\`
> • .gacha - Invocar más
> • .inv - Ver restantes`
    
    conn.sendMessage(m.chat, {
      text,
      mentions: [m.sender]
    }, { quoted: m })
    
  } else {
    // Vender específica
    let index = parseInt(args[0]) - 1
    
    if (isNaN(index) || index < 0 || index >= inventory.length) {
      return conn.sendMessage(m.chat, {
        text: `> . ﹡ ﹟ ❌ ׄ ⬭ *¡Número inválido!*
        
> ## \`ᴜsᴏ 📝\`
> • .sell [número] - Vender específica
> • .sellall - Vender todas
> • .inv - Ver lista con números`,
        mentions: [m.sender]
      }, { quoted: m })
    }
    
    let waifu = inventory[index]
    
    if (waifu.locked) {
      return conn.sendMessage(m.chat, {
        text: `> . ﹡ ﹟ 🔒 ׄ ⬭ *¡Waifu Protegida!*
        
${waifu.name} está bloqueada.
Usa .lock [número] para desbloquear.`,
        mentions: [m.sender]
      }, { quoted: m })
    }
    
    let sellPrice = Math.floor(waifu.value * 0.7)
    
    removeWaifu(userId, index)
    updateUser(userId, { balance: user.balance + sellPrice })
    
    let text = `> . ﹡ ﹟ 💰 ׄ ⬭ *¡ᴡᴀɪғᴜ ᴠᴇɴᴅɪᴅᴀ!*
    
*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜👤* ㅤ֢ㅤ⸱ㅤᯭִ*
ׅㅤ𓏸𓈒ㅤׄ *ɴᴏᴍʙʀᴇ* :: ${waifu.name}
ׅㅤ𓏸𓈒ㅤׄ *ʀᴀʀᴇᴢᴀ* :: ${waifu.rarity.name}
*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜💸* ㅤ֢ㅤ⸱ㅤᯭִ*
ׅㅤ𓏸𓈒ㅤׄ *ᴠᴀʟᴏʀ ᴏʀɪɢɪɴᴀʟ* :: $${waifu.value.toLocaleString()}
ׅㅤ𓏸𓈒ㅤׄ *ᴠᴇɴᴛᴀ (70%)* :: $${sellPrice.toLocaleString()}
ׅㅤ𓏸𓈒ㅤׄ *ɴᴜᴇᴠᴏ sᴀʟᴅᴏ* :: $${(user.balance + sellPrice).toLocaleString()}

> ## \`ᴄᴏᴍᴀɴᴅᴏs ⚔️\`
> • .gacha - Invocar más
> • .inv - Ver inventario`
    
    conn.sendMessage(m.chat, {
      text,
      mentions: [m.sender]
    }, { quoted: m })
  }
}

handler.help = ['sell [número]', 'sellall']
handler.tags = ['gacha']
handler.command = ['sell', 'vender', 'sellall', 'vendertodo']

export default handler