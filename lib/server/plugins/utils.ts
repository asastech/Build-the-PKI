import { FastifyInstance } from 'fastify';
import fastifyPlugin from 'fastify-plugin';

async function utils(fastify: FastifyInstance) {
	/**
	 * Parses interval strings to milliseconds.
	 * @param input a time interval, e.g: '30s', '2d', '6h'
	 * @returns interval in milliseconds
	 */
	const parseIntervalToMilliseconds = (input: string): number => {
		const oneSecondInMs = 1000;
		const oneMinuteInMs = 60 * oneSecondInMs;
		const oneHourInMs = 60 * oneMinuteInMs;
		const oneDayInMs = 24 * oneHourInMs;

		const secondsRegex = /^([0-9]{1,})s$/g;
		const minutesRegex = /^([0-9]{1,})m$/g;
		const hoursRegex = /^([0-9]{1,})h$/g;
		const daysRegex = /^([0-9]{1,})d$/g;

		if (secondsRegex.test(input)) {
			const numberInput = input.split('s')[0];
			if (!numberInput) {
				throw new Error(`Invalid number input: ${input}`);
			}
			const numericInterval = parseInt(numberInput, 10);
			return oneSecondInMs * numericInterval;
		}

		if (minutesRegex.test(input)) {
			const numberInput = input.split('m')[0];
			if (!numberInput) {
				throw new Error(`Invalid number input: ${input}`);
			}
			const numericInterval = parseInt(numberInput, 10);
			return oneMinuteInMs * numericInterval;
		}

		if (hoursRegex.test(input)) {
			const numberInput = input.split('h')[0];
			if (!numberInput) {
				throw new Error(`Invalid number input: ${input}`);
			}
			const numericInterval = parseInt(numberInput, 10);
			return oneHourInMs * numericInterval;
		}

		if (daysRegex.test(input)) {
			const numberInput = input.split('d')[0];
			if (!numberInput) {
				throw new Error(`Invalid number input: ${input}`);
			}
			const numericInterval = parseInt(numberInput, 10);
			return oneDayInMs * numericInterval;
		}

		throw new Error(
			`Invalid interval: ${input}. Must be an integer followed either by 's', 'm', 'h' or 'd' for seconds, minutes, hours and days respectively.`,
		);
	};

	fastify.decorate('utils', {
		parseIntervalToMilliseconds,
	});
}

export default fastifyPlugin(utils, {
	name: 'utils',
});
