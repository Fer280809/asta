# 🤖 Asta Bot v2.0.0

> Un poderoso bot de WhatsApp multipropósito construido con **Baileys**, diseñado para grupos y usuarios privados con funcionalidades avanzadas.

<div align="center">

[![Node.js](https://img.shields.io/badge/Node.js->=18-brightgreen?style=flat-square&logo=node.js)](https://nodejs.org/)
[![Baileys](https://img.shields.io/badge/Baileys-Multi%20Device-blue?style=flat-square&logo=whatsapp)](https://github.com/WhiskeySockets/Baileys)
[![License](https://img.shields.io/badge/License-GLP-3.0-yellow?style=flat-square)](LICENSE)
[![Estado](https://img.shields.io/badge/Estado-Activo-brightgreen?style=flat-square)](https://github.com/Fer280809/Asta)

</div>

---

## 📋 Tabla de Contenidos

- [Características](#-características)
- [Requisitos](#-requisitos)
- [Instalación](#-instalación)
- [Guía de Uso en Termux](#-guía-de-uso-en-termux)
- [Comandos Disponibles](#-comandos-disponibles)
- [Configuración](#-configuración)
- [Estructura de Carpetas](#-estructura-de-carpetas)
- [Desarrollo](#-desarrollo)
- [Contribuciones](#-contribuciones)
- [Soporte](#-soporte)

---

## ✨ Características

- ✅ **Sistema Multi-Device** - Compatible con múltiples dispositivos
- ✅ **Manejo de Grupos** - Control total de administración grupal
- ✅ **Base de Datos Integrada** - Sistema de almacenamiento de datos
- ✅ **Plugins Modulares** - Fácil extensión de funcionalidades
- ✅ **Sistema de Menciones** - Soporte completo de @menciones
- ✅ **Comandos Personalizables** - Prefijo configurable (por defecto: `.`)
- ✅ **Interfaz Elegante** - Mensajes formateados y visualmente atractivos
- ✅ **Sistema de Permisos** - Control de acceso por roles (Owner, Admin, Usuario)
- ✅ **Silenciamiento de Usuarios** - Mute con duración configurable
- ✅ **Gestión de Enlaces** - Revocar y restablecer enlaces grupales
- ✅ **Eliminación de Mensajes** - Borrar mensajes con permisos de admin
- ✅ **Sistema de Warnings** - Registro de advertencias (preparado)

---

## 🔧 Requisitos

- **Node.js** v18 - v22
- **npm** o **yarn**
- **Git** (opcional, para clonar el repositorio)
- **Whatsapp** activo en tu dispositivo

---

## 📥 Instalación

### Opción 1: Clonar el Repositorio

```bash
git clone https://github.com/Fer280809/Asta.git
cd Asta
npm install
npm start
```

### Opción 2: Descargar ZIP

1. Descarga el repositorio desde GitHub
2. Extrae la carpeta
3. Abre terminal en la carpeta
4. Ejecuta:

```bash
npm install
npm start
```

---

## 📱 Guía de Uso en Termux

### Paso 1: Instalar Termux

Descarga **Termux** desde:
- **F-Droid**: https://f-droid.org/en/packages/com.termux/
- **Google Play**: https://play.google.com/store/apps/details?id=com.termux

> ⚠️ Se recomienda F-Droid para mejor soporte

### Paso 2: Preparar el Entorno

Abre Termux y ejecuta los siguientes comandos:

```bash
# Actualizar paquetes
pkg update -y
pkg upgrade -y

# Instalar Node.js y Git
pkg install -y nodejs git

# Verificar versión de Node.js (debe ser >= 18)
node --version
```

### Paso 3: Descargar el Bot

```bash
# Navegar a una carpeta conveniente
cd storage/downloads

# Clonar el repositorio
git clone https://github.com/Fer280809/Asta.git

# Entrar al directorio
cd Asta
```

### Paso 4: Instalar Dependencias

```bash
# Instalar las dependencias del proyecto
npm install

# Esto puede tomar unos 5-10 minutos según tu conexión
```

### Paso 5: Iniciar el Bot

```bash
# Iniciar el bot
npm start
```

**Primera ejecución:**
- El bot te pedirá elegir entre Código QR o Código de Emparejamiento
- **Opción 1: Código QR** - Escanea con WhatsApp
- **Opción 2: Código de Emparejamiento** - Más seguro, requiere el código de tu teléfono

### Paso 6: Mantener el Bot Activo (Opcional)

Para que el bot se ejecute en segundo plano incluso al cerrar Termux:

```bash
# Instalar tmux (para sesiones persistentes)
pkg install -y tmux

# Crear una nueva sesión
tmux new-session -d -s asta "cd ~/storage/downloads/Asta && npm start"

# Ver sesiones activas
tmux list-sessions

# Reconectar a la sesión
tmux attach-session -t asta

# Desconectar sin cerrar (Ctrl+B, luego D)
```

### Paso 7: Actualizar el Bot (Automático)

**Opción 1: Desde WhatsApp (Recomendado)**
```
.update
```
El bot se actualizará automáticamente y se reiniciará.

**Opción 2: Script Manual en Termux**
```bash
# Entrar al directorio del bot
cd ~/storage/downloads/Asta

# Ejecutar script de actualización
bash update.sh

# O manualmente:
git pull origin main && npm install && npm start
```

### Paso 8: Reiniciar el Bot

**Opción 1: Desde WhatsApp**
```
.restart
```

**Opción 2: En Termux**
```bash
# Si usas tmux:
tmux kill-session -t asta

# Luego reinicia:
tmux new-session -d -s asta "cd ~/storage/downloads/Asta && npm start"

# Si no usas tmux, presiona Ctrl+C y ejecuta:
npm start
```

---

## 📝 Comandos Disponibles

### Comandos de Grupo

| Comando | Alias | Descripción | Permisos |
|---------|-------|-------------|----------|
| `.add` | `.agregar` `.añadir` | Invitar usuario al grupo | Admin + Bot Admin |
| `.admins` | `@admins` | Listar administradores | Grupo |
| `.promote` | `.promover` | Promocionar a administrador | Admin + Bot Admin |
| `.demote` | `.degradar` | Degradar de administrador | Admin + Bot Admin |
| `.kick` | `.echar` `.sacar` `.ban` | Expulsar usuario | Admin + Bot Admin |
| `.kicknum` | - | Expulsar por prefijo de país | Admin + Bot Admin |
| `.listnum` | `.listanum` | Listar números por prefijo | Admin + Bot Admin |
| `.mute` | `.silenciar` | Silenciar usuario (Ej: `.mute @user 1h`) | Admin + Bot Admin |
| `.delete` | `.del` | Eliminar mensaje (responder) | Admin + Bot Admin |
| `.revoke` | `.restablecer` | Revocar enlace del grupo | Admin + Bot Admin |

### Comandos de Owner

| Comando | Alias | Descripción |
|---------|-------|-------------|
| `.update` | `.actualizar` | Actualizar bot desde GitHub (automático) |
| `.restart` | `.reiniciar` | Reiniciar el bot |

### Ejemplos de Uso

```
.add 5214183357841          # Invitar usuario
@admins ¡Hola admins!        # Mencionar admins
.promote @user              # Promover usuario
.demote @user               # Degradar usuario
.kick @user                 # Expulsar usuario
.mute @user 30m             # Silenciar 30 minutos
.mute @user 2h              # Silenciar 2 horas
.mute @user 1d              # Silenciar 1 día
.mute @user                 # Silenciar indefinidamente
.delete                     # Eliminar (responde a un mensaje)
.revoke                     # Revocar enlace
.listnum 54                 # Listar números con prefijo +54
.kicknum 55                 # Expulsar números con prefijo +55
.update                     # Actualizar bot desde GitHub
.restart                    # Reiniciar el bot
```

---

## ⚙️ Configuración

### Archivo: `setting.js`

Edita este archivo para personalizar el bot:

```javascript
global.namebot = 'Asta Bot'           // Nombre del bot
global.vs = '2.0.0'                   // Versión
global.prefix = '.'                   // Prefijo de comandos
global.libreria = 'Baileys Multi Device'
```

// Información del propietario
global.owner = [
  ['5214183357841', '𝕱𝖊𝖘𝖓𝖆𝖓𝖉𝖔', true]
]

// Enlaces
global.channel = 'https://whatsapp.com/channel/...'
global.grupo = 'https://chat.whatsapp.com/...'
global.comunidad = 'https://chat.whatsapp.com/...'

// Opciones
global.modoPublico = true            // true = disponible para todos
global.antiPrivado = false           // true = bloquear mensajes privados
```

---
## 👨‍💻 Desarrollo

### Crear un Nuevo Plugin

1. Crea un archivo en `plugins/tu-categoria/mi-comando.js`:

```javascript
export async function handler(conn, chat) {
  const m = chat.messages[0]
  if (!m?.message) return
  
  const from = m.key.remoteJid
  const text = m.message?.conversation || ''
  const command = text.trim().split(/\s+/)[0].toLowerCase().replace(global.prefix, '')

  // Tu lógica aquí
  if (command === 'micomando') {
    conn.sendMessage(from, { text: '¡Hola! 👋' }, { quoted: m })
  }
}

export const config = {
  help: ['micomando'],
  tags: ['utilidad'],
  command: ['micomando'],
  group: false,    // false = funciona en privado
  admin: false,    // false = cualquiera lo puede usar
  botAdmin: false
}
```

2. El bot cargará automáticamente el plugin

### Requisitos de Desarrollo

```bash
npm install --save-dev eslint prettier
```

---

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Para contribuir:

1. Fork el repositorio
2. Crea una rama (`git checkout -b feature/AmazingFeature`)
3. Commitea cambios (`git commit -m 'Add AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

## 🆘 Soporte

### Problemas Comunes

**❌ Error: "Cannot find module '@whiskeysockets/baileys'"**
```bash
rm -rf node_modules package-lock.json
npm install
```

**❌ El bot no se conecta**
- Verifica tu conexión a internet
- Asegúrate de usar una cuenta de WhatsApp activa
- Intenta cerrar sesión y volver a escanear el código QR

**❌ Los comandos no funcionan**
- Verifica el prefijo en `setting.js`
- Asegúrate de que el bot sea administrador del grupo
- Revisa que uses la sintaxis correcta

### Contacto

- **GitHub Issues**: https://github.com/Fer280809/Asta/issues
- **Owner**: 𝕱𝖊𝖘𝖓𝖆𝖓𝖉𝖔 (5214183357841)

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver archivo `LICENSE` para más detalles.

---

## ⭐ Créditos

- **Baileys** - [WhiskeySockets](https://github.com/WhiskeySockets/Baileys)
- **Node.js** - [Node Foundation](https://nodejs.org/)
- **Desarrollador Principal**: 𝕱𝖊𝖘𝖓𝖆𝖓𝖉𝖔

---

<div align="center">

### 🌟 Si te fue útil, dale una ⭐ al repositorio

**© Asta Bot - Todos los derechos reservados**

```
Hecho con ❤️ usando JavaScript y mucho café ☕
```

</div>
