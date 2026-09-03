export const logger = {
  info: (message: string, meta?: any) => {
    console.log(JSON.stringify({ level: 'info', message, timestamp: new Date().toISOString(), ...meta }));
  },
  warn: (message: string, meta?: any) => {
    console.warn(JSON.stringify({ level: 'warn', message, timestamp: new Date().toISOString(), ...meta }));
  },
  error: (message: string, error?: any, meta?: any) => {
    // Scrub sensitive data if needed before logging
    const sanitizedError = error instanceof Error ? error.message : String(error);
    console.error(JSON.stringify({ level: 'error', message, error: sanitizedError, timestamp: new Date().toISOString(), ...meta }));
  }
};
