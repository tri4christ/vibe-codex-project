import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

// Define our button variants using class‑variance‑authority.  This makes it
// easy to add new sizes or styles later on.  See
// https://github.com/joe-bell/cva for additional documentation.
const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
  {
    variants: {
      variant: {
        default:
          'bg-gray-900 text-white hover:bg-gray-700 focus-visible:ring-gray-400 dark:bg-gray-200 dark:text-gray-900 dark:hover:bg-gray-300',
        outline:
          'border border-gray-300 bg-transparent hover:bg-gray-100 text-gray-900 dark:text-gray-100 dark:border-gray-700 dark:hover:bg-gray-800',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 px-3 rounded-md',
        lg: 'h-11 px-8 rounded-md',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

/**
 * A reusable Button component.  Pass `variant` and `size` props to select
 * different styles.  Additional props are forwarded to the underlying
 * `<button>` element.
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      />
    );
  },
);
Button.displayName = 'Button';