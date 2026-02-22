import config from '../../config.js'

let handler = async (m, { sock }) => {
  if (!m.chat.endsWith('@g.us')) return

  try {
    const metadata = await sock.groupMetadata(m.chat)
    const participants = metadata.participants || []
    const admins = participants.filter(p => p.admin === 'admin' || p.admin === 'superadmin')

    const name = metadata.subject
    const total = participants.length
    const adminCount = admins.length

    let pfp
    try {
      pfp = await sock.profilePictureUrl(m.chat, 'image')
    } catch {
      pfp = config.icono
    }

    const text = `✦ *Información del grupo*

✧ Nombre: ${name}
✿ Miembros: ${total}
❖ Administradores: ${adminCount}

✪ *Enlace del grupo*
${config.group}

❀ ¿Quieres adquirir el bot?
✧ Manda mensaje al owner
+${config.owner[0]}`

    await sock.sendMessage(m.chat, {
      text,
      contextInfo: {
        externalAdReply: {
          title: name,
          body: `Miembros ${total} • Admins ${adminCount}`,
          thumbnailUrl: pfp,
          mediaType: 1,
          renderLargerThumbnail: true,
          sourceUrl: config.group
        }
      }
    }, { quoted: m })

  } catch (e) {
    console.error(e)
  }
}

handler.help = ['info', 'grupo']
handler.tags = ['group']
handler.command = ['info', 'grupo']

export default handler
