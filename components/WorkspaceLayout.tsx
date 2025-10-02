"use client";

import { useEffect, useMemo, type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import {
  LayoutDashboard,
  Bot,
  Building2,
  Users,
  Upload,
  Palette,
  MessageSquare,
  Settings,
  Sparkles,
  Sun,
  Moon,
} from 'lucide-react';
import { useCreoStore } from '@/lib/store';
import { AI_AGENTS } from '@/lib/mockData';
import { Chip } from '@/components/Chip';
import { StatusDot } from '@/components/StatusDot';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { key: 'dashboard', label: 'Dashboard', href: '/', icon: LayoutDashboard },
  { key: 'playbooks', label: 'Playbooks', href: '/playbooks', icon: Bot },
  { key: 'prospects', label: 'Prospects', href: '/prospects', icon: Building2 },
  { key: 'people', label: 'People', href: '/people', icon: Users },
  { key: 'training', label: 'Training', href: '/training', icon: Upload },
  { key: 'creative', label: 'Creative', href: '/creative', icon: Palette },
  { key: 'reviews', label: 'Reviews', href: '/reviews', icon: MessageSquare },
  { key: 'settings', label: 'Settings', href: '/settings', icon: Settings },
] as const;

interface WorkspaceLayoutProps {
  children: ReactNode;
  headerActions?: ReactNode;
}

export function WorkspaceLayout({ children, headerActions }: WorkspaceLayoutProps) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const {
    businesses,
    activeHomeBusinessId,
    setActiveHomeBusinessId,
    companySignals,
  } = useCreoStore();

  const agentLookup = useMemo(() => {
    return AI_AGENTS.reduce<Record<string, { emoji: string; name: string }>>((acc, agent) => {
      acc[agent.id] = { emoji: agent.emoji, name: agent.name };
      return acc;
    }, {});
  }, []);

  useEffect(() => {
    if (!businesses.length) return;
    if (!activeHomeBusinessId || !businesses.some(business => business.id === activeHomeBusinessId)) {
      setActiveHomeBusinessId(businesses[0].id);
    }
  }, [businesses, activeHomeBusinessId, setActiveHomeBusinessId]);

  const activeBusiness = useMemo(
    () => businesses.find(business => business.id === activeHomeBusinessId) ?? businesses[0],
    [businesses, activeHomeBusinessId],
  );

  const signals = activeBusiness ? companySignals[activeBusiness.id] ?? [] : [];

  const themeIcon = theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />;

  function handleThemeToggle() {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 text-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-black dark:text-slate-100">
      <div className="mx-auto flex min-h-screen max-w-7xl gap-6 px-6 py-10">
        <aside className="w-80 shrink-0 space-y-6 rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Sparkles className="h-4 w-4" />
            Home Businesses
          </div>
          <div className="space-y-3">
            {businesses.map(business => (
              <button
                key={business.id}
                onClick={() => setActiveHomeBusinessId(business.id)}
                className={cn(
                  'w-full rounded-2xl border px-4 py-4 text-left transition focus:outline-none',
                  activeBusiness && business.id === activeBusiness.id
                    ? 'border-slate-900 bg-slate-900 text-white shadow dark:border-slate-100 dark:bg-slate-100 dark:text-slate-900'
                    : 'border-transparent bg-slate-100/70 hover:border-slate-200 hover:bg-slate-100 dark:bg-slate-800/50 dark:hover:bg-slate-800',
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-semibold">{business.name}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{business.industry}</p>
                  </div>
                  <Chip variant="info" className="text-[10px]">
                    {business.tier}
                  </Chip>
                </div>
                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                  {business.aiAgentIds.map(agentId => {
                    const agent = agentLookup[agentId];
                    return (
                      <span
                        key={`${business.id}-${agentId}`}
                        className="inline-flex items-center gap-1 rounded-full bg-white/80 px-2 py-1 text-slate-600 dark:bg-slate-900/80 dark:text-slate-300"
                      >
                        <span>{agent?.emoji ?? '🤖'}</span>
                        {agent?.name ?? agentId}
                      </span>
                    );
                  })}
                </div>
              </button>
            ))}
          </div>
        </aside>
        <section className="flex-1 space-y-6">
          {activeBusiness ? (
            <header className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-2">
                  <Chip variant="info" className="uppercase">
                    {activeBusiness.tier} tier
                  </Chip>
                  <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-semibold leading-tight">{activeBusiness.name}</h1>
                    {activeBusiness.website ? (
                      <a
                        href={activeBusiness.website}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm text-slate-500 underline hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                      >
                        Visit site
                      </a>
                    ) : null}
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{activeBusiness.industry}</p>
                  <div className="flex flex-wrap gap-2 text-xs text-slate-500 dark:text-slate-400">
                    {activeBusiness.goals.map(goal => (
                      <Chip key={`${activeBusiness.id}-${goal}`} className="bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                        {goal}
                      </Chip>
                    ))}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={handleThemeToggle}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    {themeIcon}
                    Toggle theme
                  </button>
                  {headerActions}
                </div>
              </div>
              <div className="flex flex-wrap gap-6 text-sm text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <StatusDot status="success" /> AI crew synced
                </div>
                <div className="flex items-center gap-2">
                  <StatusDot status="info" />
                  {activeBusiness.playbook.activity.length} recent autopilot events
                </div>
                {signals.length ? (
                  <div className="flex items-center gap-2">
                    <StatusDot status="info" /> Latest press: {signals[0].title}
                  </div>
                ) : null}
              </div>
            </header>
          ) : null}

          <nav className="flex flex-wrap gap-2 rounded-2xl border border-slate-200 bg-white/80 p-2 dark:border-slate-800 dark:bg-slate-900/40">
            {NAV_ITEMS.map(item => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.key}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition',
                    isActive
                      ? 'bg-slate-900 text-white shadow dark:bg-slate-100 dark:text-slate-900'
                      : 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800',
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="space-y-6 pb-10">{children}</div>
        </section>
      </div>
    </div>
  );
}
