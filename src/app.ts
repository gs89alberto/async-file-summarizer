import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import logger from './config/logger';
import router from './routes';
import { NotFoundError } from './common/errors';
import { errorHandler } from './middleware/error.middleware';
import jobWorker from './workers/job.worker';

const app = express();

app.use(
  morgan('dev', {
    stream: { write: (message) => logger.info(message.trim()) },
  })
);
app.use(cors({ origin: '*' }));
app.use(express.json());
app.set('json spaces', 2);
app.use(helmet());

app.use('/api', router);
app.use(() => {
  throw new NotFoundError('Endpoint not found');
});
app.use(errorHandler);
jobWorker();


export default app;
