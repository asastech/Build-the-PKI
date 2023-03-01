import { FastifyInstance } from 'fastify';
import { schema } from './spec.json';

interface IBody {
	accountId: string;
	description: string;
	commonName: string;
	ttl: string;
}

export default async function registerCreateCertificateRoute(
	fastify: FastifyInstance,
	_: unknown,
) {
	fastify.route<{ Body: IBody }>({
		method: 'POST',
		url: '/',
		schema,
		handler: async (request, reply) => {
			const { Certificate } = fastify.models;
			const { accountId, description, commonName, ttl } = request.body;

			const commonNameTaken = await Certificate.query().findOne({
				accountId,
				commonName,
			});
			if (commonNameTaken) {
				return reply.badRequest(
					`A Certificate is already issued for ${commonName}.`,
				);
			}

			const trx = await Certificate.startTransaction();

			try {
				const requestCertificateUrl = `/v1/${fastify.config.PKI_MOUNT_NAME}/issue/${fastify.config.PKI_ROLE_NAME}`;

				const requestCertificateResponse = await fastify.vault.client.request<{
					data: {
						certificate: string;
						issuing_ca: string;
						private_key: string;
						serial_number: string;
					};
				}>({
					url: requestCertificateUrl,
					method: 'POST',
					data: {
						common_name: commonName,
						ttl,
					},
				});

				// Check if the request was successful to vault
				if (
					requestCertificateResponse.data &&
					!requestCertificateResponse.error &&
					!requestCertificateResponse.errors
				) {
					const {
						certificate,
						issuing_ca: ca,
						private_key: privateKey,
						serial_number: serialNumber,
					} = requestCertificateResponse.data.data;

					const expiresAt = new Date(
						Date.now() + fastify.utils.parseIntervalToMilliseconds(ttl),
					).toISOString();

					const createdCertificate = await Certificate.query(
						trx,
					).insertAndFetch({
						accountId,
						description,
						commonName,
						serialNumber,
						status: 'ISSUED',
						expiresAt,
					});
					await trx.commit();

					return reply.status(200).send({
						success: true,
						message: 'Successfully created a new Certificate!',
						data: {
							certificateId: createdCertificate.id,
							certificate,
							ca,
							privateKey,
							expiresAt,
							serialNumber,
						},
					});
				}
			} catch (error) {
				fastify.log.error(
					error,
					'An error occured while attempting to create a certificate.',
				);
				await trx.rollback();
				return reply.internalServerError(
					'Something went wrong while generating a Certificate. Please try again in a bit.',
				);
			}
		},
	});
}
