"use client";

import type { SetupArtifact } from '@/lib/types';
import { Button } from '@/components/Button';

interface ArtifactCardProps {
  artifact: SetupArtifact;
}

export function ArtifactCard({ artifact }: ArtifactCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white/80 p-4 text-sm shadow-sm dark:border-slate-700 dark:bg-slate-900/40">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-slate-900 dark:text-slate-100">{artifact.title}</p>
          <p className="text-[11px] uppercase tracking-wide text-slate-400">{artifact.kind}</p>
        </div>
        {artifact.kind === 'link' ? (
          <Button size="sm" variant="outline" asChild>
            <a href={artifact.preview} target="_blank" rel="noreferrer">
              Open
            </a>
          </Button>
        ) : null}
      </div>
      <div className="mt-3 text-sm text-slate-600 dark:text-slate-300">
        {renderPreview(artifact)}
      </div>
    </div>
  );
}

function renderPreview(artifact: SetupArtifact) {
  if (artifact.kind === 'json') {
    return (
      <pre className="max-h-40 overflow-auto rounded-xl bg-slate-900/90 p-3 text-xs text-emerald-200">
        {artifact.preview}
      </pre>
    );
  }
  if (artifact.kind === 'image') {
    return (
      <div className="flex h-36 items-center justify-center rounded-xl border border-slate-200 bg-slate-100 text-xs text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
        Image preview placeholder
      </div>
    );
  }
  if (artifact.kind === 'text') {
    return <p className="line-clamp-3 whitespace-pre-wrap">{artifact.preview}</p>;
  }
  if (artifact.kind === 'link') {
    return (
      <a
        className="text-sm text-slate-600 underline underline-offset-4 hover:text-slate-800 dark:text-slate-300 dark:hover:text-slate-100"
        href={artifact.preview}
        target="_blank"
        rel="noreferrer"
      >
        {artifact.preview}
      </a>
    );
  }
  return null;
}
