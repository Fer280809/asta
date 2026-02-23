import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import chalk from 'chalk'
import { areJidsSameUser } from '@whiskeysockets/baileys'

const __filename = fileURLToPath(import.meta.url)
const __dirname  = path.dirname(__filename)

const erroresRuntimeFile = path.join(process.cwd(), 'data', 'errores-runtime.json')

// -------------------- Funciones auxiliares --------------------
function registrarError(archivo, comando, sender, err) {
  try {
    let errores = []
    if (fs.existsSync(erroresRuntimeFile)) {
      errores = JSON.parse(fs.readFileSync(erroresRuntimeFile, 'utf-8'))
    }
    errores.unshift({
      archivo,
      comando,
      sender,
      error: err.message,
      stack: err.stack?.slice(0, 400) || '',
      fecha: new Date().toLocaleString()
    })
    fs.mkdirSync(path.dirname(erroresRuntimeFile), { recursive: true })
    fs.writeFileSync(erroresRuntimeFile, JSON.stringify(errores.slice(0, 30), null, 2))
  } catch {}
}

function getTipoMensaje(msg) {
  const tipos = [
    'conversation', 'imageMessage', 'videoMessage', 'audioMessage',
    'stickerMessage', 'documentMessage', 'extendedTextMessage',
    'reactionMessage', 'locationMessage', 'contactMessage',
    'pollCreationMessage', 'buttonsResponseMessage', 'listResponseMessage'
  ]
  for (const tipo of tipos) {
    if (msg.message?.[tipo]) return tipo
  }
  return null
}

function printMensaje(m, conn, texto, tipo) {
  try {
    const jid          = m.key?.remoteJid || ''
    const esGrupo      = jid.endsWith('@g.us')
    const participante = m.key?.participant || jid
    const numero       = participante
      .replace('@s.whatsapp.net', '')
      .replace('@lid', '')
      .replace('@g.us', '')
      .split(':')[0]
    const hora = new Date().toLocaleTimeString()

    const iconos = {
      conversation: '💬', extendedTextMessage: '💬',
      imageMessage: '🖼️', videoMessage: '🎥',
      audioMessage: '🎵', stickerMessage: '🎭',
      documentMessage: '📄', reactionMessage: '❤️',
      locationMessage: '📍', contactMessage: '👤',
      pollCreationMessage: '📊', buttonsResponseMessage: '🔘',
      listResponseMessage: '📋'
    }

    console.log(chalk.gray('─'.repeat(50)))
    if (esGrupo) {
      const nombreGrupo = conn?.chats?.[jid]?.name || jid.replace('@g.us', '')
      console.log(chalk.cyan('👥 Grupo:'), chalk.bold(nombreGrupo))
      console.log(chalk.yellow('👤 De:'), chalk.bold(numero))
    } else {
      const nombreContacto = conn?.chats?.[jid]?.name || numero
      console.log(chalk.green('👤 Usuario:'), chalk.bold(nombreContacto), chalk.gray(`(${numero})`))
    }
    console.log(chalk.magenta(`${iconos[tipo] || '💬'} Tipo:`), chalk.bold(tipo))
    if (texto) console.log(chalk.blue('📝 Mensaje:'), chalk.white(texto))
    console.log(chalk.gray(`🕐 ${hora}`))
  } catch {}
}

function cargarPlugins(dir) {
  let archivos = []
  if (!fs.existsSync(dir)) return archivos
  for (const item of fs.readdirSync(dir)) {
    const fullPath = path.join(dir, item)
    if (fs.statSync(fullPath).isDirectory()) {
      archivos = archivos.concat(cargarPlugins(fullPath))
    } else if (item.endsWith('.js')) {
      archivos.push(fullPath)
    }
  }
  return archivos
}

