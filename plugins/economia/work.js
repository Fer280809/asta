import { gameConfig, getRandomJob } from '../../lib/index.js'
import { getUser, saveData } from '../../lib/database.js'

let handler = async (m, { sock }) => {
  const user = getUser(m.sender)
  const now = Date.now()
  const cooldown = 60 * 60 * 1000 // 1 hora

  if (now - (user.cooldowns?.work || 0) < cooldown) {
    const timeLeft = Math.ceil((cooldown - (now - user.cooldowns.work)) / 1000 / 60)
    return sock.sendMessage(m.chat, {
      text: `💼 Debes esperar ${timeLeft} minutos para trabajar de nuevo.`
    }, { quoted: m })
  }

  /* const jobs = [
    { name: 'Carpintero', emoji: '🔨', min: 100, max: 300 },
    { name: 'Herrero', emoji: '⚒️', min: 150, max: 400 },
    { name: 'Cocinero', emoji: '👨‍🍳', min: 80, max: 250 },
    { name: 'Minero', emoji: '⛏️', min: 120, max: 350 },
    { name: 'Granjero', emoji: '👨‍🌾', min: 90, max: 280 },
    { name: 'Alquimista', emoji: '⚗️', min: 200, max: 500 },
    { name: 'Ladrón', emoji: '🥷', min: 50, max: 600, risk: true } */
  ]

  const job = getRandomJob()
  const luck = user.stats?.luck || 1

  let earned = Math.floor(Math.random() * (job.max - job.min)) + job.min
  earned += Math.floor(luck * 5)

  // Riesgo para ladrón
  if (job.risk && Math.random() < 0.3) {
    const fine = Math.floor(earned * 0.5)
    user.yenes = Math.max(0, user.yenes - fine)
    saveData('users')
    return sock.sendMessage(m.chat, {
      text: `🥷 *Intentaste robar pero te atraparon!*

💸 Multa: ${fine} yenes
💰 Saldo: ${user.yenes} yenes`
    }, { quoted: m })
  }

  user.yenes = (user.yenes || 0) + earned
  user.exp = (user.exp || 0) + 20
  user.cooldowns = user.cooldowns || {}
  user.cooldowns.work = now

  saveData('users')

  await sock.sendMessage(m.chat, {
    text: `💼 *Trabajaste como ${job.emoji} ${job.name}*

💰 Ganaste: ${earned} yenes
⭐ EXP: +20
💵 Total: ${user.yenes} yenes`,
    mentions: [m.sender]
  }, { quoted: m })
}

handler.help = ['work', 'trabajar']
handler.tags = ['economy']
handler.command = ['work', 'trabajar', 'trabajo']

export default handler
