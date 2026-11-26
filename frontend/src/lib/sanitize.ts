const ALLOWED_TAGS = new Set(['B', 'STRONG', 'I', 'EM', 'U', 'UL', 'OL', 'LI', 'P', 'BR', 'DIV', 'SPAN', 'A'])

export function sanitizeHtml(html: string): string {
  if (!html) return ''
  const doc = new DOMParser().parseFromString(html, 'text/html')
  doc.body.querySelectorAll('script,style,iframe,object,embed,img,svg,math').forEach((node) => node.remove())
  doc.body.querySelectorAll('*').forEach((element) => {
    if (!ALLOWED_TAGS.has(element.tagName)) {
      element.replaceWith(...Array.from(element.childNodes))
      return
    }
    Array.from(element.attributes).forEach((attribute) => {
      if (element.tagName === 'A' && attribute.name === 'href') {
        const href = attribute.value.trim()
        if (!/^(https?:|mailto:)/i.test(href)) element.removeAttribute('href')
        return
      }
      element.removeAttribute(attribute.name)
    })
    if (element.tagName === 'A' && element.getAttribute('href')) {
      element.setAttribute('target', '_blank')
      element.setAttribute('rel', 'noreferrer noopener')
    }
  })
  return doc.body.innerHTML
}

export function htmlToText(html: string): string {
  if (!html) return ''
  const doc = new DOMParser().parseFromString(html, 'text/html')
  return (doc.body.textContent ?? '').trim()
}
