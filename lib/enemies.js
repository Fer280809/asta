// ============= ENEMIGOS DEL JUEGO =============

export const enemies = [
  // Overworld - Fáciles
  {
    id: 'zombie',
    name: "Zombie",
    emoji: "🧟",
    hp: 20,
    damage: 4,
    exp: 10,
    yenes: 15,
    drops: [
      { item: "carne", chance: 0.5, amount: [1, 2] },
      { item: "cuero", chance: 0.3, amount: [1, 1] }
    ],
    locations: ["overworld", "mina_abandonada"],
    difficulty: 1
  },
  {
    id: 'esqueleto',
    name: "Esqueleto",
    emoji: "💀",
    hp: 20,
    damage: 5,
    exp: 12,
    yenes: 18,
    drops: [
      { item: "huesos", chance: 0.6, amount: [1, 3] },
      { item: "flecha", chance: 0.4, amount: [1, 2] }
    ],
    locations: ["overworld", "mina_abandonada", "cueva_profunda"],
    difficulty: 1
  },
  {
    id: 'araña',
    name: "Araña",
    emoji: "🕷️",
    hp: 16,
    damage: 3,
    exp: 8,
    yenes: 10,
    drops: [
      { item: "hilo", chance: 0.5, amount: [1, 2] },
      { item: "ojo_araña", chance: 0.3, amount: [1, 1] }
    ],
    locations: ["overworld", "mina_abandonada"],
    difficulty: 1
  },
  {
    id: 'creeper',
    name: "Creeper",
    emoji: "🟩",
    hp: 20,
    damage: 15,
    exp: 15,
    yenes: 25,
    drops: [
      { item: "polvora", chance: 0.7, amount: [1, 2] }
    ],
    locations: ["overworld", "cueva_profunda"],
    difficulty: 2,
    special: "explosion"
  },
  {
    id: 'enderman',
    name: "Enderman",
    emoji: "👁️",
    hp: 40,
    damage: 10,
    exp: 25,
    yenes: 50,
    drops: [
      { item: "perla_ender", chance: 0.5, amount: [1, 1] }
    ],
    locations: ["overworld", "cueva_profunda", "end"],
    difficulty: 3
  },
  {
    id: 'bruja',
    name: "Bruja",
    emoji: "🧙‍♀️",
    hp: 26,
    damage: 6,
    exp: 18,
    yenes: 30,
    drops: [
      { item: "pocion", chance: 0.4, amount: [1, 1] },
      { item: "hilo", chance: 0.3, amount: [1, 2] }
    ],
    locations: ["overworld", "bosque_oscuro"],
    difficulty: 2,
    special: "heal"
  },

  // Nether - Medios/Difíciles
  {
    id: 'zombi_pigman',
    name: "Zombi Pigman",
    emoji: "🐷",
    hp: 20,
    damage: 12,
    exp: 18,
    yenes: 35,
    drops: [
      { item: "oro", chance: 0.5, amount: [1, 2] },
      { item: "carne", chance: 0.4, amount: [1, 1] }
    ],
    locations: ["nether"],
    difficulty: 3,
    special: "group"
  },
  {
    id: 'ghast',
    name: "Ghast",
    emoji: "😭",
    hp: 10,
    damage: 10,
    exp: 15,
    yenes: 40,
    drops: [
      { item: "lagrima_ghast", chance: 0.6, amount: [1, 1] },
      { item: "polvora", chance: 0.3, amount: [1, 2] }
    ],
    locations: ["nether"],
    difficulty: 3,
    special: "flying"
  },
  {
    id: 'blaze',
    name: "Blaze",
    emoji: "🔥",
    hp: 20,
    damage: 8,
    exp: 20,
    yenes: 45,
    drops: [
      { item: "vara_blaze", chance: 0.5, amount: [1, 1] },
      { item: "carbon", chance: 0.3, amount: [1, 1] }
    ],
    locations: ["nether"],
    difficulty: 3,
    special: "fire"
  },
  {
    id: 'wither_skeleton',
    name: "Esqueleto Wither",
    emoji: "🦴",
    hp: 30,
    damage: 8,
    exp: 20,
    yenes: 40,
    drops: [
      { item: "huesos", chance: 0.5, amount: [1, 3] },
      { item: "carbon", chance: 0.4, amount: [1, 2] }
    ],
    locations: ["nether"],
    difficulty: 3
  },
  {
    id: 'magma_cube',
    name: "Cubo de Magma",
    emoji: "🌋",
    hp: 16,
    damage: 6,
    exp: 12,
    yenes: 25,
    drops: [
      { item: "oro_nether", chance: 0.4, amount: [1, 1] }
    ],
    locations: ["nether"],
    difficulty: 2,
    special: "split"
  },

  // End - Difíciles
  {
    id: 'endermite',
    name: "Endermite",
    emoji: "🔮",
    hp: 8,
    damage: 4,
    exp: 8,
    yenes: 15,
    drops: [
      { item: "perla_ender", chance: 0.3, amount: [1, 1] }
    ],
    locations: ["end"],
    difficulty: 2
  },
  {
    id: 'shulker',
    name: "Shulker",
    emoji: "🐚",
    hp: 30,
    damage: 8,
    exp: 25,
    yenes: 60,
    drops: [
      { item: "perla_ender", chance: 0.5, amount: [1, 2] }
    ],
    locations: ["end"],
    difficulty: 4,
    special: "shield"
  },

  // Jefes - Muy difíciles
  {
    id: 'wither',
    name: "Wither",
    emoji: "👑",
    hp: 150,
    damage: 20,
    exp: 200,
    yenes: 500,
    drops: [
      { item: "nether_star", chance: 1.0, amount: [1, 1] },
      { item: "diamante", chance: 0.8, amount: [2, 5] }
    ],
    locations: ["nether", "boss"],
    difficulty: 5,
    isBoss: true,
    special: "wither_effect"
  },
  {
    id: 'dragon',
    name: "Dragón del End",
    emoji: "🐉",
    hp: 200,
    damage: 25,
    exp: 500,
    yenes: 1000,
    drops: [
      { item: "dragon_egg", chance: 1.0, amount: [1, 1] },
      { item: "diamante", chance: 1.0, amount: [5, 10] },
      { item: "esmeralda", chance: 0.8, amount: [3, 6] }
    ],
    locations: ["end", "boss"],
    difficulty: 5,
    isBoss: true,
    special: "fly"
  },
  {
    id: 'elder_guardian',
    name: "Guardián Anciano",
    emoji: "🐟",
    hp: 80,
    damage: 12,
    exp: 100,
    yenes: 300,
    drops: [
      { item: "esponja", chance: 0.7, amount: [1, 2] },
      { item: "pez_tropical", chance: 0.5, amount: [2, 4] }
    ],
    locations: ["ocean", "boss"],
    difficulty: 4,
    isBoss: true,
    special: "mining_fatigue"
  }
]

