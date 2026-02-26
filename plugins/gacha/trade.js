// plugins/gacha/trade.js
// Intercambiar waifus entre usuarios - CORREGIDO
import { getInventory, removeWaifu, addWaifu } from '../../lib/gacha.js'

// Tradeos pendientes
global.tradeOffers = global.tradeOffers || {}

let handler = async (m, { conn, args, command }) => {
  let userId = m.sender.split('@')[0]
  
  if (command === 'trade' || command === 'intercambiar') {
    // Crear oferta de trade
    if (!m.mentionedJid || m.mentionedJid.length === 0) {
      return conn.sendMessage(m.chat, {
        text: `> . ﹡ ﹟ ❌ ׄ ⬭ *¡Menciona a alguien!*
        
> ## \`ᴜsᴏ 📝\`
> • .trade @usuario [número_waifu]`,
        mentions: [m.sender]
      }, { quoted: m })
    }
    
    let targetId = m.mentionedJid[0].split('@')[0]
    
    // Evitar auto-trade
    if (targetId === userId) {
      return conn.sendMessage(m.chat, {
        text: `> . ﹡ ﹟ ❌ ׄ ⬭ *¡No puedes tradear contigo mismo!*`,
        mentions: [m.sender]
      }, { quoted: m })
    }
    
    let waifuIndex = parseInt(args[1]) - 1
    
    if (isNaN(waifuIndex) || waifuIndex < 0) {
      return conn.sendMessage(m.chat, {
        text: `> . ﹡ ﹟ ❌ ׄ ⬭ *¡Especifica la waifu!*
        
> ## \`ᴜsᴏ 📝\`
> • .trade @usuario [número]
> • Revisa tu inventario con .inv`,
        mentions: [m.sender]
      }, { quoted: m })
    }
    
    let inventory = getInventory(userId)
    if (!inventory || waifuIndex >= inventory.length) {
      return conn.sendMessage(m.chat, {
        text: `> . ﹡ ﹟ ❌ ׄ ⬭ *¡Waifu no existe!*
        
ׅㅤ𓏸𓈒ㅤׄ *ᴛɪᴇɴᴇs* :: ${inventory ? inventory.length : 0} waifus
ׅㅤ𓏸𓈒ㅤׄ *sᴏʟɪᴄɪᴛᴀsᴛᴇ* :: #${waifuIndex + 1}`,
        mentions: [m.sender]
      }, { quoted: m })
    }
    
    let waifu = inventory[waifuIndex]
    
    // Verificar si está bloqueada
    if (waifu.locked) {
      return conn.sendMessage(m.chat, {
        text: `> . ﹡ ﹟ 🔒 ׄ ⬭ *¡Waifu bloqueada!*
        
${waifu.name} está protegida.
Usa .unlock ${waifuIndex + 1} para desbloquear.`,
        mentions: [m.sender]
      }, { quoted: m })
    }
    
    // Crear oferta
    global.tradeOffers[userId] = {
      to: targetId,
      waifu: waifu,
      waifuIndex: waifuIndex,
      timestamp: Date.now()
    }
    
    let text = `> . ﹡ ﹟ 🤝 ׄ ⬭ *¡ᴏғᴇʀᴛᴀ ᴅᴇ ᴛʀᴀᴅᴇ!*
    
*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜👤* ㅤ֢ㅤ⸱ㅤᯭִ*
ׅㅤ𓏸𓈒ㅤׄ *ᴅᴇ* :: @${userId}
ׅㅤ𓏸𓈒ㅤׄ *ᴘᴀʀᴀ* :: @${targetId}
*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜🎴* ㅤ֢ㅤ⸱ㅤᯭִ*
ׅㅤ𓏸𓈒ㅤׄ *ɴᴏᴍʙʀᴇ* :: ${waifu.name}
ׅㅤ𓏸𓈒ㅤׄ *ʀᴀʀᴇᴢᴀ* :: ${waifu.rarity.name}
ׅㅤ𓏸𓈒ㅤׄ *ᴠᴀʟᴏʀ* :: $${waifu.value.toLocaleString()}

> ## \`ᴄᴏᴍᴀɴᴅᴏs ⚔️\`
> @${targetId} usa:
> • .accepttrade - Aceptar
> • .canceltrade - Rechazar

⏰ *Expira en 2 minutos*`
    
    await conn.sendMessage(m.chat, {
      image: { url: waifu.image },
      caption: text,
      mentions: [m.sender, m.mentionedJid[0]]
    }, { quoted: m })
    
  } else if (command === 'accepttrade' || command === 'atrade') {
    // Aceptar trade
    let offerEntry = Object.entries(global.tradeOffers || {}).find(([from, data]) => data.to === userId)
    
    if (!offerEntry) {
      return conn.sendMessage(m.chat, {
        text: `> . ﹡ ﹟ ❌ ׄ ⬭ *¡No hay ofertas pendientes!*
        
Nadie te ha ofrecido un trade.`,
        mentions: [m.sender]
      }, { quoted: m })
    }
    
    let [fromId, tradeData] = offerEntry
    
    // Verificar que aún tiene la waifu (re-chequear inventario actual)
    let fromInventory = getInventory(fromId)
    let currentIndex = tradeData.waifuIndex
    
    // Buscar por uniqueId para mayor seguridad
    let waifuExists = fromInventory.find((w, idx) => 
      idx === tradeData.waifuIndex && 
      w.uniqueId === tradeData.waifu.uniqueId &&
      !w.locked
    )
    
    if (!waifuExists) {
      delete global.tradeOffers[fromId]
      return conn.sendMessage(m.chat, {
        text: `> . ﹡ ﹟ ❌ ׄ ⬭ *¡Oferta inválida!*
        
La waifu ya no está disponible o fue bloqueada.`,
        mentions: [m.sender]
      }, { quoted: m })
    }
    
    // Realizar intercambio atómico
    try {
      // Remover del oferente
      let removed = removeWaifu(fromId, tradeData.waifuIndex)
      if (!removed) throw new Error('No se pudo remover waifu del oferente')
      
      // Agregar al aceptante
      addWaifu(userId, tradeData.waifu)
      
      // Limpiar oferta
      delete global.tradeOffers[fromId]
      
      let text = `> . ﹡ ﹟ ✅ ׄ ⬭ *¡ᴛʀᴀᴅᴇ ᴄᴏᴍᴘʟᴇᴛᴀᴅᴏ!*
    
*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜🎴* ㅤ֢ㅤ⸱ㅤᯭִ*
ׅㅤ𓏸𓈒ㅤׄ *ᴡᴀɪғᴜ* :: ${tradeData.waifu.name}
ׅㅤ𓏸𓈒ㅤׄ *ʀᴀʀᴇᴢᴀ* :: ${tradeData.waifu.rarity.name}
ׅㅤ𓏸𓈒ㅤׄ *ᴠᴀʟᴏʀ* :: $${tradeData.waifu.value.toLocaleString()}
ׅㅤ𓏸𓈒ㅤׄ *ɴᴜᴇᴠᴏ ᴅᴜᴇñᴏ* :: @${userId}
ׅㅤ𓏸𓈒ㅤׄ *ᴀɴᴛᴇʀɪᴏʀ* :: @${fromId}

> ## \`ᴄᴏᴍᴀɴᴅᴏs ⚔️\`
> • .inv - Ver inventario actualizado`
      
      await conn.sendMessage(m.chat, {
        image: { url: tradeData.waifu.image },
        caption: text,
        mentions: [m.sender, fromId + '@s.whatsapp.net']
      }, { quoted: m })
      
    } catch (error) {
      console.error('Error en trade:', error)
      conn.sendMessage(m.chat, {
        text: `> . ﹡ ﹟ ❌ ׄ ⬭ *¡Error en el trade!*
        
Por favor intenta de nuevo.`,
        mentions: [m.sender]
      }, { quoted: m })
    }
    
  } else if (command === 'canceltrade' || command === 'ctrade') {
    // Cancelar trade (puede ser el que envió o el que recibe)
    let offerEntry = Object.entries(global.tradeOffers || {}).find(([from, data]) => 
      data.to === userId || from === userId
    )
    
    if (!offerEntry) {
      return conn.sendMessage(m.chat, {
        text: `> . ﹡ ﹟ ❌ ׄ ⬭ *¡No hay ofertas para cancelar!*`,
        mentions: [m.sender]
      }, { quoted: m })
    }
    
    let [fromId] = offerEntry
    delete global.tradeOffers[fromId]
    
    conn.sendMessage(m.chat, {
      text: `> . ﹡ ﹟ 🚫 ׄ ⬭ *¡ᴛʀᴀᴅᴇ ᴄᴀɴᴄᴇʟᴀᴅᴏ!*
      
La oferta ha sido rechazada/cancelada.`,
      mentions: [m.sender]
    }, { quoted: m })
  }
}

handler.help = ['trade @user [número]', 'accepttrade', 'canceltrade']
handler.tags = ['gacha']
handler.command = ['trade', 'intercambiar', 'accepttrade', 'atrade', 'canceltrade', 'ctrade']

export default handler