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

  const baseClasses = 'relative rounded-full flex items-center justify-center font-bold shadow-lg transition-transform duration-300 hover:scale-110';

  const variantClasses = variant === 'chance'
    ? 'bg-gradient-to-br from-yellow-300 to-yellow-600 text-slate-900 border border-yellow-200/50 shadow-[0_0_15px_rgba(234,179,8,0.5),inset_0_2px_5px_rgba(255,255,255,0.6),inset_0_-2px_5px_rgba(0,0,0,0.2)]'
    : 'bg-gradient-to-br from-blue-400 to-blue-700 text-white border border-blue-300/50 shadow-[0_0_15px_rgba(59,130,246,0.6),inset_0_2px_5px_rgba(255,255,255,0.4),inset_0_-2px_5px_rgba(0,0,0,0.3)]'

  return (
    <div className={`${sizeClasses[size]} ${baseClasses} ${variantClasses}`}>
      <span className="drop-shadow-sm z-10">{number}</span>
      {/* Glossy overlay for extra 3D sphere effect */}
      <div className="absolute top-0 left-[15%] w-[70%] h-[35%] rounded-full bg-gradient-to-b from-white/40 to-transparent pointer-events-none"></div>
    </div>
  )
}
