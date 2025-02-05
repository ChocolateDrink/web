const config = {
	max_posts: 100, // the max number of comments that can be posted
	reload_page_when_done: false, // whether to reload the page when done
	titles: [
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
	], // the title of the post
	add_tags: false, // if the post should include tags
	tags: [
		'bloxd'
	] // the tags you want your post to have
};

let posts = 0;

const delay = (ms) => new Promise(res => setTimeout(res, ms));

while (posts !== config.max_posts) {
	const title = Array.isArray(config.titles) ? config.titles[Math.floor(Math.random() * config.titles.length)] : config.titles;

	const formData = new FormData();
	formData.append('content', title);

	if (config.tags.length > 0 && config.add_tags) {
		config.tags.forEach(tag => {
			formData.append('tags[]', tag);
		});
	}

	const response = await fetch('includes/post-handler.php', {
		method: 'POST',
		body: formData
	});

	const data = await response.json();
	if (data.success) {
		posts += 1;
		console.log(`✔️ successfully made post: ${title} (${posts})`);
	} else {
		console.log(`❌ failed to post comment: ${title} | ${data.remainingTime || data.message || '??'}`);
	}

	if (data.remainingTime) {
		console.log(`❗ waiting ${data.remainingTime} seconds before posting again`);
		await delay((data.remainingTime + 0.001) * 1000);
	} else {
		console.log(`❗ waiting 180 seconds before posting again`);
		await delay(180 * 1000);
	}
}

console.log(`✅ posted ${posts} times`);
posts = 0;

if (config.reload_page_when_done)
	location.reload();