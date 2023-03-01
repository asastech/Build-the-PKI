import pino from 'pino';

const {
	LOG_LEVEL = 'debug',
	DISABLE_LOGGING = false,
	NODE_ENV = 'development',
	SERVICE_NAME = 'loki',
} = process.env;

const logger = pino({
	name: SERVICE_NAME,
	level: LOG_LEVEL,
	enabled: !DISABLE_LOGGING,
	transport:
		NODE_ENV === 'development'
			? {
					target: 'pino-pretty',
					options: { color: true },
			  }
			: (null as any),
	timestamp: true,
});

export default logger;
