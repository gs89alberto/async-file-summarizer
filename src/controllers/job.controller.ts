import { NextFunction, Request, Response } from 'express';
import { createJob, getAllJobs, getJobById } from '../services/job.service';
import { enqueueJob } from '../queues/job.queue';
import { JobStatus } from '../types/JobTypes';
import { NotFoundError } from '../common/errors';
import logger from '../config/logger';

export async function submitFile(req: Request, res: Response): Promise<void> {
  try {
    const file = req.file!;
    const job = await createJob(file);

    await enqueueJob(job);
    res.status(201).json(job);
  } catch (error) {
    logger.info(error);
    res.status(500).json({ error: 'Unable to create job' });
  }
}

export async function getJobStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const jobId = parseInt(req.params.jobId);
    const job = await getJobById(jobId);
    if (!job) throw new NotFoundError('Job not found');

    res.json({ status: job!.status });
  } catch (error) {
    next(error);
  }
}

export async function getJobSummary(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const jobId = parseInt(req.params.jobId);
    const job = await getJobById(jobId);
    if (!job) throw new NotFoundError('Job not found');
    if (job!.status !== JobStatus.COMPLETED) res.status(400).json({ error: 'Job not completed yet' });

    res.json({ summary: job!.summary });
  } catch (error) {
    next(error);
  }
}

export async function listJobs(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const status = req.query.status as string | undefined;
    const page = parseInt(req.query.page as string, 10) || 1;
    const pageSize = parseInt(req.query.pageSize as string, 10) || 10;

    const offset = (page - 1) * pageSize;

    const { rows: jobs, count } = await getAllJobs({ status, limit: pageSize, offset });
    const totalPages = Math.ceil(count / pageSize);

    res.json({
      data: jobs,
      pagination: {
        page,
        pageSize,
        totalItems: count,
        totalPages,
      },
    });
  } catch (error) {
    next(error);
  }
}
