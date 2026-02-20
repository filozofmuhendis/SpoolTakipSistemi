import pino, { LoggerOptions } from 'pino';

const logLevel = process.env.LOG_LEVEL || 'info';

const options: LoggerOptions = {
    level: logLevel,
    base: {
        env: process.env.NODE_ENV,
    },
    redact: {
        paths: ['password', 'token', 'authorization', 'cookie'],
        remove: true,
    },
};

if (process.env.NODE_ENV !== 'production') {
    options.transport = {
        target: 'pino-pretty',
        options: {
            colorize: true,
            ignore: 'pid,hostname',
            translateTime: 'SYS:standard',
        },
    };
}

export const logger = pino(options);
