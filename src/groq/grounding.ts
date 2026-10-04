import { safeUrl, unique } from '../utils/normalize.js';
import type { Grounding } from '../mentor/types.js';

type RecordValue = Record<string, unknown>;
const record = (value: unknown): RecordValue => value && typeof value === 'object' ? value as RecordValue : {};
const array = (value: unknown): unknown[] => Array.isArray(value) ? value : [];

/** Resolve Groq's line citations to browser.open output, never to model prose alone. */
export function extractGroqGrounding(response: unknown): Grounding {
  const grounding: Grounding = {sources: [], citations: [], searchQueries: [], searchSuggestions: []};
  const opened = new Map<number, {url: string; lines: Map<number, string>}>();
  const output = array(record(response).output);
  let toolIndex = 0;
  for (const rawItem of output) {
    const item = record(rawItem);
    if (item.type !== 'mcp_call') continue;
    if (item.name === 'browser.search' && typeof item.arguments === 'string') {
      try { const args = record(JSON.parse(item.arguments)); if (typeof args.query === 'string') grounding.searchQueries.push(args.query); } catch { /* Ignore malformed tool arguments. */ }
    }
    if (item.name === 'browser.open' && item.status === 'completed' && typeof item.output === 'string') {
      const lines = new Map<number, string>();
      for (const match of item.output.matchAll(/^L(\d+): ?(.*)$/gm)) lines.set(Number(match[1]), match[2] ?? '');
      const url = safeUrl(/^L\d+: URL: (\S+)/m.exec(item.output)?.[1]);
      if (url) opened.set(toolIndex, {url, lines});
    }
    toolIndex++;
  }
  for (const rawItem of output) {
    const item = record(rawItem);
    if (item.type !== 'message') continue;
    for (const rawPart of array(item.content)) {
      const part = record(rawPart);
      if (part.type !== 'output_text' || typeof part.text !== 'string') continue;
      for (const match of part.text.matchAll(/【(\d+)†L(\d+)(?:-L(\d+))?】/g)) {
        const source = opened.get(Number(match[1]));
        const first = Number(match[2]), last = Number(match[3] ?? match[2]);
        if (!source || last < first || last - first > 30) continue;
        const cited = Array.from({length: last - first + 1}, (_, i) => source.lines.get(first + i)).filter((line): line is string => typeof line === 'string').join(' ').trim();
        if (!cited || cited.length > 3000) continue;
        if (!grounding.sources.some(s => s.url === source.url)) grounding.sources.push({url: source.url, title: null});
        grounding.citations.push({id: `citation-${grounding.citations.length + 1}`, url: source.url, text: cited, start: match.index, end: match.index + match[0].length});
      }
    }
  }
  grounding.searchQueries = unique(grounding.searchQueries);
  return grounding;
}
