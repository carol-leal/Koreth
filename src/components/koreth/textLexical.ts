/**
 * Convert a textarea value (paragraphs separated by blank lines) into a
 * Lexical editor state suitable for `richText` fields, and back again.
 */
export const textToLexical = (text: string) => ({
  root: {
    type: 'root',
    direction: 'ltr',
    format: '',
    indent: 0,
    version: 1,
    children: text
      .split(/\n\n+/)
      .filter((p) => p.trim().length > 0)
      .map((p) => ({
        type: 'paragraph',
        version: 1,
        direction: 'ltr',
        format: '',
        indent: 0,
        textFormat: 0,
        children: [{ type: 'text', version: 1, text: p, format: 0, detail: 0, mode: 'normal', style: '' }],
      })),
  },
})

export const lexicalToText = (data: unknown): string => {
  if (!data || typeof data !== 'object') return ''
  const root = (data as { root?: { children?: any[] } }).root
  if (!root || !Array.isArray(root.children)) return ''
  const paragraphs: string[] = []
  for (const node of root.children) {
    if (node?.type === 'paragraph' && Array.isArray(node.children)) {
      const p = node.children
        .filter((c: any) => c?.type === 'text' && typeof c.text === 'string')
        .map((c: any) => c.text)
        .join('')
      paragraphs.push(p)
    }
  }
  return paragraphs.join('\n\n')
}
