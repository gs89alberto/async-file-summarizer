import { createJob, getJobById, updateJob, getAllJobs } from '../../../services/job.service';
import Job from '../../../models/job';
import { JobStatus } from '../../../types/JobTypes';
import { uploadFromMemory } from '../../../utils/storageProvider';
import { sanitizeFileName } from '../../../utils/helpers';
import config from '../../../config/config';

jest.mock('../../../models/job', () => ({
  __esModule: true,
  default: {
    create: jest.fn(),
    findByPk: jest.fn(),
    update: jest.fn(),
    findAndCountAll: jest.fn()
  }
}));

jest.mock('../../../utils/storageProvider', () => ({
  uploadFromMemory: jest.fn()
}));

jest.mock('../../../utils/helpers', () => ({
  sanitizeFileName: jest.fn()
}));

jest.mock('../../../config/config', () => ({
  __esModule: true,
  default: {
    get: jest.fn()
  }
}));

describe('Job Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createJob', () => {
    it('should upload the file and create a job record', async () => {
      const mockFile = {
        originalname: 'my doc.pdf',
        buffer: Buffer.from('test content'),
        mimetype: 'application/pdf'
      } as Express.Multer.File;

      (sanitizeFileName as jest.Mock).mockReturnValue('my-doc.pdf');
      (config.get as jest.Mock).mockReturnValue('http://fake-storage.com');
      (Job.create as jest.Mock).mockResolvedValue({
        id: 1,
        fileName: 'my-doc.pdf',
        filePath: 'http://fake-storage.com/uuid-my-doc.pdf',
        status: JobStatus.PENDING,
        mimetype: 'application/pdf'
      });

      const result = await createJob(mockFile);
      expect(sanitizeFileName).toHaveBeenCalledWith('my doc.pdf');
      expect(uploadFromMemory).toHaveBeenCalledWith(
        expect.stringMatching(/^.+-my-doc\.pdf$/),
        mockFile.buffer
      );
      expect(config.get).toHaveBeenCalledWith('STORAGE_URL');
      expect(Job.create).toHaveBeenCalledWith({
        fileName: 'my-doc.pdf',
        filePath: expect.stringContaining('http://fake-storage.com/'),
        status: JobStatus.PENDING,
        mimetype: 'application/pdf'
      });
      expect(result.id).toBe(1);
      expect(result.status).toBe(JobStatus.PENDING);
    });

    it('should throw if upload fails', async () => {
      const mockFile = {
        originalname: 'error.txt',
        buffer: Buffer.from('test content'),
        mimetype: 'text/plain'
      } as Express.Multer.File;

      (sanitizeFileName as jest.Mock).mockReturnValue('error.txt');
      (config.get as jest.Mock).mockReturnValue('http://fake-storage.com');
      (uploadFromMemory as jest.Mock).mockRejectedValue(new Error('Upload failed'));

      await expect(createJob(mockFile)).rejects.toThrow('Upload failed');
    });
  });

  describe('getJobById', () => {
    it('should return a job if found', async () => {
      (Job.findByPk as jest.Mock).mockResolvedValue({ id: 10, status: JobStatus.COMPLETED });

      const job = await getJobById(10);
      expect(Job.findByPk).toHaveBeenCalledWith(10);
      expect(job).toEqual({ id: 10, status: JobStatus.COMPLETED });
    });

    it('should return null if job not found', async () => {
      (Job.findByPk as jest.Mock).mockResolvedValue(null);
      const job = await getJobById(999);
      expect(job).toBeNull();
    });

    it('should propagate errors', async () => {
      (Job.findByPk as jest.Mock).mockRejectedValue(new Error('DB error'));
      await expect(getJobById(1)).rejects.toThrow('DB error');
    });
  });

  describe('updateJob', () => {
    it('should update the job and return the updated job', async () => {
      (Job.update as jest.Mock).mockResolvedValue([1, [{ id: 5, status: JobStatus.COMPLETED }]]);

      const updated = await updateJob(5, { status: JobStatus.COMPLETED });
      expect(Job.update).toHaveBeenCalledWith({ status: JobStatus.COMPLETED }, { where: { id: 5 }, returning: true });
      expect(updated).toEqual({ id: 5, status: JobStatus.COMPLETED });
    });

    it('should return undefined if no rows were updated', async () => {
      (Job.update as jest.Mock).mockResolvedValue([0, []]);
      const updated = await updateJob(99, { status: JobStatus.FAILED });
      expect(updated).toBeUndefined();
    });

    it('should propagate errors', async () => {
      (Job.update as jest.Mock).mockRejectedValue(new Error('DB error'));
      await expect(updateJob(1, { status: JobStatus.COMPLETED })).rejects.toThrow('DB error');
    });
  });

  describe('getAllJobs', () => {
    it('should return rows and count with filtering', async () => {
      (Job.findAndCountAll as jest.Mock).mockResolvedValue({
        rows: [{ id: 1, status: JobStatus.PENDING }],
        count: 1
      });

      const options = { status: JobStatus.PENDING, limit: 5, offset: 0 };
      const result = await getAllJobs(options);

      expect(Job.findAndCountAll).toHaveBeenCalledWith({
        where: { status: JobStatus.PENDING },
        limit: 5,
        offset: 0,
        order: [['createdAt', 'DESC']]
      });
      expect(result.count).toBe(1);
      expect(result.rows).toHaveLength(1);
    });

    it('should return all jobs if no status is provided', async () => {
      (Job.findAndCountAll as jest.Mock).mockResolvedValue({
        rows: [{ id: 2, status: JobStatus.COMPLETED }, { id: 3, status: JobStatus.FAILED }],
        count: 2
      });

      const options = { limit: 10, offset: 0 };
      const result = await getAllJobs(options);

      expect(Job.findAndCountAll).toHaveBeenCalledWith({
        where: {},
        limit: 10,
        offset: 0,
        order: [['createdAt', 'DESC']]
      });
      expect(result.rows).toHaveLength(2);
      expect(result.count).toBe(2);
    });

    it('should propagate errors', async () => {
      (Job.findAndCountAll as jest.Mock).mockRejectedValue(new Error('DB error'));
      await expect(getAllJobs({})).rejects.toThrow('DB error');
    });
  });
});