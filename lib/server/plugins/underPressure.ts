import fastifyPlugin from 'fastify-plugin';
import underPressureFastifyPlugin from '@fastify/under-pressure';
import { FastifyInstance } from 'fastify';

async function underPressure(fastify: FastifyInstance) {
	await fastify.register(underPressureFastifyPlugin, {
		exposeStatusRoute: {
			routeOpts: {
				logLevel: fastify.config.LOG_LEVEL,
			},
			url: '/health',
		},
		healthCheck: async function (fastifyInstance) {
			try {
				const dbIsAlive =
					(await fastifyInstance.knex.raw('select 1+1 as result')).rows[0]
						.result === 2;

				await fastifyInstance.cache.set('connection_test', 'true', 'EX', 3);
				const cacheIsAlive =
					(await fastifyInstance.cache.get('connection_test')) === 'true';

				const vaultHealthCheckRequest = await fastify.vault.client.request<{
					initialized: boolean;
					sealed: boolean;
					standby: boolean;
				}>({
					method: 'GET',
					url: '/v1/sys/health?standbyok=true',
				});

				let vaultIsAlive = false;

				if (vaultHealthCheckRequest && vaultHealthCheckRequest.data) {
					const { initialized, sealed, standby } = vaultHealthCheckRequest.data;
					const { status, statusText } = vaultHealthCheckRequest;
					vaultIsAlive =
						status === 200 &&
						statusText === 'OK' &&
						initialized &&
						!sealed &&
						!standby;
				}

				fastify.log.debug(
					{
						vaultIsAlive,
						dbIsAlive,
						cacheIsAlive,
					},
					'Health checks',
				);

				if (cacheIsAlive && dbIsAlive && vaultIsAlive) {
					return true;
				}

				return false;
			} catch (error) {
				fastify.log.error(
					error,
					'An error occured while attempting to run a health check.',
				);

				return false;
			}
		},
		healthCheckInterval: 5000, // Every 5 seconds
	});
}

export default fastifyPlugin(underPressure, {
	name: 'underPressure',
	dependencies: ['config', 'vault', 'models', 'cache'],
});