// -------------------- Detección de owner mejorada --------------------
function checkOwner(sender) {
  try {
    const owners = Array.isArray(global.owner) ? global.owner : [];

    // 1. Verificar si el sender completo (con dominio) coincide exactamente (para @lid)
    const ownerJids = owners.map(entry => Array.isArray(entry) ? entry[0] : entry);
    if (ownerJids.includes(sender)) {
      console.log(chalk.green('✅ Coincidencia exacta de JID'));
      return true;
    }

    // 2. Limpiar el sender a solo dígitos
    const senderLimpio = sender
      .split('@')[0]
      .split(':')[0]
      .replace(/\D/g, '');

    console.log(chalk.yellow('🔍 [checkOwner] sender raw:'), sender);
    console.log(chalk.yellow('🔍 [checkOwner] sender limpio:'), senderLimpio);
    console.log(chalk.yellow('🔍 [checkOwner] owners definidos:'), owners.map(e => Array.isArray(e) ? e[0] : e).join(', '));

    const resultado = owners.some(entry => {
      const ownerRaw = Array.isArray(entry) ? entry[0] : entry;
      const ownerStr = String(ownerRaw).trim();
      const ownerLimpio = ownerStr.replace(/\D/g, '');

      console.log(chalk.yellow(`🔍 comparando owner raw: ${ownerStr}, limpio: ${ownerLimpio}`));
      return senderLimpio === ownerLimpio;
    });

    console.log(chalk.yellow(`🔍 resultado: ${resultado ? 'ES OWNER' : 'NO ES OWNER'}`));
    return resultado;
  } catch (e) {
    console.error(chalk.red('Error en checkOwner:'), e);
    return false;
  }
}

// -------------------- Mensajes de error exclusivamente desde global.msj --------------------
function dfail(tipo, m, conn) {
  // Mapeo de tipo de permiso a clave en global.msj
  const mapa = {
    owner: 'soloOwner',
    group: 'soloGrupo',
    private: 'soloPrivado',
    admin: 'sinPermisos',
    botAdmin: 'sinPermisos',
    premium: 'sinPermisos'
  };

  const clave = mapa[tipo];
  // Obtenemos el texto directamente de global.msj (se asume que existe)
  const texto = global.msj?.[clave] || '⛔ Acceso denegado'; // fallback mínimo por si acaso

  // Construir mensaje con el formato de canal
  const message = {
    text: texto,
    contextInfo: {
      externalAdReply: {
        title: global.namebot || 'Mi Bot',
        body: global.etiqueta || 'Bot',
        thumbnail: { url: global.icono },
        sourceUrl: global.channel,
        mediaType: 1,
        renderLargerThumbnail: false
      }
    }
  };

  conn.sendMessage(m.chat, message, { quoted: m }).catch(() => {});
}

