import { chromium } from 'playwright';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();
import { url, selectors } from './config.js';
import {
	clickButton,
	fillTextBox,
	getKeywords,
	convertArrayToJSON,
	convertJSONToTxt,
	writeToFile,
	readFromFile,
	filterDiffJSON,
	getTimestamp,
} from './helpers.js';

async function loginToNextDoor(page) {
	await page.goto(`${url}/login/`);

	await fillTextBox(page, 'textBox', 'Email', process.env.EMAIL_USER);
	await fillTextBox(page, 'textBox', 'Password', process.env.NEXTDOOR_PASS);
	await clickButton(page, 'button', 'Log in');
}

async function scrollToLoadPosts(page, durationSec = 30) {
	await clickButton(page, 'button', 'Filter');
	await clickButton(page, 'menuitem', 'Recent');

	await page.waitForSelector(selectors.post, { timeout: 30000 });

	const start = Date.now();
	while (Date.now() - start < durationSec * 1000) {
		await page.evaluate(() => {
			window.scrollBy(0, 20 * window.innerHeight);
		});
		await page.waitForTimeout(1000);
	}
}

async function extractPostData(page) {
	const postElements = await page.$$(selectors.post);
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
		}
	}

	return filteredPosts;
}

async function writeFiles(filteredPosts) {
	const oldJSON = (await readFromFile(process.env.JSON_FILE_PATH)) || [];
	const oldTXT = (await readFromFile(process.env.TXT_FILE_PATH)) || [];

	const postsJSON = convertArrayToJSON(filteredPosts);
	const postsTXT = convertJSONToTxt(postsJSON);
	writeToFile(postsJSON, process.env.JSON_FILE_PATH);
	writeToFile(postsTXT, process.env.TXT_FILE_PATH);

	if (oldJSON.length > 0) {
		const diffPostsJSON = filterDiffJSON(postsJSON, oldJSON);
		const diffPostsTXT = convertJSONToTxt(diffPostsJSON);
		writeToFile(diffPostsJSON, process.env.DIFF_JSON_FILE_PATH);
		writeToFile(diffPostsTXT, process.env.DIFF_TXT_FILE_PATH);

		writeToFile(oldJSON, process.env.PREV_JSON_FILE_PATH);
		writeToFile(oldTXT, process.env.PREV_TXT_FILE_PATH);

		return JSON.parse(diffPostsJSON).length > 0 ? convertJSONToTxt(diffPostsJSON) : '';
	}
	return postsTXT;
}

async function sendNextDoorUpdateEmail(text, subject = 'Nextdoor Posts') {
	if (!text || text.length === 0) {
		console.log('No new posts to send via email.');
		return;
	}

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
		subject: subject,
		text: text,
	};

	await transporter.sendMail(mailOptions);
	console.log('Email sent!');
}

async function logRunTime() {
	const logTime = getTimestamp();
	const jsonFile = await readFromFile(process.env.JSON_FILE_PATH);
	const numPosts = jsonFile ? JSON.parse(jsonFile).length : 0;

	const logMessage = `NextDoor Scraper : ${logTime} : ${numPosts} Posts\n`;
	await writeToFile(logMessage, process.env.LOG_FILE_PATH, true);
}

async function main() {
	let browser;
	try {
		browser = await chromium.launch({ headless: true });
		const page = await browser.newPage();

		await loginToNextDoor(page);

		await scrollToLoadPosts(page, 20);

		const filteredPosts = await extractPostData(page);

		const emailTXT = await writeFiles(filteredPosts);

		await sendNextDoorUpdateEmail(emailTXT, 'Nextdoor Posts');

		await logRunTime();

		await browser.close();
	} catch (error) {
		await sendNextDoorUpdateEmail(error, 'Nextdoor Scraper Error');

		if (browser) {
			await browser.close();
		}
	}
}

main();
