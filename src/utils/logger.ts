export type Progress = {stage: string; durationMs?: number; candidateCount?: number; verifiedCandidateCount?: number; errorCategory?: string};
export function logProgress(requestId: string, event: Progress): void {
  console.info(JSON.stringify({requestId, ...event}));
}
