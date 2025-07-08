import { chromium } from 'playwright';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();
import { nextDoorConfig } from './nextDoorConfig.js';
const { url, selectors } = nextDoorConfig;
import {
	getKeywords,
	convertArrayToJSON,
	convertJSONToTxt,
	writeToFile,
	readFromFile,
	filterDiffJSON,
} from './helpers.js';

async function loginToNextDoor(page) {
	await page.goto(`${url}/login/`);

	await page.fill('input[id="id_email"]', process.env.EMAIL_USER);
	await page.fill('input[id="id_password"]', process.env.NEXTDOOR_PASS);

	await page.click('button[type="submit"]');
}

async function extractPostData(page) {
	const postElements = await page.$$(selectors.post);
	let numFiltered = 0;
	let filteredPosts = [];

	for (const post of postElements) {
		const name = await post.$eval(selectors.name, (el) => el.textContent).catch(() => '');
		const text = await post.$eval(selectors.text, (el) => el.textContent).catch(() => '');
		const time = await post.$eval(selectors.time, (el) => el.textContent).catch(() => '');
		const href = await post.$eval(selectors.name, (el) => el.getAttribute('href')).catch(() => '');
		const keywords = getKeywords(text);

		if (keywords.length > 0) {
			filteredPosts.push({
				name: name.trim(),
				text: text.trim(),
				time: time.trim(),
				href: url.trim() + href.trim(),
				keywords: keywords,
			});
			numFiltered++;
		}
	}

	const oldJSON = (await readFromFile(process.env.JSON_FILE_PATH)) || [];

	const postsJSON = convertArrayToJSON(filteredPosts);
	const postsTXT = convertJSONToTxt(postsJSON);
	writeToFile(postsJSON, process.env.JSON_FILE_PATH);
	writeToFile(postsTXT, process.env.TXT_FILE_PATH);

	if (oldJSON.length > 0) {
		const diffPostsJSON = filterDiffJSON(postsJSON, oldJSON);
		const diffPostsTXT = convertJSONToTxt(diffPostsJSON);
		writeToFile(diffPostsJSON, process.env.JSON_DIFF_FILE_PATH);
		writeToFile(diffPostsTXT, process.env.TXT_DIFF_FILE_PATH);
		return convertJSONToTxt(diffPostsJSON);
	}
	return postsTXT;
}

async function scrollToLoadPosts(page, durationSec = 30) {
	const filterDiv = await page.waitForSelector(`div.${selectors.filter}`, { timeout: 10000 });
	const filterButton = await filterDiv.evaluateHandle((div) => div.closest('button'));
	await filterButton.click();

	await page.waitForSelector('text=Recent', { timeout: 5000 });
	await page.click('text=Recent');

	await page.waitForSelector(selectors.post, { timeout: 15000 });

	const start = Date.now();
	while (Date.now() - start < durationSec * 1000) {
		await page.evaluate(() => {
			window.scrollBy(0, 20 * window.innerHeight);
		});
		await page.waitForTimeout(1000);
	}
}

async function sendNextDoorUpdateEmail(text) {
	const transporter = nodemailer.createTransport({
		service: 'gmail',
		auth: {
			user: process.env.EMAIL_USER,
			pass: process.env.EMAIL_PASS,
		},
	});

	const mailOptions = {
		from: process.env.EMAIL_USER,
		to: process.env.EMAIL_USER,
		subject: 'Nextdoor Posts',
		text: text,
	};

	await transporter.sendMail(mailOptions);
	console.log('Email sent!');
}

async function main() {
	const browser = await chromium.launch({ headless: true });

	const page = await browser.newPage();

	await loginToNextDoor(page);

	await scrollToLoadPosts(page, 30);

	const emailTXT = await extractPostData(page);

	await sendNextDoorUpdateEmail(emailTXT);

	await browser.close();
}

main();
