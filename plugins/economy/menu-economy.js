// plugins/economy/menu-economy.js
// Menú de economía

import moment from 'moment-timezone'

let handler = async (m, { conn, usedPrefix }) => {
  const uptime = process.uptime()
  const horas = Math.floor(uptime / 3600)
  const minutos = Math.floor((uptime % 3600) / 60)
  const segundos = Math.floor(uptime % 60)

  const horario = moment.tz('America/Mexico_City').format('DD/MM/YYYY hh:mm:ss A')

  const menuText = `╭━━━❰ ✦ ᴍᴇɴᴜ́ ᴇᴄᴏɴᴏᴍɪ́ᴀ ✦ ❱━━━╮
┃
┃ 💰 *${global.namebot || 'Asta Bot'}* | Economía
┃ ⏱️ Uptime: ${horas}h ${minutos}m ${segundos}s
┃ 📅 ${horario}
┃
╰━━━━━━━━━━━━━━━━━━━━━━━╯

╭━━━❰ 💵 ʙᴀʟᴀɴᴄᴇ ʏ ᴛʀᴀɴsᴀᴄᴄɪᴏɴᴇs ❱━━━╮
┃
┃ ❀ *${usedPrefix}balance* [@user]
┃   └ Ver tu dinero y estadísticas
┃   └ Alias: bal, dinero
┃
┃ ❀ *${usedPrefix}daily*
┃   └ Recompensa diaria (24h)
┃   └ Racha: +$100 por día consecutivo
┃
┃ ❀ *${usedPrefix}pay* @user <cantidad>
┃   └ Transferir dinero (5% comisión)
┃   └ Alias: pagar, transfer
┃
┃ ❀ *${usedPrefix}deposit* <cantidad>|all
┃   └ Guardar dinero en el banco
┃   └ Alias: dep
┃
┃ ❀ *${usedPrefix}withdraw* <cantidad>|all
┃   └ Retirar del banco
┃   └ Alias: with, retirar
┃
╰━━━━━━━━━━━━━━━━━━━━━━━╯

╭━━━❰ 💼 ᴛʀᴀʙᴀᴊᴏ ʏ ᴍɪɴᴇʀɪ́ᴀ ❱━━━━━━━━━━╮
┃
┃ ❀ *${usedPrefix}work*
┃   └ Trabajar (cada 30 min)
┃   └ Ganas: $500 - $3,000
┃   └ Alias: trabajar
┃
┃ ❀ *${usedPrefix}mine*
┃   └ Minar minerales (cada 15 min)
┃   └ Posibles: Carbón, Hierro, Oro, Diamante
┃   └ Alias: minar
┃
╰━━━━━━━━━━━━━━━━━━━━━━━╯

╭━━━❰ 🎰 ᴊᴜᴇɢᴏs ʏ ᴀᴢᴀʀ ❱━━━━━━━━━━━╮
┃
┃ ❀ *${usedPrefix}tatar* <cantidad>
┃   └ Juego de azar - Multiplica tu dinero
┃   └ Posibilidades: 0x, 0.5x, 1x, 1.5x, 2x, 3x, 5x
┃   └ Cooldown: 5 minutos
┃   └ Alias: apostar
┃
┃ ❀ *${usedPrefix}rob* @user
┃   └ Intentar robar (50% éxito)
┃   └ Cooldown: 2 horas
┃   └ Si fallas: pagas multa $500
┃   └ Alias: robar, steal
┃
╰━━━━━━━━━━━━━━━━━━━━━━━╯

╭━━━❰ 📋 ᴍɪsɪᴏɴᴇs ʏ ʀᴀɴᴋɪɴɢ ❱━━━━━━━━━╮
┃
┃ ❀ *${usedPrefix}misiones*
┃   └ Ver misiones diarias, semanales y mensuales
┃   └ Completalas para ganar recompensas
┃   └ Usa: .misiones claim <tipo>
┃   └ Alias: missions
┃
┃ ❀ *${usedPrefix}top*
┃   └ Ranking de los más ricos
┃   └ Recompensas automáticas para top 3
┃   └ Ver: .top rewards
┃   └ Alias: ranking, baltop
┃
╰━━━━━━━━━━━━━━━━━━━━━━━╯

╭━━━❰ 🏪 ᴛɪᴇɴᴅᴀ ❱━━━━━━━━━━━━━━╮
┃
┃ ❀ *${usedPrefix}shop*
┃   └ Ver items disponibles
┃   └ Comprar: .shop buy <id>
┃   └ Inventario: .shop inv
┃   └ Alias: tienda, store
┃
╰━━━━━━━━━━━━━━━━━━━━━━━╯

╭━━━❰ 🏆 sɪsᴛᴇᴍᴀ ᴅᴇ ʀᴇᴄᴏᴍᴘᴇɴsᴀs ❱━━━━━━╮
┃
┃ • Top 1 cada 2 días: $3,000
┃ • Top 2 cada 2 días: $2,000
┃ • Top 3 cada 2 días: $1,000
┃
┃ • Top 1 semanal: $15,000
┃ • Top 2 semanal: $10,000
┃ • Top 3 semanal: $5,000
┃
┃ Las recompensas se depositan automáticamente
┃ en el banco de los ganadores.
┃
╰━━━━━━━━━━━━━━━━━━━━━━━╯

> 👑 Owner: ${global.dev || 'Fernando'}
> 🤖 Prefix: ${usedPrefix}
> 💰 Economía activada`

  await conn.sendMessage(m.chat, { 
    text: menuText,
    mentions: [m.sender]
  }, { quoted: m })
}

handler.help = ['menu-economy', 'economia']
handler.tags = ['economy', 'main']
handler.command = ['menu-economy', 'menueconomy', 'economia', 'economy']

export default handler