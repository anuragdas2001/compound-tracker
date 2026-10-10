"use client";

import { Toaster, resolveValue } from 'react-hot-toast';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

export function CustomToaster() {
  return (
    <Toaster position="top-right">
      {(t) => (
        <div
          className="flex items-start gap-4 rounded-2xl border px-5 py-4 shadow-2xl max-w-sm"
          style={{
            backgroundColor: 'var(--c-surface-soft)',
            borderColor: 'var(--c-primary)',
            boxShadow: '0 12px 40px -10px var(--c-glow)',
            animation: t.visible
              ? 'slideInRight 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards'
              : 'slideOutRight 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
          }}
        >
          <div className="shrink-0 mt-0.5">
            {t.type === 'error' && <AlertCircle className="h-5 w-5 text-red-500 drop-shadow-sm" />}
            {t.type === 'success' && <CheckCircle2 className="h-5 w-5 text-[var(--c-primary)] drop-shadow-sm" />}
            {t.type === 'loading' && <Loader2 className="h-5 w-5 animate-spin text-[var(--c-primary)]" />}
          </div>
          <p 
            className="text-[15px] font-medium text-[var(--c-text)] leading-relaxed"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            {resolveValue(t.message, t)}
          </p>
        </div>
      )}
    </Toaster>
  );
}
