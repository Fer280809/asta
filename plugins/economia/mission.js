import { missions, getMission, getAvailableMissions, checkMissionProgress, getMissionReward } from '../../lib/index.js'
import { getUser, saveData } from '../../lib/database.js'

let handler = async (m, { sock, args }) => {
  const user = getUser(m.sender)
  const now = Date.now()

  // Mostrar misiones disponibles
  if (!args.length || args[0] === 'list') {
    let text = `📜 *Misiones Disponibles*

`

    missions.forEach(mission => {
      const isCompleted = user.missions.completed.includes(mission.id)
      const isActive = user.missions.active?.id === mission.id

      let status = isCompleted ? '✅' : isActive ? '🔄' : '⬜'
      text += `${status} *${mission.name}*
`
      text += `├ ${mission.desc}
`
      text += `├ Recompensa: ${mission.reward} yenes
`

      if (isActive) {
        const progress = user.missions.active.progress || 0
        text += `└ Progreso: ${progress}/${mission.amount}
`
      } else {
        text += `└ Usa: ${config.prefix}mission start ${mission.id}
`
      }
      text += '
'
    })

    return sock.sendMessage(m.chat, { text }, { quoted: m })
  }

  // Iniciar misión
  if (args[0] === 'start' && args[1]) {
    const missionId = parseInt(args[1])
    const mission = getMission(m => m.id === missionId)

    if (!mission) {
      return sock.sendMessage(m.chat, {
        text: '❌ Misión no encontrada.'
      }, { quoted: m })
    }

    if (user.missions.completed.includes(missionId)) {
      return sock.sendMessage(m.chat, {
        text: '✅ Ya completaste esta misión.'
      }, { quoted: m })
    }

    if (user.missions.active) {
      return sock.sendMessage(m.chat, {
        text: `🔄 Ya tienes una misión activa: ${user.missions.active.name}
Finalízala primero con ${config.prefix}mission complete`
      }, { quoted: m })
    }

    user.missions.active = {
      id: missionId,
      name: mission.name,
      progress: 0,
      startedAt: now
    }

    saveData('users')

    return sock.sendMessage(m.chat, {
      text: `📜 *Misión iniciada!*

🎯 ${mission.name}
📝 ${mission.desc}
💰 Recompensa: ${mission.reward} yenes

¡Buena suerte!`
    }, { quoted: m })
  }

  // Completar misión
  if (args[0] === 'complete') {
    if (!user.missions.active) {
      return sock.sendMessage(m.chat, {
        text: '❌ No tienes una misión activa.'
      }, { quoted: m })
    }

    const mission = getMission(m => m.id === user.missions.active.id)
    const progress = user.missions.active.progress || 0

    if (progress < mission.amount) {
      return sock.sendMessage(m.chat, {
        text: `❌ Misión incompleta. Progreso: ${progress}/${mission.amount}`
      }, { quoted: m })
    }

    // Recompensa
    user.yenes += mission.reward
    user.exp += mission.reward / 2
    user.missions.completed.push(mission.id)
    user.missions.active = null

    saveData('users')

    return sock.sendMessage(m.chat, {
      text: `🎉 *Misión Completada!*

📜 ${mission.name}
💰 +${mission.reward} yenes
⭐ +${Math.floor(mission.reward / 2)} EXP

¡Felicidades!`
    }, { quoted: m })
  }

  // Ver misión activa
  if (args[0] === 'active') {
    if (!user.missions.active) {
      return sock.sendMessage(m.chat, {
        text: '❌ No tienes una misión activa.'
      }, { quoted: m })
    }

    const mission = getMission(m => m.id === user.missions.active.id)
    const progress = user.missions.active.progress || 0

    return sock.sendMessage(m.chat, {
      text: `🔄 *Misión Activa*

📜 ${mission.name}
📝 ${mission.desc}
📊 Progreso: ${progress}/${mission.amount}
💰 Recompensa: ${mission.reward} yenes`
    }, { quoted: m })
  }
}

handler.help = ['mission', 'mision', 'quest']
handler.tags = ['economy', 'adventure']
handler.command = ['mission', 'mision', 'quest', 'misiones']

export default handler
