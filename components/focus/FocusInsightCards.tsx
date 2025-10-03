import type { ReactNode } from 'react';

interface InsightCard {
  id: string;
  title: string;
  body: string;
}

const INSIGHT_LIBRARY: Record<string, InsightCard> = {
  email: {
    id: 'email-insight',
    title: 'Email Campaign Signals',
    body: 'Open 34%, CTR 8.1%, warm list growth +12% WoW. Crew has segmentation tests queued.',
  },
  paid: {
    id: 'paid-insight',
    title: 'Paid Media Snapshot',
    body: 'ROAS 3.6, spend pacing 92% of plan, fresh lookalikes ready for deployment.',
  },
  sms: {
    id: 'sms-insight',
    title: 'SMS Momentum',
    body: 'Opt-in rate 63%, reply velocity +18%. Eden recommends testing conversational nudges.',
  },
  reviews: {
    id: 'reviews-insight',
    title: 'Review Velocity',
    body: '146 reviews this week, response SLA 2h12m. Tone checks cleared by Eden.',
  },
  sales: {
    id: 'sales-insight',
    title: 'Pipeline Health',
    body: 'Pipeline $540k, 12 meetings booked. Leo prepping contract automation for next stage.',
  },
  seo: {
    id: 'seo-insight',
    title: 'SEO Focus',
    body: 'Top landing pages due for refresh; schema updates queued by Story.',
  },
  creative: {
    id: 'creative-insight',
    title: 'Creative Pulse',
    body: 'Six new assets in review, hooks tested against engagement benchmarks.',
  },
  ads: {
    id: 'ads-insight',
    title: 'Ads Performance',
    body: 'Evergreen ads nearing fatigue; Caleb has two variants staged for launch.',
  },
};

export function buildInsightCards(tags: string[]): InsightCard[] {
  const normalized = tags.map(tag => tag.toLowerCase());
  const uniqueKeys = Array.from(new Set(normalized));
  const cards = uniqueKeys
    .map(key => INSIGHT_LIBRARY[key])
    .filter((item): item is InsightCard => Boolean(item));
  return cards.length ? cards : [INSIGHT_LIBRARY.reviews];
}

export function FocusInsightCards({ cards }: { cards: InsightCard[] }) {
  return (
    <div className="space-y-4">
      {cards.map(card => (
        <article
          key={card.id}
          className="rounded-3xl border border-slate-200 bg-white/80 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/50"
        >
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            {card.title}
          </h3>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{card.body}</p>
        </article>
      ))}
    </div>
  );
}

export type { InsightCard };
