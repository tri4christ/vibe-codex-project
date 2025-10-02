/**
 * Utility function to concatenate class names.  Takes any number of
 * arguments (strings, arrays, or conditionals) and returns a single
 * space‑separated string.  Falsey values are omitted.
 */
export function cn(...classes: any[]): string {
  return classes
    .flatMap(cls => {
      if (!cls) return [];
      if (Array.isArray(cls)) return cls;
      return [cls];
    })
    .filter(Boolean)
    .join(' ');
}