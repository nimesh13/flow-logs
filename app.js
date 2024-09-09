const fs = require('fs');
const readline = require('readline');
const csv = require('csv-parser');

async function parseLookUpFile(lookUpFile) {
	const results = [];
	return new Promise((resolve, reject) => {
		const lookup = {};
		fs.createReadStream('lookup_table.csv')
		.pipe(csv())
		.on('data', (row) => {
			if (Object.values(row).some(value => value.trim() !== '')) {
				results.push(row);
				const key = `${row.dstport}_${row.protocol}`;
                lookup[key] = row.tag;
			}
		})
		.on('end', () => {
			resolve(lookup);
		})
		.on('error', (error) => {
			reject(error);
		});
	});
}

async function main() {
	const flowLogsFile = process.argv[2];
	const lookUpFile = process.argv[3];
	const outputFileName = process.argv[4];

	if (!flowLogsFile || !lookUpFile || !outputFileName) {
		console.error('Usage: node script.js <flow_logs_file> <lookup_file> <output_file>');
		process.exit(1);
	}

	const lookup = await parseLookUpFile(lookUpFile);
	console.log(lookup);
}

main();