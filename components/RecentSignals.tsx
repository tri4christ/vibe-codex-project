import type { SignalItem } from '@/lib/types';
import { Button } from '@/components/Button';

interface RecentSignalsProps {
  signals?: SignalItem[];
}

export function RecentSignals({ signals }: RecentSignalsProps) {
  if (!signals || !signals.length) {
    return null;
  }

  const press = signals.find(signal => signal.kind === 'press');
  const social = signals.find(signal => signal.kind === 'social');

  return (
    <section className="rounded-3xl border border-slate-200 bg-white/80 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/50">
      <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Recent signals</h3>
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
        Keep context handy before outreach — press and social moments update daily.
      </p>
      <div className="mt-4 space-y-3">
        {press ? <SignalRow signal={press} /> : null}
        {social ? <SignalRow signal={social} /> : null}
      </div>
    </section>
  );
}

function SignalRow({ signal }: { signal: SignalItem }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white/60 p-3 text-sm dark:border-slate-700 dark:bg-slate-900/40">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-medium text-slate-900 dark:text-slate-100">{signal.title}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">{signal.takeaway}</p>
          <p className="text-xs text-slate-400 dark:text-slate-500">
            {signal.source} · {new Date(signal.publishedAt).toLocaleDateString()}
          </p>
        </div>
        <Button asChild size="sm" variant="outline">
          <a href={signal.url} target="_blank" rel="noreferrer" className="px-2 text-xs">
            Open
          </a>
        </Button>
      </div>
    </div>
  );
}
