"use client";

import { useState } from 'react';
import { WorkspaceLayout } from '@/components/WorkspaceLayout';
import { Section } from '@/components/Section';
import { Button } from '@/components/Button';
import { Chip } from '@/components/Chip';
import { useCreoStore } from '@/lib/store';
import type { DatasetEntry, DatasetFormat } from '@/lib/mockData';
import { Upload } from 'lucide-react';

export default function TrainingPage() {
  const { businesses, activeHomeBusinessId, setBusinesses } = useCreoStore();
  const activeBusiness = businesses.find(business => business.id === activeHomeBusinessId);

  const [name, setName] = useState('');
  const [format, setFormat] = useState<DatasetFormat>('Text');
  const [description, setDescription] = useState('');

  if (!activeBusiness) {
    return (
      <WorkspaceLayout>
        <Section title="No business selected" description="Choose a Home Business to manage training data." />
      </WorkspaceLayout>
    );
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name.trim()) return;
    const dataset: DatasetEntry = {
      id: `dataset-${Date.now()}`,
      name: name.trim(),
      format,
      description: description.trim(),
      uploadedAt: 'Today',
    };
    setBusinesses(prev =>
      prev.map(business =>
        business.id === activeBusiness.id
          ? { ...business, datasets: [dataset, ...business.datasets] }
          : business,
      ),
    );
    setName('');
    setDescription('');
    setFormat('Text');
  };

  return (
    <WorkspaceLayout>
      <div className="grid gap-6 lg:grid-cols-[1.2fr,1fr]">
        <Section title="Teach Creo AI" description="Drop raw data to shape messaging, targeting, or pricing models.">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="space-y-2 text-sm">
                <span className="text-slate-600 dark:text-slate-300">Dataset name</span>
                <input
                  value={name}
                  onChange={event => setName(event.target.value)}
                  required
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                />
              </label>
              <label className="space-y-2 text-sm">
                <span className="text-slate-600 dark:text-slate-300">Format</span>
                <select
                  value={format}
                  onChange={event => setFormat(event.target.value as DatasetFormat)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                >
                  <option value="Text">Text</option>
                  <option value="PDF">PDF</option>
                  <option value="JSON">JSON</option>
                </select>
              </label>
            </div>
            <label className="block space-y-2 text-sm">
              <span className="text-slate-600 dark:text-slate-300">Notes</span>
              <textarea
                value={description}
                onChange={event => setDescription(event.target.value)}
                rows={4}
                placeholder="Paste context, sample copy, or JSON arrays."
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
              />
            </label>
            <div className="flex justify-end">
              <Button type="submit" className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Save to library
              </Button>
            </div>
          </form>
        </Section>
        <Section title="Library" description="Everything Creo AI has been trained on for this franchise.">
          <div className="space-y-3">
            {activeBusiness.datasets.map(dataset => (
              <div key={dataset.id} className="rounded-2xl border border-slate-200 bg-white/70 p-4 text-sm dark:border-slate-800 dark:bg-slate-900/40">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-slate-900 dark:text-slate-100">{dataset.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{dataset.description}</p>
                  </div>
                  <Chip variant="neutral">{dataset.format}</Chip>
                </div>
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Uploaded {dataset.uploadedAt}</p>
              </div>
            ))}
          </div>
        </Section>
      </div>
    </WorkspaceLayout>
  );
}
