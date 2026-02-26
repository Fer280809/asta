// lib/gacha.js
// Funciones de utilidad para el sistema de gacha

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DB_DIR = join(__dirname, '..', 'database')
const DB_PATH = join(DB_DIR, 'gacha.json')

// Crear directorio si no existe
if (!existsSync(DB_DIR)) {
  mkdirSync(DB_DIR, { recursive: true })
}

// Inicializar DB si no existe
if (!existsSync(DB_PATH)) {
  writeFileSync(DB_PATH, JSON.stringify({}))
}

function readDB() {
  try {
    return JSON.parse(readFileSync(DB_PATH, 'utf8'))
  } catch {
    return {}
  }
}

function writeDB(data) {
  try {
    writeFileSync(DB_PATH, JSON.stringify(data, null, 2))
  } catch (e) {
    console.error('Error escribiendo DB:', e)
  }
}

export function getInventory(userId) {
  let db = readDB()
  return db[userId] || []
}

export function addWaifu(userId, waifu) {
  let db = readDB()
  if (!db[userId]) db[userId] = []
  
  // Agregar metadata
  waifu.acquired = Date.now()
  waifu.locked = waifu.locked || false
  waifu.favorite = waifu.favorite || false
  waifu.uniqueId = Date.now() + '_' + Math.random().toString(36).substr(2, 9)
  
  db[userId].push(waifu)
  writeDB(db)
  return true
}

export function removeWaifu(userId, index) {
  let db = readDB()
  if (!db[userId] || index < 0 || index >= db[userId].length) return false
  
  db[userId].splice(index, 1)
  writeDB(db)
  return true
}

export function updateWaifu(userId, index, updates) {
  let db = readDB()
  if (!db[userId] || index < 0 || index >= db[userId].length) return false
  
  db[userId][index] = { ...db[userId][index], ...updates }
  writeDB(db)
  return true
}

export function getAllInventories() {
  let db = readDB()
  return Object.entries(db).map(([id, waifus]) => ({
    id,
    count: waifus.length,
    totalValue: waifus.reduce((sum, w) => sum + (w.value || 0), 0),
    legendaries: waifus.filter(w => w.rarity && w.rarity.name && w.rarity.name.includes('⭐⭐⭐⭐⭐')).length,
    epics: waifus.filter(w => w.rarity && w.rarity.name && w.rarity.name.includes('⭐⭐⭐⭐')).length
  }))
}

export function formatWaifuList(waifus, start = 1) {
  return waifus.map((w, i) => {
    let rarity = w.rarity ? w.rarity.name.split(' ')[0] : '⭐'
    return `${start + i}. ${rarity} ${w.name} | ${w.series} | $${(w.value || 0).toLocaleString()}`
  }).join('\n')
}
