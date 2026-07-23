function escape(v: string): string {
  return v
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/**
 * Render a plain-text body as simple HTML paragraphs, escaping user input.
 * Blank lines split paragraphs; single line breaks become <br>.
 */
export function renderMassEmailHtml(bodyText: string): string {
  const paragraphs = bodyText
    .split(/\n{2,}/)
    .map(p => p.trim())
    .filter(Boolean)
    .map(p => `<p style="margin:0 0 12px 0;line-height:1.5;">${escape(p).replace(/\n/g, '<br>')}</p>`)
    .join('\n')

  return `<!DOCTYPE html>
<html><body style="font-family:Arial,Helvetica,sans-serif;color:#222;max-width:640px;">
${paragraphs || '<p></p>'}
</body></html>`
}
