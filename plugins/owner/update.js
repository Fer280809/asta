import { exec } from 'child_process'
import { promisify } from 'util'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const execAsync = promisify(exec)

export async function handler(conn, chat) {
  const m = chat.messages[0]
  if (!m?.message) return
  
  const from = m.key.remoteJid
  const sender = m.key.participant || from
  const isOwner = global.owner.some(o => o[0] === sender.split('@')[0])

  if (!isOwner) {
    return conn.sendMessage(from, { 
      text: `${global.msj.soloOwner} - Solo el propietario del bot puede usar este comando.` 
    }, { quoted: m })
  }

  const text =
    m.message?.conversation ||
    m.message?.extendedTextMessage?.text ||
    ''

  const command = text.trim().split(/\s+/)[0].toLowerCase().replace(global.prefix, '')
  const args = text.trim().split(/\s+/).slice(1)

  // Validar que sea comando de update
  if (!['update', 'actualizar'].includes(command)) return

  // Mensaje de inicio
  await conn.sendMessage(from, { 
    text: `🔄 Iniciando actualización...\n⏳ Por favor espera...` 
  }, { quoted: m })

  try {
    const projectDir = path.join(__dirname, '..')

    // Paso 1: Fetch de cambios
    await conn.sendMessage(from, { 
      text: `📡 Verificando cambios en el repositorio...` 
    })

    const { stdout: fetchOutput } = await execAsync('git fetch origin main', { cwd: projectDir })
    console.log('Git fetch:', fetchOutput)

    // Paso 2: Verificar si hay cambios
    const { stdout: statusOutput } = await execAsync('git status -sb', { cwd: projectDir })
    const tieneChanges = statusOutput.includes('behind') || statusOutput.includes('ahead')

    if (!tieneChanges && statusOutput.includes('up to date')) {
      return conn.sendMessage(from, { 
        text: `✅ El bot ya está actualizado a la última versión.\n\n${statusOutput}` 
      }, { quoted: m })
    }

    // Paso 3: Pull de cambios
    await conn.sendMessage(from, { 
      text: `📥 Descargando actualizaciones...` 
    })

    const { stdout: pullOutput } = await execAsync('git pull origin main', { cwd: projectDir })
    console.log('Git pull:', pullOutput)

    // Paso 4: Instalar nuevas dependencias
    await conn.sendMessage(from, { 
      text: `📦 Instalando dependencias (esto puede tomar unos minutos)...` 
    })

    const { stdout: npmOutput } = await execAsync('npm install', { cwd: projectDir })
    console.log('NPM install:', npmOutput)

    // Obtener versión
    const packageJson = JSON.parse(fs.readFileSync(path.join(projectDir, 'package.json'), 'utf-8'))
    const version = packageJson.version

    // Mensaje de éxito
    const successMsg = `
✅ **Actualización Completada**

📊 Detalles:
• Versión: ${version}
• Estado: ✓ Actualizado correctamente
• Cambios: ${pullOutput.includes('Already up to date') ? 'Sin cambios nuevos' : 'Cambios aplicados'}

⚡ Próximos pasos:
• El bot se reiniciará automáticamente
• Los cambios estarán activos en pocos segundos

💡 Nota: Si hay cambios críticos, es posible que debas reiniciar manualmente.
`

    await conn.sendMessage(from, { 
      text: successMsg 
    }, { quoted: m })

    // Opcional: Auto-restart después de 3 segundos
    setTimeout(() => {
      console.log('🔄 Reiniciando bot para aplicar cambios...')
      process.exit(0)
    }, 3000)

  } catch (error) {
    console.error('Error en actualización:', error)

    let errorMsg = `❌ Error durante la actualización:\n\n`

    if (error.message.includes('not a git repository')) {
      errorMsg += `_El bot no está en un repositorio git_\n`
      errorMsg += `_Usa este comando solo en instalaciones desde git_`
    } else if (error.message.includes('permission denied')) {
      errorMsg += `_Permisos insuficientes para actualizar_\n`
      errorMsg += `_En Termux, ejecuta: npm install -g npm_`
    } else if (error.message.includes('ENOENT')) {
      errorMsg += `_No se encontraron los archivos necesarios_\n`
      errorMsg += `_Asegúrate de estar en el directorio correcto_`
    } else {
      errorMsg += error.message.substring(0, 200)
    }

    await conn.sendMessage(from, { 
      text: errorMsg 
    }, { quoted: m })
  }
}

export const config = {
  help: ['update', 'actualizar'],
  tags: ['owner'],
  command: ['update', 'actualizar'],
  owner: true,
  botAdmin: false,
  fail: null
}
