import { items, locations, enemies, getRandomEnemy, calculateDamage, processDrops, gameConfig } from '../../lib/index.js'
import { getUser, saveData } from '../../lib/database.js'

let handler = async (m, { sock, args }) => {
  const user = getUser(m.sender)
  const now = Date.now()
  const cooldown = 30 * 60 * 1000 // 30 minutos

  if (now - user.cooldowns.adventure < cooldown) {
    const timeLeft = Math.ceil((cooldown - (now - user.cooldowns.adventure)) / 1000 / 60)
    return sock.sendMessage(m.chat, {
      text: `🗺️ Necesitas descansar ${timeLeft} minutos antes de otra aventura.`
    }, { quoted: m })
  }

  // Verificar HP
  if (user.hp < 20) {
    return sock.sendMessage(m.chat, {
      text: '❤️ Estás muy débil. Cúrate primero con #heal'
    }, { quoted: m })
  }

  // Seleccionar ubicación
  let location
  if (args.length > 0) {
    const searchName = args.join(' ').toLowerCase()
    location = locations.find(l => 
      l.name.toLowerCase() === searchName ||
      l.name.toLowerCase().includes(searchName)
    )
  }

  if (!location) {
    // Mostrar ubicaciones disponibles
    let text = `🗺️ *Lugares de Aventura*

`
    config.locations.forEach((loc, i) => {
      const diffStars = '⭐'.repeat(loc.difficulty) + '⚫'.repeat(5 - loc.difficulty)
      text += `${loc.emoji} *${loc.name}*
`
      text += `├ Dificultad: ${diffStars}
`
      text += `├ Posibles drops: ${loc.drops.slice(0, 3).join(', ')}...
`
      text += `└ Usa: ${config.prefix}adventure ${i + 1}

`
    })
    return sock.sendMessage(m.chat, { text }, { quoted: m })
  }

  // Calcular resultado basado en stats
  const weapon = user.equipment.weapon ? config.items[user.equipment.weapon] : null
  const armor = user.equipment.armor ? config.items[user.equipment.armor] : null

  const attack = (weapon?.damage || 5) + user.stats.strength
  const defense = (armor?.defense || 0) + user.stats.defense

  // Evento aleatorio
  const events = ['combat', 'treasure', 'explore', 'trap']
  const event = events[Math.floor(Math.random() * events.length)]

  let result = ''
  let drops = []
  let expGain = 0
  let hpLoss = 0

  switch (event) {
    case 'combat':
      const enemy = getRandomEnemy(location.id, location.difficulty)
      const playerDamage = Math.max(1, attack - Math.floor(Math.random() * 5))
      const enemyDamage = calculateDamage(enemy, defense)

      hpLoss = enemyDamage
      user.hp = Math.max(0, user.hp - hpLoss)
      expGain = enemy.exp

      // Drops del enemigo
      /* enemy.drops.forEach(drop => {
        if (Math.random() > 0.5) {
          const amount = Math.floor(Math.random() * 2) + 1
          drops.push({ item: drop, amount })
          user.inventory[drop] = (user.inventory[drop] || 0) + amount */
      const drops = processDrops(enemy)
      drops.forEach(d => {
        user.inventory[d.item] = (user.inventory[d.item] || 0) + d.amount
      })
        }
      })

      result = `⚔️ *¡Combate!*
Enemigo: ${enemy.emoji} ${enemy.name}
Daño recibido: ${hpLoss}
Daño infligido: ${playerDamage}`
      break

    case 'treasure':
      expGain = 50
      const treasureItems = location.drops.slice(0, 2)
      treasureItems.forEach(item => {
        const amount = Math.floor(Math.random() * 3) + 1
        drops.push({ item, amount })
        user.inventory[item] = (user.inventory[item] || 0) + amount
      })
      result = `🎁 *¡Tesoro encontrado!*
Encontraste un cofre con items valiosos.`
      break

    case 'explore':
      expGain = 30
      const exploreItem = location.drops[Math.floor(Math.random() * location.drops.length)]
      const amount = Math.floor(Math.random() * 5) + 1
      drops.push({ item: exploreItem, amount })
      user.inventory[exploreItem] = (user.inventory[exploreItem] || 0) + amount
      result = `🔍 *Exploración exitosa*
Encontraste recursos útiles.`
      break

    case 'trap':
      hpLoss = Math.floor(Math.random() * 15) + 5
      user.hp = Math.max(0, user.hp - hpLoss)
      expGain = 10
      result = `💥 *¡Trampa!*
Caíste en una trampa. Perdiste ${hpLoss} HP.`
      break
  }

  user.exp += expGain
  user.cooldowns.adventure = now

  // Verificar subida de nivel
  const expNeeded = user.level * 100
  if (user.exp >= expNeeded) {
    user.level++
    user.exp -= expNeeded
    user.maxHp += 10
    user.hp = user.maxHp
    user.stats.strength += 1
    result += `

🎉 *¡Subiste de nivel!*
Nivel: ${user.level}
HP máximo aumentado.`
  }

  saveData('users')

  let dropText = drops.length > 0 ? 
    '
📦 *Obtenido:*
' + drops.map(d => {
      const item = config.items[d.item]
      return `${item?.emoji || '•'} ${item?.name || d.item}: ${d.amount}`
    }).join('
') : ''

  await sock.sendMessage(m.chat, {
    text: `🗺️ *Aventura en ${location.emoji} ${location.name}*

${result}${dropText}

⭐ EXP: +${expGain}
❤️ HP: ${user.hp}/${user.maxHp}`,
    mentions: [m.sender]
  }, { quoted: m })
}

handler.help = ['adventure', 'aventura', 'explorar']
handler.tags = ['economy', 'adventure']
handler.command = ['adventure', 'aventura', 'explorar']

export default handler
