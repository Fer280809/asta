export async function handler(conn, chat) {
  const m = chat.messages[0]
  if (!m?.message) return
  
  const from = m.key.remoteJid
  const sender = m.key.participant || from
  const isOwner = global.owner.some(o => o[0] === sender.split('@')[0])

  if (!isOwner) {
    return conn.sendMessage(from, { 
      text: `${global.msj.soloOwner} - Solo el propietario del bot puede usar este comando.` 
    }, { quoted: m })
  }

  const text =
    m.message?.conversation ||
    m.message?.extendedTextMessage?.text ||
    ''

  const command = text.trim().split(/\s+/)[0].toLowerCase().replace(global.prefix, '')

  // Validar que sea comando de restart
  if (!['restart', 'reiniciar'].includes(command)) return

  // Mensaje antes de reiniciar
  await conn.sendMessage(from, { 
    text: `🔄 **Reiniciando bot...**\n\n⏳ El bot se apagará y volverá en unos segundos.\n\n⚠️ En Termux, asegúrate de usar tmux o un gestor de procesos para que se reinicie automáticamente.` 
  }, { quoted: m })

  // Dar tiempo para que se envíe el mensaje
  setTimeout(() => {
    console.log('🔄 Bot reiniciándose...')
    process.exit(0)
  }, 1500)
}

export const config = {
  help: ['restart', 'reiniciar'],
  tags: ['owner'],
  command: ['restart', 'reiniciar'],
  owner: true,
  botAdmin: false,
  fail: null
}
