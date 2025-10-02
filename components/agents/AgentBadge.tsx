import Image from 'next/image';
import { getAvatar, type Agent } from '@/lib/agents';

const SIZE_CONFIG = {
  xs: { dimension: 24, wrapper: 'gap-1 text-[11px]', image: 'h-6 w-6' },
  sm: { dimension: 32, wrapper: 'gap-2 text-xs', image: 'h-8 w-8' },
  md: { dimension: 40, wrapper: 'gap-3 text-sm', image: 'h-10 w-10' },
  lg: { dimension: 80, wrapper: 'gap-3 text-base', image: 'h-20 w-20' },
} as const;

type BadgeSize = keyof typeof SIZE_CONFIG;

interface AgentBadgeProps {
  agent: Agent;
  size?: BadgeSize;
}

export function AgentBadge({ agent, size = 'sm' }: AgentBadgeProps) {
  const config = SIZE_CONFIG[size];
  const avatarSrc = getAvatar(agent);
  const hasPhoto = avatarSrc !== '/agents/fallback.png';
  const sizesAttr = size === 'lg' ? '80px' : '(max-width: 640px) 24px, (max-width: 1024px) 32px, 40px';

  return (
    <span
      className={`inline-flex items-center ${config.wrapper} rounded-full bg-white/80 px-2 py-1 text-slate-600 dark:bg-slate-900/80 dark:text-slate-300`}
    >
      {hasPhoto ? (
        <Image
          src={avatarSrc}
          alt={`${agent.name}, ${agent.role}`}
          width={config.dimension}
          height={config.dimension}
          sizes={sizesAttr}
          className={`${config.image} rounded-full object-cover`}
        />
      ) : (
        <span
          role="img"
          aria-label={`${agent.name} avatar`}
          className={`flex ${config.image} items-center justify-center rounded-full bg-slate-900/10 text-base`}
        >
          {agent.kind === 'human' ? '👤' : agent.emoji}
        </span>
      )}
      <span className="font-medium">{agent.name}</span>
    </span>
  );
}