// -------------------- Handler principal --------------------
export async function handler(conn, chat) {
  try {
    // Evitar procesar el mismo mensaje varias veces
    if (!conn.processedMessages) conn.processedMessages = new Set();
    const messageId = chat.messages?.[0]?.key?.id;
    if (messageId) {
      if (conn.processedMessages.has(messageId)) {
        console.log(chalk.gray(`Mensaje ${messageId} ya procesado, omitiendo...`));
        return;
      }
      conn.processedMessages.add(messageId);
      setTimeout(() => conn.processedMessages.delete(messageId), 3000);
    }

    const m = chat.messages[0];
    if (!m?.message) return;
    if (m.key?.remoteJid === 'status@broadcast') return;
    if (m.message?.protocolMessage) return;

    const tipo = getTipoMensaje(m);
    if (!tipo) return;

    const from       = m.key.remoteJid;
    const sender     = m.key.participant || from;
    const isGroup    = from.endsWith('@g.us');
    const fromMe     = m.key?.fromMe || false;
    const usedPrefix = global.prefix || '.';

    const text =
      m.message?.conversation ||
      m.message?.extendedTextMessage?.text ||
      m.message?.imageMessage?.caption ||
      m.message?.videoMessage?.caption ||
      '';

    if (!fromMe) printMensaje(m, conn, text, tipo);
    if (!text || !text.startsWith(usedPrefix)) return;

    const args    = text.slice(usedPrefix.length).trim().split(/\s+/);
    const command = args.shift().toLowerCase();

    // Determinar si el usuario es owner
    const isOwner = checkOwner(sender);
    console.log(chalk.cyan(`🔍 isOwner final: ${isOwner}`));

    // ========== OBTENER INFORMACIÓN DEL GRUPO ==========
    let groupMetadata = {};
    let participants = [];
    let isAdmin = false;
    let isBotAdmin = false;

    if (isGroup) {
      try {
        groupMetadata = await conn.groupMetadata(from).catch(() => ({}));
        participants = groupMetadata.participants || [];
        
        const userParticipant = participants.find(p => areJidsSameUser(p.id, sender));
        isAdmin = !!(userParticipant?.admin === 'admin' || userParticipant?.admin === 'superadmin');

        const botParticipant = participants.find(p => areJidsSameUser(p.id, conn.user.jid));
        isBotAdmin = !!(botParticipant?.admin === 'admin' || botParticipant?.admin === 'superadmin');
      } catch (e) {
        console.error(chalk.red('Error al obtener metadata del grupo:'), e);
      }
    }

    // Adjuntar propiedades al mensaje
    m.chat      = from;
    m.sender    = sender;
    m.timestamp = Date.now();
    m.isGroup   = isGroup;
    m.isAdmin   = isAdmin;
    m.isBotAdmin = isBotAdmin;
    m.isOwner   = isOwner;

    // ========== BUSCAR Y EJECUTAR PLUGIN ==========
    const pluginsDir = path.join(process.cwd(), 'plugins');
    const archivos   = cargarPlugins(pluginsDir);

    for (const filePath of archivos) {
      try {
        const { default: plugin } = await import(`${filePath}?update=${Date.now()}`);
        if (!plugin?.command) continue;

        const cmds = Array.isArray(plugin.command) ? plugin.command : [plugin.command];
        if (!cmds.includes(command)) continue;

        const relativo = path.relative(pluginsDir, filePath);

        console.log(
          chalk.bgBlue.white(`\n⚡ Comando: ${usedPrefix}${command}`),
          chalk.gray(`[${relativo}]`),
          chalk.gray(`args: [${args.join(', ')}]`)
        );

        // ========== VERIFICACIONES DE PERMISOS ==========
        console.log('🔍 plugin.owner:', plugin.owner, '| isOwner:', isOwner);

        if (plugin.owner && !isOwner) {
          dfail('owner', m, conn);
          return;
        }

        if (plugin.group && !isGroup) {
          dfail('group', m, conn);
          return;
        }

        if (plugin.private && isGroup) {
          dfail('private', m, conn);
          return;
        }

        if (plugin.admin && !isAdmin) {
          dfail('admin', m, conn);
          return;
        }

        if (plugin.botAdmin && !isBotAdmin) {
          dfail('botAdmin', m, conn);
          return;
        }

        // ========== EJECUCIÓN DEL PLUGIN ==========
        try {
          await plugin(m, { 
            conn, 
            args, 
            usedPrefix, 
            isOwner, 
            command,
            isGroup, 
            isAdmin, 
            isBotAdmin, 
            groupMetadata, 
            participants,
            text: args.join(" ")
          });
        } catch (err) {
          console.error(chalk.red(`❌ Error en [${relativo}]:`), err.message);
          registrarError(relativo, command, sender, err);
          await conn.sendMessage(from, {
            text: `❌ Error en *${usedPrefix}${command}*\n📁 ${relativo}\n🔴 ${err.message}`
          }, { quoted: m }).catch(() => {});
        }

        return; // Comando ejecutado, salir del bucle

      } catch (err) {
        console.error(chalk.red(`❌ Error cargando plugin:`), err.message);
      }
    }

  } catch (error) {
    console.error(chalk.red('❌ Handler error:'), error.message);
  }
}