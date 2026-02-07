interface Props {
  children: React.ReactNode
  color?: string
  className?: string
}

export default function Badge({ children, color = 'primary-500', className = '' }: Props) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full bg-${color}/20 text-${color} ${className}`}
    >
      {children}
    </span>
  )
}
