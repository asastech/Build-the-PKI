const ENV_SCHEMA = {
	type: 'object',
	required: [
		'SERVICE_NAME',
		'DATABASE_URL',
		'REDIS_URL',
		'VAULT_ADDR',
		'VAULT_TOKEN',
		'PKI_MOUNT_NAME',
		'PKI_ROLE_NAME',
		'PKI_ISSUER_REF',
		'PKI_CERT_EXPIRATION',
	],

	properties: {
		SERVICE_NAME: {
			type: 'string',
		},
		NODE_ENV: {
			type: 'string',
			enum: ['development', 'testing', 'staging', 'production'],
			default: 'production',
		},
		APP_ENV: {
			type: 'string',
			enum: ['development', 'testing', 'staging', 'production'],
			default: 'production',
		},
		LOG_LEVEL: {
			type: 'string',
			enum: ['fatal', 'error', 'warn', 'info', 'debug', 'trace'],
			default: 'info',
		},
		DISABLE_LOGGING: {
			type: 'boolean',
			default: false,
		},
		HOST: {
			type: 'string',
			default: '0.0.0.0',
		},
		PORT: {
			type: 'integer',
			default: 3000,
		},
		DATABASE_URL: {
			type: 'string',
		},
		REDIS_URL: {
			type: 'string',
		},
		VAULT_ADDR: {
			type: 'string',
		},
		VAULT_TOKEN: {
			type: 'string',
		},
		PKI_MOUNT_NAME: {
			type: 'string',
		},
		PKI_ROLE_NAME: {
			type: 'string',
		},
		PKI_ISSUER_REF: {
			type: 'string',
		},
		PKI_CERT_EXPIRATION: {
			type: 'string',
		},
	},
};

export default ENV_SCHEMA;
