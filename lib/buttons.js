// Utilidades para crear botones fácilmente

export function createButtons(prefix, buttonsData) {
  return buttonsData.map(btn => ({
    buttonId: `${prefix}${btn.id}`,
    buttonText: { displayText: btn.text },
    type: 1
  }))
}

export function createList(prefix, title, sections) {
  return {
    title,
    sections: sections.map(section => ({
      title: section.title,
      rows: section.rows.map(row => ({
        title: row.title,
        description: row.description || '',
        rowId: `${prefix}${row.id}`
      }))
    }))
  }
}

// Ejemplo de uso:
// const buttons = createButtons('#', [
//   { id: 'menu', text: '📱 Menú' },
//   { id: 'help', text: '❓ Ayuda' }
// ])
