import { Sequelize } from 'sequelize';
import config from './config';

export const sequelize = new Sequelize(
  config.get('POSTGRES_DB'),
  config.get('POSTGRES_USER'),
  config.get('POSTGRES_PASSWORD'),
  {
    host: config.get('POSTGRES_HOST'),
    port: parseInt(config.get('POSTGRES_PORT')),
    dialect: 'postgres',
    logging: false,
  }
);

export default sequelize;
