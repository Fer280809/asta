import axios from 'axios'
import cheerio from 'cheerio'

let handler = async (m, { conn, text }) => {
  if (!text) {
    return conn.reply(m.chat, `❀ Te faltó el link de Twitter/X.`, m)
  }

  try {
    await m.react('🕒')

    const result = await twitterScraper(text);
    if (!result.status) return conn.reply(m.chat, `❌ No se pudo obtener el contenido.`, m)

    if (result.data.type === 'video') {
      let caption = `❀ *Twitter Download* ❀

> ✦ Título » ${result.data.title}
> ⴵ Duración » ${result.data.duration}`
      await conn.sendFile(m.chat, result.data.dl[0].url, "video.mp4", caption, m)
    } else {
      await conn.sendMessage(m.chat, {
        image: { url: result.data.imageUrl },
        caption: `❀ *Twitter Download* ❀`
      }, { quoted: m })
    }

    await m.react('✔️')
  } catch (e) {
    await m.react('✖️')
    return conn.reply(m.chat, `⚠︎ Error: ${e.message}`, m)
  }
}

async function twitterScraper(url) {
  return new Promise(async (resolve, reject) => {
    try {
      const twitterUrlMatch = url.match(/(https:\/\/x.com\/[^?]+)/)
      const tMatch = url.match(/t=([^&]+)/)
      const twitterUrl = twitterUrlMatch ? twitterUrlMatch[1] : ''
      const t = tMatch ? tMatch[1] : ''
      const urlnya = encodeURIComponent(`${twitterUrl}?t=${t}&s=19`)

      const response = await axios.post("https://savetwitter.net/api/ajaxSearch", `q=${urlnya}&lang=en`)
      const $ = cheerio.load(response.data.data)
      const isVideo = $('.tw-video').length > 0
      const twitterId = $('#TwitterId').val()

      if (isVideo) {
        const data = []
        $('.dl-action a').each((i, elem) => {
          const quality = $(elem).text().trim()
          const url = $(elem).attr('href')
          data.push({ quality, url })
        })
        const title = $('.tw-middle h3').text().trim()
        const videoDuration = $('.tw-middle p').text().trim()
        resolve({
          status: true,
          data: { type: "video", title, duration: videoDuration, dl: data }
        })
      } else {
        const imageUrl = $('.photo-list .download-items__thumb img').attr('src')
        resolve({
          status: true,
          data: { type: "image", imageUrl }
        })
      }
    } catch (error) {
      reject(error)
    }
  })
}

handler.command = ["x", "twitter", "xdl"]
handler.help = ["twitter <link>"]
handler.tags = ["descargas"]

export default handler
