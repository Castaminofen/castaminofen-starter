import clsx from 'clsx';
import type { InputHTMLAttributes, DetailedHTMLProps } from 'react';

export function Input({ className, ...props }: DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>) {
  return <input className={clsx('input shadow-sm', className)} aria-invalid={props['aria-invalid'] ?? undefined} {...props} />;
}
