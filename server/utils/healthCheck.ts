import mongoose from 'mongoose';

export interface HealthCheckResponse {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  database: 'connected' | 'disconnected';
  environment: string;
  uptime: number;
  checks: {
    database: boolean;
    memory: boolean;
    diskSpace: boolean;
  };
}

export const getHealthStatus = async (): Promise<HealthCheckResponse> => {
  const isDbConnected = mongoose.connection.readyState === 1;
  const memoryUsage = process.memoryUsage();
  const heapUsedPercent = (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100;

  const healthStatus: HealthCheckResponse = {
    status: isDbConnected && heapUsedPercent < 90 ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString(),
    database: isDbConnected ? 'connected' : 'disconnected',
    environment: process.env.NODE_ENV || 'development',
    uptime: process.uptime(),
    checks: {
      database: isDbConnected,
      memory: heapUsedPercent < 90,
      diskSpace: true, // Can be expanded with actual disk checking
    },
  };

  return healthStatus;
};
