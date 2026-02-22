let handler = async (m, { conn }) => {
  const uptime = process.uptime()
  const horas = Math.floor(uptime / 3600)
  const minutos = Math.floor((uptime % 3600) / 60)
  const segundos = Math.floor(uptime % 60)
  
  const texto = `🏓 *${global.namebot}* activo\n\n` +
                `⏱️ Uptime: ${horas}h ${minutos}m ${segundos}s\n` +
                `👑 Owner: ${global.dev}\n` +
                `📅 ${new Date().toLocaleString()}`
  
  await conn.sendMessage(m.chat, { text: texto }, { quoted: m })
}

handler.help = ['ping']
handler.tags = ['main']
handler.command = ['ping']

export default handler
