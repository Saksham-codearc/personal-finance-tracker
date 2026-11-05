import { AlertTriangle } from 'lucide-react';
import Modal from './Modal';

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  description,
  confirmLabel = 'Delete',
  loading = false,
}) {
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm">
      <div className="flex gap-3.5">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400">
          <AlertTriangle size={20} />
        </div>
        <div>
          <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">{description}</p>
          <div className="mt-6 flex justify-end gap-2.5">
            <button type="button" className="btn-secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button
              type="button"
              className="btn bg-rose-600 text-white hover:bg-rose-700"
              onClick={onConfirm}
              disabled={loading}
            >
              {loading ? 'Deleting…' : confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
