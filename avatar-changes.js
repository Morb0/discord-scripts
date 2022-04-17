require('dotenv').config();
const got = require('got');

const TOKEN = process.env.TOKEN;
const IMAGE_URLS = process.env.IMAGE_URLS.split('|');


(async () => {
	try {
		const url = getImageUrlByHours();
		const base64 = await getBase64ImageByUrl(url);
		await updateDiscordProfile({
			avatar: `data:image/png;base64,${base64}`,
		});
		
		process.exit(0);
	} catch(e) {
		console.error('Fail', e);
		process.exit(1);
	}
})();

function getImageUrlByHours() {
	console.log('Getting image url');
	const hours = new Date().getHours();
	let imageIdx = hours;
	while (imageIdx > IMAGE_URLS.length) {
		imageIdx -= IMAGE_URLS.length;
	}
	imageIdx -= 1;
	console.log(`Picked image index - ${imageIdx}`);
	return IMAGE_URLS[imageIdx];
}

async function getBase64ImageByUrl(url) {
	console.log('Getting image base64');
	return got.get(url, {
		encoding: 'base64',
	}).text();
}

async function updateDiscordProfile(payload) {
	console.log('Updating Discord profile');
	const res = await got.patch('https://discord.com/api/v9/users/@me', {
		throwHttpErrors: false,
		json: payload,
		headers: {
			authorization: TOKEN,
			'user-agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) discord/1.0.9004 Chrome/91.0.4472.164 Electron/13.6.6 Safari/537.36',
		},
	});
	
	if (res.statusCode !== 200) {
		console.log('Failed to update Discord profile', res.body);
		return;
	}

	console.log('Discord profile successfully updated');
}
