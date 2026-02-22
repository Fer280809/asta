import { items } from '../../lib/index.js'
import { getUser, saveData } from '../../lib/database.js'

let handler = async (m, { sock, args }) => {
  const target = m.mentionedJid?.[0] || m.quoted?.sender

  if (!target) {
    return sock.sendMessage(m.chat, {
      text: `⚔️ *Desafía a alguien a un duelo!*

Uso: #duel @usuario`
    }, { quoted: m })
  }

  if (target === m.sender) {
    return sock.sendMessage(m.chat, {
      text: '❌ No puedes duelarte a ti mismo.'
    }, { quoted: m })
  }

  const user1 = getUser(m.sender)
  const user2 = getUser(target)

  if (user1.hp < 30 || user2.hp < 30) {
    return sock.sendMessage(m.chat, {
      text: '❌ Ambos jugadores necesitan al menos 30 HP.'
    }, { quoted: m })
  }

  // Calcular poder
  const power1 = (user1.stats?.strength || 1) + (user1.level || 1) * 2 + Math.floor(Math.random() * 10)
  const power2 = (user2.stats?.strength || 1) + (user2.level || 1) * 2 + Math.floor(Math.random() * 10)

  let winner, loser, winnerData, loserData

  if (power1 > power2) {
    winner = m.sender
    loser = target
    winnerData = user1
    loserData = user2
  } else {
    winner = target
    loser = m.sender
    winnerData = user2
    loserData = user1
  }

  // Daño
  const damage = Math.floor(Math.random() * 20) + 10
  loserData.hp = Math.max(0, loserData.hp - damage)

  // Recompensa
  const reward = Math.floor(Math.random() * 100) + 50
  winnerData.yenes = (winnerData.yenes || 0) + reward
  winnerData.exp = (winnerData.exp || 0) + 30

  saveData('users')

  await sock.sendMessage(m.chat, {
    text: `⚔️ *DUELO FINALIZADO* ⚔️

🏆 *Ganador:* @${winner.split('@')[0]}
💥 Poder: ${power1 > power2 ? power1 : power2}
💰 Recompensa: ${reward} yenes
⭐ EXP: +30

💀 *Perdedor:* @${loser.split('@')[0]}
💔 Daño recibido: ${damage} HP
❤️ HP restante: ${loserData.hp}/${loserData.maxHp}`,
    mentions: [winner, loser]
  }, { quoted: m })
}

handler.help = ['duel', 'duelo', 'pvp']
handler.tags = ['economy', 'adventure']
handler.command = ['duel', 'duelo', 'pvp', 'fight']

export default handler
