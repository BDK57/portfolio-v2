'use client';
import { useState } from 'react';

export default function CopyEmail({ email, className = '' }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      window.location.href = `mailto:${email}`;
    }
  };
  return (
    <button type="button" className={`copy-btn ${copied ? 'is-done' : ''} ${className}`} onClick={copy}>
      <span aria-live="polite">{copied ? 'Copied ✓' : 'Copy email'}</span>
    </button>
  );
}
