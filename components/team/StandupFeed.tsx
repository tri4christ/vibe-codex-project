"use client";

import { useMemo, useState } from 'react';
import { AgentBadge } from '@/components/agents/AgentBadge';
import { Button } from '@/components/Button';
import { Chip } from '@/components/Chip';
import { AGENTS, type Agent } from '@/lib/agents';
import { formatRelative } from '@/lib/time';

export interface StandupPost {
  id: string;
  agentId: string;
  message: string;
  createdAt: string;
  action?: {
    label: string;
    nextStatus: string;
  };
}

interface StandupFeedProps {
  posts: StandupPost[];
}

export function StandupFeed({ posts }: StandupFeedProps) {
  const agentLookup = useMemo(() => {
    return AGENTS.reduce<Record<string, Agent>>((acc, agent) => {
      acc[agent.id] = agent;
      return acc;
    }, {});
  }, []);

  const [entries, setEntries] = useState(posts);

  const handleAction = (post: StandupPost) => {
    if (!post.action) return;
    const agent = agentLookup[post.agentId];
    const followUp: StandupPost = {
      id: `${post.id}-followup-${Date.now()}`,
      agentId: post.agentId,
      message: `${agent?.name ?? 'Agent'} ${post.action.nextStatus.toLowerCase()}.`,
      createdAt: new Date().toISOString(),
    };
    setEntries(prev => [followUp, ...prev.map(item => (item.id === post.id ? { ...item, action: undefined } : item))]);
  };

  if (!entries.length) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
        Crew updates will appear here once teammates post.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {entries.map(post => {
        const agent = agentLookup[post.agentId];
        return (
          <article
            key={post.id}
            className="rounded-3xl border border-slate-200 bg-white/80 p-4 text-sm shadow-sm dark:border-slate-800 dark:bg-slate-900/40"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                {agent ? <AgentBadge agent={agent} /> : null}
                <p className="text-xs text-slate-400">{agent?.role ?? 'Crew member'} · {formatRelative(post.createdAt)}</p>
              </div>
              {post.action ? (
                <Chip variant="info">Needs attention</Chip>
              ) : null}
            </div>
            <p className="mt-3 text-slate-600 dark:text-slate-300">{post.message}</p>
            {post.action ? (
              <div className="mt-3 flex justify-end">
                <Button size="sm" onClick={() => handleAction(post)}>
                  {post.action.label}
                </Button>
              </div>
            ) : null}
          </article>
        );
      })}
    </div>
  );
}

