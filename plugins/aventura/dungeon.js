import { items, gameConfig } from '../../lib/index.js'
import { getUser, saveData } from '../../lib/database.js'

let handler = async (m, { sock }) => {
  const user = getUser(m.sender)
  const now = Date.now()
  const cooldown = 2 * 60 * 60 * 1000 // 2 horas

  if (now - (user.cooldowns?.dungeon || 0) < cooldown) {
    const timeLeft = Math.ceil((cooldown - (now - user.cooldowns.dungeon)) / 1000 / 60)
    return sock.sendMessage(m.chat, {
      text: `🏰 La mazmorra se regenera en ${timeLeft} minutos.`
    }, { quoted: m })
  }

  if (user.hp < 50) {
    return sock.sendMessage(m.chat, {
      text: '❌ Necesitas al menos 50 HP para entrar a la mazmorra.'
    }, { quoted: m })
  }

  const floors = gameConfig.dungeon.floors /* [
    { name: 'Sótano', emoji: '🕳️', difficulty: 1, reward: 100 },
    { name: 'Cripta', emoji: '⚰️', difficulty: 2, reward: 250 },
    { name: 'Caverna', emoji: '🦇', difficulty: 3, reward: 500 },
    { name: 'Abismo', emoji: '🔥', difficulty: 4, reward: 1000 },
    { name: 'Infierno', emoji: '👹', difficulty: 5, reward: 2000 } */
  ]

  const weapon = user.equipment?.weapon ? items[user.equipment.weapon] : null
  const armor = user.equipment?.armor ? items[user.equipment.armor] : null

  const attack = (weapon?.damage || 5) + (user.stats?.strength || 1)
  const defense = (armor?.defense || 0) + (user.stats?.defense || 1)

  let totalReward = 0
  let totalExp = 0
  let floorsCleared = 0
  let hpLost = 0
  let drops = []

  for (const floor of floors) {
    const enemyPower = floor.difficulty * 10 + Math.floor(Math.random() * 10)
    const playerPower = attack + defense + Math.floor(Math.random() * 10)

    if (playerPower > enemyPower) {
      floorsCleared++
      totalReward += floor.reward
      totalExp += floor.reward / 2

      // Posible drop
      if (Math.random() < 0.3) {
        const possibleDrops = ['pocion', 'oro', 'diamante']
        const drop = possibleDrops[Math.floor(Math.random() * possibleDrops.length)]
        drops.push(drop)
        user.inventory[drop] = (user.inventory[drop] || 0) + 1
      }
    } else {
      const damage = Math.floor(Math.random() * 15) + 5
      hpLost += damage
      user.hp = Math.max(0, user.hp - damage)
      if (user.hp <= 0) break
    }
  }

  user.yenes = (user.yenes || 0) + totalReward
  user.exp = (user.exp || 0) + totalExp
  user.cooldowns = user.cooldowns || {}
  user.cooldowns.dungeon = now

  // Curación automática si sobrevivió
  if (user.hp > 0) {
    user.hp = Math.min(user.maxHp, user.hp + 20)
  }

  saveData('users')

  let text = `🏰 *MAZMORRA COMPLETADA* 🏰

`
  text += `📊 Pisos superados: ${floorsCleared}/${floors.length}
`
  text += `💰 Recompensa: ${totalReward} yenes
`
  text += `⭐ EXP: +${totalExp}
`
  text += `💔 HP perdido: ${hpLost}
`
  text += `❤️ HP actual: ${user.hp}/${user.maxHp}
`

  if (drops.length > 0) {
    text += `
📦 Drops: ${drops.map(d => config.items[d]?.emoji || '•').join(' ')}
`
  }

  if (user.hp <= 0) {
    text += `
💀 *Caíste en combate!* Perdiste el 10% de tus yenes.`
    user.yenes = Math.floor(user.yenes * (1 - gameConfig.dungeon.deathPenalty))
    user.hp = user.maxHp
    saveData('users')
  }

  await sock.sendMessage(m.chat, {
    text,
    mentions: [m.sender]
  }, { quoted: m })
}

handler.help = ['dungeon', 'mazmorra', 'dun']
handler.tags = ['economy', 'adventure']
handler.command = ['dungeon', 'mazmorra', 'dun']

export default handler
