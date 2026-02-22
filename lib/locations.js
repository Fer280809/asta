// ============= UBICACIONES DE AVENTURA =============

export const locations = [
  {
    id: "mina_abandonada",
    name: "Mina Abandonada",
    emoji: "⛏️",
    difficulty: 1,
    description: "Una vieja mina llena de carbón y hierro. Perfecta para principiantes.",
    drops: ["carbon", "hierro", "piedra", "tierra"],
    dropRates: { carbon: 0.6, hierro: 0.4, piedra: 0.8, tierra: 0.5 },
    enemies: ["zombie", "esqueleto", "araña"],
    enemyChance: 0.3,
    expBonus: 1.0,
    yenBonus: 1.0,
    requirements: null,
    dangerLevel: "Fácil 🟢"
  },
  {
    id: "bosque_oscuro",
    name: "Bosque Oscuro",
    emoji: "🌲",
    difficulty: 2,
    description: "Un bosque denso con madera valiosa y criaturas de la noche.",
    drops: ["roble", "abeto", "lana", "cuero", "manzana"],
    dropRates: { roble: 0.7, abeto: 0.5, lana: 0.3, cuero: 0.2, manzana: 0.4 },
    enemies: ["zombie", "esqueleto", "araña", "bruja"],
    enemyChance: 0.4,
    expBonus: 1.2,
    yenBonus: 1.1,
    requirements: { level: 2 },
    dangerLevel: "Medio 🟡"
  },
  {
    id: "cueva_profunda",
    name: "Cueva Profunda",
    emoji: "🕳️",
    difficulty: 3,
    description: "Cavernas profundas con minerales preciosos y peligros ocultos.",
    drops: ["diamante", "esmeralda", "obsidiana", "oro", "redstone"],
    dropRates: { diamante: 0.15, esmeralda: 0.1, obsidiana: 0.3, oro: 0.35, redstone: 0.4 },
    enemies: ["esqueleto", "creeper", "enderman", "zombie"],
    enemyChance: 0.5,
    expBonus: 1.5,
    yenBonus: 1.3,
    requirements: { level: 5, mining: 10 },
    dangerLevel: "Difícil 🟠"
  },
  {
    id: "nether",
    name: "Nether",
    emoji: "🔥",
    difficulty: 4,
    description: "Un infierno dimension lleno de fuego, lava y criaturas hostiles.",
    drops: ["cuarzo", "oro_nether", "vara_blaze", "polvora", "obsidiana"],
    dropRates: { cuarzo: 0.5, oro_nether: 0.4, vara_blaze: 0.2, polvora: 0.35, obsidiana: 0.25 },
    enemies: ["zombi_pigman", "ghast", "blaze", "wither_skeleton", "magma_cube"],
    enemyChance: 0.6,
    expBonus: 2.0,
    yenBonus: 1.8,
    requirements: { level: 10, items: ["obsidiana"] },
    dangerLevel: "Muy Difícil 🔴"
  },
  {
    id: "end",
    name: "El End",
    emoji: "🌑",
    difficulty: 5,
    description: "Una dimensión oscura flotante, hogar del temible Dragón.",
    drops: ["perla_ender", "dragon_egg", "obsidiana", "diamante"],
    dropRates: { perla_ender: 0.4, dragon_egg: 0.05, obsidiana: 0.6, diamante: 0.2 },
    enemies: ["enderman", "endermite", "shulker", "dragon"],
    enemyChance: 0.7,
    expBonus: 3.0,
    yenBonus: 2.5,
    requirements: { level: 15, items: ["perla_ender"] },
    dangerLevel: "Extremo ⚫",
    isBossLocation: true
  },
  {
    id: "ocean",
    name: "Océano Profundo",
    emoji: "🌊",
    difficulty: 3,
    description: "Las profundidades del océano guardan tesoros y peligros acuáticos.",
    drops: ["pez_comun", "pez_tropical", "calamar", "langosta", "alga"],
    dropRates: { pez_comun: 0.6, pez_tropical: 0.4, calamar: 0.25, langosta: 0.2, alga: 0.5 },
    enemies: ["elder_guardian"],
    enemyChance: 0.2,
    expBonus: 1.4,
    yenBonus: 1.2,
    requirements: { level: 4 },
    dangerLevel: "Difícil 🟠"
  },
  {
    id: "desert",
    name: "Desierto",
    emoji: "🏜️",
    difficulty: 2,
    description: "Un árido desierto con templos antiguos y peligros ocultos.",
    drops: ["arena", "cactus", "hueso", "oro"],
    dropRates: { arena: 0.9, cactus: 0.4, hueso: 0.3, oro: 0.15 },
    enemies: ["esqueleto", "zombie", "araña"],
    enemyChance: 0.35,
    expBonus: 1.1,
    yenBonus: 1.0,
    requirements: null,
    dangerLevel: "Medio 🟡"
  },
  {
    id: "montaña",
    name: "Montaña",
    emoji: "🏔️",
    difficulty: 3,
    description: "Picos nevados con esmeraldas y peligros de caída.",
    drops: ["esmeralda", "obsidiana", "nieve", "piedra"],
    dropRates: { esmeralda: 0.25, obsidiana: 0.2, nieve: 0.7, piedra: 0.8 },
    enemies: ["enderman", "esqueleto", "zombie"],
    enemyChance: 0.4,
    expBonus: 1.3,
    yenBonus: 1.2,
    requirements: { level: 4 },
    dangerLevel: "Difícil 🟠"
  }
]

// Función para obtener ubicación por ID
export function getLocation(id) {
  return locations.find(l => l.id === id) || null
}

// Función para obtener ubicaciones por dificultad
export function getLocationsByDifficulty(difficulty) {
  return locations.filter(l => l.difficulty === difficulty)
}

// Función para verificar requisitos
export function checkRequirements(location, user) {
  if (!location.requirements) return { canEnter: true }

  const reqs = location.requirements
  const missing = []

  if (reqs.level && user.level < reqs.level) {
    missing.push(`Nivel ${reqs.level}`)
  }

  if (reqs.mining && user.stats?.mining < reqs.mining) {
    missing.push(`Mining ${reqs.mining}`)
  }

  if (reqs.items) {
    for (const item of reqs.items) {
      if (!user.inventory || !user.inventory[item]) {
        missing.push(`Item: ${item}`)
      }
    }
  }

  return {
    canEnter: missing.length === 0,
    missing
  }
}

// Función para obtener drops de ubicación
export function getLocationDrops(location) {
  const drops = []

  for (const item of location.drops) {
    const rate = location.dropRates[item] || 0.1
    if (Math.random() < rate) {
      const amount = Math.floor(Math.random() * 3) + 1
      drops.push({ item, amount })
    }
  }

  return drops
}

// Función para obtener ubicaciones disponibles para usuario
export function getAvailableLocations(user) {
  return locations.filter(l => {
    const check = checkRequirements(l, user)
    return check.canEnter
  })
}

export default locations
