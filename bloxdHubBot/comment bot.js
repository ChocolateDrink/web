const config = {
	max_posts: 100, // the max number of comments that can be posted
	reload_page_when_done: false, // whether to reload the page when done
	messages: [
		'buff the stone axe',
		'caves are cool and stuff',
		'makes capes free or sum',
		'bloxd needs more items',
		'should add candles',
		'a tool to make flying faster',
		'cheese sticks as a food',
		'beans regen you',
		'mod panel for custom worlds',
		'cheese bisket as a foog',
		'pactch glidr bug'
	] // the comments to post
};

const postId = document.querySelector('.comments-container').dataset.postId;
const headers = defaultHeaders || { 'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]').content} || { 'X-CSRF-Token': ''};

let posts = 0;

const delay = (ms) => new Promise(res => setTimeout(res, ms));

while (posts !== config.max_posts) {
	const comment = Array.isArray(config.messages) ? config.messages[Math.floor(Math.random() * config.messages.length)] : config.messages;
	const response = await fetch('includes/post-comment.php', {
		method: 'POST',
		headers: headers,
		body: JSON.stringify({
			post_id: postId,
			content: comment
		})
	});

	const data = await response.json();
	if (data.success) {
		posts += 1;
		console.log(`✔️ success posting comment: ${comment} (${posts})`);
	} else {
		console.log(`❌ failed to post comment: ${comment} | ${data.remainingTime || data.message || '??'}`);
	}

	if (data.remainingTime) {
		console.log(`❗ waiting ${data.remainingTime} seconds before posting again`);
		await delay((data.remainingTime + 0.001) * 1000);
	} else {
		console.log(`❗ waiting 30 seconds before posting again`);
		await delay(30 * 1000);
	}
}

console.log(`✅ done sending ${posts} messages`);
posts = 0;

if (config.reload_page_when_done)
	location.reload();