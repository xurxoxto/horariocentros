import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import { Button } from './ui';

interface ConfirmOptions {
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
}

type ResolveCallback = (value: boolean) => void;

interface ConfirmContextValue {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextValue>({
  confirm: () => Promise.resolve(false),
});

export const ConfirmProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions>({ message: '' });
  const resolveRef = useRef<ResolveCallback | null>(null);

  const confirm = useCallback((opts: ConfirmOptions) => {
    setOptions(opts);
    setOpen(true);
    return new Promise<boolean>(resolve => {
      resolveRef.current = resolve;
    });
  }, []);

  const handleConfirm = () => {
    setOpen(false);
    resolveRef.current?.(true);
  };

  const handleCancel = () => {
    setOpen(false);
    resolveRef.current?.(false);
  };

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      {open && (
        <div className="fixed inset-0 z-[9998] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleCancel} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-[scaleIn_0.2s_ease-out]">
            {/* Icon */}
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ${
              options.danger ? 'bg-red-100' : 'bg-amber-100'
            }`}>
              <span className="text-2xl">{options.danger ? '🗑️' : '⚠️'}</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
              {options.title || (options.danger ? 'Eliminar' : 'Confirmar acción')}
            </h3>
            <p className="text-sm text-gray-500 text-center mb-6">
              {options.message}
            </p>
            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={handleCancel}
                className="flex-1"
              >
                {options.cancelLabel || 'Cancelar'}
              </Button>
              <button
                onClick={handleConfirm}
                className={`flex-1 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                  options.danger
                    ? 'bg-red-600 text-white hover:bg-red-700 active:scale-95'
                    : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95'
                }`}
              >
                {options.confirmLabel || 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
};

export const useConfirm = () => useContext(ConfirmContext);
