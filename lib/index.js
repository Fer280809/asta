// ============= EXPORTACIONES DE LIB =============

export { items, getItem, getItemsByType, searchItems } from './items.js'
export { recipes, canCraft, craftItem, getRecipesByCategory } from './recipes.js'
export { missions, getMission, getMissionsByType, getAvailableMissions, checkMissionProgress, getMissionReward } from './missions.js'
export { enemies, getEnemy, getEnemiesByLocation, getEnemiesByDifficulty, getRandomEnemy, calculateDamage, processDrops } from './enemies.js'
export { locations, getLocation, getLocationsByDifficulty, checkRequirements, getLocationDrops, getAvailableLocations } from './locations.js'
export { gameConfig, getExpForLevel, getCooldownMs, getRandomJob, getRandomFish } from './gameConfig.js'
