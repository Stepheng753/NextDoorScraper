import { format } from 'date-fns';
import keywordsJson from './keywords.json' with { type: 'json' };

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
