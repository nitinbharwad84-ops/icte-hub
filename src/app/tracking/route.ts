import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { session_id, action, payload } = await request.json();
    if (!session_id || !action) return NextResponse.json({ error: 'Missing session_id or action' }, { status: 400 });

    const supabase = await createClient();

    if (action === 'view_college') {
      const newView = { college_id: payload.college_id, college_name: payload.college_name, viewed_at: new Date().toISOString() };
      const { error: upsertErr } = await supabase.from('visitors').upsert(
        { session_id, viewed_colleges: [newView], last_seen_at: new Date().toISOString() },
        { onConflict: 'session_id' }
      );
      if (upsertErr) {
        console.error('Tracking upsert error (view_college):', upsertErr);
        return NextResponse.json({ success: false, error: upsertErr.message }, { status: 500 });
      }
    } else if (action === 'filter_change') {
      const { error: upsertErr } = await supabase.from('visitors').upsert(
        { session_id, mode_filters_used: [payload.mode], last_seen_at: new Date().toISOString() },
        { onConflict: 'session_id' }
      );
      if (upsertErr) {
        console.error('Tracking upsert error (filter_change):', upsertErr);
        return NextResponse.json({ success: false, error: upsertErr.message }, { status: 500 });
      }
    } else if (action === 'converted') {
      const { error: upsertErr } = await supabase.from('visitors').upsert(
        { session_id, converted_to_lead_id: payload.lead_id, last_seen_at: new Date().toISOString() },
        { onConflict: 'session_id' }
      );
      if (upsertErr) {
        console.error('Tracking upsert error (converted):', upsertErr);
        return NextResponse.json({ success: false, error: upsertErr.message }, { status: 500 });
      }
    } else if (action === 'page_view') {
      const { error: upsertErr } = await supabase.from('visitors').upsert(
        { session_id, last_seen_at: new Date().toISOString() },
        { onConflict: 'session_id' }
      );
      if (upsertErr) {
        console.error('Tracking upsert error (page_view):', upsertErr);
        return NextResponse.json({ success: false, error: upsertErr.message }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Tracking error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
