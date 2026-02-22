/**
 * Code Recreated by Orion Wolf
 * Comando: kicknum.js - Expulsar por código de país
 */

// Sistema para iniciar/parar el comando kicknum
global.kicknumRunning = global.kicknumRunning || {}

export async function handler(conn, chat) {
  const m = chat.messages[0]
  if (!m?.message) return
  
  const from = m.key.remoteJid
  const isGroup = from.endsWith('@g.us')

  if (!isGroup) return

  const text =
    m.message?.conversation ||
    m.message?.extendedTextMessage?.text ||
    ''

  const args = text.trim().split(/\s+/).slice(1)
  const command = text.trim().split(/\s+/)[0].toLowerCase().replace(global.prefix, '')
  const usedPrefix = global.prefix

  // Validar que sea uno de los comandos
  if (!['kicknum', 'listnum', 'listanum', 'stopkicknum'].includes(command)) return

  try {
    const metadata = await conn.groupMetadata(from)
    const participants = metadata.participants || []
    const isBotAdmin = metadata.admins?.includes(conn.user.id)

    const bot = global.db.data.settings[conn.user.id] || {}

    // Comando para detener
    if (command === 'stopkicknum') {
      if (!global.kicknumRunning[from]) {
        return conn.sendMessage(from, { text: '⚠️ No hay ningún proceso de kicknum en ejecución.' }, { quoted: m })
      }
      global.kicknumRunning[from] = false
      return conn.sendMessage(from, { text: '🛑 Proceso de eliminación detenido correctamente.' }, { quoted: m })
    }

    // Validaciones para el comando kicknum y listnum
    if (!args[0]) {
      return conn.sendMessage(from, { text: `❀ Ingrese algún prefijo de un país.\nEjemplo: ${usedPrefix + command} 212` }, { quoted: m })
    }

    if (isNaN(args[0])) {
      return conn.sendMessage(from, { text: `ꕥ Prefijo inválido. Solo números.` }, { quoted: m })
    }

    const lol = args[0].replace(/[+]/g, '')
    const ps = participants
      .map(u => u.id)
      .filter(v => v !== conn.user.id && v.startsWith(lol))

    if (ps.length === 0) {
      return conn.sendMessage(from, { text: `ꕥ No hay ningún número con el prefijo +${lol} en este grupo.` }, { quoted: m })
    }

    const numeros = ps.map(v => '⭔ @' + v.replace(/@.+/, ''))
    const delay = ms => new Promise(res => setTimeout(res, ms))

    switch (command) {
      case 'listanum':
      case 'listnum': {
        const msg = `❀ Lista de números con el prefijo +${lol}:\n\n${numeros.join('\n')}`
        conn.sendMessage(from, { 
          text: msg,
          mentions: ps
        }, { quoted: m })
        break
      }

      case 'kicknum': {
        if (!isBotAdmin) {
          return conn.sendMessage(from, { text: '⚠️ El bot necesita ser administrador para usar este comando.' }, { quoted: m })
        }

        if (!bot.restrict) {
          return conn.sendMessage(from, { text: '⚠️ El modo restricción está desactivado en la configuración.' }, { quoted: m })
        }

        if (global.kicknumRunning[from]) {
          return conn.sendMessage(from, { text: `⚠️ Ya hay un proceso de eliminación activo en este grupo.\nUsa *${usedPrefix}stopkicknum* para detenerlo.` }, { quoted: m })
        }

        global.kicknumRunning[from] = true
        conn.sendMessage(from, { 
          text: `🚨 Iniciando eliminación de usuarios con prefijo +${lol}...\nUsa *${usedPrefix}stopkicknum* para detener el proceso.` 
        }, { quoted: m })

        for (const user of ps) {
          if (!global.kicknumRunning[from]) {
            conn.sendMessage(from, { text: '🛑 Proceso detenido por el administrador.' })
            break
          }

          try {
            await conn.groupParticipantsUpdate(from, [user], 'remove')
            await delay(3000) // Espera 3s entre expulsiones
          } catch (err) {
            console.error(err)
          }
        }

        global.kicknumRunning[from] = false
        conn.sendMessage(from, { text: '✅ Proceso finalizado.' })
        break
      }
    }
  } catch (e) {
    console.error(e)
    conn.sendMessage(from, { text: `⚠️ Error: ${e.message}` }, { quoted: m })
  }
}

export const config = {
  command: ['kicknum', 'listnum', 'listanum', 'stopkicknum'],
  group: true,
  botAdmin: true,
  admin: true
}
