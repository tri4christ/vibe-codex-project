export function formatRelative(input: string | number | Date): string {
  const date = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(date.getTime())) {
    return 'recently';
  }

  const now = Date.now();
  const diffMs = now - date.getTime();
  const absMs = Math.abs(diffMs);

  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;
  const week = 7 * day;
  const month = 30 * day;
  const year = 365 * day;

  if (absMs < minute) {
    return 'just now';
  }
  if (absMs < hour) {
    const minutes = Math.round(absMs / minute);
    return `${minutes}m ago`;
  }
  if (absMs < day) {
    const hours = Math.round(absMs / hour);
    return `${hours}h ago`;
  }
  if (absMs < week) {
    const days = Math.round(absMs / day);
    return `${days}d ago`;
  }
  if (absMs < month) {
    const weeks = Math.round(absMs / week);
    return `${weeks}w ago`;
  }
  if (absMs < year) {
    const months = Math.round(absMs / month);
    return `${months}mo ago`;
  }
  const years = Math.round(absMs / year);
  return `${years}y ago`;
}
