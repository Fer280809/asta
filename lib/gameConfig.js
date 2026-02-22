// ============= CONFIGURACIÓN DEL JUEGO =============

export const gameConfig = {
  // Economía
  currency: "🪙 Yenes",
  dailyReward: 1000,
  dailyBonus: { min: 0, max: 500 },

  // Inventario
  maxInventory: 50,
  maxStack: 64,

  // Cooldowns (en minutos)
  cooldowns: {
    daily: 24 * 60,      // 24 horas
    mine: 5,             // 5 minutos
    chop: 3,             // 3 minutos
    hunt: 10,            // 10 minutos
    fish: 5,             // 5 minutos
    heal: 2,             // 2 minutos
    mission: 30,         // 30 minutos
    adventure: 30,       // 30 minutos
    dungeon: 120,        // 2 horas
    work: 60,            // 1 hora
    duel: 15,            // 15 minutos
    roulette: 0,         // Sin cooldown
    slots: 0             // Sin cooldown
  },

  // Niveles
  leveling: {
    baseExp: 100,
    expMultiplier: 1.5,
    maxLevel: 100,
    hpPerLevel: 10,
    manaPerLevel: 5
  },

  // Stats base
  baseStats: {
    hp: 100,
    maxHp: 100,
    mana: 50,
    maxMana: 50,
    strength: 1,
    defense: 1,
    speed: 1,
    luck: 1,
    mining: 0,
    chopping: 0,
    hunting: 0,
    fishing: 0
  },

  // Combate
  combat: {
    critChance: 0.1,     // 10% de crítico
    critMultiplier: 2,
    fleeChance: 0.3,     // 30% de huir
    defenseReduction: 0.5 // 50% de reducción por defensa
  },

  // Apuestas
  gambling: {
    minBet: 50,
    maxBet: 10000,
    roulette: {
      redChance: 0.48,
      blackChance: 0.48,
      greenChance: 0.04,
      redMultiplier: 2,
      blackMultiplier: 2,
      greenMultiplier: 14
    },
    slots: {
      symbols: ['🍎', '🍊', '🍇', '🍒', '💎', '7️⃣', '🎰'],
      weights: [20, 20, 15, 15, 10, 5, 1],
      multipliers: {
        threeSame: 5,
        twoSame: 2,
        jackpot: 20
      }
    }
  },

  // Trabajos
  jobs: [
    { name: 'Carpintero', emoji: '🔨', min: 100, max: 300 },
    { name: 'Herrero', emoji: '⚒️', min: 150, max: 400 },
    { name: 'Cocinero', emoji: '👨‍🍳', min: 80, max: 250 },
    { name: 'Minero', emoji: '⛏️', min: 120, max: 350 },
    { name: 'Granjero', emoji: '👨‍🌾', min: 90, max: 280 },
    { name: 'Alquimista', emoji: '⚗️', min: 200, max: 500 },
    { name: 'Ladrón', emoji: '🥷', min: 50, max: 600, risk: 0.3, finePercent: 0.5 }
  ],

  // Peces
  fishes: [
    { name: 'Pez Común', emoji: '🐟', value: 10, exp: 5, chance: 0.4 },
    { name: 'Pez Tropical', emoji: '🐠', value: 25, exp: 10, chance: 0.2 },
    { name: 'Pez Globo', emoji: '🐡', value: 40, exp: 15, chance: 0.15 },
    { name: 'Tiburón', emoji: '🦈', value: 100, exp: 30, chance: 0.05 },
    { name: 'Ballena', emoji: '🐋', value: 200, exp: 50, chance: 0.02 },
    { name: 'Calamar', emoji: '🦑', value: 60, exp: 20, chance: 0.1 },
    { name: 'Langosta', emoji: '🦞', value: 80, exp: 25, chance: 0.06 },
    { name: 'Basura', emoji: '🥾', value: 1, exp: 1, chance: 0.02 }
  ],

  // Mazmorra
  dungeon: {
    floors: [
      { name: 'Sótano', emoji: '🕳️', difficulty: 1, reward: 100, exp: 50 },
      { name: 'Cripta', emoji: '⚰️', difficulty: 2, reward: 250, exp: 125 },
      { name: 'Caverna', emoji: '🦇', difficulty: 3, reward: 500, exp: 250 },
      { name: 'Abismo', emoji: '🔥', difficulty: 4, reward: 1000, exp: 500 },
      { name: 'Infierno', emoji: '👹', difficulty: 5, reward: 2000, exp: 1000 }
    ],
    deathPenalty: 0.1 // Pierde 10% de yenes al morir
  },

  // Transferencias
  transfer: {
    fee: 0.05, // 5% de comisión
    minAmount: 100
  },

  // Tienda
  shop: {
    items: [
      { item: 'manzana', price: 15 },
      { item: 'pan', price: 25 },
      { item: 'sopa', price: 40 },
      { item: 'pocion', price: 150 },
      { item: 'pocion_mana', price: 180 },
      { item: 'pocion_fuerza', price: 200 },
      { item: 'pocion_velocidad', price: 180 },
      { item: 'palos', price: 5 },
      { item: 'espada_madera', price: 60 },
      { item: 'espada_piedra', price: 100 },
      { item: 'espada_hierro', price: 250 },
      { item: 'pico_madera', price: 50 },
      { item: 'pico_piedra', price: 90 },
      { item: 'pico_hierro', price: 220 },
      { item: 'hacha_madera', price: 45 },
      { item: 'hacha_piedra', price: 85 },
      { item: 'hacha_hierro', price: 200 },
      { item: 'armadura_cuero', price: 200 },
      { item: 'armadura_hierro', price: 500 },
      { item: 'antorcha', price: 10 },
      { item: 'perla_ender', price: 500 }
    ],
    sellMultiplier: 0.7 // Vende al 70% del valor
  }
}

// Función para calcular EXP necesario para siguiente nivel
export function getExpForLevel(level) {
  return Math.floor(gameConfig.leveling.baseExp * Math.pow(gameConfig.leveling.expMultiplier, level - 1))
}

// Función para calcular cooldown en ms
export function getCooldownMs(action) {
  const minutes = gameConfig.cooldowns[action] || 5
  return minutes * 60 * 1000
}

// Función para obtener trabajo aleatorio
export function getRandomJob() {
  return gameConfig.jobs[Math.floor(Math.random() * gameConfig.jobs.length)]
}

// Función para obtener pez aleatorio
export function getRandomFish() {
  const roll = Math.random()
  let cumulative = 0

  for (const fish of gameConfig.fishes) {
    cumulative += fish.chance
    if (roll <= cumulative) return fish
  }

  return gameConfig.fishes[0]
}

export default gameConfig
