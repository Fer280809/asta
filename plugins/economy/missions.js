// plugins/economy/missions.js
// Sistema de misiones

import { getUser, addMoney, updateUser } from '../../lib/economy.js'
import fs from 'fs'
import path from 'path'

const missionsPath = path.join(process.cwd(), 'data', 'missions.json')

// Tipos de misiones
const missionTypes = {
  daily: {
    reward: 2000,
    reset: 24 * 60 * 60 * 1000,
    missions: [
      { id: 'msg10', desc: 'Enviar 10 mensajes', target: 10, type: 'messages' },
      { id: 'cmd5', desc: 'Usar 5 comandos', target: 5, type: 'commands' },
      { id: 'work2', desc: 'Trabajar 2 veces', target: 2, type: 'work' },
      { id: 'mine3', desc: 'Minar 3 veces', target: 3, type: 'mine' }
    ]
  },
  weekly: {
    reward: 10000,
    reset: 7 * 24 * 60 * 60 * 1000,
    missions: [
      { id: 'msg100', desc: 'Enviar 100 mensajes', target: 100, type: 'messages' },
      { id: 'cmd30', desc: 'Usar 30 comandos', target: 30, type: 'commands' },
      { id: 'work10', desc: 'Trabajar 10 veces', target: 10, type: 'work' },
      { id: 'mine15', desc: 'Minar 15 veces', target: 15, type: 'mine' },
      { id: 'tatar5', desc: 'Jugar tatar 5 veces', target: 5, type: 'tatar' }
    ]
  },
  monthly: {
    reward: 50000,
    reset: 30 * 24 * 60 * 60 * 1000,
    missions: [
      { id: 'msg500', desc: 'Enviar 500 mensajes', target: 500, type: 'messages' },
      { id: 'cmd100', desc: 'Usar 100 comandos', target: 100, type: 'commands' },
      { id: 'work50', desc: 'Trabajar 50 veces', target: 50, type: 'work' },
      { id: 'mine50', desc: 'Minar 50 veces', target: 50, type: 'mine' },
      { id: 'tatar20', desc: 'Jugar tatar 20 veces', target: 20, type: 'tatar' }
    ]
  }
}

function getMissionsData() {
  if (!fs.existsSync(missionsPath)) {
    fs.mkdirSync(path.dirname(missionsPath), { recursive: true })
    fs.writeFileSync(missionsPath, JSON.stringify({}, null, 2))
  }
  return JSON.parse(fs.readFileSync(missionsPath, 'utf-8'))
}

function saveMissionsData(data) {
  fs.writeFileSync(missionsPath, JSON.stringify(data, null, 2))
}

function getUserMissions(userId) {
  let data = getMissionsData()
  if (!data[userId]) {
    data[userId] = {
      daily: { completed: [], claimed: false, lastReset: 0 },
      weekly: { completed: [], claimed: false, lastReset: 0 },
      monthly: { completed: [], claimed: false, lastReset: 0 }
    }
    saveMissionsData(data)
  }
  return data[userId]
}

function checkReset(userId, type) {
  let missions = getUserMissions(userId)
  let now = Date.now()
  let resetTime = missionTypes[type].reset

  if (now - missions[type].lastReset >= resetTime) {
    missions[type].completed = []
    missions[type].claimed = false
    missions[type].lastReset = now

    let data = getMissionsData()
    data[userId] = missions
    saveMissionsData(data)
  }
  return missions[type]
}

function updateMission(userId, type, missionId) {
  let missions = getUserMissions(userId)
  let missionData = checkReset(userId, type)

  if (!missionData.completed.includes(missionId)) {
    missionData.completed.push(missionId)

    let data = getMissionsData()
    data[userId] = missions
    saveMissionsData(data)
    return true
  }
  return false
}

