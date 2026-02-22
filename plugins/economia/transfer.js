import { gameConfig } from '../../lib/index.js'
import { getUser, saveData } from '../../lib/database.js'

let handler = async (m, { sock, args }) => {
  const target = m.mentionedJid?.[0] || m.quoted?.sender
  const amount = parseInt(args[1])

  if (!target || !amount || amount <= 0) {
    return sock.sendMessage(m.chat, {
      text: `💸 *Transferir Yenes*

Uso: #transfer @usuario <cantidad>`
    }, { quoted: m })
  }

  if (target === m.sender) {
    return sock.sendMessage(m.chat, {
      text: '❌ No puedes transferirte a ti mismo.'
    }, { quoted: m })
  }

  const sender = getUser(m.sender)
  const receiver = getUser(target)

  if (sender.yenes < amount) {
    return sock.sendMessage(m.chat, {
      text: `❌ No tienes suficientes yenes.
💰 Tienes: ${sender.yenes}
💸 Quieres enviar: ${amount}`
    }, { quoted: m })
  }

  // Comisión del 5%
  const fee = Math.floor(amount * gameConfig.transfer.fee)
  const finalAmount = amount - fee

  sender.yenes -= amount
  receiver.yenes = (receiver.yenes || 0) + finalAmount

  saveData('users')

  await sock.sendMessage(m.chat, {
    text: `💸 *Transferencia Exitosa*

📤 Enviado: ${amount} yenes
📥 Recibido: ${finalAmount} yenes
💰 Comisión (5%): ${fee} yenes

👤 De: @${m.sender.split('@')[0]}
👤 Para: @${target.split('@')[0]}`,
    mentions: [m.sender, target]
  }, { quoted: m })
}

handler.help = ['transfer', 'pay', 'pagar']
handler.tags = ['economy']
handler.command = ['transfer', 'pay', 'pagar', 'dar']

export default handler
