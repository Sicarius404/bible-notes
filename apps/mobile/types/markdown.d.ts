declare module 'markdown-it' {
  class MarkdownIt {
    constructor(options?: any)
    use(plugin: any): this
    render(src: string, env?: any): string
    renderInline(src: string, env?: any): string
  }
  export = MarkdownIt
}

declare module 'markdown-it-mark' {
  function markdownItMark(md: any): void
  export = markdownItMark
}
