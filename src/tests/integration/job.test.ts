import request from 'supertest';
import app from '../../app';
import Job from '../../models/job';
import { JobStatus } from '../../types/JobTypes';

jest.mock('../../models/job', () => ({
  create: jest.fn(),
  findByPk: jest.fn(),
  findAndCountAll: jest.fn(),
}));

describe('Job Routes Integration Tests with Mocked DB', () => {
  describe('POST /jobs', () => {
    it('should return 400 if no file is uploaded', async () => {
      const res = await request(app).post('/api/jobs/').field('title', 'No File');

      expect(res.status).toBe(400);
      expect(res.body.error).toStrictEqual({ message: 'No file uploaded' });
    });
  });

  describe('GET /jobs/:jobId', () => {
    it('should return job status if job exists', async () => {
      (Job.findByPk as jest.Mock).mockResolvedValue({
        id: 1,
        fileName: 'example.txt',
        filePath: 'http://fake-storage.com/example.txt',
        status: JobStatus.COMPLETED,
        mimetype: 'text/plain',
      });

      const res = await request(app).get('/api/jobs/1');
      expect(Job.findByPk).toHaveBeenCalledWith(1);
      expect(res.status).toBe(200);
      expect(res.body.status).toBe(JobStatus.COMPLETED);
    });

    it('should return 404 if job not found', async () => {
      (Job.findByPk as jest.Mock).mockResolvedValue(null);

      const res = await request(app).get('/api/jobs/9999');
      expect(Job.findByPk).toHaveBeenCalledWith(9999);
      expect(res.status).toBe(404);
      expect(res.body.error).toStrictEqual({ message: 'Job not found' });
    });
  });

  describe('GET /summaries/:jobId', () => {
    it('should return summary if job is COMPLETED', async () => {
      (Job.findByPk as jest.Mock).mockResolvedValue({
        id: 2,
        fileName: 'summary.txt',
        filePath: 'http://fake-storage.com/summary.txt',
        status: JobStatus.COMPLETED,
        summary: 'This is a summarized text.',
        mimetype: 'text/plain',
      });

      const res = await request(app).get('/api/jobs/summaries/2');
      expect(Job.findByPk).toHaveBeenCalledWith(2);
      expect(res.status).toBe(200);
      expect(res.body.summary).toBe('This is a summarized text.');
    });

    it('should return 404 if job not found', async () => {
      (Job.findByPk as jest.Mock).mockResolvedValue(null);

      const res = await request(app).get('/api/jobs/summaries/9999');
      expect(Job.findByPk).toHaveBeenCalledWith(9999);
      expect(res.status).toBe(404);
      expect(res.body.error).toStrictEqual({ message: 'Job not found' });
    });

    it('should return 400 if job not completed yet', async () => {
      (Job.findByPk as jest.Mock).mockResolvedValue({
        id: 3,
        fileName: 'incomplete.txt',
        filePath: 'http://fake-storage.com/incomplete.txt',
        status: JobStatus.PENDING,
        mimetype: 'text/plain',
      });

      const res = await request(app).get('/api/jobs/summaries/3');
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Job not completed yet');
    });
  });

  describe('GET /jobs', () => {
    it('should return paginated and filtered jobs', async () => {
      (Job.findAndCountAll as jest.Mock).mockResolvedValue({
        rows: [
          { id: 11, fileName: 'job1.txt', status: JobStatus.COMPLETED, mimetype: 'text/plain' },
          { id: 12, fileName: 'job2.txt', status: JobStatus.COMPLETED, mimetype: 'text/plain' },
        ],
        count: 2,
      });

      const res = await request(app).get('/api/jobs?status=COMPLETED&page=1&pageSize=2');
      expect(Job.findAndCountAll).toHaveBeenCalledWith({
        where: { status: 'COMPLETED' },
        limit: 2,
        offset: 0,
        order: [['createdAt', 'DESC']],
      });
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeLessThanOrEqual(2);
      expect(res.body.pagination).toBeDefined();
      expect(res.body.pagination.totalItems).toBe(2);
      expect(res.body.data.every((job: any) => job.status === JobStatus.COMPLETED)).toBe(true);
    });
  });
});
