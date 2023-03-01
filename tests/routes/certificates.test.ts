import '../../types/overloads.d';
import { FastifyInstance } from 'fastify';
import { bootstrap } from '../../lib/server';
import { v4 as uuid } from 'uuid';

describe('certificate routes', () => {
	let server: FastifyInstance;
	beforeAll(async () => {
		server = await bootstrap();
		await server.ready();

		const healthCheckResponse = await server.inject({
			path: '/health',
			method: 'GET',
		});

		const healthy = healthCheckResponse.statusCode === 200;

		if (!healthy) {
			console.error(healthCheckResponse);
			process.exit(677);
		}

		const [vaultInitialized, error] = await server.vault.initializeVaultPKI();
		if (!vaultInitialized && error) {
			console.error(error);
			process.exit(676);
		}
	});

	const account = { id: uuid() };

	describe('create', () => {
		test('successfully creates a certificate', async () => {
			const response = await server.inject({
				method: 'POST',
				url: '/v1/certificates',
				payload: {
					accountId: account.id,
					description: 'A testing certificate',
					commonName: 'loki-integration-testing.ofin.co',
					ttl: '24h',
				},
			});

			const responseBody = JSON.parse(response.payload) as {
				success: boolean;
				message: string;
			};

			expect(response.statusCode).toEqual(200);
			expect(responseBody.success).toBeTruthy();
			expect(responseBody.message).toEqual(
				'Successfully created a new Certificate!',
			);
		});
		test('fails to create due to a common name and account conflict', async () => {
			const response = await server.inject({
				method: 'POST',
				url: '/v1/certificates',
				payload: {
					accountId: account.id,
					description: 'A testing certificate',
					commonName: 'loki-integration-testing.ofin.co',
					ttl: '24h',
				},
			});

			const responseBody = JSON.parse(response.payload) as {
				error: string;
				message: string;
			};

			expect(response.statusCode).toEqual(400);
			expect(responseBody.error).toEqual('Bad Request');
			expect(responseBody.message).toEqual(
				'A Certificate is already issued for loki-integration-testing.ofin.co.',
			);
		});
	});

	describe('delete', () => {
		test('successfully deletes a certificate', async () => {
			const createCertificateResponse = await server.inject({
				method: 'POST',
				url: '/v1/certificates',
				payload: {
					accountId: uuid(),
					description: 'A testing certificate',
					commonName: 'loki-integration-testing.ofin.co',
					ttl: '24h',
				},
			});

			const createCertificateResponseBody = JSON.parse(
				createCertificateResponse.payload,
			) as { data: { certificateId: string } };

			const response = await server.inject({
				method: 'DELETE',
				url: `/v1/certificates/${createCertificateResponseBody.data.certificateId}`,
			});

			expect(response.statusCode).toEqual(200);
			expect(JSON.parse(response.payload)).toEqual({
				success: true,
				message: 'Successfully deleted and revoked a Certificate.',
			});
		});
		test('fails to delete a not-existing certificate', async () => {
			const response = await server.inject({
				method: 'DELETE',
				url: `/v1/certificates/${uuid()}`,
			});

			expect(response.statusCode).toEqual(404);
			expect(JSON.parse(response.payload)).toEqual({
				error: 'Not Found',
				message: 'Certificate not found.',
				statusCode: 404,
			});
		});
	});

	describe('fetch', () => {
		test('successfully fetches a certificate', async () => {
			const createCertificateResponse = await server.inject({
				method: 'POST',
				url: '/v1/certificates',
				payload: {
					accountId: uuid(),
					description: 'A testing certificate',
					commonName: 'loki-integration-testing.ofin.co',
					ttl: '24h',
				},
			});

			const createCertificateResponseBody = JSON.parse(
				createCertificateResponse.payload,
			) as { data: { certificateId: string } };

			const response = await server.inject({
				method: 'GET',
				url: `/v1/certificates/${createCertificateResponseBody.data.certificateId}`,
			});

			const responseBody = JSON.parse(response.payload) as {
				success: boolean;
				message: string;
				data: {
					certificate: {
						id: string;
						accountId: string;
						description: string;
						commonName: string;
						serialNumber: string;
						status: string;
						deletedBy: string;
						deletedById: string;
						expiresAt: string;
						updatedAt: string;
						createdAt: string;
						deletedAt: string;
					};
				};
			};

			expect(response.statusCode).toEqual(200);
			expect(responseBody.success).toBeTruthy();
			expect(responseBody.message).toEqual(
				'Successfully fetched a Certificate.',
			);
			expect(responseBody.data.certificate.id).toEqual(
				createCertificateResponseBody.data.certificateId,
			);
		});
		test('fails to fetch a non-existing certificate', async () => {
			const response = await server.inject({
				method: 'GET',
				url: `/v1/certificates/${uuid()}`,
			});

			expect(response.statusCode).toEqual(404);
			expect(JSON.parse(response.payload)).toEqual({
				error: 'Not Found',
				message: 'Certificate not found.',
				statusCode: 404,
			});
		});
	});

	describe('listByAccountId', () => {
		test('successfully lists certificates', async () => {
			const response = await server.inject({
				method: 'GET',
				url: `/v1/certificates/account/${account.id}`,
			});

			const responseBody = JSON.parse(response.payload) as {
				success: boolean;
				message: string;
				data: {
					certificates: {
						id: string;
						accountId: string;
						description: string;
						commonName: string;
						serialNumber: string;
						status: string;
						deletedBy: string;
						deletedById: string;
						expiresAt: string;
						updatedAt: string;
						createdAt: string;
						deletedAt: string;
					}[];
				};
			};

			expect(response.statusCode).toEqual(200);
			expect(responseBody.success).toBeTruthy();
			expect(responseBody.message).toEqual(
				'Successfully listed all Certificates.',
			);
			expect(Array.isArray(responseBody.data.certificates)).toBeTruthy();
			expect(responseBody.data.certificates.length).toBeGreaterThanOrEqual(1);
		});
	});
});
