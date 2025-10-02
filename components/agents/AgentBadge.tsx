import Image from 'next/image';
import { getAvatar, type Agent } from '@/lib/agents';

interface AgentBadgeProps {
  agent: Agent;
}

export function AgentBadge({ agent }: AgentBadgeProps) {
  const isHuman = agent.kind === 'human';

  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-white/80 px-2 py-1 text-xs text-slate-600 dark:bg-slate-900/80 dark:text-slate-300">
      {isHuman ? (
        <Image src={getAvatar(agent)} alt={agent.name} width={24} height={24} className="h-6 w-6 rounded-full object-cover" />
      ) : (
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-900/10 text-base">
          {agent.emoji}
        </span>
      )}
      <span className="font-medium">{agent.name}</span>
    </span>
  );
}

