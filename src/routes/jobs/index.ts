import { Router } from 'express';
import upload from '../../middleware/multer.middleware';
import { getJobStatus, getJobSummary, listJobs, submitFile } from '../../controllers/job.controller';
import { getJobByIdValidator, getJobListValidator, uploadFileValidator } from '../../validators/job.validators';


const router = Router();

router.post('/', upload.single('file'), uploadFileValidator, submitFile);
router.get('/:jobId', getJobByIdValidator, getJobStatus);
router.get('/summaries/:jobId', getJobByIdValidator, getJobSummary);
router.get('/', getJobListValidator, listJobs);

export default router;
