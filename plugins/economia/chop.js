import { items, gameConfig } from '../../lib/index.js'
import { getUser, saveData } from '../../lib/database.js'

let handler = async (m, { sock }) => {
  const user = getUser(m.sender)
  const now = Date.now()
  const cooldown = gameConfig.cooldowns.chop * 60 * 1000

  if (now - user.cooldowns.chop < cooldown) {
    const timeLeft = Math.ceil((cooldown - (now - user.cooldowns.chop)) / 1000 / 60)
    return sock.sendMessage(m.chat, {
      text: `🪓 Estás cansado. Descansa ${timeLeft} minutos.`
    }, { quoted: m })
  }

  const chopPower = user.equipment.tool?.chop || 1
  const baseAmount = Math.floor(Math.random() * 3) + 2 + Math.floor(chopPower / 2)

  // Tipos de madera
  const woods = [
    { item: 'roble', chance: 50 },
    { item: 'abeto', chance: 35 },
    { item: 'abedul', chance: 20 },
    { item: 'jungle', chance: 10 }
  ]

  const drops = []

  woods.forEach(wood => {
    if (Math.random() * 100 < wood.chance) {
      const amount = Math.floor(Math.random() * baseAmount) + 1
      drops.push({ item: wood.item, amount })
      user.inventory[wood.item] = (user.inventory[wood.item] || 0) + amount
    }
  })

  // Siempre algo de roble
  if (drops.length === 0) {
    const amount = Math.floor(Math.random() * 3) + 1
    drops.push({ item: 'roble', amount })
    user.inventory.roble = (user.inventory.roble || 0) + amount
  }

  // Palos como extra
  if (Math.random() > 0.5) {
    const sticks = Math.floor(Math.random() * 4) + 2
    user.inventory.palos = (user.inventory.palos || 0) + sticks
    drops.push({ item: 'palos', amount: sticks })
  }

  const expGain = Math.floor(Math.random() * 15) + 8
  user.exp += expGain
  user.cooldowns.chop = now
  user.stats.chopping++

  saveData('users')

  let dropText = drops.map(d => {
    const item = items[d.item]
    return `${item.emoji} ${item.name}: ${d.amount}`
  }).join('
')

  await sock.sendMessage(m.chat, {
    text: `🪓 *Tala completada!*

📦 Obtenido:
${dropText}

⭐ EXP: +${expGain}
🪓 Chopping LVL: ${user.stats.chopping}`,
    mentions: [m.sender]
  }, { quoted: m })
}

handler.help = ['chop', 'talar', 'cortar']
handler.tags = ['economy', 'adventure']
handler.command = ['chop', 'talar', 'cortar']

export default handler
