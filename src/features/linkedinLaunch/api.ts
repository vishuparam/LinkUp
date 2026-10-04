import { generateLinkedInProfile, validateLinkedInProfileKit } from './generate';
import { normalizeLinkedInSource } from './normalize';
import type { LinkedInLaunchSource, LinkedInProfileKit } from './types';

export interface GenerationResult {
  kit: LinkedInProfileKit;
  mode: 'ai' | 'fallback';
}

/** Always returns a usable kit, even when the server or model is unavailable. */
export async function requestLinkedInProfile(
  input: LinkedInLaunchSource,
  fetchImpl: typeof fetch = fetch,
): Promise<GenerationResult> {
  const profile = normalizeLinkedInSource(input);
  const fallback = generateLinkedInProfile(profile);
  let fallbackReason = 'network_error';
  try {
    const response = await fetchImpl('/api/linkedin-launch/generate', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profile }),
    });
    if (!response.ok) {
      fallbackReason = `server_http_${response.status}`;
      throw new Error('Server rejected generation');
    }
    fallbackReason = 'client_invalid_json';
    const result: unknown = await response.json();
    fallbackReason = 'client_missing_kit';
    if (!result || typeof result !== 'object' || !('kit' in result)) throw new Error('Missing kit');
    fallbackReason = 'client_invalid_kit';
    const kit = validateLinkedInProfileKit(result.kit);
    if (kit.projects.length !== fallback.projects.length ||
        kit.projects.some((project, index) => project.title !== fallback.projects[index].title) ||
        kit.experience.length !== fallback.experience.length ||
        kit.volunteering.length !== fallback.volunteering.length ||
        kit.honors.length !== fallback.honors.length ||
        !kit.about || !kit.headline) throw new Error('Malformed kit');
    return { kit, mode: 'ai' };
  } catch {
    if (typeof window !== 'undefined' && ['localhost', '127.0.0.1'].includes(window.location.hostname)) {
      console.warn(`[LinkedIn Launch] deterministic fallback: ${fallbackReason}`);
      // Only a fixed reason code is sent; no student data or generated text.
      if (fallbackReason.startsWith('client_')) {
        void fetch('/api/linkedin-launch/diagnostic', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reason: fallbackReason }),
        }).catch(() => {});
      }
    }
    return { kit: fallback, mode: 'fallback' };
  }
}
