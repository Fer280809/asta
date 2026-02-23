/**
 * Code Recreated by Orion Wolf
 * Comando: add.js - Invitar usuarios al grupo
 */

import moment from 'moment-timezone'

let handler = async (m, { conn, args, usedPrefix, command }) => {
  if (!m.isGroup) return
  if (!args[0]) {
    return conn.sendMessage(m.chat, { text: `❀ Por favor, ingrese el número al que quiere enviar una invitación al grupo.` }, { quoted: m })
  }

  const numero = args.join('').trim()

  if (numero.includes('+')) {
    return conn.sendMessage(m.chat, { text: `ꕥ Ingrese el número todo junto sin el *+*` }, { quoted: m })
  }

  if (isNaN(numero)) {
    return conn.sendMessage(m.chat, { text: `ꕥ Ingrese sólo números sin su código de país y sin espacios.` }, { quoted: m })
  }

  try {
    const link = 'https://chat.whatsapp.com/' + await conn.groupInviteCode(m.chat)
    const tag = '@' + m.sender.split('@')[0]
    const chatLabel = (await conn.groupMetadata(m.chat))?.subject || 'Grupal'
    const horario = `${moment.tz('America/Caracas').format('DD/MM/YYYY hh:mm:ss A')}`
    
    const invite = `❀ 𝗜𝗡𝗩𝗜𝗧𝗔𝗖𝗜𝗢𝗡 𝗔 𝗨𝗡 𝗚𝗥𝗨𝗣𝗢\n\nꕥ *Usuario* » ${tag}\n✿ *Chat* » ${chatLabel}\n✰ *Fecha* » ${horario}\n✦ *Link* » ${link}`
    
    const targetJid = numero + '@s.whatsapp.net'
    await conn.sendMessage(targetJid, { 
      text: invite,
      mentions: [m.sender]
    })

    conn.sendMessage(m.chat, { text: `❀ El enlace de invitación fue enviado al usuario correctamente.` }, { quoted: m })
  } catch (e) {
    conn.sendMessage(m.chat, { text: `⚠️ Error: ${e.message}` }, { quoted: m })
  }
}

handler.help = ['invite']
handler.tags = ['group']
handler.command = ['add', 'agregar', 'añadir']
handler.group = true
handler.botAdmin = true

export default handler
