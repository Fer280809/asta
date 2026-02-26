// plugins/economy/tatar.js
// Juego Tatar - Apuesta y multiplica

import { getUser, addMoney, removeMoney, checkCooldown, formatTime } from '../../lib/economy.js'

const multiplicadores = [
  { valor: 0, prob: 30, emoji: '💀' },
  { valor: 0.5, prob: 25, emoji: '😢' },
  { valor: 1, prob: 20, emoji: '😐' },
  { valor: 1.5, prob: 15, emoji: '🙂' },
  { valor: 2, prob: 7, emoji: '😃' },
  { valor: 3, prob: 2.5, emoji: '🤩' },
  { valor: 5, prob: 0.5, emoji: '🎰' }
]

function girarTatar() {
  let rand = Math.random() * 100
  let acum = 0

  for (let mult of multiplicadores) {
    acum += mult.prob
    if (rand <= acum) return mult
  }
  return multiplicadores[0]
}

let handler = async (m, { conn, args }) => {
  let userId = m.sender.split('@')[0]
  let user = getUser(userId)

  // ✅ Fix: mostrar uso ANTES de verificar cooldown
  // así no se bloquea el comando si no pasaron args
  if (!args[0]) {
    return conn.sendMessage(m.chat, {
      text: `> . ﹡ ﹟ 🎰 ׄ ⬭ *¡ᴛᴀᴛᴀʀ!*

*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜📋* ㅤ֢ㅤ⸱ㅤᯭִ*
ׅㅤ𓏸𓈒ㅤׄ *ᴜsᴏ* :: *.tatar <cantidad>*
ׅㅤ𓏸𓈒ㅤׄ *ᴇᴊᴇᴍᴘʟᴏ* :: *.tatar 1000*
ׅㅤ𓏸𓈒ㅤׄ *ᴍᴀ́xɪᴍᴏ* :: $${user.balance.toLocaleString()}

*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜🎲* ㅤ֢ㅤ⸱ㅤᯭִ*
ׅㅤ𓏸𓈒ㅤׄ *0x* :: 💀 ᴘɪᴇʀᴅᴇs ᴛᴏᴅᴏ (30%)
ׅㅤ𓏸𓈒ㅤׄ *0.5x* :: 😢 ᴘɪᴇʀᴅᴇs ʟᴀ ᴍɪᴛᴀᴅ (25%)
ׅㅤ𓏸𓈒ㅤׄ *1x* :: 😐 ʀᴇᴄᴜᴘᴇʀᴀs (20%)
ׅㅤ𓏸𓈒ㅤׄ *1.5x* :: 🙂 ɢᴀɴᴀs 50% (15%)
ׅㅤ𓏸𓈒ㅤׄ *2x* :: 😃 ᴅᴜᴘʟɪᴄᴀs (7%)
ׅㅤ𓏸𓈒ㅤׄ *3x* :: 🤩 ᴛʀɪᴘʟɪᴄᴀs (2.5%)
ׅㅤ𓏸𓈒ㅤׄ *5x* :: 🎰 ᴊᴀᴄᴋᴘᴏᴛ! (0.5%)

> ## \`ᴀᴅᴠᴇʀᴛᴇɴᴄɪᴀ ⚔️\`
> ᴇʟ ᴊᴜᴇɢᴏ ᴇs ᴀᴢᴀʀ, ᴘᴜᴇᴅᴇs ᴘᴇʀᴅᴇʀ ᴛᴏᴅᴏ`
    }, { quoted: m })
  }

  let amount = parseInt(args[0].replace(/[^0-9]/g, ''))

  if (!amount || amount <= 0) {
    return conn.sendMessage(m.chat, {
      text: `> . ﹡ ﹟ ❌ ׄ ⬭ *¡ᴄᴀɴᴛɪᴅᴀᴅ ɪɴᴠᴀ́ʟɪᴅᴀ!*

*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜⚠️* ㅤ֢ㅤ⸱ㅤᯭִ*
ׅㅤ𓏸𓈒ㅤׄ *ᴅᴇᴛᴀʟʟᴇ* :: ɪɴɢʀᴇsᴀ ᴜɴᴀ ᴄᴀɴᴛɪᴅᴀᴅ ᴠᴀ́ʟɪᴅᴀ`
    }, { quoted: m })
  }

  if (amount > user.balance) {
    return conn.sendMessage(m.chat, {
      text: `> . ﹡ ﹟ ❌ ׄ ⬭ *¡sɪɴ ᴅɪɴᴇʀᴏ!*

*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜💸* ㅤ֢ㅤ⸱ㅤᯭִ*
ׅㅤ𓏸𓈒ㅤׄ *ɴᴇᴄᴇsɪᴛᴀs* :: $${amount.toLocaleString()}
ׅㅤ𓏸𓈒ㅤׄ *ᴛɪᴇɴᴇs* :: $${user.balance.toLocaleString()}`
    }, { quoted: m })
  }

  // ✅ Fix: verificar cooldown SOLO cuando ya se va a jugar
  let cooldown = checkCooldown(userId, 'Tatar', 5 * 60 * 1000)

  if (!cooldown.canUse) {
    return conn.sendMessage(m.chat, {
      text: `> . ﹡ ﹟ ⏰ ׄ ⬭ *¡ᴇsᴘᴇʀᴀ!*

*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜🎰* ㅤ֢ㅤ⸱ㅤᯭִ*
ׅㅤ𓏸𓈒ㅤׄ *ᴛɪᴇᴍᴘᴏ ʀᴇsᴛᴀɴᴛᴇ* :: ${formatTime(cooldown.remaining)}

> ## \`ᴇʟ ᴛᴀᴛᴀʀ ᴇs ᴀᴅɪᴄᴛɪᴠᴏ ⚔️\`
> ᴛᴏᴍᴀ ᴜɴ ᴅᴇsᴄᴀɴsᴏ`
    }, { quoted: m })
  }

  removeMoney(userId, amount)

  let resultado = girarTatar()
  let ganancia = Math.floor(amount * resultado.valor)
  let neto = ganancia - amount

  addMoney(userId, ganancia)

  let mensaje = neto >= 0 ? '¡ɢᴀɴᴀsᴛᴇ!' : '¡ᴘᴇʀᴅɪsᴛᴇ!'
  let color = neto >= 0 ? '✅' : '❌'

  conn.sendMessage(m.chat, {
    text: `> . ﹡ ﹟ 🎰 ׄ ⬭ *${mensaje}*

*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜${resultado.emoji}* ㅤ֢ㅤ⸱ㅤᯭִ*
ׅㅤ𓏸𓈒ㅤׄ *ᴀᴘᴜᴇsᴛᴀ* :: $${amount.toLocaleString()}
ׅㅤ𓏸𓈒ㅤׄ *ᴍᴜʟᴛɪᴘʟɪᴄᴀᴅᴏʀ* :: ${resultado.valor}x
ׅㅤ𓏸𓈒ㅤׄ *ɢᴀɴᴀɴᴄɪᴀ* :: $${ganancia.toLocaleString()}
ׅㅤ𓏸𓈒ㅤׄ *ɴᴇᴛᴏ* :: ${color} $${Math.abs(neto).toLocaleString()} ${neto >= 0 ? '↑' : '↓'}

> ## \`sᴜᴇʀᴛᴇ ᴘᴀʀᴀ ʟᴀ ᴘʀᴏ́xɪᴍᴀ ⚔️\`
> ᴘᴜᴇᴅᴇs ᴊᴜɢᴀʀ ᴅᴇ ɴᴜᴇᴠᴏ ᴇɴ 5 ᴍɪɴᴜᴛᴏs`,
    mentions: [m.sender]
  }, { quoted: m })
}

handler.help = ['tatar <cantidad>']
handler.tags = ['economy']
handler.command = ['tatar', 'apostar']

export default handler
