import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { SpinnerGap } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'soft'
export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon'

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-accent text-on-accent hover:bg-accent-hover shadow-soft',
  secondary: 'border border-line bg-card text-ink hover:bg-card2',
  ghost: 'text-muted hover:bg-card2 hover:text-ink',
  danger: 'bg-danger text-on-danger hover:opacity-90',
  soft: 'bg-accent-soft text-accent hover:bg-accent/15',
}

const sizes: Record<ButtonSize, string> = {
  sm: 'h-8 gap-1.5 rounded-lg px-3 text-xs',
  md: 'h-10 gap-2 rounded-lg px-4 text-sm',
  lg: 'h-11 gap-2 rounded-lg px-5 text-sm',
  icon: 'h-9 w-9 rounded-lg',
}

export function buttonClassName({
  variant = 'secondary',
  size = 'md',
  className,
}: {
  variant?: ButtonVariant
  size?: ButtonSize
  className?: string
} = {}) {
  return cn(
    'inline-flex select-none items-center justify-center whitespace-nowrap font-medium leading-none transition active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50 [&>svg]:shrink-0',
    variants[variant],
    sizes[size],
    className,
  )
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = 'secondary', size = 'md', loading, children, disabled, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      aria-busy={loading}
      className={buttonClassName({ variant, size, className })}
      {...props}
    >
      {loading ? <SpinnerGap size={16} className="animate-spin" /> : null}
      {children}
    </button>
  )
})