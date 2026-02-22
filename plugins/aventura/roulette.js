import { gameConfig } from '../../lib/index.js'
import { getUser, saveData } from '../../lib/database.js'

let handler = async (m, { sock, args }) => {
  const amount = parseInt(args[0])
  const color = args[1]?.toLowerCase()

  if (!amount || amount <= 0 || !color || !['red', 'black', 'green'].includes(color)) {
    return sock.sendMessage(m.chat, {
      text: `🎰 *RULETA* 🎰

Uso: ${config.prefix}roulette <cantidad> <red/black/green>

🔴 Red - Paga 2x (48%)
⚫ Black - Paga 2x (48%)
🟢 Green - Paga 14x (4%)`
    }, { quoted: m })
  }

  const user = getUser(m.sender)

  if (user.yenes < amount) {
    return sock.sendMessage(m.chat, {
      text: `❌ No tienes ${amount} yenes.`
    }, { quoted: m })
  }

  const roll = Math.random()
  let result, win = false, multiplier = 0

  if (roll < 0.04) {
    result = 'green'
    if (color === 'green') {
      win = true
      multiplier = 14
    }
  } else if (roll < 0.52) {
    result = 'red'
    if (color === 'red') {
      win = true
      multiplier = 2
    }
  } else {
    result = 'black'
    if (color === 'black') {
      win = true
      multiplier = 2
    }
  }

  const emojis = { red: '🔴', black: '⚫', green: '🟢' }

  if (win) {
    const winnings = amount * multiplier
    user.yenes += winnings - amount
    saveData('users')

    await sock.sendMessage(m.chat, {
      text: `🎰 *RULETA* 🎰

${emojis[result]} ¡SALIÓ ${result.toUpperCase()}!

✅ ¡GANASTE!
💰 ${winnings} yenes
📈 Multiplicador: ${multiplier}x
💵 Saldo: ${user.yenes} yenes`
    }, { quoted: m })
  } else {
    user.yenes -= amount
    saveData('users')

    await sock.sendMessage(m.chat, {
      text: `🎰 *RULETA* 🎰

${emojis[result]} Salió ${result}

❌ Perdiste ${amount} yenes
💵 Saldo: ${user.yenes} yenes`
    }, { quoted: m })
  }
}

handler.help = ['roulette', 'ruleta', 'bet']
handler.tags = ['economy', 'games']
handler.command = ['roulette', 'ruleta', 'bet', 'apostar']

export default handler
