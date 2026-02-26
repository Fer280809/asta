
global.economy = {
  // Moneda
  currency: '$',
  currencyName: 'AstaCoins',

  // Recompensas base
  dailyBase: 1000,
  dailyStreakBonus: 100,
  dailyMaxStreak: 10,

  // Cooldowns (en milisegundos)
  cooldowns: {
    work: 30 * 60 * 1000,      // 30 minutos
    mine: 15 * 60 * 1000,      // 15 minutos
    tatar: 5 * 60 * 1000,      // 5 minutos
    rob: 2 * 60 * 60 * 1000,   // 2 horas
    daily: 24 * 60 * 60 * 1000 // 24 horas
  },

  // Recompensas del Top (automáticas)
  topRewards: {
    biDaily: {        // Cada 2 días
      interval: 2 * 24 * 60 * 60 * 1000,
      rewards: [3000, 2000, 1000] // 1ro, 2do, 3ro
    },
    weekly: {         // Semanal
      interval: 7 * 24 * 60 * 60 * 1000,
      rewards: [15000, 10000, 5000]
    }
  },

  // Trabajos disponibles
  jobs: [
    { name: 'Desarrollador', emoji: '💻', min: 500, max: 1500 },
    { name: 'Doctor', emoji: '🩺', min: 800, max: 2000 },
    { name: 'Policía', emoji: '👮', min: 600, max: 1800 },
    { name: 'Bombero', emoji: '🚒', min: 700, max: 1900 },
    { name: 'Chef', emoji: '👨‍🍳', min: 400, max: 1200 },
    { name: 'Artista', emoji: '🎨', min: 300, max: 1000 },
    { name: 'Músico', emoji: '🎸', min: 350, max: 1100 },
    { name: 'Piloto', emoji: '✈️', min: 900, max: 2500 },
    { name: 'Astronauta', emoji: '🚀', min: 1000, max: 3000 },
    { name: 'Leñador', emoji: '🪓', min: 200, max: 800 }
  ],

  // Minerales
  minerals: [
    { name: 'Carbón', emoji: '⚫', min: 50, max: 200, prob: 40 },
    { name: 'Hierro', emoji: '🔩', min: 100, max: 400, prob: 30 },
    { name: 'Oro', emoji: '🏆', min: 300, max: 800, prob: 15 },
    { name: 'Diamante', emoji: '💎', min: 800, max: 2000, prob: 8 },
    { name: 'Esmeralda', emoji: '💚', min: 1500, max: 3500, prob: 5 },
    { name: 'Rubí', emoji: '❤️', min: 2500, max: 5000, prob: 2 }
  ],

  // Multiplicadores Tatar
  tatarMultipliers: [
    { value: 0, prob: 30, emoji: '💀' },
    { value: 0.5, prob: 25, emoji: '😢' },
    { value: 1, prob: 20, emoji: '😐' },
    { value: 1.5, prob: 15, emoji: '🙂' },
    { value: 2, prob: 7, emoji: '😃' },
    { value: 3, prob: 2.5, emoji: '🤩' },
    { value: 5, prob: 0.5, emoji: '🎰' }
  ],

  // Items de tienda
  shopItems: [
    { id: 'fishing_rod', name: 'Caña de Pescar', emoji: '🎣', price: 5000 },
    { id: 'pickaxe', name: 'Pico Mejorado', emoji: '⛏️', price: 8000 },
    { id: 'laptop', name: 'Laptop Gamer', emoji: '💻', price: 15000 },
    { id: 'car', name: 'Auto Deportivo', emoji: '🏎️', price: 50000 },
    { id: 'mansion', name: 'Mansión', emoji: '🏰', price: 100000 },
    { id: 'yacht', name: 'Yate', emoji: '🛥️', price: 250000 }
  ],

  // Misiones
  missions: {
    daily: {
      reward: 2000,
      list: [
        { id: 'msg10', desc: 'Enviar 10 mensajes', target: 10 },
        { id: 'cmd5', desc: 'Usar 5 comandos', target: 5 },
        { id: 'work2', desc: 'Trabajar 2 veces', target: 2 },
        { id: 'mine3', desc: 'Minar 3 veces', target: 3 }
      ]
    },
    weekly: {
      reward: 10000,
      list: [
        { id: 'msg100', desc: 'Enviar 100 mensajes', target: 100 },
        { id: 'cmd30', desc: 'Usar 30 comandos', target: 30 },
        { id: 'work10', desc: 'Trabajar 10 veces', target: 10 },
        { id: 'mine15', desc: 'Minar 15 veces', target: 15 },
        { id: 'tatar5', desc: 'Jugar tatar 5 veces', target: 5 }
      ]
    },
    monthly: {
      reward: 50000,
      list: [
        { id: 'msg500', desc: 'Enviar 500 mensajes', target: 500 },
        { id: 'cmd100', desc: 'Usar 100 comandos', target: 100 },
        { id: 'work50', desc: 'Trabajar 50 veces', target: 50 },
        { id: 'mine50', desc: 'Minar 50 veces', target: 50 },
        { id: 'tatar20', desc: 'Jugar tatar 20 veces', target: 20 }
      ]
    }
  }
}

console.log('✅ Configuración de economía cargada')
