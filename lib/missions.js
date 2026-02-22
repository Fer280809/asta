// ============= MISIONES DEL JUEGO =============

export const missions = [
  // Minería
  { id: 1, name: "Minero Novato", desc: "Mina 10 carbones", type: "mine", target: "carbon", amount: 10, reward: 100, exp: 50 },
  { id: 2, name: "Buscador de Hierro", desc: "Mina 5 hierros", type: "mine", target: "hierro", amount: 5, reward: 250, exp: 100 },
  { id: 3, name: "Cazador de Oro", desc: "Mina 3 oros", type: "mine", target: "oro", amount: 3, reward: 400, exp: 150 },
  { id: 4, name: "Maestro de Diamantes", desc: "Mina 5 diamantes", type: "mine", target: "diamante", amount: 5, reward: 1000, exp: 300 },
  { id: 5, name: "Esmeralda Real", desc: "Mina 3 esmeraldas", type: "mine", target: "esmeralda", amount: 3, reward: 1500, exp: 400 },
  { id: 6, name: "Obsidiana Negra", desc: "Mina 10 obsidianas", type: "mine", target: "obsidiana", amount: 10, reward: 600, exp: 200 },

  // Tala
  { id: 7, name: "Leñador Principiante", desc: "Tala 20 maderas de roble", type: "chop", target: "roble", amount: 20, reward: 150, exp: 75 },
  { id: 8, name: "Bosque Invernal", desc: "Tala 15 abetos", type: "chop", target: "abeto", amount: 15, reward: 200, exp: 100 },
  { id: 9, name: "Madera Blanca", desc: "Tala 10 abedules", type: "chop", target: "abedul", amount: 10, reward: 250, exp: 125 },
  { id: 10, name: "Jungla Salvaje", desc: "Tala 10 maderas de jungla", type: "chop", target: "jungle", amount: 10, reward: 350, exp: 175 },

  // Caza
  { id: 11, name: "Carnicero", desc: "Obtén 10 carnes", type: "hunt", target: "carne", amount: 10, reward: 200, exp: 100 },
  { id: 12, name: "Pollero", desc: "Obtén 8 pollos", type: "hunt", target: "pollo", amount: 8, reward: 180, exp: 90 },
  { id: 13, name: "Curtidor", desc: "Obtén 15 cueros", type: "hunt", target: "cuero", amount: 15, reward: 400, exp: 200 },
  { id: 14, name: "Pastor", desc: "Obtén 20 lanas", type: "hunt", target: "lana", amount: 20, reward: 300, exp: 150 },

  // Pesca
  { id: 15, name: "Pescador Novato", desc: "Pesca 5 peces comunes", type: "fish", target: "pez_comun", amount: 5, reward: 100, exp: 50 },
  { id: 16, name: "Pescador Tropical", desc: "Pesca 3 peces tropicales", type: "fish", target: "pez_tropical", amount: 3, reward: 150, exp: 75 },
  { id: 17, name: "Cazador de Tiburones", desc: "Pesca 2 tiburones", type: "fish", target: "tiburon", amount: 2, reward: 400, exp: 200 },
  { id: 18, name: "Ballenero", desc: "Pesca 1 ballena", type: "fish", target: "ballena", amount: 1, reward: 800, exp: 400 },

  // Economía
  { id: 19, name: "Ahorrador", desc: "Acumula 5000 yenes", type: "money", target: "yen", amount: 5000, reward: 500, exp: 250 },
  { id: 20, name: "Rico", desc: "Acumula 10000 yenes", type: "money", target: "yen", amount: 10000, reward: 1000, exp: 500 },
  { id: 21, name: "Millonario", desc: "Acumula 50000 yenes", type: "money", target: "yen", amount: 50000, reward: 5000, exp: 1000 },

  // Crafteo
  { id: 22, name: "Herrero Aprendiz", desc: "Craftea una espada de hierro", type: "craft", target: "espada_hierro", amount: 1, reward: 400, exp: 200 },
  { id: 23, name: "Armadura Pesada", desc: "Craftea una armadura de hierro", type: "craft", target: "armadura_hierro", amount: 1, reward: 600, exp: 300 },
  { id: 24, name: "Diamante Brillante", desc: "Craftea una espada de diamante", type: "craft", target: "espada_diamante", amount: 1, reward: 1000, exp: 500 },
  { id: 25, name: "Chef", desc: "Craftea 5 sopas", type: "craft", target: "sopa", amount: 5, reward: 300, exp: 150 },
  { id: 26, name: "Panadero", desc: "Craftea 10 panes", type: "craft", target: "pan", amount: 10, reward: 250, exp: 125 },
  { id: 27, name: "Alquimista", desc: "Craftea 3 pociones de curación", type: "craft", target: "pocion", amount: 3, reward: 500, exp: 250 },

  // Combate
  { id: 28, name: "Cazador de Monstruos", desc: "Derrota 5 monstruos en aventura", type: "kill", target: "monster", amount: 5, reward: 500, exp: 250 },
  { id: 29, name: "Duelista", desc: "Gana 3 duelos", type: "duel", target: "win", amount: 3, reward: 600, exp: 300 },
  { id: 30, name: "Explorador de Mazmorras", desc: "Completa 3 mazmorras", type: "dungeon", target: "complete", amount: 3, reward: 1000, exp: 500 },

  // Especiales
  { id: 31, name: "Trabajador Duro", desc: "Trabaja 5 veces", type: "work", target: "work", amount: 5, reward: 300, exp: 150 },
  { id: 32, name: "Jugador de Casino", desc: "Juega 10 veces a la ruleta", type: "gamble", target: "roulette", amount: 10, reward: 400, exp: 200 },
  { id: 33, name: "Slots Adicto", desc: "Juega 20 veces a las slots", type: "gamble", target: "slots", amount: 20, reward: 500, exp: 250 },

  // Diarias (especiales)
  { id: 34, name: "Recolector", desc: "Recolecta 50 items en total", type: "collect", target: "any", amount: 50, reward: 800, exp: 400 },
  { id: 35, name: "Vendedor", desc: "Vende items por 1000 yenes", type: "sell", target: "yen", amount: 1000, reward: 400, exp: 200 },
  { id: 36, name: "Comerciante", desc: "Compra 5 items en la tienda", type: "buy", target: "items", amount: 5, reward: 300, exp: 150 }
]

// Función para obtener misión por ID
export function getMission(id) {
  return missions.find(m => m.id === id) || null
}

// Función para obtener misiones por tipo
export function getMissionsByType(type) {
  return missions.filter(m => m.type === type)
}

// Función para obtener misiones disponibles (no completadas)
export function getAvailableMissions(completedIds) {
  return missions.filter(m => !completedIds.includes(m.id))
}

// Función para verificar progreso de misión
export function checkMissionProgress(mission, progress) {
  return progress >= mission.amount
}

// Función para obtener recompensa formateada
export function getMissionReward(mission) {
  return {
    yenes: mission.reward,
    exp: mission.exp,
    text: `💰 ${mission.reward} yenes, ⭐ ${mission.exp} EXP`
  }
}

export default missions
