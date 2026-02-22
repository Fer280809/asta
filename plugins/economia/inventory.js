import { items } from '../../lib/index.js'
import { getUser } from '../../lib/database.js'

let handler = async (m, { sock, args }) => {
  let target = m.mentionedJid?.[0] || m.quoted?.sender || m.sender

  if (target !== m.sender && !isOwner(m.sender)) {
    target = m.sender
  }

  const user = getUser(target)
  const items = Object.entries(user.inventory)

  if (items.length === 0) {
    return sock.sendMessage(m.chat, {
      text: `📦 *Inventario vacío*

@${target.split('@')[0]} no tiene items.`,
      mentions: [target]
    }, { quoted: m })
  }

  // Categorizar items
  const categories = {
    mineral: [],
    madera: [],
    comida: [],
    arma: [],
    armadura: [],
    herramienta: [],
    recurso: [],
    otro: []
  }

  items.forEach(([key, amount]) => {
    const item = items[key]
    if (!item) {
      categories.otro.push({ key, name: key, emoji: '•', amount })
      return
    }

    const cat = categories[item.type] ? item.type : 'otro'
    categories[cat].push({
      key,
      name: item.name,
      emoji: item.emoji,
      amount
    })
  })

  let text = `📦 *Inventario de @${target.split('@')[0]}*
`
  text += `💰 Yenes: ${user.yenes.toLocaleString()}

`

  const catNames = {
    mineral: '⛏️ Minerales',
    madera: '🪵 Maderas',
    comida: '🍖 Comida',
    arma: '⚔️ Armas',
    armadura: '🛡️ Armaduras',
    herramienta: '🔧 Herramientas',
    recurso: '📋 Recursos',
    otro: '📎 Otros'
  }

  Object.entries(categories).forEach(([cat, items]) => {
    if (items.length > 0) {
      text += `${catNames[cat]}:
`
      items.forEach(item => {
        text += `  ${item.emoji} ${item.name}: ${item.amount}
`
      })
      text += '
'
    }
  })

  text += `📊 Total: ${items.length}/${50} items`

  await sock.sendMessage(m.chat, {
    text,
    mentions: [target]
  }, { quoted: m })
}

handler.help = ['inventory', 'inv', 'inventario', 'items']
handler.tags = ['economy']
handler.command = ['inventory', 'inv', 'inventario', 'items', 'mochila']

export default handler
