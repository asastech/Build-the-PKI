import '../types/overloads.d';
import { FastifyInstance } from 'fastify';
import { bootstrap } from '../lib/server';

describe('server', () => {
	let server: FastifyInstance;
	beforeAll(async () => {
		server = await bootstrap();
		await server.ready();
	});

	test('registers config plugin', async () => {
		expect(server.config).toBeTruthy();
	});

	test('registers vault plugin', async () => {
		expect(server.vault).toBeTruthy();
	});

	test('registers db plugin', async () => {
		expect(server.models).toBeTruthy();
		expect(server.knex).toBeTruthy();
	});

	test('registers cache plugin', async () => {
		expect(server.cache).toBeTruthy();
	});
});
