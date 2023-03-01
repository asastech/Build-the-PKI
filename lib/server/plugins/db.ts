import { FastifyInstance } from 'fastify';
import fastifyPlugin from 'fastify-plugin';
import Knex from 'knex';
import { Model, knexSnakeCaseMappers } from 'objection';
import { models } from '../models';

async function db(fastify: FastifyInstance, _: unknown) {
	const knex = Knex({
		client: 'pg',
		connection: fastify.config.DATABASE_URL,
		searchPath: ['public', 'loki'],
		pool: {
			min: 2,
			max: 10,
		},
		debug: fastify.config.LOG_LEVEL === 'debug',
		log: {
			warn(message: string) {
				fastify.log.warn(message);
			},
			error(message: string) {
				fastify.log.error(message);
			},
			debug(message: string) {
				fastify.log.debug(message);
			},
			enableColors: fastify.config.NODE_ENV === 'development',
		},
		...knexSnakeCaseMappers(),
	});

	Model.knex(knex);
	fastify.decorate('knex', knex);
	fastify.decorate('models', models);
}

export default fastifyPlugin(db, {
	name: 'models',
	dependencies: ['config'],
});
