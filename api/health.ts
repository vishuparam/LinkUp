import type { VercelRequest, VercelResponse } from '../src/utils/vercel-types.js';
import { prepareHttp } from '../src/utils/http.js';
export default function health(req: VercelRequest, res: VercelResponse) {
  if (!prepareHttp(req, res, 'GET')) return;
  return res.status(200).json({status: 'ok', service: 'linkup-mentor-finder'});
}
