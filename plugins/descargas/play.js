import fetch from "node-fetch"
import yts from "yt-search"
import axios from "axios"

const MAX_FILE_SIZE = 500 * 1024 * 1024

// APIs de descarga
const apis = [
  {
    name: "Savenow/Y2Down",
    key: "dfcb6d76f2f6a9894gjkege8a4ab232222",
    ytdl: async function(url, format) {
      try {
        const initUrl = `https://p.savenow.to/ajax/download.php?copyright=0&format=${format}&url=${encodeURIComponent(url)}&api=${this.key}`;
        const init = await fetch(initUrl, {
          headers: {
            "User-Agent": "Mozilla/5.0 (Android 13; Mobile; rv:146.0) Gecko/146.0 Firefox/146.0",
            "Referer": "https://y2down.cc/"
          }
        });
        const data = await init.json();
        if (!data.success) return { error: data.message };

        const id = data.id;
        const progressUrl = `https://p.savenow.to/api/progress?id=${id}`;
        let attempts = 0;

        while (attempts < 30) {
          await new Promise(r => setTimeout(r, 2000));
          attempts++;
          const res = await fetch(progressUrl, {
            headers: {
              "User-Agent": "Mozilla/5.0 (Android 13; Mobile; rv:146.0) Gecko/146.0 Firefox/146.0",
              "Referer": "https://y2down.cc/"
            }
          });
          const status = await res.json();
          if (status.progress === 1000) {
            return {
              title: data.title || data.info?.title,
              image: data.info?.image,
              link: status.download_url
            };
          }
        }
        return { error: "Timeout" };
      } catch (e) {
        return { error: e.message };
      }
    }
  }
];

async function downloadWithFallback(url, type = 'audio') {
  for (const api of apis) {
    try {
      const format = type === 'audio' ? 'mp3' : '720';
      const result = await api.ytdl(url, format);
      if (!result.error) return { status: true, result };
    } catch (e) {
      continue;
    }
  }
  return { status: false, error: "No se pudo descargar" };
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text?.trim()) {
    return conn.reply(m.chat, `❗ Ingresa el nombre de una canción.

Ejemplo: *${usedPrefix + command} Bad Bunny Tití Me Preguntó*`, m);
  }

  await m.react('🔍');

  try {
    const search = await yts(text);
    const video = search.all?.[0];
    if (!video) throw 'No se encontraron resultados.';

    const { title, thumbnail, timestamp, views, ago, url, author } = video;

    const body = `╭━━━━━━━━━━━━━╮
│ 🎵 *YouTube Play*
╰━━━━━━━━━━━━━╯

📹 *${title}*

👤 Canal: ${author.name}
👁️ Vistas: ${views?.toLocaleString()}
⏱️ Duración: ${timestamp}
📅 Publicado: ${ago}

*Elige una opción:*`;

    const buttons = [
      { buttonId: `${usedPrefix}ytmp3 ${url}`, buttonText: { displayText: '🎧 Audio' }, type: 1 },
      { buttonId: `${usedPrefix}ytmp4 ${url}`, buttonText: { displayText: '📽️ Video' }, type: 1 },
      { buttonId: `${usedPrefix}ytmp3doc ${url}`, buttonText: { displayText: '💿 Audio Doc' }, type: 1 },
      { buttonId: `${usedPrefix}ytmp4doc ${url}`, buttonText: { displayText: '🎥 Video Doc' }, type: 1 }
    ];

    await conn.sendMessage(m.chat, {
      image: { url: thumbnail },
      caption: body,
      footer: `『𝕬𝖘𝖙𝖆-𝕭𝖔𝖙』⚡`,
      buttons: buttons,
      headerType: 4
    }, { quoted: m });

    await m.react('✅');

  } catch (e) {
    await m.react('❌');
    return conn.reply(m.chat, typeof e === 'string' ? e : `Error: ${e.message}`, m);
  }
};

// Comandos de descarga directa
handler.before = async (m, { conn, usedPrefix }) => {
  if (!m.text) return;

  const commands = ['ytmp3', 'ytmp4', 'ytmp3doc', 'ytmp4doc'];
  const cmd = m.text.split(' ')[0].replace(usedPrefix, '');

  if (!commands.includes(cmd)) return;

  const url = m.text.split(' ')[1];
  if (!url) return;

  await m.react('⏳');

  try {
    const type = cmd.includes('mp3') ? 'audio' : 'video';
    const asDoc = cmd.includes('doc');

    const dl = await downloadWithFallback(url, type);
    if (!dl.status) throw dl.error;

    const { result } = dl;

    if (cmd === 'ytmp3') {
      await conn.sendMessage(m.chat, {
        audio: { url: result.link },
        mimetype: 'audio/mpeg',
        fileName: `${result.title}.mp3`
      }, { quoted: m });
    } else if (cmd === 'ytmp4') {
      await conn.sendMessage(m.chat, {
        video: { url: result.link },
        caption: `🎬 ${result.title}`
      }, { quoted: m });
    } else if (cmd === 'ytmp3doc') {
      await conn.sendMessage(m.chat, {
        document: { url: result.link },
        mimetype: 'audio/mpeg',
        fileName: `${result.title}.mp3`,
        caption: result.title
      }, { quoted: m });
    } else if (cmd === 'ytmp4doc') {
      await conn.sendMessage(m.chat, {
        document: { url: result.link },
        mimetype: 'video/mp4',
        fileName: `${result.title}.mp4`,
        caption: `🎬 ${result.title}`
      }, { quoted: m });
    }

    await m.react('✅');
    return true;
  } catch (e) {
    await m.react('❌');
    await conn.reply(m.chat, `Error: ${e}`, m);
    return true;
  }
};

handler.help = ['play', 'ytmp3', 'ytmp4', 'ytmp3doc', 'ytmp4doc'];
handler.tags = ['descargas'];
handler.command = ['play', 'ytmp3', 'ytmp4', 'ytmp3doc', 'ytmp4doc'];

export default handler;
