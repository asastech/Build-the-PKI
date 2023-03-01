import { FastifyInstance } from 'fastify';
import { OrderByDirection } from 'objection';
import { schema } from './spec.json';

interface IParams {
	accountId: string;
}

interface IQuery {
	limit: number;
	offset: number;
	field: string;
	direction: OrderByDirection;
}

export default async function registerListCertificatesByAccountIdRoute(
	fastify: FastifyInstance,
	_: unknown,
) {
	fastify.route<{ Params: IParams; Querystring: IQuery }>({
		method: 'GET',
		url: '/account/:accountId',
		schema,
		handler: async (request, reply) => {
			const { Certificate } = fastify.models;
			const { accountId } = request.params;
			const { limit, offset, field, direction } = request.query;

			const certificates = await Certificate.query()
				.where({ accountId })
				.limit(limit)
				.offset(offset)
				.orderBy(field, direction);

			return reply.status(200).send({
				success: true,
				message: 'Successfully listed all Certificates.',
				data: { certificates },
			});
		},
	});
}
