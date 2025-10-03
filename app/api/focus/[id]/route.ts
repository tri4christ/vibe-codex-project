import { NextResponse } from 'next/server';
import { archiveFocus, getFocusById, updateFocus } from '@/lib/focusStore';

interface Params {
  params: { id: string };
}

export async function GET(_request: Request, { params }: Params) {
  const focus = getFocusById(params.id);
  if (!focus) {
    return NextResponse.json({ error: 'Focus not found' }, { status: 404 });
  }
  return NextResponse.json({ data: focus });
}

export async function PATCH(request: Request, { params }: Params) {
  const patch = await request.json();
  const updated = updateFocus(params.id, patch ?? {});
  if (!updated) {
    return NextResponse.json({ error: 'Focus not found' }, { status: 404 });
  }
  return NextResponse.json({ data: updated });
}

export async function DELETE(_request: Request, { params }: Params) {
  const archived = archiveFocus(params.id);
  if (!archived) {
    return NextResponse.json({ error: 'Focus not found' }, { status: 404 });
  }
  return NextResponse.json({ data: archived });
}
