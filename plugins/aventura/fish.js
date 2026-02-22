import { items, gameConfig, getRandomFish } from '../../lib/index.js'
import { getUser, saveData } from '../../lib/database.js'

let handler = async (m, { sock }) => {
  const user = getUser(m.sender)
  const now = Date.now()
  const cooldown = 5 * 60 * 1000 // 5 minutos

  if (now - (user.cooldowns?.fish || 0) < cooldown) {
    const timeLeft = Math.ceil((cooldown - (now - user.cooldowns.fish)) / 1000 / 60)
    return sock.sendMessage(m.chat, {
      text: `🎣 Debes esperar ${timeLeft} minutos para pescar de nuevo.`
    }, { quoted: m })
  }

  /* const fishes = [
    { name: 'Pez Común', emoji: '🐟', value: 10, exp: 5 },
    { name: 'Pez Tropical', emoji: '🐠', value: 25, exp: 10 },
    { name: 'Pez Globo', emoji: '🐡', value: 40, exp: 15 },
    { name: 'Tiburón', emoji: '🦈', value: 100, exp: 30 },
    { name: 'Ballena', emoji: '🐋', value: 200, exp: 50 },
    { name: 'Calamar', emoji: '🦑', value: 60, exp: 20 },
    { name: 'Langosta', emoji: '🦞', value: 80, exp: 25 },
    { name: 'Basura', emoji: '🥾', value: 1, exp: 1 } */
  ]

  const luck = user.stats?.luck || 1
  const fishAmount = Math.floor(Math.random() * 3) + 1 + Math.floor(luck / 3)
  const fish = getRandomFish()
  const amount = fishAmount

  user.inventory = user.inventory || {}
  const itemKey = fish.name.toLowerCase().replace(/\s/g, '_')
  user.inventory[itemKey] = (user.inventory[itemKey] || 0) + amount

  const expGain = fish.exp * amount
  user.exp = (user.exp || 0) + expGain
  user.cooldowns = user.cooldowns || {}
  user.cooldowns.fish = now

  // Subir nivel de pesca
  user.stats = user.stats || {}
  user.stats.fishing = (user.stats.fishing || 0) + 1

  saveData('users')

  await sock.sendMessage(m.chat, {
    text: `🎣 *Pescaste!*

${fish.emoji} ${fish.name} x${amount}
💰 Valor: ${fish.value * amount} yenes
⭐ EXP: +${expGain}
🎣 Fishing LVL: ${user.stats.fishing}`,
    mentions: [m.sender]
  }, { quoted: m })
}

handler.help = ['fish', 'pescar']
handler.tags = ['economy', 'adventure']
handler.command = ['fish', 'pescar', 'pesca']

export default handler
