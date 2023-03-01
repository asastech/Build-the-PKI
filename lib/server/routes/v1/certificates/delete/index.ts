import { randomUUID } from 'crypto';
import { FastifyInstance } from 'fastify';
import { schema } from './spec.json';

interface IParams {
	certificateId: string;
}

export default async function registerDeleteCertificateRoute(
	fastify: FastifyInstance,
	_: unknown,
) {
	fastify.route<{ Params: IParams }>({
		method: 'DELETE',
		url: '/:certificateId',
		schema,
		handler: async (request, reply) => {
			const { Certificate } = fastify.models;
			const { certificateId } = request.params;

			const certificate = await Certificate.query().findById(certificateId);
			if (!certificate) {
				return reply.notFound('Certificate not found.');
			}

			const trx = await Certificate.startTransaction();

			try {
				const url = `/v1/${fastify.config.PKI_MOUNT_NAME}/revoke`;

				const response = await fastify.vault.client.request<{
					data: {
						revocation_time: number;
						revocation_time_rfc3339: string;
					};
				}>({
					url,
					method: 'POST',
					data: {
						serial_number: certificate.serialNumber,
					},
				});

				// Check if the request was successful to vault
				if (response.data && !response.error && !response.errors) {
					await certificate.$query(trx).patch({
						status: 'DELETED',
						deletedAt: new Date().toISOString(),
						deletedBy: 'USER',
						deletedById: randomUUID(), // replace with userId from auth header
					});

					await trx.commit();

					return reply.status(200).send({
						success: true,
						message: 'Successfully deleted and revoked a Certificate.',
					});
				}
			} catch (error) {
				fastify.log.error(
					error,
					'An error occured while attempting to revoke a Certificate from vault.',
				);
				await trx.rollback();
				return reply.internalServerError(
					'Something went wrong while revoking a Certificate. Please try again in a bit.',
				);
			}
		},
	});
}
