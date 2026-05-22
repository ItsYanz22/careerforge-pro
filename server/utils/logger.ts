import fs from 'fs';
import path from 'path';

interface LogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  data?: any;
}

class Logger {
  private logDir: string;
  private isProduction: boolean;

  constructor() {
    this.isProduction = process.env.NODE_ENV === 'production';
    this.logDir = path.join(process.cwd(), 'logs');

    // Create logs directory if it doesn't exist
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  private formatLog(entry: LogEntry): string {
    return JSON.stringify(entry);
  }

  private writeToFile(level: string, message: string, data?: any): void {
    if (this.isProduction) {
      const entry: LogEntry = {
        timestamp: new Date().toISOString(),
        level: level as any,
        message,
        ...(data && { data }),
      };

      const logFile = path.join(
        this.logDir,
        `${level}-${new Date().toISOString().split('T')[0]}.log`
      );

      fs.appendFileSync(logFile, this.formatLog(entry) + '\n');
    }
  }

  info(message: string, data?: any): void {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ℹ️  ${message}`, data || '');
    this.writeToFile('info', message, data);
  }

  warn(message: string, data?: any): void {
    const timestamp = new Date().toISOString();
    console.warn(`[${timestamp}] ⚠️  ${message}`, data || '');
    this.writeToFile('warn', message, data);
  }

  error(message: string, data?: any): void {
    const timestamp = new Date().toISOString();
    console.error(`[${timestamp}] ❌ ${message}`, data || '');
    this.writeToFile('error', message, data);
  }

  debug(message: string, data?: any): void {
    if (!this.isProduction) {
      const timestamp = new Date().toISOString();
      console.debug(`[${timestamp}] 🔍 ${message}`, data || '');
    }
    this.writeToFile('debug', message, data);
  }
}

export default new Logger();
