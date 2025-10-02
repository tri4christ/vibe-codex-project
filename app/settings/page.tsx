"use client";

import { WorkspaceLayout } from '@/components/WorkspaceLayout';
import { Section } from '@/components/Section';

export default function SettingsPage() {
  return (
    <WorkspaceLayout>
      <Section title="Settings" description="Configure notification cadence, agent assignments, and integrations.">
        <p className="text-sm text-slate-500 dark:text-slate-400">Prototype placeholder — wire real controls once backend endpoints are ready.</p>
      </Section>
    </WorkspaceLayout>
  );
}
