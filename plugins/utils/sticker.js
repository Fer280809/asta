import { downloadContentFromMessage } from '@whiskeysockets/baileys'
import { Sticker } from 'wa-sticker-formatter'

let handler = async (m, { sock }) => {
  try {
    const quoted = m.quoted?.message

    if (!quoted?.imageMessage) {
      return sock.sendMessage(m.chat, {
        text: '✧ Responde a una imagen para convertirla en sticker'
      }, { quoted: m })
    }

    const username = m.pushName || 'AstaBot'

    const stream = await downloadContentFromMessage(quoted.imageMessage, 'image')
    let buffer = Buffer.alloc(0)
    for await (const chunk of stream) {
      buffer = Buffer.concat([buffer, chunk])
    }

    const sticker = new Sticker(buffer, {
      pack: 'AstaBot',
      author: username,
      quality: 100
    })

    const finalBuffer = await sticker.toBuffer()

    await sock.sendMessage(m.chat, {
      sticker: finalBuffer
    }, { quoted: m })

  } catch (e) {
    console.error(e)
    await sock.sendMessage(m.chat, {
      text: '✧ Error creando sticker'
    }, { quoted: m })
  }
}

handler.help = ['sticker', 's', 'stick']
handler.tags = ['utils', 'sticker']
handler.command = ['sticker', 's', 'stick']

export default handler
