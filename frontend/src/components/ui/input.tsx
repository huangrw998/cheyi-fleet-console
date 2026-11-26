import { forwardRef, useEffect, useImperativeHandle, useRef, useState, type InputHTMLAttributes, type TextareaHTMLAttributes } from 'react'
import { X } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import { useField } from './form'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  clearable?: boolean
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, clearable = true, ...props },
  ref,
) {
  const field = useField()
  const inputRef = useRef<HTMLInputElement>(null)
  useImperativeHandle(ref, () => inputRef.current as HTMLInputElement)
  const [hasValue, setHasValue] = useState(() => String(props.value ?? props.defaultValue ?? '').length > 0)

  useEffect(() => {
    if (props.value !== undefined) setHasValue(String(props.value).length > 0)
  }, [props.value])

  const showClear = clearable && !props.readOnly && !props.disabled && props.type !== 'password' && hasValue

  const clear = () => {
    const input = inputRef.current
    if (!input) return
    const setValue = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set
    setValue?.call(input, '')
    input.dispatchEvent(new Event('input', { bubbles: true }))
    input.focus()
  }

  return (
    <div className="relative w-full">
      <input
        ref={inputRef}
        id={props.id ?? field?.id}
        aria-invalid={field?.error ? true : undefined}
        aria-required={field?.required || undefined}
        aria-describedby={props['aria-describedby'] ?? (field?.error ? `${field.id}-error` : field?.hint ? `${field.id}-hint` : undefined)}
        {...props}
        onChange={(event) => {
          setHasValue(event.target.value.length > 0)
          props.onChange?.(event)
        }}
        className={cn(
          'field-control h-11 px-3.5 text-sm disabled:cursor-not-allowed disabled:opacity-60',
          showClear && 'pr-10',
          field?.error && 'field-control-invalid',
          className,
        )}
      />
      {showClear ? (
        <button
          type="button"
          onClick={clear}
          className="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-muted transition hover:bg-card2 hover:text-ink"
          aria-label="清空输入"
          title="清空输入"
        >
          <X size={13} />
        </button>
      ) : null}
    </div>
  )
})

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  clearable?: boolean
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { className, clearable = true, ...props },
  ref,
) {
  const field = useField()
  const areaRef = useRef<HTMLTextAreaElement>(null)
  useImperativeHandle(ref, () => areaRef.current as HTMLTextAreaElement)
  const [hasValue, setHasValue] = useState(() => String(props.value ?? props.defaultValue ?? '').length > 0)

  useEffect(() => {
    if (props.value !== undefined) setHasValue(String(props.value).length > 0)
  }, [props.value])

  const showClear = clearable && !props.readOnly && !props.disabled && hasValue

  const clear = () => {
    const area = areaRef.current
    if (!area) return
    const setValue = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')?.set
    setValue?.call(area, '')
    area.dispatchEvent(new Event('input', { bubbles: true }))
    area.focus()
  }

  return (
    <div className="relative w-full">
      <textarea
        ref={areaRef}
        id={props.id ?? field?.id}
        aria-invalid={field?.error ? true : undefined}
        aria-required={field?.required || undefined}
        aria-describedby={props['aria-describedby'] ?? (field?.error ? `${field.id}-error` : field?.hint ? `${field.id}-hint` : undefined)}
        {...props}
        onChange={(event) => {
          setHasValue(event.target.value.length > 0)
          props.onChange?.(event)
        }}
        className={cn(
          'field-control min-h-28 resize-y px-3.5 py-3 text-sm',
          showClear && 'pr-10',
          field?.error && 'field-control-invalid',
          className,
        )}
      />
      {showClear ? (
        <button
          type="button"
          onClick={clear}
          className="absolute right-2 top-2.5 flex h-6 w-6 items-center justify-center rounded-full text-muted transition hover:bg-card2 hover:text-ink"
          aria-label="清空内容"
          title="清空内容"
        >
          <X size={13} />
        </button>
      ) : null}
    </div>
  )
})

