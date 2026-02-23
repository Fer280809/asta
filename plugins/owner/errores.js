// plugins/owner/errores.js
// Muestra errores de inicio y runtime

import fs from 'fs'
import path from 'path'

const erroresInicioFile   = path.join(process.cwd(), 'data', 'errores-inicio.json')
const erroresRuntimeFile  = path.join(process.cwd(), 'data', 'errores-runtime.json')

const readJSON = (file) => {
  try {
    if (!fs.existsSync(file)) return null
    return JSON.parse(fs.readFileSync(file, 'utf-8'))
  } catch {
    return null
  }
}

let handler = async (m, { conn, args, usedPrefix, command }) => {
  const sub = args[0]?.toLowerCase()
  const num = parseInt(args[0])

  if (sub === 'inicio') {
    const errores = readJSON(erroresInicioFile)
    if (!errores || !errores.length) {
      return conn.sendMessage(m.chat, { text: '✅ No hubo errores al iniciar.' }, { quoted: m })
    }
    const lista = errores.map((e, i) =>
      `*${i + 1}.* ${e.archivo}\n   🔴 ${e.error}`
    ).join('\n\n')
    return conn.sendMessage(m.chat, {
      text: `🚨 *Errores al iniciar (${errores.length}):*\n\n${lista}`
    }, { quoted: m })
  }

  if (!isNaN(num) && num > 0) {
    const errores = readJSON(erroresRuntimeFile)
    if (!errores || !errores.length) {
      return conn.sendMessage(m.chat, { text: '✅ No hay errores registrados.' }, { quoted: m })
    }
    const e = errores[num - 1]
    if (!e) {
      return conn.sendMessage(m.chat, { text: `❌ No existe el error #${num}` }, { quoted: m })
    }
    return conn.sendMessage(m.chat, {
      text: `🔴 *Error #${num}*\n\n` +
        `📁 *Plugin:* ${e.archivo}\n` +
        `💬 *Comando:* ${e.comando || 'N/A'}\n` +
        `👤 *Sender:* ${e.sender}\n` +
        `📅 *Fecha:* ${e.fecha}\n\n` +
        `❌ *Error:*\n${e.error}\n\n` +
        `📋 *Stack:*\n${e.stack || 'No disponible'}`
    }, { quoted: m })
  }

  const errores = readJSON(erroresRuntimeFile)
  if (!errores || !errores.length) {
    return conn.sendMessage(m.chat, { text: '✅ No hay errores registrados.' }, { quoted: m })
  }

  const lista = errores.map((e, i) =>
    `*${i + 1}.* [${e.archivo}]\n` +
    `   💬 ${e.comando || 'N/A'} | 📅 ${e.fecha}\n` +
    `   🔴 ${e.error.slice(0, 80)}${e.error.length > 80 ? '...' : ''}`
  ).join('\n\n')

  await conn.sendMessage(m.chat, {
    text: `🔴 *Errores runtime (${errores.length}):*\n\n${lista}\n\n` +
      `▸ ${usedPrefix}${command} inicio\n` +
      `▸ ${usedPrefix}${command} <número>`
  }, { quoted: m })
}

handler.help    = ['errores [inicio|número]']
handler.tags    = ['owner']
handler.command = ['errores', 'errors']
handler.owner   = true

export default handler