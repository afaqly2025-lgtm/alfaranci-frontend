import { XMarkIcon } from '@heroicons/react/24/outline';
import { createPortal } from 'react-dom';

export const Modal = ({ open, onClose, title, children, size = 'lg', layer = 'z-50' }) => {
  if (!open) return null;
  const widths = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl'
  };
  return createPortal(
    <div className={`fixed inset-0 ${layer} flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm`}>
      <div className={`w-full ${widths[size]} overflow-hidden rounded-3xl bg-white shadow-soft dark:bg-slate-950`}>
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-800">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h3>
          <button onClick={onClose} className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
        <div className="max-h-[80vh] overflow-y-auto p-5">{children}</div>
      </div>
    </div>,
    document.body
  );
};
