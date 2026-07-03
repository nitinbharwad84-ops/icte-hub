'use client';
import { useCallback } from 'react';
import { getSessionId } from '@/lib/utils/session';

interface TrackEvent {
  action: 'page_view' | 'view_college' | 'filter_change' | 'converted';
  payload?: Record<string, unknown>;
}

export function useTracking() {
  const track = useCallback(async (event: TrackEvent) => {
    try {
      const session_id = getSessionId();
      if (!session_id) return;
      await fetch('/tracking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id, ...event }),
      });
    } catch {
      // Fail silently
    }
  }, []);

  return { track };
}
