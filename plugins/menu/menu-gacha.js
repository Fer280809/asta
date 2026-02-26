// plugins/gacha/gachamenu.js
// Menú principal del sistema de gacha
import { getUser } from '../../lib/economy.js'
import { getInventory } from '../../lib/gacha.js'

let handler = async (m, { conn }) => {
  let userId = m.sender.split('@')[0]
  let user = getUser(userId)
  let inventory = getInventory(userId)
  
  // Calcular estadísticas
  let totalValue = inventory.reduce((sum, w) => sum + (w.value || 0), 0)
  let legendaries = inventory.filter(w => w.rarity && w.rarity.name && w.rarity.name.includes('⭐⭐⭐⭐⭐')).length
  
  let text = `> . ﹡ ﹟ 🎰 ׄ ⬭ *¡sɪsᴛᴇᴍᴀ ᴅᴇ ɢᴀᴄʜᴀ!*
  
*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜👤* ㅤ֢ㅤ⸱ㅤᯭִ*
ׅㅤ𓏸𓈒ㅤׄ *ᴜsᴜᴀʀɪᴏ* :: @${userId}
ׅㅤ𓏸𓈒ㅤׄ *ᴅɪɴᴇʀᴏ* :: $${user.balance.toLocaleString()}
*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜📦* ㅤ֢ㅤ⸱ㅤᯭִ*
ׅㅤ𓏸𓈒ㅤׄ *ᴡᴀɪғᴜs* :: ${inventory.length}
ׅㅤ𓏸𓈒ㅤׄ *ᴠᴀʟᴏʀ ᴛᴏᴛᴀʟ* :: $${totalValue.toLocaleString()}
ׅㅤ𓏸𓈒ㅤׄ *ʟᴇɢᴇɴᴅᴀʀɪᴀs* :: ${legendaries} ⭐

*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜🎲* ㅤ֢ㅤ⸱ㅤᯭִ* — *ɪɴᴠᴏᴄᴀʀ*
ׅㅤ𓏸𓈒ㅤׄ *.gacha* :: Invocar 1 waifu ($100)
ׅㅤ𓏸𓈒ㅤׄ *.multigacha* :: Invocar x10 ($900)
ׅㅤ𓏸𓈒ㅤׄ *.claim [número]* :: Reclamar waifu ($50)
ׅㅤ𓏸𓈒ㅤׄ *.claimall* :: Reclamar todas

*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜📦* ㅤ֢ㅤ⸱ㅤᯭִ* — *ɪɴᴠᴇɴᴛᴀʀɪᴏ*
ׅㅤ𓏸𓈒ㅤׄ *.inv [página]* :: Ver colección
ׅㅤ𓏸𓈒ㅤׄ *.invgaсha* :: Ver gacha/inventario
ׅㅤ𓏸𓈒ㅤׄ *.waifuinfo [número]* :: Detalles waifu
ׅㅤ𓏸𓈒ㅤׄ *.lock [número]* :: Proteger de venta
ׅㅤ𓏸𓈒ㅤׄ *.unlock [número]* :: Desproteger
ׅㅤ𓏸𓈒ㅤׄ *.favorite [número]* :: Marcar favorita

*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜💰* ㅤ֢ㅤ⸱ㅤᯭִ* — *ᴇᴄᴏɴᴏᴍíᴀ*
ׅㅤ𓏸𓈒ㅤׄ *.sell [número]* :: Vender waifu (70%)
ׅㅤ𓏸𓈒ㅤׄ *.sellall* :: Vender todas
ׅㅤ𓏸𓈒ㅤׄ *.waifustore* :: Tienda de waifus
ׅㅤ𓏸𓈒ㅤׄ *.buywaifu [número]* :: Comprar
ׅㅤ𓏸𓈒ㅤׄ *.viewwaifu [número]* :: Ver en tienda

*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜🤝* ㅤ֢ㅤ⸱ㅤᯭִ* — *sᴏᴄɪᴀʟ*
ׅㅤ𓏸𓈒ㅤׄ *.trade @user [número]* :: Ofrecer trade
ׅㅤ𓏸𓈒ㅤׄ *.accepttrade* :: Aceptar trade
ׅㅤ𓏸𓈒ㅤׄ *.canceltrade* :: Cancelar trade
ׅㅤ𓏸𓈒ㅤׄ *.topwaifus* :: Ranking coleccionistas

> ## \`ᴘʀᴇᴄɪᴏs 💎\`
> • ⭐ Común :: $150 | ⭐⭐ Poco Común :: $300
> • ⭐⭐⭐ Rara :: $800 | ⭐⭐⭐⭐ Épica :: $2,500  
> • ⭐⭐⭐⭐⭐ Legendaria :: $10,000 | ✨🌟 Mítica :: $50,000`

  conn.sendMessage(m.chat, {
    text,
    mentions: [m.sender]
  }, { quoted: m })
}

handler.help = ['gachamenu', 'gachalist', 'gachahelp']
handler.tags = ['gacha']
handler.command = ['gachamenu', 'gachalist', 'gachahelp', 'gmenu', 'waifumenu', 'gachacommands']

export default handler
