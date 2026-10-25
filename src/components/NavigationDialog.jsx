'use client';
import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

export default function NavigationDialog({ title, onClose, className = '', children, inputFocus = false, onKeyDown }) {
  const ref = useRef(null);
  useEffect(() => {
    const dialog = ref.current;
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    dialog.showModal();
    if (inputFocus) dialog.querySelector('input:not([type=hidden]), textarea, select')?.focus();
    document.body.style.overflow = 'hidden';
    return () => { dialog.close(); document.body.style.overflow = previousOverflow; if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true }); };
  }, []);
  return createPortal(<dialog ref={ref} className={`sn-dialog ${className}`} aria-label={title} onKeyDown={onKeyDown} onCancel={event => { event.preventDefault(); onClose(); }} onClick={event => { if (event.target === event.currentTarget) { const rect = event.currentTarget.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) onClose(); } }}><button className="sn-dialog__close" onClick={onClose} aria-label={`إغلاق ${title}`} autoFocus={!inputFocus}><X size={21} /></button>{children}</dialog>, document.body);
}
