const { CronJob } = require('cron');
const chalk = require('chalk');
const path = require('path');
const moment = require('moment');
const schedule = require('./cron.schedule');

async function runCronJob(scriptPath, cronSchedule) {
	try {
		let child;
		const { spawn } = require('child_process'); // eslint-disable-line
		try {
			child = spawn(`node ${path.resolve(__dirname, scriptPath)}`, {
				shell: true,
				stdio: [null, null, null, 'pipe'],
			});
		} catch (error) {
			console.log('Cron Service Error SPAWN Error cron service 1 :', error);
		}
		try {
			child.stdout.on('data', (data) => {
				console.log(data.toString());
			});
		} catch (error) {
			console.log('Cron Service Error SPAWN Error cron service 2 :', error);
		}
		try {
			child.stderr.on('data', (data) => {
				console.error(data.toString());
			});
		} catch (error) {
			console.log('Cron Service Error SPAWN Error cron service 3 :', error);
		}
		try {
			child.on('exit', (code) => {
				console.log(`Child exited with code ${code}`);
			});
		} catch (error) {
			console.log('Cron Service Error SPAWN Error cron service 4 :', error);
		}
		try {
			child.on('close', (code) => {
				console.log(`Child close with code ${code}`);
			});
		} catch (error) {
			console.log('Cron Service Error SPAWN Error cron service 5 :', error);
		}
		try {
			child.stdio[3].on('data', (data) => {
				if (data.toString() === 'KillCronJob') {
					console.log(data.toString());
					child.kill();
				}
			});
		} catch (error) {
			console.log('Cron Service Error SPAWN Error cron service 6 :', error);
		}
		console.log('%s%s CronJob scheduled', chalk.green(`[${moment().format('HH:mm:ss')}]`), chalk.green(`[${cronSchedule}]`));
	} catch (error) {
		console.log('SPAWN Error cron service run:', error);
	}
}

module.exports = {
	async init(jobs) {
		try {
			// jobs structure should be [{script_path:<relative script path>, schedule: <schedule value>},{script_path:<relative script path>, schedule: <schedule value>}]
			jobs.forEach((job) => {
				const cronJob = new CronJob(schedule.getCronSchedule(job.schedule), () => runCronJob(job.script_path, schedule.getCronSchedule(job.schedule)), null);
				cronJob.start();
			});
		} catch (error) {
			console.log(chalk.red('Failed to setup cron'), error);
			console.log('Cron Service Error Failed to setup cron init:', error);
		}
	},
	runCronJob,
};
