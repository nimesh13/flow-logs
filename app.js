const fs = require('fs');
const readline = require('readline');
const csv = require('csv-parser');
const protocols = require('./protocols');

async function parseLookUpFile(lookUpFile) {
	const results = [];
	return new Promise((resolve, reject) => {
		const lookup = {};
		fs.createReadStream(lookUpFile)
			.pipe(csv())
			.on('data', (row) => {
				if (Object.values(row).some(value => value.trim() !== '')) {
					results.push(row);
					const key = `${row.dstport}_${row.protocol.toLowerCase()}`;
					lookup[key] = row.tag.toLowerCase();
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

async function parseFlowLogsFile(flowLogsFile, lookupTable) {
	const tagsExistsCount = {};
	const portProtocolCount = {};

	try {
		const data = fs.readFileSync(flowLogsFile, 'utf8');
		const rows = data.trim().split('\n').filter(line => line.trim() !== '');

		rows.forEach(row => {
			const fields = row.split(' ');
			const dstport = fields[6];
			const protocol = protocols[fields[7]];
			const key = `${dstport}_${protocol.toLowerCase()}`;
			const tag = lookupTable[key] || 'Untagged';

			if (!tagsExistsCount[tag]) {
				tagsExistsCount[tag] = 0;
			}
			tagsExistsCount[tag]++;

			if (!portProtocolCount[key]) portProtocolCount[key] = 0;
			portProtocolCount[key]++;
		});

		return { tagsExistsCount, portProtocolCount };
	} catch (error) {
		console.log('ERROR processing flow logs file', error);
	}
}

async function writeToFile(data, outputFileName) {
	try {
		const { tagsExistsCount, portProtocolCount } = data;
		let output = 'Tag Counts:\nTag, Count\n';
		for (const [tag, count] of Object.entries(tagsExistsCount)) {
			output += `${tag}, ${count}\n`;
		}

		output += '\nPort/Protocol Combination Counts:\nPort, Protocol, Count\n';
		for (const [key, count] of Object.entries(portProtocolCount)) {
			const [port, protocol] = key.split('_');
			output += `${port}, ${protocol}, ${count}\n`;
		}

		fs.writeFileSync(outputFileName, output);
		console.log('Output file written successfully.');

	} catch (error) {
		console.log('ERROR writing to file', error);
	}
}

async function main() {
	const flowLogsFile = process.argv[2];
	const lookUpFile = process.argv[3];
	const outputFileName = process.argv[4];

	if (!flowLogsFile || !lookUpFile || !outputFileName) {
		console.error('Usage: node script.js <flow_logs_file> <lookup_file> <output_file>');
		process.exit(1);
	}

	const lookupTable = await parseLookUpFile(lookUpFile);
	const data = await parseFlowLogsFile(flowLogsFile, lookupTable);
	await writeToFile(data, outputFileName);
}

main();