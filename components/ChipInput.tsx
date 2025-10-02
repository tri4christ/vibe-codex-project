"use client";

import { useEffect, useState } from 'react';

interface ChipInputProps {
  label: string;
  values: string[];
  placeholder?: string;
  onChange: (values: string[]) => void;
}

export function ChipInput({ label, values, placeholder, onChange }: ChipInputProps) {
  const [input, setInput] = useState('');

  useEffect(() => {
    setInput('');
  }, [values]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && input.trim()) {
      event.preventDefault();
      const next = input.trim();
      if (!values.includes(next)) {
        onChange([...values, next]);
      }
      setInput('');
    }
    if (event.key === 'Backspace' && !input && values.length) {
      onChange(values.slice(0, values.length - 1));
    }
  };

  return (
    <label className="space-y-2 text-sm">
      <span className="text-slate-600 dark:text-slate-300">{label}</span>
      <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900">
        <div className="flex flex-wrap gap-2">
          {values.map(value => (
            <span
              key={value}
              className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-200"
            >
              {value}
              <button
                type="button"
                className="text-slate-400 transition hover:text-slate-600 dark:hover:text-slate-100"
                onClick={() => onChange(values.filter(item => item !== value))}
              >
                ×
              </button>
            </span>
          ))}
          <input
            value={input}
            onChange={event => setInput(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={values.length ? '' : placeholder}
            className="flex-1 min-w-[120px] bg-transparent text-sm text-slate-700 placeholder:text-slate-400 outline-none dark:text-slate-100"
          />
        </div>
      </div>
    </label>
  );
}
