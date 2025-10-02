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
        ghost:
          'bg-transparent text-gray-900 hover:bg-gray-100 focus-visible:ring-gray-300 dark:text-gray-100 dark:hover:bg-gray-800',
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
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

function composeRefs<T>(...refs: Array<React.Ref<T> | undefined>) {
  return (node: T | null) => {
    for (const ref of refs) {
      if (!ref) continue;
      if (typeof ref === 'function') {
        ref(node);
      } else {
        (ref as React.MutableRefObject<T | null>).current = node;
      }
    }
  };
}

const Slot = React.forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement>>(
  ({ children, className, ...props }, ref) => {
    if (!React.isValidElement(children)) {
      return null;
    }

    const childWithRef = children as React.ReactElement & { ref?: React.Ref<HTMLElement> };

    const mergedProps = {
      ...(props as Record<string, unknown>),
      className: cn((children.props as { className?: string }).className, className),
      ref: composeRefs(childWithRef.ref, ref),
    };

    return React.cloneElement(children as React.ReactElement, mergedProps);
  },
);
Slot.displayName = 'Slot';

/**
 * A reusable Button component.  Pass `variant` and `size` props to select
 * different styles.  Additional props are forwarded to the underlying
 * `<button>` element.
 */
export const Button = React.forwardRef<HTMLElement, ButtonProps>(
  ({ className, variant, size, asChild = false, type, disabled, ...props }, ref) => {
    const commonClassName = cn(
      buttonVariants({ variant, size }),
      disabled && asChild ? 'pointer-events-none opacity-50' : undefined,
      className,
    );

    if (asChild) {
      const ariaDisabled = disabled ? { 'aria-disabled': true, tabIndex: -1 } : {};
      return (
        <Slot
          {...(props as Record<string, unknown>)}
          {...ariaDisabled}
          className={commonClassName}
          ref={ref}
        />
      );
    }

    return (
      <button
        {...props}
        type={type ?? 'button'}
        disabled={disabled}
        className={commonClassName}
        ref={ref as React.Ref<HTMLButtonElement>}
      />
    );
  },
);
Button.displayName = 'Button';
