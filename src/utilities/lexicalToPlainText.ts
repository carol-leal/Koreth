type LexicalNode = {
  type?: string
  text?: string
  children?: LexicalNode[]
}

const walk = (node: LexicalNode | undefined, out: string[], stopAfterFirstParagraph: boolean): boolean => {
  if (!node) return false
  if (node.type === 'text' && typeof node.text === 'string') {
    out.push(node.text)
    return false
  }
  if (Array.isArray(node.children)) {
    for (const c of node.children) {
      const stop = walk(c, out, stopAfterFirstParagraph)
      if (stop) return true
    }
  }
  if (stopAfterFirstParagraph && node.type === 'paragraph') return true
  return false
}

export const lexicalToPlainText = (data: unknown, opts: { firstParagraphOnly?: boolean } = {}): string => {
  if (!data || typeof data !== 'object') return ''
  const root = (data as { root?: LexicalNode }).root
  if (!root) return ''
  const out: string[] = []
  walk(root, out, !!opts.firstParagraphOnly)
  return out.join('').trim()
}
