# 『𝕬𝖘𝖙𝖆-𝕭𝖔𝖙』v2.0

Bot de WhatsApp avanzado con sistema de economía RPG, aventura, crafteo y SubBots.

## 🚀 Características

- 💰 **Economía completa**: Minería, tala, caza, comercio
- ⚔️ **Sistema RPG**: Niveles, experiencia, estadísticas
- 🎒 **Inventario**: Gestión de items, crafteo, equipamiento
- 🗺️ **Aventura**: Exploración de lugares, combates, misiones
- 🔗 **SubBots**: Crea tu propio bot con QR o código de emparejamiento
- 👑 **Administración**: Completos comandos de grupo
- 🎨 **Stickers**: Creador de stickers fácil

## 📦 Instalación

```bash
# Clonar repositorio
git clone https://github.com/Fer280809/Asta-bot.git
cd asta-bot

# Instalar dependencias
npm install

# Iniciar bot
npm start
```

## ⚙️ Configuración

Edita `config.js`:
```javascript
export const owner = ["5214183357841"] // Tu número
export const prefix = '#' // Prefijo de comandos
```

## 🎮 Comandos Principales

### Economía
- `#daily` - Recompensa diaria
- `#mine` - Minar minerales
- `#chop` - Talar madera
- `#hunt` - Cazar animales
- `#balance` - Ver tu dinero
- `#inventory` - Ver inventario
- `#shop` - Tienda de items
- `#craft` - Sistema de crafteo
- `#heal` - Curarte

### Aventura
- `#adventure` - Explorar mundo
- `#mission` - Sistema de misiones

### SubBots
- `#subbot` - Menú de SubBots
- `#subbot qr` - Crear con QR
- `#subbot code` - Crear con código
- `#subbot list` - Mis SubBots

### Admin
- `#kick` - Expulsar usuario
- `#promote` - Dar admin
- `#demote` - Quitar admin
- `#tagall` - Mencionar todos
- `#del` - Borrar mensaje

### Utilidades
- `#sticker` - Crear sticker
- `#menu` - Menú principal
- `#info` - Info del grupo

## 📁 Estructura

```
asta-bot/
├── config.js          # Configuración principal
├── index.js           # Entrada principal
├── package.json       # Dependencias
├── lib/               # Librerías
│   ├── handler.js     # Manejador de comandos
│   ├── database.js    # Base de datos
│   ├── permissions.js # Permisos
│   ├── subbot-qr.js   # Generador QR
│   ├── subbot-code.js # Generador código
│   └── subbot-runner.js # Ejecutor SubBots
├── plugins/           # Comandos
│   ├── admin/         # Comandos de admin
│   ├── economia/      # Economía y RPG
│   ├── aventura/      # Aventura y misiones
│   ├── grupos/        # Comandos de grupo
│   ├── subbots/       # Sistema SubBots
│   └── utils/         # Utilidades
├── data/              # Base de datos JSON
└── Sessions/          # Sesiones
    ├── Principal/     # Bot principal
    └── SubBots/       # SubBots
```

## 🌟 Créditos

- **Creador**: Fernando
- **Número**: +5214183357841
- **GitHub**: [Fer280809](https://github.com/Fer280809)

## 📞 Soporte

- Grupo: https://chat.whatsapp.com/BfCKeP10yZZ9ancsGy1Eh9
- Comunidad: https://chat.whatsapp.com/KKwDZn5vDAE6MhZFAcVQeO
- Canal: https://whatsapp.com/channel/0029Vb64nWqLo4hb8cuxe23n

## 📄 Licencia

MIT License - Libre uso y modificación.
