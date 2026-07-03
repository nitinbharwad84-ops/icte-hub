import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { session_id, action, payload } = await request.json();
    if (!session_id || !action) return NextResponse.json({ error: 'Missing session_id or action' }, { status: 400 });

    const supabase = await createClient();

    if (action === 'view_college') {
      const { data: existing } = await supabase.from('visitors').select('viewed_colleges').eq('session_id', session_id).single();
      const viewed = existing?.viewed_colleges || [];
      const newView = { college_id: payload.college_id, college_name: payload.college_name, viewed_at: new Date().toISOString() };
      viewed.push(newView);
      await supabase.from('visitors').upsert(
        { session_id, viewed_colleges: viewed, last_seen_at: new Date().toISOString() },
        { onConflict: 'session_id' }
      );
    } else if (action === 'filter_change') {
      const { data: existing } = await supabase.from('visitors').select('mode_filters_used').eq('session_id', session_id).single();
      const modes = existing?.mode_filters_used || [];
      if (!modes.includes(payload.mode)) modes.push(payload.mode);
      await supabase.from('visitors').upsert(
        { session_id, mode_filters_used: modes, last_seen_at: new Date().toISOString() },
        { onConflict: 'session_id' }
      );
    } else if (action === 'converted') {
      await supabase.from('visitors').upsert(
        { session_id, converted_to_lead_id: payload.lead_id, last_seen_at: new Date().toISOString() },
        { onConflict: 'session_id' }
      );
    } else if (action === 'page_view') {
      await supabase.from('visitors').upsert(
        { session_id, last_seen_at: new Date().toISOString() },
        { onConflict: 'session_id' }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Tracking error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
