import { items, gameConfig } from '../../lib/index.js'
import { getUser, saveData } from '../../lib/database.js'

let handler = async (m, { sock }) => {
  const user = getUser(m.sender)
  const now = Date.now()
  const cooldown = gameConfig.cooldowns.hunt * 60 * 1000

  if (now - user.cooldowns.hunt < cooldown) {
    const timeLeft = Math.ceil((cooldown - (now - user.cooldowns.hunt)) / 1000 / 60)
    return sock.sendMessage(m.chat, {
      text: `🏹 Necesitas descansar ${timeLeft} minutos.`
    }, { quoted: m })
  }

  // Animales posibles
  const animals = [
    { name: 'Conejo', emoji: '🐰', drops: ['carne', 'cuero'], exp: 10 },
    { name: 'Vaca', emoji: '🐄', drops: ['carne', 'cuero'], exp: 15 },
    { name: 'Pollo', emoji: '🐔', drops: ['pollo', 'plumas'], exp: 8 },
    { name: 'Oveja', emoji: '🐑', drops: ['lana'], exp: 12 },
    { name: 'Cerdo', emoji: '🐷', drops: ['carne'], exp: 14 },
    { name: 'Lobo', emoji: '🐺', drops: ['carne', 'dientes'], exp: 20 },
    { name: 'Oso', emoji: '🐻', drops: ['carne', 'cuero'], exp: 30 }
  ]

  const hunt = animals[Math.floor(Math.random() * animals.length)]
  const drops = []

  hunt.drops.forEach(drop => {
    const amount = Math.floor(Math.random() * 2) + 1
    drops.push({ item: drop, amount })
    user.inventory[drop] = (user.inventory[drop] || 0) + amount
  })

  user.exp += hunt.exp
  user.cooldowns.hunt = now
  user.stats.hunting++

  saveData('users')

  let dropText = drops.map(d => {
    const item = items[d.item]
    return `${item.emoji} ${item.name}: ${d.amount}`
  }).join('
')

  await sock.sendMessage(m.chat, {
    text: `🏹 *Cazaste un ${hunt.emoji} ${hunt.name}!*

📦 Obtenido:
${dropText}

⭐ EXP: +${hunt.exp}
🏹 Hunting LVL: ${user.stats.hunting}`,
    mentions: [m.sender]
  }, { quoted: m })
}

handler.help = ['hunt', 'cazar', 'caza']
handler.tags = ['economy', 'adventure']
handler.command = ['hunt', 'cazar', 'caza']

export default handler
