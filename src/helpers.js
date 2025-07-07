import { format } from 'date-fns';
import keywordsJson from './keywords.json' with { type: 'json' };

export function getTimestamp() {
	return format(new Date(), 'MM/dd/yyyy - hh:mm:ss a');
}

export function getKeywords(text) {
	const keywords = keywordsJson.keywords;
	const textSplit = text.toLowerCase().split(' ');
	return keywords.filter((keyword) => textSplit.includes(keyword.toLowerCase()));
}
