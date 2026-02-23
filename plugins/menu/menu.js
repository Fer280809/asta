/**
 * Code Recreated by Orion Wolf
 * Comando: menu-grupo.js - Menú de administración de grupos
 */

import moment from 'moment-timezone'

let handler = async (m, { conn, usedPrefix }) => {
  const uptime = process.uptime()
  const horas = Math.floor(uptime / 3600)
  const minutos = Math.floor((uptime % 3600) / 60)
  const segundos = Math.floor(uptime % 60)
  
  const horario = moment.tz('America/Caracas').format('DD/MM/YYYY hh:mm:ss A')
  
  const menuText = `╭━━━❰ ✦ 𝗠𝗘𝗡𝗨 𝗚𝗥𝗨𝗣𝗢 ✦ ❱━━━╮
┃
┃ 🏢 *${global.namebot || 'Bot'}* | Administración
┃ ⏱️ Uptime: ${horas}h ${minutos}m ${segundos}s
┃ 📅 ${horario}
┃
╰━━━━━━━━━━━━━━━━━━━━━━━╯

╭━━━❰ 👥 𝗚𝗘𝗦𝗧𝗜𝗢́𝗡 𝗗𝗘 𝗨𝗦𝗨𝗔𝗥𝗜𝗢𝗦 ❱━━━╮
┃
┃ ❀ *${usedPrefix}add* <número>
┃   └ Invitar usuario al grupo
┃
┃ ❀ *${usedPrefix}kick* @usuario
┃   └ Expulsar usuario del grupo
┃   └ Alias: echar, sacar, ban
┃
┃ ❀ *${usedPrefix}promote* @usuario
┃   └ Ascender a administrador
┃   └ Alias: promover
┃
┃ ❀ *${usedPrefix}demote* @usuario
┃   └ Degradar administrador
┃   └ Alias: degradar
┃
╰━━━━━━━━━━━━━━━━━━━━━━━╯

╭━━━❰ 🔇 𝗠𝗢𝗗𝗘𝗥𝗔𝗖𝗜𝗢́𝗡 ❱━━━━━━━━━━╮
┃
┃ ❀ *${usedPrefix}mute* @usuario [tiempo]
┃   └ Silenciar usuario
┃   └ Ejemplo: ${usedPrefix}mute @user 10m
┃   └ Unidades: s (seg), m (min), h (hora), d (día)
┃   └ Alias: silenciar
┃
┃ ❀ *${usedPrefix}unmute* @usuario
┃   └ Quitar silencio
┃   └ Alias: dessilenciar
┃
╰━━━━━━━━━━━━━━━━━━━━━━━╯

╭━━━❰ 🛡️ 𝗙𝗜𝗟𝗧𝗥𝗢𝗦 𝗣𝗢𝗥 𝗣𝗔𝗜́𝗦 ❱━━━━━━━╮
┃
┃ ❀ *${usedPrefix}kicknum* <prefijo>
┃   └ Expulsar por código de país
┃   └ Ejemplo: ${usedPrefix}kicknum 212
┃
┃ ❀ *${usedPrefix}listnum* <prefijo>
┃   └ Listar números por país
┃   └ Alias: listanum
┃
┃ ❀ *${usedPrefix}stopkicknum*
┃   └ Detener proceso de expulsión
┃
╰━━━━━━━━━━━━━━━━━━━━━━━╯

╭━━━❰ 🔗 𝗘𝗡𝗟𝗔𝗖𝗘𝗦 𝗬 𝗠𝗘𝗡𝗦𝗔𝗝𝗘𝗦 ❱━━━━╮
┃
┃ ❀ *${usedPrefix}revoke*
┃   └ Revocar y restablecer enlace
┃   └ Alias: restablecer
┃
┃ ❀ *${usedPrefix}admins* [mensaje]
┃   └ Mencionar administradores
┃   └ Alias: @admins
┃
┃ ❀ *${usedPrefix}del* (responder msg)
┃   └ Eliminar mensaje citado
┃   └ Alias: delete
┃
╰━━━━━━━━━━━━━━━━━━━━━━━╯

╭━━━❰ ⚠️ 𝗥𝗘𝗤𝗨𝗜𝗦𝗜𝗧𝗢𝗦 ❱━━━━━━━━━━╮
┃
┃ • El bot debe ser administrador
┃ • Solo admins pueden usar estos comandos
┃ • Algunos comandos requieren modo restrict
┃
╰━━━━━━━━━━━━━━━━━━━━━━━╯

> 👑 Owner: ${global.dev || 'Orion Wolf'}
> 🤖 Prefix: ${usedPrefix}`

  await conn.sendMessage(m.chat, { 
    text: menuText,
    mentions: [m.sender]
  }, { quoted: m })
}

handler.help = ['menú', 'menu', 'help', 'MENU', 'Menu']
handler.tags = ['main', 'group']
handler.command = ['menú', 'menu', 'help', 'MENU', 'Menu']

export default handler
