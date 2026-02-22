import { items, gameConfig } from '../../lib/index.js'
import { getUser, saveData } from '../../lib/database.js'

let handler = async (m, { sock, args }) => {
  const user = getUser(m.sender)

  // Lista de items en venta
  const shopItems = [
    { item: 'manzana', price: 15 },
    { item: 'pan', price: 25 },
    { item: 'sopa', price: 40 },
    { item: 'pocion', price: 150 },
    { item: 'pocion_mana', price: 180 },
    { item: 'palos', price: 5 },
    { item: 'espada_madera', price: 60 },
    { item: 'espada_piedra', price: 100 },
    { item: 'pico_madera', price: 50 },
    { item: 'pico_piedra', price: 90 },
    { item: 'hacha_madera', price: 45 },
    { item: 'armadura_cuero', price: 200 }
  ]

  // Mostrar tienda
  if (!args.length || args[0] === 'list') {
    let text = `🏪 *Tienda de Asta*

💰 *Tu dinero:* ${user.yenes.toLocaleString()} yenes

📦 *Items en venta:*

`

    shopItems.forEach(shopItem => {
      const item = items[shopItem.item]
      if (!item) return
      text += `${item.emoji} *${item.name}*
`
      text += `├ Precio: ${shopItem.price} yenes
`
      if (item.heal) text += `├ Cura: ${item.heal} HP
`
      if (item.damage) text += `├ Daño: ${item.damage}
`
      if (item.defense) text += `├ Defensa: ${item.defense}
`
      text += `└ Comprar: ${config.prefix}shop buy ${shopItem.item}

`
    })

    return sock.sendMessage(m.chat, { text }, { quoted: m })
  }

  // Comprar item
  if (args[0] === 'buy' && args[1]) {
    const itemName = args[1].toLowerCase()
    const amount = parseInt(args[2]) || 1

    const shopItem = shopItems.find(s => 
      s.item === itemName || 
      config.items[s.item]?.name.toLowerCase() === itemName
    )

    if (!shopItem) {
      return sock.sendMessage(m.chat, {
        text: '❌ Item no disponible en la tienda.'
      }, { quoted: m })
    }

    const item = items[shopItem.item]
    const totalPrice = (shopItem.price || items[shopItem.item]?.value || 0) * amount

    if (user.yenes < totalPrice) {
      return sock.sendMessage(m.chat, {
        text: `❌ No tienes suficiente dinero.
Necesitas: ${totalPrice} yenes
Tienes: ${user.yenes} yenes`
      }, { quoted: m })
    }

    // Verificar espacio en inventario
    const currentItems = Object.keys(user.inventory).length
    if (currentItems >= gameConfig.maxInventory) {
      return sock.sendMessage(m.chat, {
        text: '❌ Inventario lleno. Vende o usa algunos items primero.'
      }, { quoted: m })
    }

    user.yenes -= totalPrice
    user.inventory[shopItem.item] = (user.inventory[shopItem.item] || 0) + amount

    saveData('users')

    return sock.sendMessage(m.chat, {
      text: `✅ *Compra exitosa!*

${item.emoji} ${item.name} x${amount}
💰 Pagado: ${totalPrice} yenes
💵 Saldo: ${user.yenes.toLocaleString()} yenes`,
      mentions: [m.sender]
    }, { quoted: m })
  }

  // Vender item
  if (args[0] === 'sell' && args[1]) {
    const itemName = args[1].toLowerCase()
    const amount = parseInt(args[2]) || 1

    const itemKey = Object.keys(config.items).find(key => 
      key === itemName || 
      config.items[key].name.toLowerCase() === itemName
    )

    if (!itemKey || !user.inventory[itemKey] || user.inventory[itemKey] < amount) {
      return sock.sendMessage(m.chat, {
        text: '❌ No tienes ese item o cantidad suficiente.'
      }, { quoted: m })
    }

    const item = items[itemKey]
    const sellPrice = Math.floor(item.value * 0.7) * amount // 70% del valor

    user.inventory[itemKey] -= amount
    if (user.inventory[itemKey] <= 0) delete user.inventory[itemKey]
    user.yenes += sellPrice

    saveData('users')

    return sock.sendMessage(m.chat, {
      text: `💰 *Venta exitosa!*

${item.emoji} ${item.name} x${amount}
💵 Recibido: ${sellPrice} yenes
💰 Saldo: ${user.yenes.toLocaleString()} yenes`,
      mentions: [m.sender]
    }, { quoted: m })
  }
}

handler.help = ['shop', 'tienda', 'buy', 'sell']
handler.tags = ['economy']
handler.command = ['shop', 'tienda', 'comprar', 'vender']

export default handler
