import { FastifyInstance } from 'fastify';
import registerCreateCertificateRoute from './create';
import registerFetchCertificateRoute from './fetch';
import registerDeleteCertificateRoute from './delete';
import registerListCertificatesByAccountIdRoute from './listByAccountId';

export default async function registerCertificateRoutes(
	fastify: FastifyInstance,
) {
	await fastify.register(registerCreateCertificateRoute);
	await fastify.register(registerFetchCertificateRoute);
	await fastify.register(registerDeleteCertificateRoute);
	await fastify.register(registerListCertificatesByAccountIdRoute);
}
