import config from '../config.js'

// Verificar si es owner
export function isOwner(userJid) {
  if (!userJid) return false
  const num = userJid.split('@')[0]
  return config.owner.includes(num)
}

// Verificar si es admin del grupo
export async function isAdmin(sock, groupJid, userJid) {
  if (!groupJid?.endsWith('@g.us')) return false
  if (isOwner(userJid)) return true

  try {
    const metadata = await sock.groupMetadata(groupJid)
    const participant = metadata.participants.find(p => p.id === userJid)
    return participant?.admin === 'admin' || participant?.admin === 'superadmin'
  } catch (e) {
    return false
  }
}

// Verificar si es grupo
export function isGroup(jid) {
  return jid?.endsWith('@g.us')
}
