const DAILY_9AM = '0 0 9 * * *';

module.exports = {
	getCronSchedule: (string) => {
		switch (string) {
			case 'DAILY_1AM':
				return '0 0 1 * * *';
			case 'DAILY_2AM':
				return '0 0 2 * * *';
			case 'DAILY_3AM':
				return '0 0 3 * * *';
			case 'DAILY_4AM':
				return '0 0 4 * * *';
			case 'DAILY_5AM':
				return '0 0 5 * * *';
			case 'DAILY_6AM':
				return '0 0 6 * * *';
			case 'DAILY_7AM':
				return '0 0 7 * * *';
			case 'DAILY_8AM':
				return '0 0 8 * * *';
			case 'DAILY_9AM':
				return DAILY_9AM;
			case 'EVERY_5_MINUTE':
				return '30 */5 * * * *';
			case 'EVERY_3_MINUTE':
				return '20 */3 * * * *';
			case 'EVERY_2_MINUTE':
				return '10 */2 * * * *';
			case 'EVERY_1_MINUTE':
				return '0 */1 * * * *';
			case 'EVERY_12_HOUR':
				return '0 50 */12 * * *';
			case 'EVERY_8_HOUR':
				return '0 10 */8 * * *';
			case 'EVERY_6_HOUR':
				return '0 40 */6 * * *';
			case 'EVERY_4_HOUR':
				return '0 50 */4 * * *';
			case 'EVERY_3_HOUR':
				return '0 30 */3 * * *';
			case 'EVERY_2_HOUR':
				return '0 20 */2 * * *';
			case 'EVERY_1_HOUR':
				return '0 10 */1 * * *';
			default:
				return DAILY_9AM;
		}
	},
	DAILY_9AM,
};