import { Queue } from 'bullmq';
import { v4 as uuidv4 } from 'uuid';
import config from '../config/config';
import { JobAttributes } from '../models/job';

const connection = {
  host: config.get('REDIS_HOST') || 'localhost',
  port: parseInt(config.get('REDIS_PORT')|| '6379'),
};

export const jobQueue = new Queue('jobQueue', { connection });

export function enqueueJob(job: JobAttributes) {
  return jobQueue.add(
    'processJob',
    { job },
    {
      jobId: uuidv4(),
      attempts: 3,
      removeOnComplete: true,
      removeOnFail: false,
    }
  );
}
