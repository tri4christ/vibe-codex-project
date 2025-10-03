import { NextResponse } from 'next/server';
import { addAssistantResponse, addMessage, listMessages } from '@/lib/focusMessagesStore';

interface Params {
  params: { id: string };
}

export async function GET(_request: Request, { params }: Params) {
  const data = listMessages(params.id);
  return NextResponse.json({ data });
}

export async function POST(request: Request, { params }: Params) {
  const payload = await request.json();
  const text = typeof payload?.text === 'string' ? payload.text.trim() : '';
  if (!text) {
    return NextResponse.json({ error: 'Prompt text is required.' }, { status: 400 });
  }

  const focusId = params.id;
  const userMessage = addMessage({ focusId, role: 'user', text });
  const assistantMessage = addAssistantResponse(focusId, text);

  return NextResponse.json({ data: [userMessage, assistantMessage] });
}
