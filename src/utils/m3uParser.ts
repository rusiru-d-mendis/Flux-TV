/**
 * Simple M3U Parser
 */

export interface M3UEntry {
  name: string;
  url: string;
  duration?: number;
  group?: string;
  logo?: string;
}

export function parseM3U(content: string): M3UEntry[] {
  const lines = content.split(/\r?\n/);
  const entries: M3UEntry[] = [];
  let currentEntry: Partial<M3UEntry> | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (line.startsWith('#EXTM3U')) {
      continue;
    }

    if (line.startsWith('#EXTINF:')) {
      // Parse EXTINF line
      // Format: #EXTINF:-1 tvg-id="" tvg-name="" tvg-logo="" group-title="",Channel Name
      const infoMatch = line.match(/#EXTINF:([-0-9.]+)(.*),(.*)/);
      if (infoMatch) {
        const duration = parseFloat(infoMatch[1]);
        const attributes = infoMatch[2];
        const name = infoMatch[3].trim();

        const logoMatch = attributes.match(/tvg-logo="([^"]+)"/);
        const groupMatch = attributes.match(/group-title="([^"]+)"/);

        currentEntry = {
          name,
          duration,
          logo: logoMatch ? logoMatch[1] : undefined,
          group: groupMatch ? groupMatch[1] : undefined,
        };
      }
    } else if (line && !line.startsWith('#')) {
      // This is the URL line
      if (currentEntry) {
        currentEntry.url = line;
        entries.push(currentEntry as M3UEntry);
        currentEntry = null;
      } else {
        // Simple M3U without EXTINF
        entries.push({
          name: line.split('/').pop() || 'Unknown',
          url: line,
        });
      }
    }
  }

  return entries;
}
