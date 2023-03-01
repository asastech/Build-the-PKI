import { FastifyInstance } from 'fastify';
import registerV1Routes from './v1';

export default async function RegisterRoutes(
	fastify: FastifyInstance,
	_: unknown,
) {
	await fastify.register(registerV1Routes, { prefix: 'v1' });
}
