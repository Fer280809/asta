// plugins/gacha/waifuinfo.js
// Ver detalles de waifu y gestionar favoritos
import { getInventory, updateWaifu } from '../../lib/gacha.js'

let handler = async (m, { conn, args, command }) => {
  let userId = m.sender.split('@')[0]
  let inventory = getInventory(userId)
  
  if (inventory.length === 0) {
    return conn.sendMessage(m.chat, {
      text: `> . ﹡ ﹟ ❌ ׄ ⬭ *¡Inventario vacío!*`,
      mentions: [m.sender]
    }, { quoted: m })
  }
  
  let index = parseInt(args[0]) - 1
  
  if (isNaN(index) || index < 0 || index >= inventory.length) {
    return conn.sendMessage(m.chat, {
      text: `> . ﹡ ﹟ ❌ ׄ ⬭ *¡Número inválido!*
      
Tienes ${inventory.length} waifus.
Usa .inv para ver la lista.`,
      mentions: [m.sender]
    }, { quoted: m })
  }
  
  let waifu = inventory[index]
  
  if (command === 'lock' || command === 'bloquear' || command === 'unlock' || command === 'desbloquear') {
    // Toggle lock
    let newLock = command === 'lock' || command === 'bloquear'
    updateWaifu(userId, index, { locked: newLock })
    
    let text = `> . ﹡ ﹟ 🔒 ׄ ⬭ *¡ᴇsᴛᴀᴅᴏ ᴀᴄᴛᴜᴀʟɪᴢᴀᴅᴏ!*
    
*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜👤* ㅤ֢ㅤ⸱ㅤᯭִ*
ׅㅤ𓏸𓈒ㅤׄ *ɴᴏᴍʙʀᴇ* :: ${waifu.name}
ׅㅤ𓏸𓈒ㅤׄ *ᴇsᴛᴀᴅᴏ* :: ${newLock ? '🔒 Protegida' : '🔓 Desprotegida'}
ׅㅤ𓏸𓈒ㅤׄ *ᴘᴜᴇᴅᴇs ᴠᴇɴᴅᴇʀ* :: ${newLock ? 'No' : 'Sí'}

> ${newLock ? 'Usa .unlock para permitir la venta' : 'Usa .lock para proteger de venta'}`
    
    conn.sendMessage(m.chat, {
      text,
      mentions: [m.sender]
    }, { quoted: m })
    
  } else if (command === 'favorite' || command === 'fav' || command === 'favorito') {
    // Marcar como favorita
    updateWaifu(userId, index, { favorite: !waifu.favorite })
    
    let text = `> . ﹡ ﹟ ⭐ ׄ ⬭ *¡ғᴀᴠᴏʀɪᴛᴏ ᴀᴄᴛᴜᴀʟɪᴢᴀᴅᴏ!*
    
*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜👤* ㅤ֢ㅤ⸱ㅤᯭִ*
ׅㅤ𓏸𓈒ㅤׄ *ɴᴏᴍʙʀᴇ* :: ${waifu.name}
ׅㅤ𓏸𓈒ㅤׄ *ғᴀᴠᴏʀɪᴛᴀ* :: ${!waifu.favorite ? '⭐ Sí' : 'No'}
ׅㅤ𓏸𓈒ㅤׄ *ʙᴏɴᴏs* :: ${!waifu.favorite ? '+5% valor' : 'Normal'}`
    
    conn.sendMessage(m.chat, {
      text,
      mentions: [m.sender]
    }, { quoted: m })
    
  } else {
    // Mostrar info
    let acquiredDate = waifu.acquired ? new Date(waifu.acquired).toLocaleDateString() : 'Desconocida'
    
    let text = `> . ﹡ ﹟ ℹ️ ׄ ⬭ *¡ɪɴғᴏ ᴅᴇ ᴡᴀɪғᴜ!*
    
*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜👤* ㅤ֢ㅤ⸱ㅤᯭִ*
ׅㅤ𓏸𓈒ㅤׄ *ɴᴏᴍʙʀᴇ* :: ${waifu.name}
ׅㅤ𓏸𓈒ㅤׄ *sᴇʀɪᴇ* :: ${waifu.series}
ׅㅤ𓏸𓈒ㅤׄ *ɪᴅ* :: #${waifu.id}
*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜⭐* ㅤ֢ㅤ⸱ㅤᯭִ*
ׅㅤ𓏸𓈒ㅤׄ *ʀᴀʀᴇᴢᴀ* :: ${waifu.rarity.name}
ׅㅤ𓏸𓈒ㅤׄ *ᴠᴀʟᴏʀ* :: $${waifu.value.toLocaleString()}
ׅㅤ𓏸𓈒ㅤׄ *ᴛᴀɢs* :: ${waifu.tags || 'N/A'}
*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜📊* ㅤ֢ㅤ⸱ㅤᯭִ*
ׅㅤ𓏸𓈒ㅤׄ *ᴀᴅǫᴜɪʀɪᴅᴀ* :: ${acquiredDate}
ׅㅤ𓏸𓈒ㅤׄ *ᴘʀᴏᴛᴇɢɪᴅᴀ* :: ${waifu.locked ? '🔒 Sí' : '🔓 No'}
ׅㅤ𓏸𓈒ㅤׄ *ғᴀᴠᴏʀɪᴛᴀ* :: ${waifu.favorite ? '⭐ Sí' : 'No'}

> ## \`ᴄᴏᴍᴀɴᴅᴏs ⚔️\`
> • .lock ${index + 1} - Proteger
> • .unlock ${index + 1} - Desproteger  
> • .favorite ${index + 1} - Favorito
> • .sell ${index + 1} - Vender
> • .trade @user ${index + 1} - Intercambiar`

    await conn.sendMessage(m.chat, {
      image: { url: waifu.image },
      caption: text,
      mentions: [m.sender]
    }, { quoted: m })
  }
}

handler.help = ['waifuinfo [número]', 'lock [número]', 'favorite [número]']
handler.tags = ['gacha']
handler.command = ['waifuinfo', 'winfo', 'info', 'lock', 'bloquear', 'unlock', 'desbloquear', 'favorite', 'fav', 'favorito']

export default handler