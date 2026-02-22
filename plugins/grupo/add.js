import moment from 'moment-timezone'

export async function handler(conn, chat) {
  const m = chat.messages[0]
  if (!m?.message) return
  
  const from = m.key.remoteJid
  const sender = m.key.participant || from
  const isGroup = from.endsWith('@g.us')

  if (!isGroup) return

  const text =
    m.message?.conversation ||
    m.message?.extendedTextMessage?.text ||
    ''

  const args = text.trim().split(/\s+/).slice(1)
  const usedPrefix = global.prefix
  const command = text.trim().split(/\s+/)[0].toLowerCase().replace(usedPrefix, '')

  // Validar que sea comando de add
  if (!['add', 'agregar', 'añadir'].includes(command)) return

  if (!text || !args.join('')) {
    return conn.sendMessage(from, { text: `❀ Por favor, ingrese el número al que quiere enviar una invitación al grupo.` }, { quoted: m })
  }

  const numero = args.join('').trim()

  if (numero.includes('+')) {
    return conn.sendMessage(from, { text: `ꕥ Ingrese el número todo junto sin el *+*` }, { quoted: m })
  }

  if (isNaN(numero)) {
    return conn.sendMessage(from, { text: `ꕥ Ingrese sólo números sin su código de país y sin espacios.` }, { quoted: m })
  }

  try {
    const link = 'https://chat.whatsapp.com/' + await conn.groupInviteCode(from)
    const tag = '@' + sender.split('@')[0]
    const chatLabel = (await conn.groupMetadata(from))?.subject || 'Grupal'
    const horario = `${moment.tz('America/Caracas').format('DD/MM/YYYY hh:mm:ss A')}`
    
    const invite = `❀ 𝗜𝗡𝗩𝗜𝗧𝗔𝗖𝗜𝗢𝗡 𝗔 𝗨𝗡 𝗚𝗥𝗨𝗣𝗢\n\nꕥ *Usuario* » ${tag}\n✿ *Chat* » ${chatLabel}\n✰ *Fecha* » ${horario}\n✦ *Link* » ${link}`
    
    const targetJid = numero + '@s.whatsapp.net'
    await conn.sendMessage(targetJid, { 
      text: invite,
      mentions: [sender]
    })

    conn.sendMessage(from, { text: `❀ El enlace de invitación fue enviado al usuario correctamente.` }, { quoted: m })
  } catch (e) {
    conn.sendMessage(from, { text: `⚠️ Error: ${e.message}` }, { quoted: m })
  }
}

export const config = {
  help: ['invite'],
  tags: ['group'],
  command: ['add', 'agregar', 'añadir'],
  group: true,
  botAdmin: true
}
