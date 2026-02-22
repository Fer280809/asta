// ============= RECETAS DE CRAFTEO =============

export const recipes = {
  // Armas
  espada_madera: { roble: 2, palos: 1 },
  espada_piedra: { piedra: 2, palos: 1 },
  espada_hierro: { hierro: 2, palos: 1 },
  espada_oro: { oro: 2, palos: 1 },
  espada_diamante: { diamante: 2, palos: 1 },
  espada_esmeralda: { esmeralda: 2, palos: 1, diamante: 1 },

  arco: { cuerda: 3, palos: 3 },
  ballesta: { hierro: 2, palos: 3, cuerda: 2 },

  // Herramientas
  pico_madera: { roble: 3, palos: 2 },
  pico_piedra: { piedra: 3, palos: 2 },
  pico_hierro: { hierro: 3, palos: 2 },
  pico_oro: { oro: 3, palos: 2 },
  pico_diamante: { diamante: 3, palos: 2 },

  hacha_madera: { roble: 3, palos: 2 },
  hacha_piedra: { piedra: 3, palos: 2 },
  hacha_hierro: { hierro: 3, palos: 2 },
  hacha_oro: { oro: 3, palos: 2 },
  hacha_diamante: { diamante: 3, palos: 2 },

  // Armaduras
  armadura_cuero: { cuero: 8 },
  armadura_hierro: { hierro: 8 },
  armadura_oro: { oro: 8 },
  armadura_diamante: { diamante: 8 },
  armadura_esmeralda: { esmeralda: 8, diamante: 2 },

  // Recursos
  palos: { roble: 1 }, // Produce 4 palos
  cuerda: { hilo: 4 },
  antorcha: { carbon: 1, palos: 1 }, // Produce 4 antorchas
  mesa_crafteo: { roble: 4 },
  horno: { piedra: 8 },
  cofre: { roble: 8 },
  yunque: { hierro: 4, piedra: 3 },
  encantamiento: { diamante: 2, obsidiana: 4, libro: 1 },

  // Comida
  pan: { trigo: 3 },
  sopa: { zanahoria: 2, calabaza: 1, cuenco: 1 },
  pastel: { trigo: 3, huevo: 1, leche: 3, azucar: 2 },
  galleta: { trigo: 2, azucar: 1 },
  carne_cocida: { carne: 1, carbon: 1 },
  pollo_cocido: { pollo: 1, carbon: 1 },

  // Pociones
  pocion: { botella: 1, manzana: 2, polvo_blaze: 1 },
  pocion_mana: { botella: 1, lapis: 3, polvo_blaze: 1 },
  pocion_fuerza: { botella: 1, polvo_blaze: 2, hueso: 3 },
  pocion_velocidad: { botella: 1, azucar: 3, polvo_blaze: 1 },
  pocion_suerte: { botella: 1, oro: 3, polvo_blaze: 1 },

  // Especiales
  libro: { papel: 3, cuero: 1 },
  papel: { caña_azucar: 3 },
  botella: { vidrio: 3 },
  vidrio: { arena: 4, carbon: 1 },
  cuenco: { arcilla: 3 },
  ladrillo: { arcilla: 1, carbon: 1 },
  bloque_oro: { oro: 9 },
  bloque_diamante: { diamante: 9 },
  bloque_esmeralda: { esmeralda: 9 },

  // Bloques de construcción
  escalera_madera: { roble: 6 },
  puerta_madera: { roble: 6 },
  valla_madera: { roble: 4, palos: 2 },
  losa_piedra: { piedra: 3 },
  ladrillos: { ladrillo: 4 },
  bloque_piedra: { piedra: 9 }
}

// Función para verificar si se puede craftear
export function canCraft(inventory, recipeKey) {
  const recipe = recipes[recipeKey]
  if (!recipe) return { can: false, reason: 'Receta no existe' }

  const missing = []
  for (const [ingredient, amount] of Object.entries(recipe)) {
    const has = inventory[ingredient] || 0
    if (has < amount) {
      missing.push(`${ingredient}: ${has}/${amount}`)
    }
  }

  return {
    can: missing.length === 0,
    missing: missing.length > 0 ? missing : null
  }
}

// Función para craftear
export function craftItem(inventory, recipeKey) {
  const recipe = recipes[recipeKey]
  if (!recipe) return { success: false, error: 'Receta no existe' }

  const check = canCraft(inventory, recipeKey)
  if (!check.can) {
    return { success: false, error: 'Ingredientes faltantes', missing: check.missing }
  }

  // Consumir ingredientes
  for (const [ingredient, amount] of Object.entries(recipe)) {
    inventory[ingredient] -= amount
    if (inventory[ingredient] <= 0) {
      delete inventory[ingredient]
    }
  }

  // Agregar resultado
  inventory[recipeKey] = (inventory[recipeKey] || 0) + 1

  return { success: true, item: recipeKey }
}

// Función para obtener recetas por categoría
export function getRecipesByCategory() {
  const categories = {
    armas: [],
    herramientas: [],
    armaduras: [],
    recursos: [],
    comida: [],
    pociones: [],
    especiales: [],
    construccion: []
  }

  const categoryMap = {
    espada: 'armas',
    arco: 'armas',
    ballesta: 'armas',
    pico: 'herramientas',
    hacha: 'herramientas',
    armadura: 'armaduras',
    palos: 'recursos',
    cuerda: 'recursos',
    antorcha: 'recursos',
    mesa: 'especiales',
    horno: 'especiales',
    cofre: 'especiales',
    yunque: 'especiales',
    encantamiento: 'especiales',
    pan: 'comida',
    sopa: 'comida',
    pastel: 'comida',
    galleta: 'comida',
    carne_cocida: 'comida',
    pollo_cocido: 'comida',
    pocion: 'pociones',
    libro: 'recursos',
    papel: 'recursos',
    botella: 'recursos',
    vidrio: 'recursos',
    cuenco: 'recursos',
    ladrillo: 'construccion',
    bloque: 'construccion',
    escalera: 'construccion',
    puerta: 'construccion',
    valla: 'construccion',
    losa: 'construccion',
    ladrillos: 'construccion'
  }

  for (const [key, recipe] of Object.entries(recipes)) {
    let category = 'otros'
    for (const [prefix, cat] of Object.entries(categoryMap)) {
      if (key.includes(prefix)) {
        category = cat
        break
      }
    }
    if (categories[category]) {
      categories[category].push({ key, recipe })
    }
  }

  return categories
}

export default recipes
