import { Worker } from 'bullmq';
import { getJobById, updateJob } from '../services/job.service';
import type { Job as BullJob } from 'bullmq';
import { JobStatus } from '../types/JobTypes';
import config from '../config/config';
import { analyzeFile } from '../utils/summarizer';

const connection = {
  host: config.get('REDIS_HOST'),
  port: parseInt(config.get('REDIS_PORT')),
};

const jobWorker = () => new Worker(
  'jobQueue',
  async (bullJob: BullJob) => {
    const { id: jobId } = bullJob.data.job;
    const dbJob = await getJobById(jobId);
    if (!dbJob) throw new Error(`Job ID ${jobId} not found`);
    try {
      await updateJob(jobId, { status: JobStatus.PROCESSING });
      const summarizedContent = await analyzeFile(bullJob.data.job);

      await updateJob(jobId, {
        status: JobStatus.COMPLETED,
        summary: summarizedContent,
      });
    } catch (error: any) {
      await updateJob(jobId, { status: JobStatus.FAILED });
      throw error;
    }
  },
  { connection }
);

export default jobWorker;