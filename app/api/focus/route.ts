import { NextResponse } from 'next/server';
import { createFocus, listFocuses } from '@/lib/focusStore';
import type { FocusStatus } from '@/lib/types';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') as FocusStatus | null;
  const query = searchParams.get('q')?.toLowerCase() ?? '';

  const data = listFocuses().filter(item => {
    const matchesStatus = status ? item.status === status : true;
    const matchesQuery = query
      ? item.title.toLowerCase().includes(query) || item.tags.some(tag => tag.toLowerCase().includes(query))
      : true;
    return matchesStatus && matchesQuery;
  });

  return NextResponse.json({ data });
}

export async function POST(request: Request) {
  const payload = await request.json();
  if (!payload || typeof payload.businessId !== 'string' || typeof payload.title !== 'string') {
    return NextResponse.json({ error: 'Invalid focus payload' }, { status: 400 });
  }

  const focus = createFocus({
    businessId: payload.businessId,
    title: payload.title,
    description: payload.description,
    startDate: payload.startDate,
    endDate: payload.endDate,
    tags: Array.isArray(payload.tags) ? payload.tags : undefined,
    kpis: Array.isArray(payload.kpis) ? payload.kpis : undefined,
    milestones: Array.isArray(payload.milestones) ? payload.milestones : undefined,
    status: payload.status,
  });

  return NextResponse.json({ data: focus }, { status: 201 });
}
