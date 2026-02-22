import { getUser } from '../../lib/database.js'
import { items } from '../../lib/index.js'

let handler = async (m, { sock, args }) => {
  let target = m.mentionedJid?.[0] || m.quoted?.sender || m.sender

  // Si se menciona a alguien y no es owner, solo mostrar propio
  if (target !== m.sender && !isOwner(m.sender)) {
    target = m.sender
  }

  const user = getUser(target)

  const text = `💼 *Cartera de @${target.split('@')[0]}*

💰 Yenes: ${user.yenes.toLocaleString()}
⭐ Nivel: ${user.level}
❤️ HP: ${user.hp}/${user.maxHp}
💙 Maná: ${user.mana}/${user.maxMana}
📦 Items: ${Object.keys(user.inventory).length}

📊 Stats:
• 💪 Fuerza: ${user.stats.strength}
• 🛡️ Defensa: ${user.stats.defense}
• ⚡ Velocidad: ${user.stats.speed}
• 🍀 Suerte: ${user.stats.luck}`

  await sock.sendMessage(m.chat, {
    text,
    mentions: [target]
  }, { quoted: m })
}

handler.help = ['balance', 'cartera', 'yen', 'money']
handler.tags = ['economy']
handler.command = ['balance', 'cartera', 'yen', 'money', 'yenes']

export default handler
