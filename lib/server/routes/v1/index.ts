import { FastifyInstance } from 'fastify';
import registerCertificatesRoutes from './certificates';

export default async function RegisterV1Routes(
	fastify: FastifyInstance,
	_: unknown,
) {
	await fastify.register(registerCertificatesRoutes, {
		prefix: 'certificates',
	});
}
