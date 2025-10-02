"use client";

import { useEffect, useMemo, useState } from 'react';
import { Modal, ModalFooter } from '@/components/Modal';
import { Button } from '@/components/Button';
import { useCreoStore } from '@/lib/store';
import type { BuyingRole, Person, PersonStage, ProspectBusiness } from '@/lib/types';

interface AddContactDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  defaultProspectId?: string;
  homeBusinessId: string;
  onCreate?: (person: Person) => void;
}

const STAGES: PersonStage[] = ['New', 'Nurturing', 'Qualified', 'Meeting', 'Won', 'Lost'];
const ROLES: BuyingRole[] = ['Decision Maker', 'Economic Buyer', 'Technical Buyer', 'Champion', 'Influencer', 'Blocker'];

export function AddContactDrawer({ isOpen, onClose, defaultProspectId, homeBusinessId, onCreate }: AddContactDrawerProps) {
  const { prospects, addPerson, memories, setMemories } = useCreoStore();
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<BuyingRole | ''>('');
  const [stage, setStage] = useState<PersonStage>('New');
  const [prospectId, setProspectId] = useState<string>('');

  const availableProspects = useMemo(
    () => prospects.filter(prospect => prospect.homeBusinessId === homeBusinessId),
    [prospects, homeBusinessId],
  );

  useEffect(() => {
    if (isOpen) {
      setName('');
      setTitle('');
      setEmail('');
      setPhone('');
      setRole('');
      setStage('New');
      setProspectId(defaultProspectId ?? availableProspects[0]?.id ?? '');
    }
  }, [isOpen, defaultProspectId, availableProspects]);

  const selectedProspect: ProspectBusiness | undefined = availableProspects.find(prospect => prospect.id === prospectId);

  const handleSubmit = () => {
    if (!name.trim() || !email.trim() || !prospectId) return;
    const person: Person = {
      id: `person-${Date.now()}`,
      homeBusinessId,
      prospectBusinessId: prospectId,
      name: name.trim(),
      title: title.trim() || undefined,
      email: email.trim(),
      phone: phone.trim() || undefined,
      role: (role || undefined) as BuyingRole | undefined,
      stage,
      updatedAt: new Date().toISOString(),
    };
    addPerson(person);
    if (!memories[person.id]) {
      setMemories(prev => ({
        ...prev,
        [person.id]: {
          contactId: person.id,
          summary: 'Capture preferences once this contact replies. Memory will grow automatically.',
          updatedAt: new Date().toISOString(),
          traits: {
            interests: [],
            pains: [],
            goals: [],
            preferences: {},
          },
          facts: [],
        },
      }));
    }
    onCreate?.(person);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add contact"
      description="Capture who you're collaborating with so Creo AI can tailor threads and reminders."
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-1 text-sm">
          <span className="text-slate-600 dark:text-slate-300">Full name *</span>
          <input
            value={name}
            onChange={event => setName(event.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          />
        </label>
        <label className="space-y-1 text-sm">
          <span className="text-slate-600 dark:text-slate-300">Title</span>
          <input
            value={title}
            onChange={event => setTitle(event.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          />
        </label>
        <label className="space-y-1 text-sm">
          <span className="text-slate-600 dark:text-slate-300">Email *</span>
          <input
            type="email"
            value={email}
            onChange={event => setEmail(event.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          />
        </label>
        <label className="space-y-1 text-sm">
          <span className="text-slate-600 dark:text-slate-300">Phone</span>
          <input
            value={phone}
            onChange={event => setPhone(event.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <label className="space-y-1 text-sm">
          <span className="text-slate-600 dark:text-slate-300">Prospect Business *</span>
          <select
            value={prospectId}
            onChange={event => setProspectId(event.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          >
            {availableProspects.map(prospect => (
              <option key={prospect.id} value={prospect.id}>
                {prospect.name}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1 text-sm">
          <span className="text-slate-600 dark:text-slate-300">Buying role</span>
          <select
            value={role}
            onChange={event => setRole(event.target.value as BuyingRole | '')}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          >
            <option value="">Select role</option>
            {ROLES.map(option => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1 text-sm">
          <span className="text-slate-600 dark:text-slate-300">Stage</span>
          <select
            value={stage}
            onChange={event => setStage(event.target.value as PersonStage)}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          >
            {STAGES.map(option => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
      </div>

      {selectedProspect ? (
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Linked to <span className="font-semibold text-slate-600 dark:text-slate-300">{selectedProspect.name}</span>
        </p>
      ) : null}

      <ModalFooter>
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={!name.trim() || !email.trim() || !prospectId}>
          Save contact
        </Button>
      </ModalFooter>
    </Modal>
  );
}
