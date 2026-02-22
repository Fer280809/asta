import { gameConfig } from '../../lib/index.js'
import { getUser, saveData } from '../../lib/database.js'

let handler = async (m, { sock }) => {
  const user = getUser(m.sender)
  const now = Date.now()
  const cooldown = 24 * 60 * 60 * 1000 // 24 horas

  if (now - user.cooldowns.daily < cooldown) {
    const timeLeft = Math.ceil((cooldown - (now - user.cooldowns.daily)) / 1000 / 60 / 60)
    return sock.sendMessage(m.chat, {
      text: `⏳ Ya reclamaste tu recompensa diaria.
Vuelve en ${timeLeft} horas.`
    }, { quoted: m })
  }

  const reward = gameConfig.dailyReward
  const bonus = Math.floor(Math.random() * (gameConfig.dailyBonus.max - gameConfig.dailyBonus.min)) + gameConfig.dailyBonus.min // Bonus aleatorio 0-500
  const total = reward + bonus

  user.yenes += total
  user.cooldowns.daily = now

  // Bonus por racha (si implementamos rachas después)
  const expGain = 50
  user.exp += expGain

  saveData('users')

  await sock.sendMessage(m.chat, {
    text: `🎁 *Recompensa Diaria Reclamada!*

💰 Yenes: +${total.toLocaleString()}
⭐ EXP: +${expGain}
💵 Total: ${user.yenes.toLocaleString()}

¡Vuelve mañana para más!`,
    mentions: [m.sender]
  }, { quoted: m })
}

handler.help = ['daily', 'diario', 'recompensa']
handler.tags = ['economy']
handler.command = ['daily', 'diario', 'recompensa']

export default handler
