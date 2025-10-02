"use client";

import { useEffect, useMemo, useState } from 'react';
import { Modal, ModalFooter } from '@/components/Modal';
import { Chip } from '@/components/Chip';
import { Button } from '@/components/Button';
import type { SetupTask } from '@/lib/types';

const IMPACT_VARIANT: Record<string, 'neutral' | 'info' | 'warning' | 'success'> = {
  critical: 'warning',
  high: 'info',
  med: 'neutral',
  low: 'neutral',
};

interface SetupTaskDrawerProps {
  task: SetupTask | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveFields: (fields: Record<string, string>) => void;
  onAction: (action: string) => void;
  onApprovalChange: (approved: boolean) => void;
}

export function SetupTaskDrawer({ task, isOpen, onClose, onSaveFields, onAction, onApprovalChange }: SetupTaskDrawerProps) {
  const [draftFields, setDraftFields] = useState<Record<string, string>>({});

  useEffect(() => {
    if (task && isOpen) {
      setDraftFields(task.fields ? { ...task.fields } : {});
    }
  }, [task, isOpen]);

  const descriptionList = useMemo(() => {
    if (!task) return [] as Array<{ label: string; value: string }>;
    return [
      { label: 'Owner', value: task.owner },
      { label: 'Impact', value: capitalize(task.impact) },
      { label: 'Last updated', value: new Date(task.lastUpdatedAt).toLocaleString() },
    ];
  }, [task]);

  if (!task) {
    return null;
  }

  const handleSave = () => {
    onSaveFields(draftFields);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={task.title}
      description={task.description}
      className="max-w-4xl"
    >
      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-4">
          <div className="flex flex-wrap gap-3 text-xs text-slate-500 dark:text-slate-400">
            {descriptionList.map(item => (
              <span key={item.label} className="flex items-center gap-1">
                <strong className="uppercase tracking-wide text-slate-400">{item.label}:</strong> {item.value}
              </span>
            ))}
            <Chip variant={IMPACT_VARIANT[task.impact] ?? 'neutral'}>{capitalize(task.impact)}</Chip>
            <Chip variant={task.status === 'done' ? 'success' : task.status === 'in-progress' ? 'info' : 'neutral'}>
              {formatStatus(task.status)}
            </Chip>
          </div>

          {renderFields(task.id, draftFields, setDraftFields)}
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white/70 p-4 dark:border-slate-700 dark:bg-slate-900/40">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Quick actions</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {task.actions
                .filter(action => action !== 'Open')
                .map(action => (
                  <Button key={action} size="sm" variant="outline" onClick={() => onAction(action)}>
                    {action}
                  </Button>
                ))}
            </div>
          </div>

          {task.requiresApproval ? (
            <label className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white/70 p-4 text-sm dark:border-slate-700 dark:bg-slate-900/40">
              <span className="text-slate-600 dark:text-slate-300">Approved for publishing</span>
              <input
                type="checkbox"
                checked={Boolean(task.approved)}
                onChange={event => onApprovalChange(event.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-500 dark:border-slate-600 dark:text-slate-100"
              />
            </label>
          ) : null}
        </div>
      </div>

      <ModalFooter>
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
        <Button onClick={handleSave}>
          Save
        </Button>
      </ModalFooter>
    </Modal>
  );
}

function renderFields(
  taskId: string,
  draftFields: Record<string, string>,
  setDraftFields: (fields: Record<string, string>) => void,
) {
  const keys = Object.keys(draftFields ?? {});
  if (keys.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 p-6 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
        No structured inputs for this task. Use the actions to progress the status.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {keys.map(key => (
        <label key={`${taskId}-${key}`} className="space-y-2 text-sm">
          <span className="text-slate-600 dark:text-slate-300">{prettyLabel(key)}</span>
          {isLongField(key) ? (
            <textarea
              value={draftFields[key] ?? ''}
              rows={key.toLowerCase().includes('json') ? 8 : 4}
              onChange={event => setDraftFields({ ...draftFields, [key]: event.target.value })}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            />
          ) : (
            <input
              value={draftFields[key] ?? ''}
              onChange={event => setDraftFields({ ...draftFields, [key]: event.target.value })}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            />
          )}
        </label>
      ))}
    </div>
  );
}

function prettyLabel(key: string) {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, char => char.toUpperCase())
    .trim();
}

function isLongField(key: string) {
  return /description|hours|json|template|notes|faqs|keywords|pitch|about|availability/i.test(key);
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function formatStatus(status: string) {
  switch (status) {
    case 'in-progress':
      return 'In progress';
    case 'todo':
      return 'To do';
    default:
      return capitalize(status);
  }
}
