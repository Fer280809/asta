import { gameConfig } from '../../lib/index.js'
import { getUser, saveData } from '../../lib/database.js'

let handler = async (m, { sock, args }) => {
  const amount = parseInt(args[0]) || 100

  if (amount < gameConfig.gambling.minBet) {
    return sock.sendMessage(m.chat, {
      text: '❌ Apuesta mínima: 50 yenes'
    }, { quoted: m })
  }

  const user = getUser(m.sender)

  if (user.yenes < amount) {
    return sock.sendMessage(m.chat, {
      text: `❌ No tienes ${amount} yenes.`
    }, { quoted: m })
  }

  const symbols = gameConfig.gambling.symbols
  const weights = gameConfig.gambling.slots.weights // Probabilidades

  const roll = () => {
    const total = weights.reduce((a, b) => a + b, 0)
    let random = Math.random() * total
    for (let i = 0; i < symbols.length; i++) {
      random -= weights[i]
      if (random <= 0) return symbols[i]
    }
    return symbols[0]
  }

  const slot1 = roll()
  const slot2 = roll()
  const slot3 = roll()

  let win = false
  let multiplier = 0

  if (slot1 === slot2 && slot2 === slot3) {
    win = true
    if (slot1 === '7️⃣') multiplier = 10
    else if (slot1 === '💎') multiplier = 7
    else if (slot1 === '🎰') multiplier = 20
    else multiplier = 5
  } else if (slot1 === slot2 || slot2 === slot3 || slot1 === slot3) {
    win = true
    multiplier = 2
  }

  if (win) {
    const winnings = amount * multiplier
    user.yenes += winnings - amount
    saveData('users')

    await sock.sendMessage(m.chat, {
      text: `🎰 | ${slot1} | ${slot2} | ${slot3} | 🎰

✅ ¡GANASTE!
💰 ${winnings} yenes
📈 Multiplicador: ${multiplier}x`
    }, { quoted: m })
  } else {
    user.yenes -= amount
    saveData('users')

    await sock.sendMessage(m.chat, {
      text: `🎰 | ${slot1} | ${slot2} | ${slot3} | 🎰

❌ Perdiste ${amount} yenes`
    }, { quoted: m })
  }
}

handler.help = ['slots', 'slot', 'tragamonedas']
handler.tags = ['economy', 'games']
handler.command = ['slots', 'slot', 'tragamonedas']

export default handler
