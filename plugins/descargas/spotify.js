import axios from "axios"

const handler = async (m, { conn, text, usedPrefix }) => {
  if (!text) return m.reply("❀ Proporciona el nombre de una canción o artista.")

  try {
    await m.react('🕒')

    const isUrl = /https?:\/\/(open\.)?spotify\.com\/track\/[a-zA-Z0-9]+/.test(text)
    let trackUrl = text
    let info = null

    if (!isUrl) {
      const search = await axios.get(`https://delirius-api-oficial.vercel.app/search/spotify?q=${encodeURIComponent(text)}&limit=1`)
      const result = search.data?.data?.[0]
      if (!result) throw new Error("No se encontraron resultados.")
      trackUrl = result.url
      info = result
    }

    const res = await axios.get(`https://delirius-api-oficial.vercel.app/download/spotifydl?url=${encodeURIComponent(trackUrl)}`)
    const d = res.data?.data

    if (!res.data?.status || !d?.url) throw new Error("No se pudo obtener el audio.")

    const caption = `「✦」Descargando *${d.title || info?.title}*

> ꕥ Autor » *${d.author || info?.artist}*
${info?.album ? `> ❑ Álbum » *${info.album}*
` : ''}${info?.duration ? `> ⴵ Duración » *${info.duration}*
` : ''}> 🜸 Enlace » ${info?.url || trackUrl}`

    await conn.sendMessage(m.chat, {
      text: caption,
      contextInfo: {
        externalAdReply: {
          showAdAttribution: true,
          title: '✧ Spotify • Music ✧',
          body: 'Asta Bot',
          mediaType: 1,
          thumbnailUrl: d.image || info?.image,
          sourceUrl: info?.url || trackUrl
        }
      }
    }, { quoted: m })

    await conn.sendMessage(m.chat, { 
      audio: { url: d.url }, 
      fileName: `${d.title}.mp3`, 
      mimetype: 'audio/mpeg' 
    }, { quoted: m })

    await m.react('✔️')
  } catch (err) {
    await m.react('✖️')
    m.reply(`⚠︎ Error.
> Usa *${usedPrefix}report* para informarlo.

${err.message}`)
  }
}

handler.help = ["spotify", "splay"]
handler.tags = ["descargas"]
handler.command = ["spotify", "splay"]

export default handler
