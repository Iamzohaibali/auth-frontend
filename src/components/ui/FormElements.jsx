import { forwardRef } from 'react';

// ─── Input ────────────────────────────────────────────────────────────────────
export const Input = forwardRef(function Input(
  { label, error, className = '', icon: IconComponent, ...props },
  ref
) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <div className="relative">
        {IconComponent && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <IconComponent className="h-4 w-4 text-gray-400" />
          </div>
        )}
        <input
          ref={ref}
          className={[
            'w-full rounded-lg border px-3 py-2.5 text-sm transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent',
            IconComponent ? 'pl-10' : '',
            error
              ? 'border-red-400 bg-red-50'
              : 'border-gray-300 bg-white hover:border-gray-400',
            className,
          ].filter(Boolean).join(' ')}
          {...props}
        />
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
});

// ─── Button ───────────────────────────────────────────────────────────────────
export function Button({
  children,
  variant  = 'primary',
  size     = 'md',
  isLoading = false,
  disabled  = false,
  className = '',
  ...props
}) {
  const variants = {
    primary:   'bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-indigo-300',
    secondary: 'bg-gray-100 text-gray-800 hover:bg-gray-200 disabled:opacity-50',
    danger:    'bg-red-600 text-white hover:bg-red-700 disabled:bg-red-300',
    outline:   'border border-indigo-600 text-indigo-600 hover:bg-indigo-50 disabled:opacity-50',
    ghost:     'text-gray-600 hover:bg-gray-100 disabled:opacity-50',
  };
  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <button
      disabled={isLoading || disabled}
      className={[
        'inline-flex items-center justify-center gap-2 font-medium rounded-lg',
        'transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500',
        'focus:ring-offset-2 disabled:cursor-not-allowed',
        variants[variant] ?? variants.primary,
        sizes[size] ?? sizes.md,
        className,
      ].join(' ')}
      {...props}
    >
      {isLoading && (
        <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
      )}
      {children}
    </button>
  );
}

// ─── Badge ────────────────────────────────────────────────────────────────────
export function Badge({ children, variant = 'default' }) {
  const variants = {
    default:   'bg-gray-100 text-gray-700',
    success:   'bg-green-100 text-green-700',
    warning:   'bg-yellow-100 text-yellow-700',
    danger:    'bg-red-100 text-red-700',
    primary:   'bg-indigo-100 text-indigo-700',
    moderator: 'bg-purple-100 text-purple-700',
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        variants[variant] ?? variants.default
      }`}
    >
      {children}
    </span>
  );
}