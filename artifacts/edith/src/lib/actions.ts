export interface EdithAction {
  type: string;
  params: string;
  raw: string;
}

export function parseActions(text: string): EdithAction[] {
  const re = /\[ACTION:([A-Z_]+):([^\]]*)\]/g;
  const actions: EdithAction[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    actions.push({ type: m[1], params: m[2], raw: m[0] });
  }
  return actions;
}

export function stripActions(text: string): string {
  return text
    .replace(/\[ACTION:[A-Z_]+:[^\]]*\]/g, '')
    .replace(/https?:\/\/\S+/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function openUrl(url: string): void {
  const target = url.trim();
  if (!target) return;
  const popup = window.open(target, '_blank', 'noopener');
  if (!popup) {
    window.location.assign(target);
  }
}

export function executeQuickCommand(text: string): boolean {
  const normalized = text.trim().toLowerCase();
  if (!normalized) return false;
  if (
    normalized.includes('youtube') &&
    (
      normalized.includes('open') ||
      normalized.includes('launch') ||
      normalized.includes('start') ||
      normalized.includes('play') ||
      normalized.includes('watch') ||
      normalized.includes('go') ||
      normalized.includes('browse') ||
      normalized.includes('khol') ||
      normalized.includes('खोल') ||
      normalized.includes('खोलो')
    )
  ) {
    openUrl('https://www.youtube.com');
    return true;
  }
  if (
    normalized === 'open youtube' ||
    normalized === 'youtube open' ||
    normalized === 'open the youtube' ||
    normalized === 'open yt' ||
    normalized === 'launch youtube' ||
    normalized === 'start youtube' ||
    normalized === 'play youtube' ||
    normalized === 'watch youtube' ||
    normalized === 'go to youtube' ||
    normalized === 'open youtube website' ||
    normalized === 'youtube kholo' ||
    normalized === 'youtube khol' ||
    normalized === 'youtube खोलो' ||
    normalized === 'youtube kholo ji' ||
    normalized === 'open youtube please' ||
    normalized === 'open youtube now'
  ) {
    openUrl('https://www.youtube.com');
    return true;
  }
  return false;
}

async function sendDesktopCommand(action: string, params: Record<string, unknown>): Promise<void> {
  try {
    const res = await fetch('/api/desktop/command', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, params }),
    });
    const data = await res.json();
    if (data.error) {
      console.warn('[EDITH DESKTOP]', data.error);
      if (data.error.includes('not connected')) {
        console.info('[EDITH DESKTOP] Download edith_desktop_agent.py and run it on your machine for full desktop control');
      }
    }
  } catch (e) {
    console.error('[EDITH DESKTOP] Command error:', e);
  }
}

export function executeActions(actions: EdithAction[]): void {
  for (const action of actions) {
    try {
      switch (action.type) {
        case 'OPEN_URL':
          openUrl(action.params);
          break;
        case 'WHATSAPP': {
          const colonIdx = action.params.indexOf(':');
          const phone = colonIdx >= 0 ? action.params.slice(0, colonIdx).replace(/\D/g, '') : '';
          const msg = colonIdx >= 0 ? action.params.slice(colonIdx + 1) : action.params;
          const base = phone ? `https://wa.me/${phone}` : 'https://wa.me/';
          window.open(`${base}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener');
          break;
        }
        case 'TWEET':
          window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(action.params)}`, '_blank', 'noopener');
          break;
        case 'EMAIL': {
          const parts = action.params.split(':');
          const to = parts[0] ?? '';
          const subject = parts[1] ?? '';
          const body = parts.slice(2).join(':');
          window.open(`mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
          break;
        }
        case 'SEARCH':
          window.open(`https://www.google.com/search?q=${encodeURIComponent(action.params)}`, '_blank', 'noopener');
          break;
        case 'YOUTUBE':
          openUrl(
            action.params.trim()
              ? `https://www.youtube.com/results?search_query=${encodeURIComponent(action.params)}`
              : 'https://www.youtube.com'
          );
          break;
        case 'YOUTUBE_OPEN':
          openUrl('https://www.youtube.com');
          break;
        case 'INSTAGRAM':
          window.open('https://www.instagram.com/', '_blank', 'noopener');
          break;
        case 'MAPS':
          window.open(`https://www.google.com/maps/search/${encodeURIComponent(action.params)}`, '_blank', 'noopener');
          break;
        case 'TRANSLATE':
          window.open(`https://translate.google.com/?text=${encodeURIComponent(action.params)}`, '_blank', 'noopener');
          break;
        case 'DESKTOP_OPEN':
          sendDesktopCommand('open_app', { name: action.params.trim() });
          break;
        case 'DESKTOP_TYPE':
          sendDesktopCommand('type_text', { text: action.params });
          break;
        case 'DESKTOP_KEYS':
          sendDesktopCommand('press_keys', { keys: action.params.trim() });
          break;
        case 'DESKTOP_CLICK': {
          const [x, y] = action.params.split(',').map(v => parseInt(v.trim(), 10));
          sendDesktopCommand('click', { x, y });
          break;
        }
        case 'DESKTOP_SCREENSHOT':
          sendDesktopCommand('screenshot', {});
          break;
        case 'DESKTOP_RUN':
          sendDesktopCommand('run_command', { command: action.params });
          break;
        case 'DESKTOP_SCROLL': {
          const clicks = parseInt(action.params.trim(), 10) || 3;
          sendDesktopCommand('scroll', { clicks });
          break;
        }
        default:
          console.warn('[EDITH ACTION]', 'Unknown action type:', action.type);
      }
    } catch (e) {
      console.error('[EDITH ACTION] Execute error:', e);
    }
  }
}

export function parseAndExecute(text: string): string {
  const actions = parseActions(text);
  if (actions.length === 0) return stripActions(text);
  executeActions(actions);
  return stripActions(text);
}
