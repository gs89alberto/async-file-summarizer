import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/sequelize';
import { JobStatus } from '../types/JobTypes';

export interface JobAttributes {
  id?: number;
  fileName: string;
  filePath: string;
  mimetype: string;
  status: JobStatus;
  summary?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

interface JobCreationAttributes
  extends Optional<JobAttributes, 'id' | 'status' | 'summary' | 'createdAt' | 'updatedAt'> {}

class Job extends Model<JobAttributes, JobCreationAttributes> implements JobAttributes {
  declare id?: number;
  declare fileName: string;
  declare filePath: string;
  declare mimetype: string;
  declare status: JobStatus;
  declare summary?: string | null;
  declare readonly createdAt?: Date;
  declare readonly updatedAt?: Date;
}

Job.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    fileName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    filePath: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    mimetype: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(...Object.values(JobStatus)),
      allowNull: false,
      defaultValue: JobStatus.PENDING,
    },
    summary: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'Job',
  }
);

export default Job;
