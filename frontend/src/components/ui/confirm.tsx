import { Button } from './button'
import { Modal } from './modal'

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = '确认',
  tone = 'primary',
  loading,
}: {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description?: string
  confirmLabel?: string
  tone?: 'primary' | 'danger'
  loading?: boolean
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      width="max-w-md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>取消</Button>
          <Button variant={tone} onClick={onConfirm} loading={loading}>{confirmLabel}</Button>
        </>
      }
    >
      <p className="text-sm leading-6 text-muted">操作后会立即写入数据库，且不可撤销。请确认信息无误。</p>
    </Modal>
  )
}