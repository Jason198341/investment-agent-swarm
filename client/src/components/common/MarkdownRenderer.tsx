import ReactMarkdown from 'react-markdown'

interface Props {
  content: string
  className?: string
}

export default function MarkdownRenderer({ content, className = '' }: Props) {
  // Strip the JSON meta block from display
  const displayContent = content.replace(/```json\s*\{[\s\S]*?\}\s*```/, '').trim()

  return (
    <div className={`prose prose-sm max-w-none ${className}`}>
      <ReactMarkdown>{displayContent}</ReactMarkdown>
    </div>
  )
}
