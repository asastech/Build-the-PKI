import { JSONSchema } from 'objection';
import BaseModel from './Base';

export default class Certificate extends BaseModel {
	id!: string;
	accountId!: string;
	description!: string;
	commonName!: string;
	serialNumber!: string;
	status!: 'ISSUED' | 'REVOKED' | 'EXPIRED' | 'DELETED';
	deletedBy?: 'USER' | 'SYSTEM' | 'ADMIN';
	deletedById?: string;
	expiresAt!: string;
	createdAt!: string;
	updatedAt!: string;
	deletedAt?: string;

	static override get tableName(): string {
		return 'Certificate';
	}

	static override get jsonSchema(): JSONSchema {
		return {
			type: 'object',
			required: ['accountId', 'commonName', 'serialNumber', 'expiresAt'],

			properties: {
				id: { type: 'string', format: 'uuid' },
				accountId: { type: 'string', format: 'uuid' },
				description: { type: 'string' },
				commonName: { type: 'string' },
				serialNumber: { type: 'string' },
				status: {
					type: 'string',
					enum: ['ISSUED', 'REVOKED', 'EXPIRED', 'DELETED'],
				},
				deletedBy: { type: 'string', enum: ['USER', 'SYSTEM', 'ADMIN'] },
				deletedById: { type: 'string', format: 'uuid' },
				expiresAt: { type: 'string', format: 'date-time' },
				updatedAt: { type: 'string', format: 'date-time' },
				createdAt: { type: 'string', format: 'date-time' },
				deletedAt: { type: 'string', format: 'date-time' },
			},
		};
	}
}
