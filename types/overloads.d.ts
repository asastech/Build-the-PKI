import { AxiosInstance, AxiosRequestConfig } from 'axios';
import { Redis } from 'ioredis';
import { Knex } from 'knex';
import { models } from '../lib/server/models';

type ENV = 'development' | 'staging' | 'testing' | 'production';

type EnvSchema = {
	SERVICE_NAME: string;
	NODE_ENV: ENV;
	APP_ENV: ENV;
	REDIS_URL: string;
	LOG_LEVEL: 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace';
	DISABLE_LOGGING: boolean;
	HOST: string;
	PORT: number;
	DATABASE_URL: string;
	REDIS_URL: string;
	VAULT_ADDR: string;
	VAULT_TOKEN: string;
	PKI_MOUNT_NAME: string;
	PKI_ROLE_NAME: string;
	PKI_ISSUER_REF: string;
	PKI_CERT_EXPIRATION: string;
};

type VaultClientRequest = <T>(options: AxiosRequestConfig) => Promise<{
	data?: T;
	status: number;
	statusText?: string;
	error?: unknown;
	message?: string;
	errors?: Array<string>;
}>;

type ParseIntervalToMilliseconds = (input: string) => number;

declare module 'fastify' {
	interface FastifyInstance {
		env: EnvSchema;
		config: Record<string, string> & EnvSchema;
		cache: Redis;
		models: typeof models;
		knex: Knex<unknown, unknown[]>;
		axios: AxiosInstance;
		vault: {
			client: {
				/**
				 * Initiate an Axios HTTP request to a Vault instance
				 */
				request: VaultClientRequest;
			};
			/**
			 * Initializes a Vault instance with the required PKI options.
			 */
			initializeVaultPKI: () => Promise<[boolean, Record<string, any> | null]>;
		};
		utils: {
			/**
			 * Parses interval strings to milliseconds.
			 * @param input a time interval, e.g: '30s', '2d', '6h'
			 * @returns interval in milliseconds
			 */
			parseIntervalToMilliseconds: ParseIntervalToMilliseconds;
		};
	}
}
