import { safeUrl, unique } from '../utils/normalize.js';
import type { Grounding } from './types.js';
const record = (v: unknown): Record<string, unknown> => typeof v === 'object' && v !== null ? v as Record<string, unknown> : {};
const array = (v: unknown): unknown[] => Array.isArray(v) ? v : [];
/** Only SDK metadata is accepted as provenance; URLs in model prose are not sources. */
export function extractGroundingSources(response: unknown): Grounding {
  const result: Grounding = {sources: [], searchQueries: [], citations: [], searchSuggestions: []};
  const addSource = (url: unknown, title: unknown) => {
    const valid = safeUrl(url);
    if (valid && !result.sources.some(s => s.url === valid)) result.sources.push({url: valid, title: typeof title === 'string' ? title : null});
    return valid;
  };
  const root = record(response);
  const content = (value: unknown) => {
    const part = record(value);
    if (part.type !== 'text' || typeof part.text !== 'string') return;
    for (const value of array(part.annotations)) {
      const a = record(value);
      if (a.type !== 'url_citation') continue;
      const url = addSource(a.url, a.title);
      if (!url) continue;
      const bytes = Buffer.from(part.text);
      const start = typeof a.start_index === 'number' && Number.isInteger(a.start_index) ? a.start_index : null;
      const end = typeof a.end_index === 'number' && Number.isInteger(a.end_index) ? a.end_index : null;
      const text = start !== null && end !== null && start >= 0 && end > start && end <= bytes.length ? bytes.subarray(start, end).toString('utf8') : '';
      result.citations.push({id: `citation-${result.citations.length + 1}`, url, text, start, end});
    }
  };
  for (const item of array(root.steps)) {
    const step = record(item);
    if (step.type === 'model_output') array(step.content).forEach(content);
    if (step.type === 'google_search_call') result.searchQueries.push(...array(record(step.arguments).queries).filter((q): q is string => typeof q === 'string'));
    if (step.type === 'google_search_result') for (const r of array(step.result)) {
      const html = record(r).search_suggestions;
      if (typeof html === 'string') result.searchSuggestions.push(html);
    }
  }
  // Older Interactions responses exposed text in outputs rather than steps.
  array(root.outputs).forEach(content);
  // Defensive support for generateContent-style metadata in fixtures/provider migrations.
  for (const item of array(root.candidates)) {
    const c = record(item); const m = record(c.groundingMetadata);
    const chunks = array(m.groundingChunks).map(x => record(record(x).web));
    chunks.forEach(x => addSource(x.uri, x.title));
    result.searchQueries.push(...array(m.webSearchQueries).filter((q): q is string => typeof q === 'string'));
    const html = record(m.searchEntryPoint).renderedContent;
    if (typeof html === 'string') result.searchSuggestions.push(html);
    for (const raw of array(m.groundingSupports)) {
      const support = record(raw); const segment = record(support.segment);
      for (const idx of array(support.groundingChunkIndices)) {
        const chunk = typeof idx === 'number' ? chunks[idx] : undefined;
        const url = safeUrl(chunk?.uri);
        if (url) result.citations.push({id: `citation-${result.citations.length + 1}`, url, text: typeof segment.text === 'string' ? segment.text : '', start: typeof segment.startIndex === 'number' ? segment.startIndex : null, end: typeof segment.endIndex === 'number' ? segment.endIndex : null});
      }
    }
  }
  result.searchQueries = unique(result.searchQueries);
  result.searchSuggestions = unique(result.searchSuggestions);
  return result;
}
