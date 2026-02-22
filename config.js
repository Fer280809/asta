// ============= CONFIGURACIÓN ASTA BOT =============

export const owner = ["5214183357841"]

export const prefix = '#'

export const botname = "『𝕬𝖘𝖙𝖆-𝕭𝖔𝖙』"
export const author = "Powered By 𝕱𝖊𝖗𝖓𝖆𝖓𝖉𝖔"
export const etiqueta = "𝕱𝖊𝖗𝖓𝖆𝖓𝖉𝖔"

// URLs
export const group = "https://chat.whatsapp.com/BfCKeP10yZZ9ancsGy1Eh9"
export const community = "https://chat.whatsapp.com/KKwDZn5vDAE6MhZFAcVQeO"
export const channel = "https://whatsapp.com/channel/0029Vb64nWqLo4hb8cuxe23n"
export const github = "https://github.com/Fer280809/Asta-bot"

// ============= CONFIGURACIÓN SUB-BOTS =============
export const subBotConfig = {
  maxSubBots: 50,
  sessionTimeout: 120,
  autoRestart: true,
  allowCustomization: true,
  defaultPrefix: '#',
  folder: "./Sessions/SubBots"
}

// ============= IMPORTAR CONFIGURACIÓN DE JUEGO =============
// Ahora en archivos separados en lib/:
// - lib/items.js
// - lib/recipes.js
// - lib/missions.js
// - lib/enemies.js
// - lib/locations.js
// - lib/gameConfig.js

export default {
  prefix,
  botname,
  owner,
  etiqueta,
  group,
  community,
  channel,
  github,
  subBotConfig
}
