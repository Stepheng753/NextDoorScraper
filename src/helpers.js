import { format } from 'date-fns';
import { writeFile, readFile } from 'fs/promises';
import keywordsJson from './keywords.json' with { type: 'json' };
import { nextDoorConfig } from './nextDoorConfig.js';
const { lineBreak } = nextDoorConfig;

export function getTimestamp() {
	return format(new Date(), 'MM/dd/yyyy - hh:mm:ss a');
}

export function getKeywords(text) {
	const { keywords = [] } = keywordsJson;
	const foundKeywords = new Set();
	const lowerText = text.toLowerCase();

	for (const keyword of keywords) {
		// `\b` is a word boundary, ensuring we match whole words/phrases only.
		const regex = new RegExp(`\\b${keyword}\\b`, 'g');
		if (regex.test(lowerText)) {
			foundKeywords.add(keyword);
		}
	}

	return Array.from(foundKeywords);
}

export function convertArrayToJSON(array) {
	return JSON.stringify(array, null, 4);
}

export function convertJSONToTxt(json) {
	const array = JSON.parse(json);
	let output = `Scrape Time: ${getTimestamp()}\n`;
	output += `Found ${array.length} posts.\n`;
	output += lineBreak;

	array.forEach((item) => {
		output += `${item.name} : ${item.time}\n`;
		output += `${item.href}\n`;
		output += `[${item.keywords.join(', ')}]\n\n`;
		output += `${item.text}\n`;
		output += lineBreak;
	});
	return output;
}

export async function writeToFile(data, filePath) {
	try {
		await writeFile(filePath, data, 'utf-8');
		return console.log(`Posts written to ${filePath}`);
	} catch (error) {
		return console.error(`Error writing to file ${filePath}:`, error);
	}
}

export async function readFromFile(filePath) {
	try {
		const data = await readFile(filePath, 'utf-8');
		return data;
	} catch (error) {
		return null;
	}
}

export function filterDiffJSON(newJSON, oldJSON) {
	const newPosts = JSON.parse(newJSON);
	const oldPosts = JSON.parse(oldJSON);

	const oldPostSet = new Set(oldPosts.map((post) => post.text.trim()));
	const diffPosts = newPosts.filter((post) => !oldPostSet.has(post.text.trim()));

	return convertArrayToJSON(diffPosts);
}
