export function getSessionId(): string {
  if (typeof window === 'undefined') return '';
  let id = localStorage.getItem('icte_session_id');
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem('icte_session_id', id);
  }
  return id;
}

export function getSource(): string {
  if (typeof window === 'undefined') return 'direct';
  const params = new URLSearchParams(window.location.search);
  const source = params.get('source');
  if (source) {
    localStorage.setItem('icte_source', source);
    return source;
  }
  return localStorage.getItem('icte_source') || 'direct';
}
