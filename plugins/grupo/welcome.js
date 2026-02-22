import { createCanvas, loadImage } from '@napi-rs/canvas'
import fs from 'fs'
import path from 'path'

const configFile = path.join(process.cwd(), 'data', 'welcome.json')

const DEFAULT_CONFIG = {
  activo: true,
  width: 800,
  height: 400,
  avatar: {
    x: 130,
    y: 200,
    radio: 90,
    borde: { color: '#00e5ff', grosor: 5 }
  },
  textos: {
    bienvenida: { texto: '¡Bienvenido!', font: 'bold 42px Sans', color: '#00e5ff', x: 420, y: 140 },
    nombre:     { font: 'bold 36px Sans', color: '#ffffff', x: 420, y: 200 },
    grupo:      { font: '24px Sans', color: '#cccccc', prefijo: 'a ', x: 420, y: 250 },
    miembros:   { font: '20px Sans', color: '#aaaaaa', sufijo: ' miembros', x: 420, y: 290 }
  },
  linea: { activa: true, color: '#00e5ff', y: 320, margenX: 40 },
  caption:    '👋 ¡Bienvenido @{numero} a *{grupo}*!\nYa somos *{miembros}* miembros.',
  captionBye: '👋 @{numero} ha salido de *{grupo}*. ¡Hasta pronto!'
}

function cargarConfigs() {
  try {
    if (!fs.existsSync(configFile)) return {}
    return JSON.parse(fs.readFileSync(configFile, 'utf-8'))
  } catch { return {} }
}

function guardarConfigs(configs) {
  fs.mkdirSync(path.dirname(configFile), { recursive: true })
  fs.writeFileSync(configFile, JSON.stringify(configs, null, 2))
}

function getConfig(jid) {
  const configs = cargarConfigs()
  const cfg = configs[jid] || {}
  return {
    ...DEFAULT_CONFIG, ...cfg,
    avatar: { ...DEFAULT_CONFIG.avatar, ...(cfg.avatar || {}), borde: { ...DEFAULT_CONFIG.avatar.borde, ...(cfg.avatar?.borde || {}) } },
    textos: { ...DEFAULT_CONFIG.textos, ...(cfg.textos || {}) },
    linea:  { ...DEFAULT_CONFIG.linea,  ...(cfg.linea  || {}) }
  }
}

function setConfig(jid, datos) {
  const configs = cargarConfigs()
  configs[jid] = { ...(configs[jid] || {}), ...datos }
  guardarConfigs(configs)
}

// ✅ Normalizar participante — puede ser string u objeto {id}
function getId(p) {
  return typeof p === 'string' ? p : p?.id || ''
}

async function getFotoGrupo(conn, jid) {
  try {
    const url = await conn.profilePictureUrl(jid, 'image')
    const res = await fetch(url)
    return Buffer.from(await res.arrayBuffer())
  } catch { return null }
}

async function getFotoPerfil(conn, usuario) {
  try {
    const url = await conn.profilePictureUrl(usuario, 'image')
    const res = await fetch(url)
    return Buffer.from(await res.arrayBuffer())
  } catch {
    return fs.existsSync('./assets/default.png')
      ? fs.readFileSync('./assets/default.png')
      : null
  }
}

