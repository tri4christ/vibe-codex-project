"use client";

import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}

export function Modal({ isOpen, onClose, title, description, children, footer, className }: ModalProps) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4 backdrop-blur">
      <div
        className={cn(
          'relative w-full max-w-3xl rounded-3xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900',
          className
        )}
      >
        <button
          aria-label="Close"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
        >
          <X className="h-5 w-5" />
        </button>
        {(title || description) && (
          <header className="mb-6 space-y-2 pr-10">
            {title ? <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">{title}</h2> : null}
            {description ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">{description}</p>
            ) : null}
          </header>
        )}
        <div className="space-y-6">{children}</div>
        {footer ? <footer className="mt-6 flex justify-end gap-2">{footer}</footer> : null}
      </div>
    </div>
  );
}

export function ModalFooter({ children }: { children: ReactNode }) {
  return <div className="mt-6 flex flex-wrap items-center justify-end gap-2">{children}</div>;
}
