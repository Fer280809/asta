import { items, recipes, canCraft } from '../../lib/index.js'
import { getUser, saveData } from '../../lib/database.js'

let handler = async (m, { sock, args }) => {
  const user = getUser(m.sender)

  // Si no hay argumentos, mostrar recetas disponibles
  if (!args.length) {
    let text = `🔨 *Mesa de Crafteo*

📋 *Recetas disponibles:*

`

    Object.entries(config.recipes).forEach(([result, ingredients]) => {
      const item = config.items[result]
      if (!item) return

      let ingText = Object.entries(ingredients)
        .map(([ing, amount]) => {
          const ingItem = items[ing]
          return `${ingItem?.emoji || '•'} ${ingItem?.name || ing}: ${amount}`
        }).join(', ')

      text += `${item.emoji} *${item.name}*
└ ${ingText}

`
    })

    text += `
Usa: ${config.prefix}craft <nombre>`

    return sock.sendMessage(m.chat, { text }, { quoted: m })
  }

  // Buscar receta
  const searchName = args.join(' ').toLowerCase()
  const recipeKey = Object.keys(config.recipes).find(key => {
    const item = config.items[key]
    return key === searchName || 
           item?.name.toLowerCase() === searchName ||
           item?.name.toLowerCase().includes(searchName)
  })

  if (!recipeKey) {
    return sock.sendMessage(m.chat, {
      text: '❌ Receta no encontrada. Usa #craft para ver las disponibles.'
    }, { quoted: m })
  }

  const recipe = config.recipes[recipeKey]
  const resultItem = config.items[recipeKey]

  // Verificar ingredientes
  const missing = []
  for (const [ing, amount] of Object.entries(recipe)) {
    const has = user.inventory[ing] || 0
    if (has < amount) {
      const ingItem = items[ing]
      missing.push(`${ingItem?.emoji || ''} ${ingItem?.name || ing} (${has}/${amount})`)
    }
  }

  if (missing.length > 0) {
    return sock.sendMessage(m.chat, {
      text: `❌ *Ingredientes faltantes:*
${missing.join('
')}`
    }, { quoted: m })
  }

  // Consumir ingredientes
  for (const [ing, amount] of Object.entries(recipe)) {
    user.inventory[ing] -= amount
    if (user.inventory[ing] <= 0) delete user.inventory[ing]
  }

  // Dar resultado
  user.inventory[recipeKey] = (user.inventory[recipeKey] || 0) + 1

  // EXP por craftear
  const expGain = 20
  user.exp += expGain

  saveData('users')

  await sock.sendMessage(m.chat, {
    text: `🔨 *Crafteo exitoso!*

✨ Creaste: ${resultItem.emoji} *${resultItem.name}*
⭐ EXP: +${expGain}

📦 Inventario actualizado.`,
    mentions: [m.sender]
  }, { quoted: m })
}

handler.help = ['craft', 'craftear', 'crear']
handler.tags = ['economy', 'crafting']
handler.command = ['craft', 'craftear', 'crear']

export default handler
