import yts from 'yt-search'

var handler = async (m, { text, conn, usedPrefix }) => {
  if (!text) return conn.reply(m.chat, `❀ Ingresa una búsqueda de Youtube.`, m)

  try {
    await m.react('🕒')
    let results = await yts(text)
    let tes = results.all

    let teks = results.all.map(v => {
      switch (v.type) {
        case 'video': 
          return `「✦」Resultados para *${text}*

❀ *${v.title}*
> ✦ Canal » *${v.author.name}*
> ⴵ Duración » *${v.timestamp}*
> ✐ Subido » *${v.ago}*
> ✰ Vistas » *${v.views}*
> 🜸 Enlace » ${v.url}`
      }
    }).filter(v => v).join('

••••••••••••••••••••••••••••••••••••

')

    await conn.sendFile(m.chat, tes[0].thumbnail, 'yts.jpeg', teks, m)
    await m.react('✔️')
  } catch (e) {
    await m.react('✖️')
    conn.reply(m.chat, `⚠︎ Error: ` + e.message, m)
  }
}

handler.help = ['ytsearch', 'yts']
handler.tags = ['descargas']
handler.command = ['ytbuscar', 'ytsearch', 'yts']

export default handler
