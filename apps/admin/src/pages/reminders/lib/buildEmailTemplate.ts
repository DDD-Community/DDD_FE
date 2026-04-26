type TemplateInput = {
  message: string
  ctaLabel: string
  ctaUrl: string
}

const HTML_ESCAPE_MAP: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
}

const escapeHtml = (input: string): string =>
  input.replace(/[&<>"']/g, (ch) => HTML_ESCAPE_MAP[ch] ?? ch)

/**
 * 사전 알림 메일 4슬롯 → { html, text }
 *
 * - HTML 셸은 본 함수 내부에 고정.
 * - 운영진은 message / ctaLabel / ctaUrl 만 입력.
 * - text는 HTML을 못 보는 클라이언트용 plain text 대체본.
 */
export const buildEmailTemplate = ({
  message,
  ctaLabel,
  ctaUrl,
}: TemplateInput): { html: string; text: string } => {
  const safeMessage = escapeHtml(message).replace(/\n/g, "<br />")
  const safeUrl = encodeURI(ctaUrl)
  const safeLabel = escapeHtml(ctaLabel)

  const html = `
<div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#222;">
  <p style="font-size:15px;line-height:1.7;margin:0 0 24px;">${safeMessage}</p>
  <a href="${safeUrl}"
     style="display:inline-block;padding:12px 20px;background:#000;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;">
    ${safeLabel}
  </a>
</div>`.trim()

  const text = `${message}\n\n${ctaLabel}: ${ctaUrl}`

  return { html, text }
}
