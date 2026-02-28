interface NumberBadgeProps {
  number: number
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'chance'
}

export default function NumberBadge({ number, size = 'md', variant = 'default' }: NumberBadgeProps) {
  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
  }

  const variantClasses = variant === 'chance'
    ? 'bg-yellow-500 text-white border-yellow-600'
    : 'bg-primary-600 text-white border-primary-700'

  return (
    <div
      className={`${sizeClasses[size]} ${variantClasses} rounded-full border-2 flex items-center justify-center font-bold shadow-md`}
    >
      {number}
    </div>
  )
}
