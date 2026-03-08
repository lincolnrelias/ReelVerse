import * as dotenv from 'dotenv';
dotenv.config();

import { startAnalysisWorker } from './workers/analysis.worker.js';

startAnalysisWorker().catch((err) => {
  console.error('Worker failed to start:', err);
  process.exit(1);
});
