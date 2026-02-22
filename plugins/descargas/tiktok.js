import axios from 'axios'

const handler = async (m, { conn, text, usedPrefix }) => {
  if (!text) return conn.reply(m.chat, '❀ Ingresa un enlace de TikTok o término de búsqueda.', m)

  const isUrl = /(?:https?:\/\/)?(?:www\.|vm\.|vt\.|t\.)?tiktok\.com\//i.test(text)

  try {
    await m.react('🕒')

    if (isUrl) {
      // Descargar de URL
      const res = await axios.get(`https://www.tikwm.com/api/?url=${encodeURIComponent(text)}?hd=1`)
      const data = res.data?.data

      if (!data?.play) return conn.reply(m.chat, '❌ Enlace inválido.', m)

      const { title, author, play, music, type, images } = data
      const caption = `*🎬 TikTok Download*

*📝 Título:* ${title}
*👤 Autor:* ${author?.nickname}
*🎵 Música:* ${author?.unique_id}`

      if (type === 'image' && Array.isArray(images)) {
        for (const img of images.slice(0, 10)) {
          await conn.sendMessage(m.chat, { image: { url: img } }, { quoted: m })
        }
        if (music) {
          await conn.sendMessage(m.chat, { audio: { url: music }, mimetype: 'audio/mp4' }, { quoted: m })
        }
      } else {
        await conn.sendMessage(m.chat, { video: { url: play }, caption }, { quoted: m })
      }
    } else {
      // Búsqueda
      const res = await axios({
        method: 'POST',
        url: 'https://tikwm.com/api/feed/search',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'Mozilla/5.0'
        },
        data: { keywords: text, count: 10, cursor: 0, HD: 1 }
      })

      const results = res.data?.data?.videos?.filter(v => v.play) || []
      if (results.length === 0) return conn.reply(m.chat, '❌ No se encontraron resultados.', m)

      let text_results = `*🔍 TikTok Search: ${text}*

`
      results.slice(0, 5).forEach((v, i) => {
        text_results += `${i + 1}. *${v.title || 'Sin título'}*
`
        text_results += `   👤 ${v.author?.nickname}
`
        text_results += `   ⏱️ ${v.duration}s

`
      })

      text_results += `Para descargar usa: ${usedPrefix}tiktok <link>`

      await conn.reply(m.chat, text_results, m)
    }

    await m.react('✔️')
  } catch (e) {
    await m.react('✖️')
    await conn.reply(m.chat, `⚠︎ Error.
${e.message}`, m)
  }
}

handler.help = ['tiktok', 'tt']
handler.tags = ['descargas']
handler.command = ['tiktok', 'tt', 'tiktokdl']

export default handler
