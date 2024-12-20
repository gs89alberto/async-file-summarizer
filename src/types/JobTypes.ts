export enum JobStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export interface GetAllJobsOptions {
  status?: string;
  limit?: number;
  offset?: number;
}
