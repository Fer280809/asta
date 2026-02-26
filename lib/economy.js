// lib/economy.js
// Sistema de economía para Asta Bot

import fs from 'fs'
import path from 'path'
import moment from 'moment-timezone'

// Rutas de archivos de datos
const dataDir = path.join(process.cwd(), 'data')
const economyPath = path.join(dataDir, 'economy.json')
const cooldownsPath = path.join(dataDir, 'cooldowns.json')

// Asegurar que existe el directorio de datos
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true })
}

// Inicializar archivos si no existen
if (!fs.existsSync(economyPath)) {
  fs.writeFileSync(economyPath, JSON.stringify({}, null, 2))
}
if (!fs.existsSync(cooldownsPath)) {
  fs.writeFileSync(cooldownsPath, JSON.stringify({}, null, 2))
}

// Cargar configuración
try {
  await import('./economy-config.js')
} catch (e) {
  console.log('⚠️ No se encontró economy-config.js, usando valores por defecto')
}

const config = global.economy || {
  currency: '$',
  currencyName: 'AstaCoins',
  dailyBase: 1000,
  dailyStreakBonus: 100,
  dailyMaxStreak: 10,
  cooldowns: {
    work: 30 * 60 * 1000,
    mine: 15 * 60 * 1000,
    tatar: 5 * 60 * 1000,
    rob: 2 * 60 * 60 * 1000,
    daily: 24 * 60 * 60 * 1000
  }
}

// Funciones de utilidad
function getEconomyData() {
  try {
    return JSON.parse(fs.readFileSync(economyPath, 'utf-8'))
  } catch {
    return {}
  }
}

function saveEconomyData(data) {
  fs.writeFileSync(economyPath, JSON.stringify(data, null, 2))
}

function getCooldownsData() {
  try {
    return JSON.parse(fs.readFileSync(cooldownsPath, 'utf-8'))
  } catch {
    return {}
  }
}

function saveCooldownsData(data) {
  fs.writeFileSync(cooldownsPath, JSON.stringify(data, null, 2))
}

// Obtener o crear usuario
export function getUser(userId) {
  let data = getEconomyData()
  
  if (!data[userId]) {
    data[userId] = {
      id: userId,
      balance: 0,
      bank: 0,
      level: 1,
      exp: 0,
      streak: 0,
      lastDaily: 0,
      inventory: [],
      messages: 0,
      commands: 0,
      workCount: 0,
      mineCount: 0,
      tatarCount: 0,
      createdAt: Date.now()
    }
    saveEconomyData(data)
  }
  
  return data[userId]
}

// Actualizar usuario
export function updateUser(userId, updates) {
  let data = getEconomyData()
  let user = data[userId] || getUser(userId)
  
  Object.assign(user, updates)
  data[userId] = user
  saveEconomyData(data)
  
  return user
}

// Añadir dinero (efectivo o banco)
export function addMoney(userId, amount, toBank = false) {
  let user = getUser(userId)
  
  if (toBank) {
    user.bank += amount
  } else {
    user.balance += amount
  }
  
  // Subir EXP
  user.exp += Math.floor(amount / 100)
  
  // Subir de nivel si corresponde
  let expNeeded = user.level * 1000
  if (user.exp >= expNeeded) {
    user.level++
    user.exp -= expNeeded
  }
  
  updateUser(userId, user)
  return user
}

// Remover dinero
export function removeMoney(userId, amount, fromBank = false) {
  let user = getUser(userId)
  
  if (fromBank) {
    if (user.bank < amount) return false
    user.bank -= amount
  } else {
    if (user.balance < amount) return false
    user.balance -= amount
  }
  
  updateUser(userId, user)
  return true
}

// Transferir dinero entre usuarios
export function transfer(fromId, toId, amount) {
  let fromUser = getUser(fromId)
  let toUser = getUser(toId)
  
  if (fromUser.balance < amount) return false
  
  fromUser.balance -= amount
  toUser.balance += amount
  
  updateUser(fromId, fromUser)
  updateUser(toId, toUser)
  
  return true
}

// Verificar cooldown
export function checkCooldown(userId, action, cooldownTime) {
  let data = getCooldownsData()
  
  if (!data[userId]) {
    data[userId] = {}
  }
  
  let lastUse = data[userId][action] || 0
  let now = Date.now()
  let remaining = (lastUse + cooldownTime) - now
  
  if (remaining > 0) {
    return {
      canUse: false,
      remaining: remaining,
      lastUse: lastUse
    }
  }
  
  // Actualizar cooldown
  data[userId][action] = now
  saveCooldownsData(data)
  
  return {
    canUse: true,
    remaining: 0,
    lastUse: lastUse
  }
}

// Formatear tiempo
export function formatTime(ms) {
  let seconds = Math.floor(ms / 1000)
  let minutes = Math.floor(seconds / 60)
  let hours = Math.floor(minutes / 60)
  let days = Math.floor(hours / 24)
  
  if (days > 0) return `${days}d ${hours % 24}h ${minutes % 60}m`
  if (hours > 0) return `${hours}h ${minutes % 60}m ${seconds % 60}s`
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`
  return `${seconds}s`
}

// Obtener top de usuarios
export function getTop(limit = 10) {
  let data = getEconomyData()
  
  let users = Object.values(data).map(user => ({
    ...user,
    total: user.balance + user.bank
  }))
  
  users.sort((a, b) => b.total - a.total)
  
  return users.slice(0, limit)
}

// Incrementar estadísticas
export function incrementStat(userId, stat, amount = 1) {
  let user = getUser(userId)
  
  if (user[stat] !== undefined) {
    user[stat] += amount
    updateUser(userId, user)
  }
  
  return user
}

// Guardar racha diaria
export function saveStreak(userId, streak) {
  let user = getUser(userId)
  user.streak = streak
  user.lastDaily = Date.now()
  updateUser(userId, user)
  return user
}

// Obtener racha actual
export function getStreak(userId) {
  let user = getUser(userId)
  return {
    streak: user.streak || 0,
    lastDaily: user.lastDaily || 0
  }
}

export default {
  getUser,
  updateUser,
  addMoney,
  removeMoney,
  transfer,
  checkCooldown,
  formatTime,
  getTop,
  incrementStat,
  saveStreak,
  getStreak
}
