import { Request, Response, NextFunction } from 'express';
import { submitFile, getJobStatus, getJobSummary, listJobs } from '../../../controllers/job.controller';
import { createJob, getAllJobs, getJobById } from '../../../services/job.service';
import { enqueueJob } from '../../../queues/job.queue';
import { JobStatus } from '../../../types/JobTypes';
import { NotFoundError } from '../../../common/errors';

jest.mock('../../../services/job.service', () => ({
  createJob: jest.fn(),
  getAllJobs: jest.fn(),
  getJobById: jest.fn(),
}));

jest.mock('../../../queues/job.queue', () => ({
  enqueueJob: jest.fn(),
}));

describe('Job Controller', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe('submitFile', () => {
    it('should create a job and enqueue it', async () => {
      const file = { originalname: 'test.txt', buffer: Buffer.from('test') } as Express.Multer.File;
      req.file = file;

      const mockJob = { id: 1, fileName: 'test.txt', status: JobStatus.PENDING };
      (createJob as jest.Mock).mockResolvedValue(mockJob);

      await submitFile(req as Request, res as Response);

      expect(createJob).toHaveBeenCalledWith(file);
      expect(enqueueJob).toHaveBeenCalledWith(mockJob);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockJob);
    });

    it('should return 500 if an error occurs', async () => {
      req.file = { originalname: 'test.txt', buffer: Buffer.from('test') } as Express.Multer.File;
      (createJob as jest.Mock).mockRejectedValue(new Error('DB error'));

      await submitFile(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Unable to create job' });
    });
  });

  describe('getJobStatus', () => {
    it('should return job status if job found', async () => {
      req.params = { jobId: '1' };
      (getJobById as jest.Mock).mockResolvedValue({ id: 1, status: JobStatus.COMPLETED });

      await getJobStatus(req as Request, res as Response, next);

      expect(getJobById).toHaveBeenCalledWith(1);
      expect(next).not.toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({ status: JobStatus.COMPLETED });
    });

    it('should call next with NotFoundError if job not found', async () => {
      req.params = { jobId: '999' };
      (getJobById as jest.Mock).mockResolvedValue(null);

      await getJobStatus(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(expect.any(NotFoundError));
      expect(res.json).not.toHaveBeenCalled();
    });

    it('should call next with error if an error occurs', async () => {
      req.params = { jobId: '1' };
      const error = new Error('DB error');
      (getJobById as jest.Mock).mockRejectedValue(error);

      await getJobStatus(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(res.json).not.toHaveBeenCalled();
    });
  });

  describe('getJobSummary', () => {
    it('should return summary if job is completed', async () => {
      req.params = { jobId: '2' };
      (getJobById as jest.Mock).mockResolvedValue({
        id: 2,
        status: JobStatus.COMPLETED,
        summary: 'This is a summary.',
      });

      await getJobSummary(req as Request, res as Response, next);

      expect(res.json).toHaveBeenCalledWith({ summary: 'This is a summary.' });
    });

    it('should call next with NotFoundError if job not found', async () => {
      req.params = { jobId: '999' };
      (getJobById as jest.Mock).mockResolvedValue(null);

      await getJobSummary(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(expect.any(NotFoundError));
      expect(res.json).not.toHaveBeenCalled();
    });

    it('should return 400 if job is not completed', async () => {
      req.params = { jobId: '3' };
      (getJobById as jest.Mock).mockResolvedValue({
        id: 3,
        status: JobStatus.PENDING,
      });

      await getJobSummary(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Job not completed yet' });
      expect(next).not.toHaveBeenCalled();
    });

    it('should call next with error if an error occurs', async () => {
      req.params = { jobId: '4' };
      const error = new Error('DB error');
      (getJobById as jest.Mock).mockRejectedValue(error);

      await getJobSummary(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('listJobs', () => {
    it('should return paginated and filtered jobs', async () => {
      req.query = { status: JobStatus.COMPLETED, page: '2', pageSize: '5' };

      (getAllJobs as jest.Mock).mockResolvedValue({
        rows: [{ id: 11, status: JobStatus.COMPLETED }],
        count: 11,
      });

      await listJobs(req as Request, res as Response, next);

      expect(getAllJobs).toHaveBeenCalledWith({
        status: JobStatus.COMPLETED,
        limit: 5,
        offset: 5,
      });
      expect(res.json).toHaveBeenCalledWith({
        data: [{ id: 11, status: JobStatus.COMPLETED }],
        pagination: {
          page: 2,
          pageSize: 5,
          totalItems: 11,
          totalPages: Math.ceil(11 / 5),
        },
      });
    });
  });
});
