/**
 * Code Recreated by Orion Wolf
 * Comando: kicknum.js - Expulsar por código de país
 */

// Sistema para iniciar/parar el comando kicknum
global.kicknumRunning = global.kicknumRunning || {}

let handler = async (m, { conn, args, usedPrefix, command }) => {
  if (!m.isGroup) return

  try {
    const metadata = await conn.groupMetadata(m.chat)
    const participants = metadata.participants || []
    const isBotAdmin = metadata.admins?.includes(conn.user.id)

    const bot = global.db.data.settings[conn.user.id] || {}

    // Comando para detener
    if (command === 'stopkicknum') {
      if (!global.kicknumRunning[m.chat]) {
        return conn.sendMessage(m.chat, { text: '⚠️ No hay ningún proceso de kicknum en ejecución.' }, { quoted: m })
      }
      global.kicknumRunning[m.chat] = false
      return conn.sendMessage(m.chat, { text: '🛑 Proceso de eliminación detenido correctamente.' }, { quoted: m })
    }

    // Validaciones para el comando kicknum y listnum
    if (!args[0]) {
      return conn.sendMessage(m.chat, { text: `❀ Ingrese algún prefijo de un país.\nEjemplo: ${usedPrefix + command} 212` }, { quoted: m })
    }

    if (isNaN(args[0])) {
      return conn.sendMessage(m.chat, { text: `ꕥ Prefijo inválido. Solo números.` }, { quoted: m })
    }

    const lol = args[0].replace(/[+]/g, '')
    const ps = participants
      .map(u => u.id)
      .filter(v => v !== conn.user.id && v.startsWith(lol))

    if (ps.length === 0) {
      return conn.sendMessage(m.chat, { text: `ꕥ No hay ningún número con el prefijo +${lol} en este grupo.` }, { quoted: m })
    }

    const numeros = ps.map(v => '⭔ @' + v.replace(/@.+/, ''))
    const delay = ms => new Promise(res => setTimeout(res, ms))

    switch (command) {
      case 'listanum':
      case 'listnum': {
        const msg = `❀ Lista de números con el prefijo +${lol}:\n\n${numeros.join('\n')}`
        conn.sendMessage(m.chat, { 
          text: msg,
          mentions: ps
        }, { quoted: m })
        break
      }

      case 'kicknum': {
        if (!isBotAdmin) {
          return conn.sendMessage(m.chat, { text: '⚠️ El bot necesita ser administrador para usar este comando.' }, { quoted: m })
        }

        if (!bot.restrict) {
          return conn.sendMessage(m.chat, { text: '⚠️ El modo restricción está desactivado en la configuración.' }, { quoted: m })
        }

        if (global.kicknumRunning[m.chat]) {
          return conn.sendMessage(m.chat, { text: `⚠️ Ya hay un proceso de eliminación activo en este grupo.\nUsa *${usedPrefix}stopkicknum* para detenerlo.` }, { quoted: m })
        }

        global.kicknumRunning[m.chat] = true
        conn.sendMessage(m.chat, { 
          text: `🚨 Iniciando eliminación de usuarios con prefijo +${lol}...\nUsa *${usedPrefix}stopkicknum* para detener el proceso.` 
        }, { quoted: m })

        for (const user of ps) {
          if (!global.kicknumRunning[m.chat]) {
            conn.sendMessage(m.chat, { text: '🛑 Proceso detenido por el administrador.' })
            break
          }

          try {
            await conn.groupParticipantsUpdate(m.chat, [user], 'remove')
            await delay(3000) // Espera 3s entre expulsiones
          } catch (err) {
            console.error(err)
          }
        }

        global.kicknumRunning[m.chat] = false
        conn.sendMessage(m.chat, { text: '✅ Proceso finalizado.' })
        break
      }
    }
  } catch (e) {
    console.error(e)
    conn.sendMessage(m.chat, { text: `⚠️ Error: ${e.message}` }, { quoted: m })
  }
}

handler.command = ['kicknum', 'listnum', 'listanum', 'stopkicknum']
handler.group = true
handler.botAdmin = true
handler.admin = true

export default handler
