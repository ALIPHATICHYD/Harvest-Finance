import { LoggerService, Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class CustomLoggerService implements LoggerService {
  private readonly logDirectory = path.join(process.cwd(), 'logs');
  private readonly logFilePath = path.join(this.logDirectory, 'application.log');
  private readonly errorFilePath = path.join(this.logDirectory, 'error.log');

  constructor() {
    if (!fs.existsSync(this.logDirectory)) {
      fs.mkdirSync(this.logDirectory, { recursive: true });
    }
  }

  private writeToFile(filepath: string, message: any, context?: string, level: string = 'info') {
    const timestamp = new Date().toISOString();
    
    // Safely stringify objects
    let strMessage = message;
    if (typeof message === 'object') {
      try {
        strMessage = JSON.stringify(message);
      } catch (e) {
        strMessage = String(message);
      }
    }

    const logEntry = JSON.stringify({ timestamp, level, context, message: strMessage }) + '\n';
    try {
      fs.appendFileSync(filepath, logEntry);
    } catch (error) {
      console.error('Failed to write log to file', error);
    }
    
    const consoleMsg = `[Nest] ${process.pid}  - ${timestamp}     ${level.toUpperCase()} [${context || 'Application'}] ${strMessage}`;
    if (level === 'error') {
      console.error('\x1b[31m%s\x1b[0m', consoleMsg); // Red
    } else if (level === 'warn') {
      console.warn('\x1b[33m%s\x1b[0m', consoleMsg); // Yellow
    } else {
      console.log('\x1b[32m%s\x1b[0m', consoleMsg); // Green
    }
  }

  log(message: any, context?: string) {
    this.writeToFile(this.logFilePath, message, context, 'info');
  }

  error(message: any, trace?: string, context?: string) {
    const errorMsg = trace ? `${message} - Trace: ${trace}` : message;
    this.writeToFile(this.errorFilePath, errorMsg, context, 'error');
    this.writeToFile(this.logFilePath, errorMsg, context, 'error');
  }

  warn(message: any, context?: string) {
    this.writeToFile(this.logFilePath, message, context, 'warn');
  }

  debug?(message: any, context?: string) {
    this.writeToFile(this.logFilePath, message, context, 'debug');
  }

  verbose?(message: any, context?: string) {
    this.writeToFile(this.logFilePath, message, context, 'verbose');
  }
}
