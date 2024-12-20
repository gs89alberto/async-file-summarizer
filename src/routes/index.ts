import { Router } from 'express';
import jobRoutes from './jobs';

const router = Router();

router.use('/jobs', jobRoutes);

export default router;
