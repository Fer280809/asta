const handler = async (m, { args, conn, usedPrefix }) => {
  try {
    if (!args[0]) {
      return conn.reply(m.chat, `❀ *Ingresa un enlace válido*

📝 Ejemplos:
• https://www.instagram.com/p/...
• https://www.facebook.com/reel/...`, m)
    }

    const url = args[0].trim()

    if (!/https?:\/\/(www\.)?(instagram\.com|facebook\.com|fb\.watch)/i.test(url)) {
      return conn.reply(m.chat, `❌ *Enlace no válido*

Solo Instagram o Facebook.`, m)
    }

    await m.react('🕒')

    // APIs a probar
    const apis = [
      `https://api.vreden.my.id/api/igdownload?url=${encodeURIComponent(url)}`,
      `https://delirius-api-oficial.vercel.app/download/instagram?url=${encodeURIComponent(url)}`,
      `https://api-samir.onrender.com/igdl?url=${encodeURIComponent(url)}`
    ]

    let mediaUrls = []
    let success = false

    for (const api of apis) {
      try {
        const res = await fetch(api, { headers: { 'User-Agent': 'Mozilla/5.0' } })
        if (!res.ok) continue
        const json = await res.json()

        // Parsear respuesta
        if (json.resultado?.respuesta?.datos) {
          mediaUrls = json.resultado.respuesta.datos.map(v => ({ url: v.url, type: v.type || 'video' }))
        } else if (json.data) {
          mediaUrls = json.data.map(v => ({ url: v.url, type: v.type || 'video' }))
        } else if (json.result) {
          mediaUrls = json.result.map(v => ({ url: v.download_link, type: v.type || 'video' }))
        }

        if (mediaUrls.length > 0) {
          success = true
          break
        }
      } catch (e) {
        continue
      }
    }

    if (!success) {
      await m.react('❌')
      return conn.reply(m.chat, `❌ *No se pudo descargar*

El enlace puede ser privado o no válido.`, m)
    }

    // Enviar medios
    for (let i = 0; i < mediaUrls.length; i++) {
      const media = mediaUrls[i]
      try {
        if (media.type === 'image') {
          await conn.sendFile(m.chat, media.url, 'instagram.jpg', 
            `📸 Instagram (${i + 1}/${mediaUrls.length})
✨ Asta-Bot`, m)
        } else {
          await conn.sendFile(m.chat, media.url, 'instagram.mp4', 
            `🎬 Instagram (${i + 1}/${mediaUrls.length})
✨ Asta-Bot`, m)
        }
        if (i < mediaUrls.length - 1) await new Promise(r => setTimeout(r, 1000))
      } catch (e) {
        console.log('Error enviando:', e.message)
      }
    }

    await m.react('✅')

  } catch (error) {
    console.error(error)
    await m.react('⚠️')
    await conn.reply(m.chat, `❌ Error: ${error.message}`, m)
  }
}

handler.command = /^(instagram|ig|fb|facebook|igdl|fbdl)$/i
handler.tags = ['descargas']
handler.help = ['instagram <enlace>', 'facebook <enlace>']

export default handler
