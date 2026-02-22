import fs from 'fs'
import path from 'path'

const DATA_DIR = './data'

// Asegurar que existe la carpeta data
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true })
}

// Base de datos en memoria
const db = {
  users: {},           // Datos de usuarios (economía, stats, inventario)
  actividad: {},       // Actividad de mensajes
  protegidos: [],      // Usuarios protegidos
  warnings: {},        // Advertencias
  palabras: [],        // Palabras prohibidas
  guilds: {},         // Datos de grupos
  subbots: {}         // Configuración de SubBots
}

// Estructura base de usuario
export function createUser(jid) {
  return {
    jid,
    yenes: 0,
    exp: 0,
    level: 1,
    hp: 100,
    maxHp: 100,
    mana: 50,
    maxMana: 50,
    inventory: {},
    equipment: {
      weapon: null,
      armor: null,
      tool: null
    },
    stats: {
      strength: 1,
      defense: 1,
      speed: 1,
      luck: 1,
      mining: 0,
      chopping: 0,
      hunting: 0
    },
    cooldowns: {
      daily: 0,
      mine: 0,
      chop: 0,
      hunt: 0,
      heal: 0,
      mission: 0,
      adventure: 0
    },
    missions: {
      active: null,
      completed: [],
      daily: null
    },
    location: null,
    joinedAt: Date.now()
  }
}

// Obtener usuario (crear si no existe)
export function getUser(jid) {
  if (!db.users[jid]) {
    db.users[jid] = createUser(jid)
  }
  return db.users[jid]
}

// Guardar usuario
export function saveUser(jid, data) {
  db.users[jid] = data
  saveData('users')
}

// Cargar datos desde archivos
export function loadData() {
  const files = {
    users: 'users.json',
    actividad: 'actividad.json',
    protegidos: 'protegidos.json',
    warnings: 'warnings.json',
    palabras: 'palabras.json',
    guilds: 'guilds.json',
    subbots: 'subbots.json'
  }

  for (const [key, filename] of Object.entries(files)) {
    const filepath = path.join(DATA_DIR, filename)
    if (fs.existsSync(filepath)) {
      try {
        db[key] = JSON.parse(fs.readFileSync(filepath, 'utf-8'))
      } catch (e) {
        console.error(`Error cargando ${filename}:`, e)
      }
    }
  }
}

// Guardar datos a archivos
export function saveData(key) {
  const files = {
    users: 'users.json',
    actividad: 'actividad.json',
    protegidos: 'protegidos.json',
    warnings: 'warnings.json',
    palabras: 'palabras.json',
    guilds: 'guilds.json',
    subbots: 'subbots.json'
  }

  if (files[key]) {
    const filepath = path.join(DATA_DIR, files[key])
    fs.writeFileSync(filepath, JSON.stringify(db[key], null, 2))
  }
}

// Guardar todos los datos
export function saveAll() {
  Object.keys(db).forEach(key => saveData(key))
}

// Auto-guardar cada 5 minutos
setInterval(() => {
  saveAll()
  console.log('💾 Base de datos guardada automáticamente')
}, 5 * 60 * 1000)

export { db }
