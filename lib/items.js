// ============= ITEMS DEL JUEGO =============

export const items = {
  // Minerales
  carbon: { name: "Carbón", emoji: "⚫", value: 10, type: "mineral" },
  hierro: { name: "Hierro", emoji: "⚙️", value: 25, type: "mineral" },
  oro: { name: "Oro", emoji: "🌟", value: 50, type: "mineral" },
  diamante: { name: "Diamante", emoji: "💎", value: 150, type: "mineral" },
  esmeralda: { name: "Esmeralda", emoji: "✳️", value: 300, type: "mineral" },
  obsidiana: { name: "Obsidiana", emoji: "🖤", value: 75, type: "mineral" },
  redstone: { name: "Redstone", emoji: "🔴", value: 40, type: "mineral" },
  cuarzo: { name: "Cuarzo", emoji: "⬜", value: 35, type: "mineral" },
  oro_nether: { name: "Oro del Nether", emoji: "🔶", value: 60, type: "mineral" },

  // Maderas
  roble: { name: "Madera de Roble", emoji: "🪵", value: 5, type: "madera" },
  abeto: { name: "Madera de Abeto", emoji: "🌲", value: 8, type: "madera" },
  abedul: { name: "Madera de Abedul", emoji: "🌳", value: 12, type: "madera" },
  jungle: { name: "Madera de Jungla", emoji: "🌴", value: 20, type: "madera" },

  // Recursos
  piedra: { name: "Piedra", emoji: "🪨", value: 3, type: "recurso" },
  tierra: { name: "Tierra", emoji: "🟫", value: 1, type: "recurso" },
  arena: { name: "Arena", emoji: "🏖️", value: 2, type: "recurso" },
  grava: { name: "Grava", emoji: "🪨", value: 2, type: "recurso" },
  arcilla: { name: "Arcilla", emoji: "🟤", value: 5, type: "recurso" },

  // Caza
  carne: { name: "Carne Cruda", emoji: "🥩", value: 15, type: "comida", heal: 10 },
  pollo: { name: "Pollo Crudo", emoji: "🍗", value: 12, type: "comida", heal: 8 },
  cuero: { name: "Cuero", emoji: "🟫", value: 20, type: "recurso" },
  lana: { name: "Lana", emoji: "🧶", value: 10, type: "recurso" },
  plumas: { name: "Plumas", emoji: "🪶", value: 5, type: "recurso" },
  huesos: { name: "Huesos", emoji: "🦴", value: 8, type: "recurso" },
  hilo: { name: "Hilo", emoji: "🧵", value: 12, type: "recurso" },

  // Pesca
  pez_comun: { name: "Pez Común", emoji: "🐟", value: 10, type: "comida", heal: 5 },
  pez_tropical: { name: "Pez Tropical", emoji: "🐠", value: 25, type: "comida", heal: 8 },
  pez_globo: { name: "Pez Globo", emoji: "🐡", value: 40, type: "comida", heal: 12 },
  tiburon: { name: "Tiburón", emoji: "🦈", value: 100, type: "comida", heal: 25 },
  ballena: { name: "Ballena", emoji: "🐋", value: 200, type: "comida", heal: 50 },
  calamar: { name: "Calamar", emoji: "🦑", value: 60, type: "comida", heal: 15 },
  langosta: { name: "Langosta", emoji: "🦞", value: 80, type: "comida", heal: 20 },

  // Comida/Curación
  manzana: { name: "Manzana", emoji: "🍎", value: 8, type: "comida", heal: 5 },
  pan: { name: "Pan", emoji: "🍞", value: 15, type: "comida", heal: 12 },
  sopa: { name: "Sopa", emoji: "🍲", value: 25, type: "comida", heal: 20 },
  carne_cocida: { name: "Carne Cocida", emoji: "🍖", value: 25, type: "comida", heal: 18 },
  pollo_cocido: { name: "Pollo Cocido", emoji: "🍗", value: 20, type: "comida", heal: 15 },
  pastel: { name: "Pastel", emoji: "🎂", value: 50, type: "comida", heal: 30 },
  galleta: { name: "Galleta", emoji: "🍪", value: 10, type: "comida", heal: 6 },
  sandia: { name: "Sandía", emoji: "🍉", value: 15, type: "comida", heal: 10 },
  zanahoria: { name: "Zanahoria", emoji: "🥕", value: 12, type: "comida", heal: 8 },

  // Pociones
  pocion: { name: "Poción de Curación", emoji: "🧪", value: 100, type: "pocion", heal: 50 },
  pocion_mana: { name: "Poción de Maná", emoji: "💙", value: 120, type: "pocion", mana: 50 },
  pocion_fuerza: { name: "Poción de Fuerza", emoji: "💪", value: 200, type: "pocion", buff: "strength" },
  pocion_velocidad: { name: "Poción de Velocidad", emoji: "⚡", value: 180, type: "pocion", buff: "speed" },
  pocion_suerte: { name: "Poción de Suerte", emoji: "🍀", value: 250, type: "pocion", buff: "luck" },

  // Crafteados - Armas
  espada_madera: { name: "Espada de Madera", emoji: "🗡️", value: 50, type: "arma", damage: 5 },
  espada_piedra: { name: "Espada de Piedra", emoji: "🗿", value: 80, type: "arma", damage: 8 },
  espada_hierro: { name: "Espada de Hierro", emoji: "⚔️", value: 200, type: "arma", damage: 15 },
  espada_oro: { name: "Espada de Oro", emoji: "🔱", value: 350, type: "arma", damage: 12 },
  espada_diamante: { name: "Espada de Diamante", emoji: "💠", value: 500, type: "arma", damage: 25 },
  espada_esmeralda: { name: "Espada de Esmeralda", emoji: "🟢", value: 800, type: "arma", damage: 35 },
  arco: { name: "Arco", emoji: "🏹", value: 150, type: "arma", damage: 10 },
  ballesta: { name: "Ballesta", emoji: "🔫", value: 300, type: "arma", damage: 20 },

  // Herramientas
  pico_madera: { name: "Pico de Madera", emoji: "⛏️", value: 40, type: "herramienta", mining: 1 },
  pico_piedra: { name: "Pico de Piedra", emoji: "🔨", value: 70, type: "herramienta", mining: 2 },
  pico_hierro: { name: "Pico de Hierro", emoji: "🔧", value: 180, type: "herramienta", mining: 3 },
  pico_oro: { name: "Pico de Oro", emoji: "⭐", value: 320, type: "herramienta", mining: 4 },
  pico_diamante: { name: "Pico de Diamante", emoji: "💎", value: 450, type: "herramienta", mining: 5 },

  hacha_madera: { name: "Hacha de Madera", emoji: "🪓", value: 35, type: "herramienta", chop: 1 },
  hacha_piedra: { name: "Hacha de Piedra", emoji: "🪓", value: 65, type: "herramienta", chop: 2 },
  hacha_hierro: { name: "Hacha de Hierro", emoji: "🪓", value: 160, type: "herramienta", chop: 3 },
  hacha_oro: { name: "Hacha de Oro", emoji: "🪓", value: 280, type: "herramienta", chop: 4 },
  hacha_diamante: { name: "Hacha de Diamante", emoji: "🪓", value: 400, type: "herramienta", chop: 5 },

  // Armaduras
  armadura_cuero: { name: "Armadura de Cuero", emoji: "🦺", value: 150, type: "armadura", defense: 5 },
  armadura_hierro: { name: "Armadura de Hierro", emoji: "🛡️", value: 400, type: "armadura", defense: 15 },
  armadura_oro: { name: "Armadura de Oro", emoji: "👑", value: 700, type: "armadura", defense: 12 },
  armadura_diamante: { name: "Armadura de Diamante", emoji: "💎", value: 1000, type: "armadura", defense: 30 },
  armadura_esmeralda: { name: "Armadura de Esmeralda", emoji: "✳️", value: 1500, type: "armadura", defense: 40 },

  // Especiales
  palos: { name: "Palos", emoji: "🦯", value: 2, type: "recurso" },
  antorcha: { name: "Antorcha", emoji: "🔥", value: 5, type: "recurso" },
  mesa_crafteo: { name: "Mesa de Crafteo", emoji: "🛠️", value: 50, type: "especial" },
  horno: { name: "Horno", emoji: "🔥", value: 80, type: "especial" },
  cofre: { name: "Cofre", emoji: "📦", value: 100, type: "especial" },
  yunque: { name: "Yunque", emoji: "🔨", value: 300, type: "especial" },
  encantamiento: { name: "Mesa de Encantamientos", emoji: "📖", value: 500, type: "especial" },

  // Drops de mobs
  perla_ender: { name: "Perla de Ender", emoji: "⚪", value: 100, type: "especial" },
  vara_blaze: { name: "Vara de Blaze", emoji: "🔥", value: 80, type: "especial" },
  lagrima_ghast: { name: "Lágrima de Ghast", emoji: "😢", value: 120, type: "especial" },
  polvora: { name: "Pólvora", emoji: "💥", value: 25, type: "recurso" },
  hueso: { name: "Hueso", emoji: "🦴", value: 8, type: "recurso" },
  flecha: { name: "Flecha", emoji: "🏹", value: 5, type: "recurso" },
  ojo_araña: { name: "Ojo de Araña", emoji: "👁️", value: 15, type: "recurso" },

  // Objetos valiosos
  dragon_egg: { name: "Huevo de Dragón", emoji: "🥚", value: 5000, type: "legendario" },
  nether_star: { name: "Estrella del Nether", emoji: "⭐", value: 3000, type: "legendario" },
  elytra: { name: "Élitros", emoji: "🪽", value: 2000, type: "legendario" },
  totem: { name: "Tótem de la Inmortalidad", emoji: "🛡️", value: 2500, type: "legendario" },

  // Basura (pesca)
  bota: { name: "Bota Vieja", emoji: "🥾", value: 1, type: "basura" },
  basura: { name: "Basura", emoji: "🗑️", value: 1, type: "basura" },
  alga: { name: "Alga", emoji: "🌿", value: 3, type: "recurso" }
}

// Función helper para obtener item
export function getItem(key) {
  return items[key] || null
}

// Función para obtener items por tipo
export function getItemsByType(type) {
  return Object.entries(items)
    .filter(([key, item]) => item.type === type)
    .reduce((acc, [key, item]) => {
      acc[key] = item
      return acc
    }, {})
}

// Función para buscar items
export function searchItems(query) {
  const lowerQuery = query.toLowerCase()
  return Object.entries(items)
    .filter(([key, item]) => 
      key.includes(lowerQuery) || 
      item.name.toLowerCase().includes(lowerQuery)
    )
    .reduce((acc, [key, item]) => {
      acc[key] = item
      return acc
    }, {})
}

export default items