async function generarImagen(nombre, nombreGrupo, miembros, fotoPerfil, fotoGrupo, cfg) {
  const canvas = createCanvas(cfg.width, cfg.height)
  const ctx    = canvas.getContext('2d')

  // Fondo: foto del grupo con overlay oscuro
  if (fotoGrupo) {
    try {
      const bg = await loadImage(fotoGrupo)
      ctx.drawImage(bg, 0, 0, cfg.width, cfg.height)
      ctx.fillStyle = 'rgba(0,0,0,0.65)'
      ctx.fillRect(0, 0, cfg.width, cfg.height)
    } catch {
      ctx.fillStyle = '#0a0a0a'
      ctx.fillRect(0, 0, cfg.width, cfg.height)
    }
  } else {
    ctx.fillStyle = '#0a0a0a'
    ctx.fillRect(0, 0, cfg.width, cfg.height)
  }

  // Línea decorativa
  if (cfg.linea.activa) {
    ctx.strokeStyle = cfg.linea.color
    ctx.lineWidth   = 2
    ctx.beginPath()
    ctx.moveTo(cfg.linea.margenX, cfg.linea.y)
    ctx.lineTo(cfg.width - cfg.linea.margenX, cfg.linea.y)
    ctx.stroke()
  }

  // Avatar circular
  const { x, y, radio, borde } = cfg.avatar
  ctx.save()
  ctx.beginPath()
  ctx.arc(x, y, radio, 0, Math.PI * 2)
  ctx.clip()
  if (fotoPerfil) {
    try {
      const av = await loadImage(fotoPerfil)
      ctx.drawImage(av, x - radio, y - radio, radio * 2, radio * 2)
    } catch {
      ctx.fillStyle = '#333'
      ctx.fill()
    }
  } else {
    ctx.fillStyle = '#333'
    ctx.fill()
  }
  ctx.restore()

  // Borde avatar
  ctx.strokeStyle = borde.color
  ctx.lineWidth   = borde.grosor
  ctx.beginPath()
  ctx.arc(x, y, radio + 2, 0, Math.PI * 2)
  ctx.stroke()

  // Textos
  ctx.textAlign = 'center'
  const t = cfg.textos

  ctx.font      = t.bienvenida.font
  ctx.fillStyle = t.bienvenida.color
  ctx.fillText(t.bienvenida.texto, t.bienvenida.x, t.bienvenida.y)

  ctx.font      = t.nombre.font
  ctx.fillStyle = t.nombre.color
  ctx.fillText(nombre, t.nombre.x, t.nombre.y)

  ctx.font      = t.grupo.font
  ctx.fillStyle = t.grupo.color
  ctx.fillText(`${t.grupo.prefijo}${nombreGrupo}`, t.grupo.x, t.grupo.y)

  ctx.font      = t.miembros.font
  ctx.fillStyle = t.miembros.color
  ctx.fillText(`${miembros}${t.miembros.sufijo}`, t.miembros.x, t.miembros.y)

  return canvas.toBuffer('image/png')
}

export async function welcomeEvento(conn, jid, participants, metadata) {
  const cfg = getConfig(jid)
  if (!cfg.activo) return

  const nombreGrupo = metadata.subject
  const miembros    = metadata.participants.length
  const fotoGrupo   = await getFotoGrupo(conn, jid)

  for (const p of participants) {
    try {
      const usuario    = getId(p)
      if (!usuario) continue
      const numero     = usuario.split('@')[0]
      const fotoPerfil = await getFotoPerfil(conn, usuario)
      const imagen     = await generarImagen(`+${numero}`, nombreGrupo, miembros, fotoPerfil, fotoGrupo, cfg)
      const caption    = cfg.caption
        .replace('{numero}', numero)
        .replace('{grupo}', nombreGrupo)
        .replace('{miembros}', miembros)

      await conn.sendMessage(jid, { image: imagen, caption, mentions: [usuario] })
    } catch (err) {
      console.error('Error welcome usuario:', err.message)
    }
  }
}

export async function byeEvento(conn, jid, participants, metadata) {
  const cfg = getConfig(jid)
  if (!cfg.activo) return

  const nombreGrupo = metadata.subject

  for (const p of participants) {
    try {
      const usuario = getId(p)
      if (!usuario) continue
      const numero  = usuario.split('@')[0]
      const caption = cfg.captionBye
        .replace('{numero}', numero)
        .replace('{grupo}', nombreGrupo)

      await conn.sendMessage(jid, { text: caption, mentions: [usuario] })
    } catch (err) {
      console.error('Error bye usuario:', err.message)
    }
  }
}

