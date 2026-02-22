import { welcomeEvento, byeEvento } from '../grupo/welcome.js'

// ✅ Normalizar participantes — pueden venir como string o como objeto {id, ...}
function getNums(participants) {
  return participants.map(p => typeof p === 'string' ? p : p.id)
}

export async function onGroupUpdate(conn, update) {
  const { id, participants, action } = update
  try {
    const metadata = await conn.groupMetadata(id)
    const usuarios = getNums(participants)

    if (action === 'add') {
      await welcomeEvento(conn, id, usuarios, metadata)
    }

    if (action === 'remove') {
      await byeEvento(conn, id, usuarios, metadata)
    }

    if (action === 'promote') {
      for (const usuario of usuarios) {
        await conn.sendMessage(id, {
          text: `⭐ @${usuario.split('@')[0]} ahora es *administrador*. ¡Felicidades!`,
          mentions: [usuario]
        })
      }
    }

    if (action === 'demote') {
      for (const usuario of usuarios) {
        await conn.sendMessage(id, {
          text: `🔻 @${usuario.split('@')[0]} ya no es administrador.`,
          mentions: [usuario]
        })
      }
    }

  } catch (err) {
    console.error('Error group-events:', err.message)
  }
}
