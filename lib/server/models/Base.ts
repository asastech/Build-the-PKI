import { Model, mixin, AjvValidator, Validator } from 'objection';
import { DBErrors } from 'objection-db-errors';
import applyFormats from 'ajv-formats';

export default class BaseModel extends mixin(Model, [DBErrors]) {
	static override get modelPaths(): string[] {
		return [__dirname];
	}

	static override createValidator(): Validator {
		return new AjvValidator({
			onCreateAjv(ajv) {
				applyFormats(ajv);
			},
			options: {
				allErrors: true,
				removeAdditional: 'all',
				useDefaults: true,
				coerceTypes: true,
				validateSchema: true,
				ownProperties: true,
			},
		});
	}
}