let handler = async (m, { conn, args }) => {
  let userId = m.sender.split('@')[0]
  let user = getUser(userId)
  let missions = getUserMissions(userId)

  // Verificar progreso automático
  for (let [type, config] of Object.entries(missionTypes)) {
    checkReset(userId, type)
    for (let mission of config.missions) {
      let progress = 0
      switch(mission.type) {
        case 'messages': progress = user.messages || 0; break
        case 'commands': progress = user.commands || 0; break
        case 'work': progress = user.workCount || 0; break
        case 'mine': progress = user.mineCount || 0; break
        case 'tatar': progress = user.tatarCount || 0; break
      }
      if (progress >= mission.target && !missions[type].completed.includes(mission.id)) {
        updateMission(userId, type, mission.id)
      }
    }
  }

  missions = getUserMissions(userId)

  if (args[0] === 'claim') {
    let type = args[1]
    if (!type || !['daily', 'weekly', 'monthly'].includes(type)) {
      return conn.sendMessage(m.chat, {
        text: `> . ﹡ ﹟ ❌ ׄ ⬭ *¡ᴛɪᴘᴏ ɪɴᴠᴀ́ʟɪᴅᴏ!*

*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜⚠️* ㅤ֢ㅤ⸱ㅤᯭִ*
ׅㅤ𓏸𓈒ㅤׄ *ᴜsᴏ* :: *.misiones claim <daily|weekly|monthly>*`
      }, { quoted: m })
    }

    let missionData = missions[type]
    let config = missionTypes[type]

    if (missionData.claimed) {
      return conn.sendMessage(m.chat, {
        text: `> . ﹡ ﹟ ❌ ׄ ⬭ *¡ʏᴀ ʀᴇᴄʟᴀᴍᴀᴅᴏ!*

*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜⚠️* ㅤ֢ㅤ⸱ㅤᯭִ*
ׅㅤ𓏸𓈒ㅤׄ *ᴇsᴛᴀᴅᴏ* :: ʏᴀ ʀᴇᴄʟᴀᴍᴀsᴛᴇ ʟᴀ ʀᴇᴄᴏᴍᴘᴇɴsᴀ ${type}`
      }, { quoted: m })
    }

    if (missionData.completed.length < config.missions.length) {
      return conn.sendMessage(m.chat, {
        text: `> . ﹡ ﹟ ❌ ׄ ⬭ *¡ᴍɪsɪᴏɴᴇs ɪɴᴄᴏᴍᴘʟᴇᴛᴀs!*

*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜📋* ㅤ֢ㅤ⸱ㅤᯭִ*
ׅㅤ𓏸𓈒ㅤׄ *ᴄᴏᴍᴘʟᴇᴛᴀᴅᴀs* :: ${missionData.completed.length}/${config.missions.length}
ׅㅤ𓏸𓈒ㅤׄ *ғᴀʟᴛᴀɴ* :: ${config.missions.length - missionData.completed.length}`
      }, { quoted: m })
    }

    addMoney(userId, config.reward)
    missionData.claimed = true

    let data = getMissionsData()
    data[userId] = missions
    saveMissionsData(data)

    return conn.sendMessage(m.chat, {
      text: `> . ﹡ ﹟ 🎉 ׄ ⬭ *¡ʀᴇᴄᴏᴍᴘᴇɴsᴀ ʀᴇᴄʟᴀᴍᴀᴅᴀ!*

*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜💰* ㅤ֢ㅤ⸱ㅤᯭִ*
ׅㅤ𓏸𓈒ㅤׄ *ᴛɪᴘᴏ* :: ${type.toUpperCase()}
ׅㅤ𓏸𓈒ㅤׄ *ʀᴇᴄᴏᴍᴘᴇɴsᴀ* :: $${config.reward.toLocaleString()}

> ## \`ғᴇʟɪᴄɪᴅᴀᴅᴇs ⚔️\`
> sɪɢᴜᴇ ᴄᴏᴍᴘʟᴇᴛᴀɴᴅᴏ ᴍɪsɪᴏɴᴇs`,
      mentions: [m.sender]
    }, { quoted: m })
  }

  // Mostrar misiones
  let text = `> . ﹡ ﹟ 📋 ׄ ⬭ *¡ᴍɪsɪᴏɴᴇs ᴅᴇ @${userId}!*

`

  for (let [type, config] of Object.entries(missionTypes)) {
    let missionData = checkReset(userId, type)
    let emoji = type === 'daily' ? '📅' : type === 'weekly' ? '📆' : '🗓️'
    let status = missionData.claimed ? '✅' : missionData.completed.length === config.missions.length ? '🎁' : '⏳'

    text += `*ㅤꨶ〆⁾ ㅤׄㅤ⸼ㅤׄ *͜${emoji}* ㅤ֢ㅤ⸱ㅤᯭִ* ${type.toUpperCase()} ${status}
`
    text += `ׅㅤ𓏸𓈒ㅤׄ *ʀᴇᴄᴏᴍᴘᴇɴsᴀ* :: $${config.reward.toLocaleString()}
`
    text += `ׅㅤ𓏸𓈒ㅤׄ *ᴘʀᴏɢʀᴇsᴏ* :: ${missionData.completed.length}/${config.missions.length}

`

    for (let mission of config.missions) {
      let completed = missionData.completed.includes(mission.id)
      let check = completed ? '✅' : '⬜'
      text += `ׅㅤ𓏸𓈒ㅤׄ ${check} ${mission.desc}
`
    }
    text += `
`
  }

  text += `> ## \`ᴄᴏᴍᴀɴᴅᴏs ⚔️\`
> • .misiones claim daily
> • .misiones claim weekly
> • .misiones claim monthly`

  conn.sendMessage(m.chat, { text, mentions: [m.sender] }, { quoted: m })
}

handler.help = ['misiones', 'missions']
handler.tags = ['economy']
handler.command = ['misiones', 'missions', 'mision']

export default handler
export { updateMission }