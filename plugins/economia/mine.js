import { items, gameConfig } from '../../lib/index.js'
import { getUser, saveData } from '../../lib/database.js'

let handler = async (m, { sock }) => {
  const user = getUser(m.sender)
  const now = Date.now()
  const cooldown = gameConfig.cooldowns.mine * 60 * 1000

  if (now - user.cooldowns.mine < cooldown) {
    const timeLeft = Math.ceil((cooldown - (now - user.cooldowns.mine)) / 1000 / 60)
    return sock.sendMessage(m.chat, {
      text: `⛏️ Estás cansado. Descansa ${timeLeft} minutos.`
    }, { quoted: m })
  }

  // Sistema de probabilidades
  const drops = []
  const miningPower = user.equipment.tool?.mining || 1
  const luck = user.stats.luck

  // Cantidad base de items
  const baseAmount = Math.floor(Math.random() * 3) + 1 + Math.floor(miningPower / 2)

  // Probabilidades de minerales
  const minerals = [
    { item: 'carbon', chance: 60 },
    { item: 'hierro', chance: 40 },
    { item: 'oro', chance: 20 },
    { item: 'diamante', chance: 10 + luck },
    { item: 'esmeralda', chance: 5 + luck },
    { item: 'obsidiana', chance: 15 }
  ]

  // Piedra siempre
  const stoneAmount = Math.floor(Math.random() * 5) + 2
  drops.push({ item: 'piedra', amount: stoneAmount })
  user.inventory.piedra = (user.inventory.piedra || 0) + stoneAmount

  // Minerales aleatorios
  minerals.forEach(min => {
    if (Math.random() * 100 < min.chance) {
      const amount = Math.floor(Math.random() * baseAmount) + 1
      drops.push({ item: min.item, amount })
      user.inventory[min.item] = (user.inventory[min.item] || 0) + amount
    }
  })

  // EXP y cooldown
  const expGain = Math.floor(Math.random() * 20) + 10
  user.exp += expGain
  user.cooldowns.mine = now
  user.stats.mining++

  saveData('users')

  let dropText = drops.map(d => {
    const item = items[d.item]
    return `${item.emoji} ${item.name}: ${d.amount}`
  }).join('
')

  await sock.sendMessage(m.chat, {
    text: `⛏️ *Minaste en la cueva!*

📦 Obtenido:
${dropText}

⭐ EXP: +${expGain}
⛏️ Mining LVL: ${user.stats.mining}`,
    mentions: [m.sender]
  }, { quoted: m })
}

handler.help = ['mine', 'minar', 'picar']
handler.tags = ['economy', 'adventure']
handler.command = ['mine', 'minar', 'picar']

export default handler
