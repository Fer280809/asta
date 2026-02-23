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

// -------------------- Detección de owner --------------------
function checkOwner(sender) {
  try {
    const owners = Array.isArray(global.owner) ? global.owner : [];
    const ownerJids = owners.map(entry => Array.isArray(entry) ? entry[0] : entry);
    
    if (ownerJids.includes(sender)) return true;

    const senderLimpio = sender
      .split('@')[0]
      .split(':')[0]
      .replace(/\D/g, '');

    return owners.some(entry => {
      const ownerRaw = Array.isArray(entry) ? entry[0] : entry;
      const ownerLimpio = String(ownerRaw).replace(/\D/g, '');
      return senderLimpio === ownerLimpio;
    });
  } catch (e) {
    console.error(chalk.red('Error en checkOwner:'), e);
    return false;
  }
}

// -------------------- Mensajes de error con formato de CANAL --------------------
async function sendChannelMessage(conn, jid, text, quoted = null) {
  try {
    await conn.sendMessage(jid, {
      text: text,
      contextInfo: {
        mentionedJid: quoted ? [quoted.sender] : [],
        externalAdReply: {
          title: `『${global.namebot || 'Bot'}』`,
          body: global.etiqueta || 'By Fernando',
          mediaType: 1,
          previewType: 0,
          showAdAttribution: true,
          thumbnailUrl: global.icono,
          sourceUrl: global.channel,
          renderLargerThumbnail: true
        },
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: global.IDchannel || '120363399175402285@newsletter',
          newsletterName: global.namebot || 'Asta-Bot',
          serverMessageId: -1
        }
      }
    }, { quoted });
  } catch (e) {
    await conn.sendMessage(jid, { text: text }, { quoted });
  }
}

async function dfail(tipo, m, conn) {
  const mapa = {
    owner: 'soloOwner',
    group: 'soloGrupo',
    private: 'soloPrivado',
    admin: 'sinPermisos',
    botAdmin: 'botNoAdmin',
    premium: 'sinPermisos'
  };

  const clave = mapa[tipo] || 'sinPermisos';
  const texto = global.msj?.[clave] || '⛔ Acceso denegado';
  
  await sendChannelMessage(conn, m.chat, texto, m);
}

// -------------------- Handler principal --------------------
export async function handler(conn, chat) {
  try {
    // Evitar procesar el mismo mensaje varias veces
    if (!conn.processedMessages) conn.processedMessages = new Set();
    const messageId = chat.messages?.[0]?.key?.id;
    if (messageId) {
      if (conn.processedMessages.has(messageId)) return;
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

    const isOwner = checkOwner(sender);

    // ========== OBTENER INFORMACIÓN DEL GRUPO ==========
    let groupMetadata = {};
    let participants = [];
    let isAdmin = false;
    let isBotAdmin = false;

    if (isGroup) {
      try {
        // 🔧 FIX: Forzar actualización de metadatos del grupo
        groupMetadata = await conn.groupMetadata(from);
        participants = groupMetadata.participants || [];
        
        // Si no hay participantes, intentar obtener de otra forma
        if (!participants || participants.length === 0) {
          console.log(chalk.yellow('⚠️ No se encontraron participantes, intentando alternativa...'));
          const chat = await conn.chats[from];
          if (chat && chat.participants) {
            participants = chat.participants;
          }
        }
        
        // 🔧 FIX: Obtener el ID del bot de múltiples fuentes posibles
        const botJid = conn.user?.jid || 
                      conn.user?.id || 
                      conn.authState?.creds?.me?.id ||
                      Object.keys(conn.chats).find(jid => jid.includes(conn.user?.id?.split(':')[0]));
        
        console.log(chalk.cyan('📊 PARTICIPANTES DEL GRUPO:'));
        participants.forEach(p => {
          console.log(chalk.gray(`  - ${p.id}: ${p.admin || 'member'}`));
        });
        console.log(chalk.cyan(`🤖 Bot JID detectado: ${botJid}`));

        // Función para extraer número limpio
        const getCleanNumber = (jid) => {
          if (!jid) return '';
          return jid.split(':')[0].split('@')[0].replace(/\D/g, '');
        };

        const senderNum = getCleanNumber(sender);
        const botNum = getCleanNumber(botJid);

        console.log(chalk.yellow('🔍 DEBUG NÚMEROS:'));
        console.log(chalk.gray(`  Sender: ${sender} -> ${senderNum}`));
        console.log(chalk.gray(`  Bot: ${botJid} -> ${botNum}`));

        // Buscar participante del usuario
        const userParticipant = participants.find(p => {
          const pNum = getCleanNumber(p.id);
          return pNum === senderNum;
        });
        
        isAdmin = !!(userParticipant?.admin === 'admin' || userParticipant?.admin === 'superadmin');

        // 🔧 FIX CRÍTICO: Buscar el bot por número en lugar de JID completo
        // También verificar si el mensaje es fromMe como indicador de que el bot está aquí
        const botParticipant = participants.find(p => {
          const pNum = getCleanNumber(p.id);
          const match = pNum === botNum;
          console.log(chalk.gray(`    Comparando: ${p.id} -> ${pNum} vs ${botNum} = ${match}`));
          return match;
        });
        
        isBotAdmin = !!(botParticipant?.admin === 'admin' || botParticipant?.admin === 'superadmin');

        // 🔧 FIX ADICIONAL: Si el mensaje es fromMe, el bot definitivamente está en el grupo
        if (fromMe && !isBotAdmin) {
          console.log(chalk.yellow('⚠️ Mensaje fromMe detectado pero bot no encontrado en participantes'));
          // Buscar cualquier participante que coincida parcialmente
          const possibleBot = participants.find(p => p.id.includes(botNum));
          if (possibleBot) {
            console.log(chalk.green('✅ Bot encontrado por coincidencia parcial:', possibleBot.id));
            isBotAdmin = !!(possibleBot.admin === 'admin' || possibleBot.admin === 'superadmin');
          }
        }

        console.log(chalk.yellow('✅ RESULTADO:'));
        console.log(chalk.gray(`  Usuario Admin: ${isAdmin}`));
        console.log(chalk.gray(`  Bot Admin: ${isBotAdmin}`));
        console.log(chalk.gray(`  Bot encontrado: ${botParticipant ? 'SÍ' : 'NO'}`));

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
          chalk.gray(`[${relativo}]`)
        );

        // ========== VERIFICACIONES DE PERMISOS ==========
        if (plugin.owner && !isOwner) {
          await dfail('owner', m, conn);
          return;
        }

        if (plugin.group && !isGroup) {
          await dfail('group', m, conn);
          return;
        }

        if (plugin.private && isGroup) {
          await dfail('private', m, conn);
          return;
        }

        if (plugin.admin && !isAdmin) {
          await dfail('admin', m, conn);
          return;
        }

        if (plugin.botAdmin && !isBotAdmin) {
          await dfail('botAdmin', m, conn);
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
          
          const errorMsg = global.msj?.error || '❌ Error al ejecutar el comando';
          await sendChannelMessage(conn, m.chat, errorMsg, m);
        }

        return;

      } catch (err) {
        console.error(chalk.red(`❌ Error cargando plugin:`), err.message);
      }
    }

  } catch (error) {
    console.error(chalk.red('❌ Handler error:'), error.message);
  }
}
