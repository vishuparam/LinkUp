import type { VercelRequest, VercelResponse } from '../src/utils/vercel-types.js';
import { findMentors } from '../src/mentor/index.js';
import { prepareHttp, readJson, sendError } from '../src/utils/http.js';
export function createFindMentorsHandler(engine: typeof findMentors = findMentors) {
  return async (req: VercelRequest, res: VercelResponse) => {
    const requestId = prepareHttp(req, res, 'POST');
    if (!requestId) return;
    try { return res.status(200).json(await engine(readJson(req), {requestId})); }
    catch (e) { return sendError(res, e, requestId); }
  };
}
export default createFindMentorsHandler();
