import logger from './config/logger';
import app from './app';
import { sequelize } from './config/sequelize';
import config from './config/config';

const port = config.get('PORT') || 3000;

sequelize
  .authenticate()
  .then(() => {
    logger.info('Database connection has been established successfully.');
  })
  .catch((error: Error) => {
    logger.error('Unable to connect to the database.', { error });
    throw error;
  });
sequelize.sync({ alter: true });

app.listen(port, () => {
  logger.info(`Server is running at http://localhost:${port}`);
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception', error);
  process.exit(1);
});
