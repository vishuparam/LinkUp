import { describe, expect, it } from 'vitest';
import { inputSchema } from '../src/mentor/schemas.js';
import { safeUrl } from '../src/utils/normalize.js';
import { getConfig } from '../src/mentor/config.js';
import { input } from './fixtures.js';
describe('input validation', () => {
  it('accepts valid/minimal input and defaults', () => { expect(inputSchema.parse({projectTitle: input.projectTitle, projectDescription: input.projectDescription}).remoteAllowed).toBe(true); });
  it.each([{...input, projectTitle: undefined}, {...input, projectDescription: undefined}, {...input, projectTitle: ' '}, {...input, projectDescription: 'tiny'}, {...input, projectDescription: 'x'.repeat(6001)}, {...input, skills: Array(21).fill('AI')}, {...input, additionalPreferences: 'x'.repeat(2001)}, {...input, locationImportance: 'extreme'}, {...input, remoteAllowed: 'false'}, {...input, unexpected: true}, null, []])('rejects malformed structures', value => expect(inputSchema.safeParse(value).success).toBe(false));
  it('requires location for in-person requests', () => { expect(inputSchema.safeParse({...input, location: undefined, remoteAllowed: false}).success).toBe(false); });
  it.each(['javascript:alert(1)', 'file:///etc/passwd', 'https://name:password@university.edu', 'https://127.0.0.1', 'https://[::1]', 'http://localhost', 'broken'])('rejects unsafe URL %s', url => expect(safeUrl(url)).toBeNull());
  it('normalizes public URLs', () => expect(safeUrl('https://university.edu/profile#bio')).toBe('https://university.edu/profile'));
  it('rejects bad configuration without echoing values', () => expect(() => getConfig({ALLOWED_ORIGINS: '*'})).toThrow('ALLOWED_ORIGINS'));
});
