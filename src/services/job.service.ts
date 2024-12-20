import config from '../config/config';
import Job, { JobAttributes } from '../models/job';
import { GetAllJobsOptions, JobStatus } from '../types/JobTypes';
import { sanitizeFileName } from '../utils/helpers';
import { uploadFromMemory } from '../utils/storageProvider';
import { randomUUID } from 'node:crypto';

export async function createJob(file: Express.Multer.File): Promise<JobAttributes> {
  const fileName = sanitizeFileName(file.originalname);
  const uniqueFileName = `${randomUUID()}-${fileName}`;
  await uploadFromMemory(uniqueFileName, file.buffer);

  const filePath = `${config.get('STORAGE_URL')}/${uniqueFileName}`;
  const job = await Job.create({ fileName, filePath, status: JobStatus.PENDING, mimetype: file.mimetype });
  return job;
}

export async function getJobById(jobId: number) {
  return Job.findByPk(jobId);
}

export async function updateJob(jobId: number, updates: Partial<Job>) {
  const [_, [updatedJob]] = await Job.update(updates, { where: { id: jobId }, returning: true });
  return updatedJob;
}

export async function getAllJobs({ status, limit, offset }: GetAllJobsOptions) {
    const where: any = {};
  
    if (status) {
      where.status = status;
    }
  
    const result = await Job.findAndCountAll({
      where,
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    });
  
    return result;
  }
