"use client";

import { WorkspaceLayout } from '@/components/WorkspaceLayout';
import { Section } from '@/components/Section';
import { Chip } from '@/components/Chip';
import { Button } from '@/components/Button';
import { useCreoStore } from '@/lib/store';
import { MessageSquare, ShieldCheck } from 'lucide-react';

export default function ReviewsPage() {
  const { businesses, activeHomeBusinessId, setBusinesses } = useCreoStore();
  const activeBusiness = businesses.find(business => business.id === activeHomeBusinessId);

  if (!activeBusiness) {
    return (
      <WorkspaceLayout>
        <Section title="No business selected" description="Choose a Home Business to review reputation." />
      </WorkspaceLayout>
    );
  }

  const handleReviewUpdate = (reviewId: string, status: 'Approved' | 'Responded') => {
    setBusinesses(prev =>
      prev.map(business =>
        business.id === activeBusiness.id
          ? {
              ...business,
              reviews: business.reviews.map(review => (review.id === reviewId ? { ...review, status } : review)),
            }
          : business,
      ),
    );
  };

  return (
    <WorkspaceLayout>
      <Section title="Reputation control" description="Approve or respond to AI-drafted public reviews.">
        <div className="space-y-4">
          {activeBusiness.reviews.map(review => (
            <div key={review.id} className="rounded-2xl border border-slate-200 bg-white/70 p-4 text-sm dark:border-slate-800 dark:bg-slate-900/40">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-900 dark:text-slate-100">{review.author}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {review.channel} · {Array.from({ length: review.rating }).map((_, idx) => (
                      <span key={idx}>★</span>
                    ))}
                  </p>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{review.comment}</p>
                </div>
                <Chip variant={review.status === 'Pending' ? 'neutral' : 'success'}>{review.status}</Chip>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleReviewUpdate(review.id, 'Responded')}
                  className="flex items-center gap-2"
                >
                  <MessageSquare className="h-4 w-4" />
                  Respond
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleReviewUpdate(review.id, 'Approved')}
                  className="flex items-center gap-2"
                >
                  <ShieldCheck className="h-4 w-4" />
                  Approve
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Section>
    </WorkspaceLayout>
  );
}
