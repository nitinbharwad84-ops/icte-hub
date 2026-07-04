import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { session_id, action, payload } = await request.json();
    if (!session_id || !action) return NextResponse.json({ error: 'Missing session_id or action' }, { status: 400 });

    const supabase = await createClient();

    if (action === 'view_college') {
      const { data: existing, error: fetchErr } = await supabase.from('visitors').select('viewed_colleges').eq('session_id', session_id).single();
      if (fetchErr) {
        console.error('Tracking fetch error (view_college):', fetchErr);
        return NextResponse.json({ success: false, error: fetchErr.message }, { status: 500 });
      }
      const viewed = existing?.viewed_colleges || [];
      const newView = { college_id: payload.college_id, college_name: payload.college_name, viewed_at: new Date().toISOString() };
      viewed.push(newView);
      const { error: upsertErr } = await supabase.from('visitors').upsert(
        { session_id, viewed_colleges: viewed, last_seen_at: new Date().toISOString() },
        { onConflict: 'session_id' }
      );
      if (upsertErr) {
        console.error('Tracking upsert error (view_college):', upsertErr);
        return NextResponse.json({ success: false, error: upsertErr.message }, { status: 500 });
      }
    } else if (action === 'filter_change') {
      const { data: existing, error: fetchErr } = await supabase.from('visitors').select('mode_filters_used').eq('session_id', session_id).single();
      if (fetchErr) {
        console.error('Tracking fetch error (filter_change):', fetchErr);
        return NextResponse.json({ success: false, error: fetchErr.message }, { status: 500 });
      }
      const modes = existing?.mode_filters_used || [];
      if (!modes.includes(payload.mode)) modes.push(payload.mode);
      const { error: upsertErr } = await supabase.from('visitors').upsert(
        { session_id, mode_filters_used: modes, last_seen_at: new Date().toISOString() },
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
