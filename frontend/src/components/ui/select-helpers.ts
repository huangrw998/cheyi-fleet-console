import { Children, isValidElement, type ReactNode } from 'react'

export interface OptionElementProps {
  value?: string | number
  disabled?: boolean
  children?: ReactNode
}

export interface SelectOption {
  value: string
  label: ReactNode
  disabled?: boolean
}

export function labelText(node: ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') return String(node)
  if (Array.isArray(node)) return node.map(labelText).join('')
  if (isValidElement<OptionElementProps>(node)) return labelText(node.props.children)
  return ''
}

export function parseOptions(children: ReactNode): SelectOption[] {
  return Children.toArray(children).flatMap((child) => {
    if (!isValidElement<OptionElementProps>(child)) return []
    const label = child.props.children ?? ''
    const optionValue = child.props.value !== undefined ? String(child.props.value) : labelText(label)
    return [{ value: optionValue, label, disabled: child.props.disabled }]
  })
}