import type { ButtonHTMLAttributes } from 'react';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'outline';
};

export default function ActionButton({ className = '', variant = 'primary', ...props }: Props) {
  const styles =
    variant === 'primary'
      ? 'bg-black text-white shadow-sm hover:bg-zinc-900'
      : 'bg-white text-zinc-900 border border-zinc-200 hover:bg-zinc-50';

  return (
    <button
      className={`rounded-xl px-4 py-3 text-sm font-medium transition ${styles} ${className}`}
      {...props}
    />
  );
}
