export { BUSINESS_CONTACT_EMAIL } from './businessInfo'

type EmailField = {
  label: string
  value: string
}

type EmailSection = {
  title: string
  fields: EmailField[]
}

type BuildEmailBodyInput = {
  title: string
  intro?: string
  sections: EmailSection[]
  footerLines?: string[]
}

export const toEmailValue = (value: string, fallback: string): string => {
  const trimmedValue = value.trim()
  return trimmedValue.length > 0 ? trimmedValue : fallback
}

export const buildEmailBody = ({
  title,
  intro,
  sections,
  footerLines = [],
}: BuildEmailBodyInput): string => {
  const lines: string[] = [title, '='.repeat(title.length), '']

  if (intro && intro.trim().length > 0) {
    lines.push(intro.trim(), '')
  }

  sections.forEach((section) => {
    lines.push(section.title, '-'.repeat(section.title.length))
    section.fields.forEach((field) => {
      lines.push(`${field.label}: ${field.value}`)
    })
    lines.push('')
  })

  footerLines
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .forEach((line) => lines.push(line))

  return lines.join('\n').trim()
}

export const openMailDraft = (to: string, subject: string, body: string) => {
  const mailtoUrl = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  window.location.href = mailtoUrl
}
