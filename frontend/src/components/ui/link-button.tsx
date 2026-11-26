import { Link, type LinkProps } from 'react-router-dom'
import { buttonClassName, type ButtonSize, type ButtonVariant } from './button'

export function ButtonLink({
  variant = 'secondary',
  size = 'md',
  className,
  ...props
}: LinkProps & { variant?: ButtonVariant; size?: ButtonSize }) {
  return <Link {...props} className={buttonClassName({ variant, size, className })} />
}