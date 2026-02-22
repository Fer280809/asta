let handler = async (m, { sock }) => {
  if (!m.chat.endsWith('@g.us')) return

  try {
    const metadata = await sock.groupMetadata(m.chat)
    const participants = metadata.participants || []

    const admins = participants.filter(p =>
      p.admin === 'admin' || p.admin === 'superadmin'
    )

    let text = '✧ *Administradores del grupo*

'
    let mentions = []

    admins.forEach((a, i) => {
      const num = a.id.split('@')[0]
      text += `❀ ${i + 1}. @${num}
`
      mentions.push(a.id)
    })

    await sock.sendMessage(m.chat, { text, mentions }, { quoted: m })

  } catch (e) {
    console.error(e)
  }
}

handler.help = ['admins', 'adminlist']
handler.tags = ['group']
handler.command = ['admins', 'adminlist', 'listadmin']

export default handler
