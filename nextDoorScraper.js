import { chromium } from 'playwright';
import { writeFile, readFile } from 'fs/promises';
import nodemailer from 'nodemailer';
import { format } from 'date-fns';
import dotenv from 'dotenv';
dotenv.config();
import { nextDoorConfig } from './nextDoorConfig.js';
const { url, selectors, lineBreak } = nextDoorConfig;

async function loginToNextDoor(page) {
	await page.goto(`${url}/login/`);

	await page.fill('input[id="id_email"]', process.env.EMAIL_USER);
	await page.fill('input[id="id_password"]', process.env.NEXTDOOR_PASS);

	await page.click('button[type="submit"]');
}

function getTimestamp() {
	return format(new Date(), 'MM/dd/yyyy - hh:mm:ss a');
}

async function extractPostData(page) {
	const postElements = await page.$$(selectors.post);

	let output = `Scrape Time: ${getTimestamp()}\n`;
	output += `Found ${postElements.length} posts.\n`;
	output += lineBreak;

	for (const post of postElements) {
		const name = await post.$eval(selectors.name, (el) => el.textContent).catch(() => '');
		const text = await post.$eval(selectors.text, (el) => el.textContent).catch(() => '');
		const location = await post.$eval(selectors.location, (el) => el.textContent).catch(() => '');
		const time = await post.$eval(selectors.time, (el) => el.textContent).catch(() => '');
		const href = await post.$eval(selectors.name, (el) => el.getAttribute('href')).catch(() => '');

		let returnString = `${name} : ${text}\n`;
		returnString += `${location} : ${time}\n`;
		returnString += `${url}${href}\n`;
		returnString += lineBreak;
		output += returnString;
	}

	await writeFile(process.env.TXT_FILE_PATH, output, 'utf-8');
	console.log(`Posts written to ${process.env.TXT_FILE_PATH}`);
}

async function scrollToLoadPosts(page, durationMs = 30000) {
	const filterDiv = await page.waitForSelector(`div.${selectors.filter}`, { timeout: 10000 });
	const filterButton = await filterDiv.evaluateHandle((div) => div.closest('button'));
	await filterButton.click();

	await page.waitForSelector('text=Recent', { timeout: 5000 });
	await page.click('text=Recent');

	await page.waitForSelector(selectors.post, { timeout: 15000 });

	const start = Date.now();
	while (Date.now() - start < durationMs) {
		await page.evaluate(() => {
			window.scrollBy(0, 20 * window.innerHeight);
		});
		await page.waitForTimeout(1000);
	}
}

async function sendEmailWithAttachment() {
	const transporter = nodemailer.createTransport({
		service: 'gmail',
		auth: {
			user: process.env.EMAIL_USER,
			pass: process.env.EMAIL_PASS, // Use an app password, not your main password
		},
	});

	const mailOptions = {
		from: process.env.EMAIL_USER,
		to: process.env.EMAIL_USER,
		subject: 'Nextdoor Posts',
		text: 'Attached are the latest Nextdoor posts.',
		attachments: [
			{
				filename: `nextdoor_posts_${getTimestamp()}.txt`,
				content: await readFile(process.env.TXT_FILE_PATH, 'utf-8'),
			},
		],
	};

	await transporter.sendMail(mailOptions);
	console.log('Email sent!');
}

async function main() {
	const browser = await chromium.launch({ headless: false });
	const page = await browser.newPage();

	await loginToNextDoor(page);

	await scrollToLoadPosts(page, 30000);

	await extractPostData(page);

	// await sendEmailWithAttachment();

	await browser.close();
}

main();