let handler = async (m, { conn, args, usedPrefix, command }) => {
  const jid = m.chat
  const cfg = getConfig(jid)

  if (command === 'welcomeon') {
    setConfig(jid, { activo: true })
    return conn.sendMessage(jid, { text: '✅ Welcome *activado*.' }, { quoted: m })
  }

  if (command === 'welcomeoff') {
    setConfig(jid, { activo: false })
    return conn.sendMessage(jid, { text: '❌ Welcome *desactivado*.' }, { quoted: m })
  }

  if (command === 'testwelcome') {
    const metadata = await conn.groupMetadata(jid)
    await welcomeEvento(conn, jid, [m.sender], metadata)
    return
  }

  if (command === 'testbye') {
    const metadata = await conn.groupMetadata(jid)
    await byeEvento(conn, jid, [m.sender], metadata)
    return
  }

  if (args[0] === 'texto' && args.slice(1).join(' ')) {
    setConfig(jid, { caption: args.slice(1).join(' ') })
    return conn.sendMessage(jid, {
      text: `✅ Caption welcome:\n${args.slice(1).join(' ')}\n\n_Variables: {numero} {grupo} {miembros}_`
    }, { quoted: m })
  }

  if (args[0] === 'bye' && args.slice(1).join(' ')) {
    setConfig(jid, { captionBye: args.slice(1).join(' ') })
    return conn.sendMessage(jid, {
      text: `✅ Caption bye:\n${args.slice(1).join(' ')}\n\n_Variables: {numero} {grupo}_`
    }, { quoted: m })
  }

  if (args[0] === 'titulo' && args.slice(1).join(' ')) {
    const txt = args.slice(1).join(' ')
    setConfig(jid, { textos: { ...cfg.textos, bienvenida: { ...cfg.textos.bienvenida, texto: txt } } })
    return conn.sendMessage(jid, { text: `✅ Título: *${txt}*` }, { quoted: m })
  }

  if (args[0] === 'color' && args[1] === 'borde' && args[2]) {
    setConfig(jid, {
      avatar: { ...cfg.avatar, borde: { ...cfg.avatar.borde, color: args[2] } },
      linea:  { ...cfg.linea, color: args[2] }
    })
    return conn.sendMessage(jid, { text: `✅ Color borde/línea: *${args[2]}*` }, { quoted: m })
  }

  if (args[0] === 'ver') {
    return conn.sendMessage(jid, {
      text: `⚙️ *Config welcome:*\n\n` +
        `🔘 Estado: *${cfg.activo ? 'Activo ✅' : 'Inactivo ❌'}*\n` +
        `💠 Borde: *${cfg.avatar.borde.color}*\n` +
        `✏️ Título: *${cfg.textos.bienvenida.texto}*\n` +
        `💬 Caption: *${cfg.caption}*\n` +
        `👋 Bye: *${cfg.captionBye}*`
    }, { quoted: m })
  }

  await conn.sendMessage(jid, {
    text: `⚙️ *Welcome*\n\n` +
      `▸ ${usedPrefix}welcomeon / welcomeoff\n` +
      `▸ ${usedPrefix}testwelcome\n` +
      `▸ ${usedPrefix}testbye\n` +
      `▸ ${usedPrefix}welcome ver\n` +
      `▸ ${usedPrefix}welcome titulo <texto>\n` +
      `▸ ${usedPrefix}welcome texto <caption>\n` +
      `▸ ${usedPrefix}welcome bye <caption>\n` +
      `▸ ${usedPrefix}welcome color borde <#hex>\n\n` +
      `_Variables: {numero} {grupo} {miembros}_`
  }, { quoted: m })
}

handler.help    = ['welcome', 'welcomeon', 'welcomeoff', 'testwelcome', 'testbye']
handler.tags    = ['grupo']
handler.command = ['welcome', 'welcomeon', 'welcomeoff', 'testwelcome', 'testbye']
handler.grupo   = true

export default handler
