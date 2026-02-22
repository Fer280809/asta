import { items, gameConfig } from '../../lib/index.js'
import { getUser, saveData } from '../../lib/database.js'

let handler = async (m, { sock, args }) => {
  const user = getUser(m.sender)
  const now = Date.now()

  // Verificar si tiene items de curación
  const healItems = ['manzana', 'pan', 'sopa', 'carne', 'pollo', 'pocion']
  let usedItem = null
  let healAmount = 0

  // Si especifica item
  if (args[0]) {
    const itemName = args[0].toLowerCase()
    const item = Object.entries(items).find(([key, val]) => 
      key === itemName || val.name.toLowerCase() === itemName
    )

    if (!item) {
      return sock.sendMessage(m.chat, {
        text: '❌ Item no encontrado.'
      }, { quoted: m })
    }

    const [key, val] = item
    if (!val.heal) {
      return sock.sendMessage(m.chat, {
        text: '❌ Ese item no cura.'
      }, { quoted: m })
    }

    if (!user.inventory[key] || user.inventory[key] <= 0) {
      return sock.sendMessage(m.chat, {
        text: `❌ No tienes ${val.emoji} ${val.name}.`
      }, { quoted: m })
    }

    usedItem = val
    healAmount = val.heal
    user.inventory[key]--
    if (user.inventory[key] <= 0) delete user.inventory[key]

  } else {
    // Auto-usar el mejor item disponible
    for (const itemKey of healItems.reverse()) {
      if (user.inventory[itemKey] && user.inventory[itemKey] > 0) {
        const item = config.items[itemKey]
        usedItem = item
        healAmount = item.heal
        user.inventory[itemKey]--
        if (user.inventory[itemKey] <= 0) delete user.inventory[itemKey]
        break
      }
    }
  }

  if (!usedItem) {
    return sock.sendMessage(m.chat, {
      text: '❌ No tienes items de curación. Compra o craftea algunos!'
    }, { quoted: m })
  }

  const oldHp = user.hp
  user.hp = Math.min(user.maxHp, user.hp + healAmount)
  const actualHeal = user.hp - oldHp

  saveData('users')

  await sock.sendMessage(m.chat, {
    text: `❤️ *Te curaste!*

🧪 Usaste: ${usedItem.emoji} ${usedItem.name}
❤️ HP: ${oldHp} → ${user.hp} (+${actualHeal})

💉 HP actual: ${user.hp}/${user.maxHp}`,
    mentions: [m.sender]
  }, { quoted: m })
}

handler.help = ['heal', 'curar', 'comer']
handler.tags = ['economy', 'rpg']
handler.command = ['heal', 'curar', 'comer', 'usar']

export default handler