// Función para obtener enemigo por ID
export function getEnemy(id) {
  return enemies.find(e => e.id === id) || null
}

// Función para obtener enemigos por ubicación
export function getEnemiesByLocation(location) {
  return enemies.filter(e => e.locations.includes(location))
}

// Función para obtener enemigos por dificultad
export function getEnemiesByDifficulty(difficulty) {
  return enemies.filter(e => e.difficulty === difficulty)
}

// Función para obtener enemigo aleatorio según ubicación
export function getRandomEnemy(location, maxDifficulty = 5) {
  const available = enemies.filter(e => 
    e.locations.includes(location) && 
    e.difficulty <= maxDifficulty &&
    !e.isBoss
  )

  if (available.length === 0) return null

  // Peso basado en dificultad (enemigos más fáciles son más comunes)
  const weighted = available.flatMap(e => 
    Array(Math.max(1, 6 - e.difficulty)).fill(e)
  )

  return weighted[Math.floor(Math.random() * weighted.length)]
}

// Función para calcular daño del enemigo
export function calculateDamage(enemy, playerDefense = 0) {
  const baseDamage = enemy.damage
  const variance = Math.floor(Math.random() * 4) - 2 // -2 a +2
  const defenseReduction = Math.floor(playerDefense / 2)

  return Math.max(1, baseDamage + variance - defenseReduction)
}

// Función para procesar drops
export function processDrops(enemy) {
  const drops = []

  for (const drop of enemy.drops) {
    if (Math.random() < drop.chance) {
      const amount = Math.floor(Math.random() * (drop.amount[1] - drop.amount[0] + 1)) + drop.amount[0]
      drops.push({ item: drop.item, amount })
    }
  }

  return drops
}

export default enemies
