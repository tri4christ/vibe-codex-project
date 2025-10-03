import { buildInsightCards, FocusInsightCards } from '@/components/focus/FocusInsightCards';

export function FocusInsightsSidebar({ tags, variant = 'inline' }: { tags: string[]; variant?: 'inline' | 'sidebar' }) {
  const cards = buildInsightCards(tags);
  const baseClasses = 'space-y-4 rounded-3xl border border-slate-200 bg-white/70 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/40';
  const variantClass = variant === 'sidebar' ? 'lg:sticky lg:top-6' : '';
  return (
    <section className={`${baseClasses} ${variantClass}`.trim()}>
      <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Crew insights</h2>
      <FocusInsightCards cards={cards} />
    </section>
  );
}
