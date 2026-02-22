import { db } from '../../lib/database.js'

let handler = async (m, { sock, args }) => {
  const type = args[0]?.toLowerCase() || 'yen'

  const users = Object.entries(db.users || {})

  if (users.length === 0) {
    return sock.sendMessage(m.chat, {
      text: '📊 No hay datos de usuarios aún.'
    }, { quoted: m })
  }

  let sorted = []
  let title = ''

  switch (type) {
    case 'yen':
    case 'yenes':
    case 'money':
      sorted = users.sort((a, b) => (b[1].yenes || 0) - (a[1].yenes || 0)).slice(0, 10)
      title = '💰 *TOP MÁS RICOS* 💰'
      break
    case 'level':
    case 'nivel':
      sorted = users.sort((a, b) => (b[1].level || 1) - (a[1].level || 1)).slice(0, 10)
      title = '⭐ *TOP NIVELES* ⭐'
      break
    case 'exp':
      sorted = users.sort((a, b) => (b[1].exp || 0) - (a[1].exp || 0)).slice(0, 10)
      title = '✨ *TOP EXPERIENCIA* ✨'
      break
    default:
      sorted = users.sort((a, b) => (b[1].yenes || 0) - (a[1].yenes || 0)).slice(0, 10)
      title = '💰 *TOP MÁS RICOS* 💰'
  }

  let text = `${title}

`

  sorted.forEach((user, i) => {
    const [jid, data] = user
    const number = jid.split('@')[0]
    const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`

    if (type === 'level' || type === 'nivel') {
      text += `${medal} @${number} - Nivel ${data.level || 1}
`
    } else if (type === 'exp') {
      text += `${medal} @${number} - ${data.exp || 0} EXP
`
    } else {
      text += `${medal} @${number} - ${(data.yenes || 0).toLocaleString()} yenes
`
    }
  })

  text += `
📊 Usa: #top <yen/level/exp>`

  await sock.sendMessage(m.chat, {
    text,
    mentions: sorted.map(u => u[0])
  }, { quoted: m })
}

handler.help = ['top', 'leaderboard', 'rank']
handler.tags = ['economy']
handler.command = ['top', 'leaderboard', 'rank', 'ranking']

export default handler
