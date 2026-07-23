import { renderMassEmailHtml } from '../mass-email-html'

describe('renderMassEmailHtml', () => {
  it('escapes HTML in the body', () => {
    const html = renderMassEmailHtml('<script>alert(1)</script>')
    expect(html).not.toContain('<script>alert(1)')
    expect(html).toContain('&lt;script&gt;alert(1)&lt;/script&gt;')
  })

  it('splits paragraphs on blank lines', () => {
    const html = renderMassEmailHtml('First paragraph.\n\nSecond paragraph.')
    const matches = html.match(/<p /g) ?? []
    expect(matches.length).toBe(2)
    expect(html).toContain('First paragraph.')
    expect(html).toContain('Second paragraph.')
  })

  it('renders single-line breaks as <br> within a paragraph', () => {
    const html = renderMassEmailHtml('Line one\nLine two')
    const matches = html.match(/<p /g) ?? []
    expect(matches.length).toBe(1)
    expect(html).toContain('Line one<br>Line two')
  })

  it('handles empty body without throwing', () => {
    const html = renderMassEmailHtml('')
    expect(html).toContain('<p></p>')
  })

  it('trims and drops empty paragraphs', () => {
    const html = renderMassEmailHtml('\n\n\nHello\n\n\n\n')
    const matches = html.match(/<p /g) ?? []
    expect(matches.length).toBe(1)
    expect(html).toContain('Hello')
  })
})
