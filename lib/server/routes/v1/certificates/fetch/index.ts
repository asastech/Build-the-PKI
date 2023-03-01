import { FastifyInstance } from 'fastify';
import { schema } from './spec.json';

interface IParams {
	certificateId: string;
}

export default async function registerFetchCertificateRoute(
	fastify: FastifyInstance,
	_: unknown,
) {
	fastify.route<{ Params: IParams }>({
		method: 'GET',
		url: '/:certificateId',
		schema,
		handler: async (request, reply) => {
			const { Certificate } = fastify.models;
			const { certificateId } = request.params;

			const certificate = await Certificate.query().findById(certificateId);
			if (!certificate) {
				return reply.notFound('Certificate not found.');
			}

			return reply.status(200).send({
				success: true,
				message: 'Successfully fetched a Certificate.',
				data: { certificate },
			});
		},
	});
}
