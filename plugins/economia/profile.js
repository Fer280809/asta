import { gameConfig } from '../../lib/index.js'
import { getUser } from '../../lib/database.js'

let handler = async (m, { sock }) => {
  let target = m.mentionedJid?.[0] || m.quoted?.sender || m.sender
  const user = getUser(target)

  // Crear barra de progreso
  const createBar = (current, max, length = 10) => {
    const filled = Math.floor((current / max) * length)
    return '█'.repeat(filled) + '░'.repeat(length - filled)
  }

  const hpBar = createBar(user.hp, user.maxHp)
  const expNeeded = (user.level || 1) * 100
  const expBar = createBar(user.exp, expNeeded)

  const text = `╭━━━━━━━━━━━━━━━━━━╮
│  🎴 *PERFIL DE USUARIO*  │
╰━━━━━━━━━━━━━━━━━━╯

👤 *Usuario:* @${target.split('@')[0]}
⭐ *Nivel:* ${user.level || 1}
❤️ *HP:* ${user.hp}/${user.maxHp}
   ${hpBar}

💙 *Maná:* ${user.mana || 0}/${user.maxMana || 50}
💰 *Yenes:* ${(user.yenes || 0).toLocaleString()}
⭐ *EXP:* ${user.exp || 0}/${expNeeded}
   ${expBar}

📊 *Estadísticas:*
💪 Fuerza: ${user.stats?.strength || 1}
🛡️ Defensa: ${user.stats?.defense || 1}
⚡ Velocidad: ${user.stats?.speed || 1}
🍀 Suerte: ${user.stats?.luck || 1}

🎒 *Inventario:* ${Object.keys(user.inventory || {}).length} items
⛏️ Mining: ${user.stats?.mining || 0}
🪓 Chopping: ${user.stats?.chopping || 0}
🏹 Hunting: ${user.stats?.hunting || 0}
🎣 Fishing: ${user.stats?.fishing || 0}

📅 *Unido:* ${new Date(user.joinedAt || Date.now()).toLocaleDateString()}`

  await sock.sendMessage(m.chat, {
    text,
    mentions: [target]
  }, { quoted: m })
}

handler.help = ['profile', 'perfil', 'yo']
handler.tags = ['economy']
handler.command = ['profile', 'perfil', 'yo', 'yo']

export default handler
