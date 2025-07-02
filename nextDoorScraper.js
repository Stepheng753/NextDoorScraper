function getInnermostText(element) {
	if (element.children.length === 0) {
		return element.textContent;
	}
	return getInnermostText(element.firstElementChild);
}

const postQuery = '.cee-media-body';
const nameQuery = '._3I7vNNNM.E7NPJ3WK';
const textQuery = '._3iKTOEn_._1m8rz6c1s._1m8rz6c1u';
const locationQuery = '.post-byline-redesign.post-byline-truncated';
const timeQuery = 'div[data-testid="post-timestamp"]';

function extractPostData() {
	let postElements = document.querySelectorAll(postQuery);

	postElements.forEach((postElement) => {
		let nameElement = postElement.querySelector(nameQuery);
		let textElement = postElement.querySelector(textQuery);
		let locationElement = postElement.querySelector(locationQuery);
		let timeElement = postElement.querySelector(timeQuery);

		if (nameElement && textElement) {
			let name = nameElement ? getInnermostText(nameElement) : '';
			let text = textElement ? getInnermostText(textElement) : '';
			let location = locationElement ? getInnermostText(locationElement) : '';
			let time = timeElement ? getInnermostText(timeElement) : '';

			returnString = name + ' : ' + text + '\n' + location + ' : ' + time + '\n' + nameElement.href;

			console.log(returnString);
		}
	});
}
