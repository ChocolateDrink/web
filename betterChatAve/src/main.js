const config = [];
config.bypassChatFilter = false;
config.removeSpamMessages = false;
config.logDetectedMessages = false;
config.blockSpammers = false;
config.removeLongMessages = false;
config.disableSuccessNotifs = false;

const core = [];
core.hooks = [];
core.hooked = [];
core.messages = [];

// fetch blacklisted words
(async () => {
	core.badWords = [];

	try {
		const response = await fetch('https://raw.githubusercontent.com/ChocolateDrink/web/refs/heads/main/betterChatAve/detections.json');
		if (!response.ok) throw new Error('http error: ' + response.status);
	
		core.badWords = await response.json() || [];
	} catch(err) {
		throw new Error('failed to get list: ' + err.message);
	}
})();

// core
(() => {
	core.updateSave = () => {
		const toSave = {};
		toSave.config = {};
		toSave.messages = core.messages;

		for (const key in config) {
			if (typeof config[key] !== 'boolean') continue;
			toSave.config[key] = config[key];
		}

		localStorage.setItem('bca_cfg', JSON.stringify(toSave));
	}

	core.loadSave = () => {
		const saved = localStorage.getItem('bca_cfg');
		if (!saved) return;

		const decoded = JSON.parse(saved);
		if (decoded.config) {
			for (const key in decoded.config) {
				if (!key in config) continue;
				config[key] = Boolean(decoded.config[key]);
			}
		}

		if (Array.isArray(decoded.messages)) {
			core.messages = decoded.messages;
		}
	}

	core.toCamelCase = (text) => {
		return text
			.toLowerCase()
			.split(' ')
			.map((word, index) => index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1))
			.join('');
	}

	core.loadSave();

	for (const key in config) {
		let val = config[key];
		Object.defineProperty(config, key, {
			get: () => val,
			set: (newVal) => {
				val = Boolean(newVal);
				core.updateSave();
			}
		});
	}
})();

// hooks
(() => {
	core.hooks.disableNotifs = (e) => {
		if (e) {
			core.hooked.callSuccess = callSuccess;
			callSuccess = () => {};
			return;
		}

		if (!core.hooked.callSuccess) return;

		callSuccess = core.hooked.callSuccess;
		core.hooked.callSuccess = null;
	}

	core.hooks.disableNotifs(config.disableSuccessNotifs);
})();

// ui
(() => {
	const main = document.createElement('div');
	main.style.width = '240px';
	main.style.padding = '15px';
	main.style.backgroundColor = 'black';
	main.style.border = '2px solid white';
	main.style.borderRadius = '8px';
	main.style.position = 'absolute';
	main.style.top = '50px';
	main.style.left = '50px';
	main.style.boxShadow = '0px 0px 10px rgba(0, 0, 0, 0.1)';
	main.style.cursor = 'move';

	const header = document.createElement('h3');
	header.textContent = 'better chat ave';
	header.style.marginTop = '0';
	header.style.textAlign = 'center';
	header.style.color = 'white';
	header.style.paddingBottom = '15px';
	header.style.userSelect = 'none';
	main.appendChild(header);

	const toggleContainer = document.createElement('div');
	toggleContainer.id = 'toggleContainer';
	main.appendChild(toggleContainer);

	let dragging = false;
	let offsetX, offsetY;

	main.addEventListener('mousedown', (e) => {
		dragging = true;
		offsetX = e.clientX - main.offsetLeft;
		offsetY = e.clientY - main.offsetTop;
	});

	document.addEventListener('mousemove', (e) => {
		if (!dragging) return;
		main.style.left = (e.clientX - offsetX) + 'px';
		main.style.top = (e.clientY - offsetY) + 'px';
	});

	document.addEventListener('mouseup', () => {
		dragging = false;
	});

	const addToggle = (text, func) => {
		const container = document.createElement('div');
		container.style.display = 'flex';
		container.style.alignItems = 'center';
		container.style.marginBottom = '10px';

		const configKey = core.toCamelCase(text);

		const toggle = document.createElement('input');
		toggle.type = 'checkbox';
		toggle.checked = Boolean(config[configKey]);
		container.appendChild(toggle);

		const label = document.createElement('label');
		label.textContent = text;
		label.style.color = 'white';
		label.style.marginLeft = '10px';
		label.style.userSelect = 'none';
		container.appendChild(label);

		toggleContainer.appendChild(container);

		toggle.addEventListener('change', () => {
			config[configKey] = toggle.checked;
			if (func) func(toggle.checked);
		});
	}

	const addButton = (text, func) => {
		const container = document.createElement('div');
		container.style.marginBottom = '10px';
	
		const button = document.createElement('button');
		button.textContent = text;
		button.style.width = '100%';
		button.style.padding = '5px';
		button.style.marginTop = '5px';
		button.style.borderRadius = '4px';
		button.style.border = '1px solid white';
		button.style.backgroundColor = '#333';
		button.style.color = 'white';
		button.style.cursor = 'pointer';
		
		container.appendChild(button);
		main.appendChild(container);
	
		button.addEventListener('click', func);
	}

	const addLabel = (text, noMarginBottom = false, noMarginTop = true, color = 'white') => {
		const label = document.createElement('div');
		label.textContent = text;
		label.style.color = color;
		label.style.marginBottom = noMarginBottom ? '0px' : '10px';
		label.style.marginTop = noMarginTop ? '0px' : '10px';
		label.style.fontSize = '14px';
		label.style.userSelect = 'none';
		main.appendChild(label);
	}

	addToggle('bypass chat filter');
	addToggle('remove spam messages');
	addToggle('log detected messages');
	addToggle('block spammers');
	addToggle('remove long messages');
	addToggle('disable success notifs', core.hooks.disableNotifs);

	addButton('clear dms', privateClear);

	addLabel('click Insert to toggle this ui', true, false, 'rgb(0, 255, 0)');

	document.addEventListener('keydown', (e) => {
		if (e.key !== 'Insert') return;

		// an idiot admires complexity, a genius admires simplicity
		if (main.style.display === 'none') {
			main.style.display = 'block';
		} else {
			main.style.display = 'none';
		}
	});

	document.body.appendChild(main);
})();

// chat bypass & save
(() => {
	const oldOpen = XMLHttpRequest.prototype.open;
	const oldSend = XMLHttpRequest.prototype.send;

	const oldPush = core.messages.push;
	const oldSplice = core.messages.splice;
	const oldShift = core.messages.shift;

	core.messages.push = function(...args) {
		const result = oldPush.apply(this, args);
		core.updateSave();
		return result;
	};

	core.messages.splice = function(...args) {
		const result = oldSplice.apply(this, args);
		core.updateSave();
		return result;
	};

	core.messages.shift = function() {
		const result = oldShift.apply(this);
		core.updateSave();
		return result;
	};

	XMLHttpRequest.prototype.open = function(_, url) {
		this.toHook = url.includes('chat_process.php') || url.includes('private_process.php');
		this.publicMsg = url.includes('chat_process.php');

		return oldOpen.apply(this, arguments);
	}

	XMLHttpRequest.prototype.send = function(body) {
		if (!this.toHook || !body || !config.bypassChatFilter) {
			return oldSend.apply(this, [body]);
		}

		const bodyParams = new URLSearchParams(body);
		let content = bodyParams.get('content');
		if (!content) return oldSend.apply(this, [body]);

		// save
		if (this.publicMsg) {
			const duped = core.messages.indexOf(content);
			if (duped !== -1) core.messages.splice(duped, 1);
			
			core.messages.push(content);
			if (core.messages.length > 100) core.messages.shift();
		}

		// bypass
		content = content.split(' ')
			.map(word => word.length >= 3 ? word.split('').join('‎') : word)
			.join(' ');

		bodyParams.set('content', content);
		body = bodyParams.toString();

		return oldSend.apply(this, [body]);
	}

	const mainChat = document.getElementById('main_input_box');

	let lastAt = -1;
	let lastMsg = '';

	// load saved messages
	mainChat.addEventListener('keydown', (e) => {
		if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return;

		if (lastAt === -1) lastMsg = e.target.value;
		if (core.messages.length === 0) return;

		if (e.key === 'ArrowUp') {
			if (lastAt < core.messages.length - 1) {
				lastAt++;
				e.target.value = '';
				e.target.value = core.messages[core.messages.length - 1 - lastAt];
			}
		} else if (e.key === 'ArrowDown') {
			if (lastAt > -1) {
				lastAt--;
				e.target.value = '';
				if (lastAt === -1) {
					e.target.value = lastMsg;
				} else {
					e.target.value = core.messages[core.messages.length - 1 - lastAt];
				}
			}
		}

		e.preventDefault();
	});
})();

// chat filter
(() => {
	const chatLogs = document.getElementById('chat_logs_container');

	const sesRegex = /^[0-9a-fA-F]{66}$/;
	const filRegex = /[`'/.,:;_]/g;

	const isSessToken = text => sesRegex.test(text);
	const hasSessToken = text => text.split(' ').some(isSessToken);
	const hasBypassedText = text => [...text].some(char => {
		const code = char.codePointAt(0);
		return code >= 0x1D400 && code <= 0x1D7FF;
	});

	const isBlacklisted = (text) => {
		const foundWord = core.badWords.find(word => text.includes(word));
		if (foundWord) return foundWord;

		if (hasSessToken(text)) return 'sess token';
		if (hasBypassedText(text)) return 'bypassed text';

		return null;
	}

	new MutationObserver((list) => {
		for (const mutation of list) {
			if (mutation.type !== 'childList') continue;

			mutation.addedNodes.forEach(node => {
				if (node.nodeType === Node.ELEMENT_NODE && node.tagName === 'LI') {
					const msg = node.querySelector('.chat_message');
					if (!msg) return;

					const avs = node.querySelector('.avtrig.avs_menu.chat_avatar');
					const userId = avs ? avs.getAttribute('data-id') : null;

					const msgText = msg.textContent.trim().toLowerCase().replace(filRegex, '');
					const detected = isBlacklisted(msgText);

					if (config.removeSpamMessages && detected) {
						node.remove();
						if (config.logDetectedMessages) console.log(`removed: "${msgText}" due to: "${detected}"`);
						if (config.blockSpammers && userId) ignoreUser(parseInt(userId));
						return;
					}

					if (config.removeLongMessages && msgText.length >= 200) {
						node.remove();
						if (config.logDetectedMessages) console.log(`removed: "${msgText.slice(0, 50)}..." due to having more than 200 characters (${msgText.length})`);
						if (config.blockSpammers && userId) ignoreUser(parseInt(userId));
						return;
					}
				}
			});
		}
	}).observe(chatLogs, { childList: true, subtree: true });
})();

// keybinds
(() => {
	const binds = [];
	binds.all = [];

	let shiftDown = false;
	let chatInput = document.getElementById('message_content');

	binds.add = (name, key, func) => {
		binds.all[name] = {bind: key, func: func}
	}

	binds.add('dm swap', 'L', () => {
		const menu = document.getElementById('private_menu');
		if (menu.style.display === 'none') getPrivate();

		setTimeout(() => {
			const button = document.querySelector('.fmenu_name.gprivate');
			if (button) button.click();
		}, 460);
	});

	binds.add('quick block', 'B', () => {
		if (currentPrivate === 0) return;
		ignoreThisUser();

		const button = document.getElementById('private_close');
		if (button) button.click();
	});

	document.addEventListener('keydown', (e) => {
		if (e.code !== 'ShiftRight') return;
		shiftDown = true;

		const input = document.activeElement;
		if (input !== chatInput) return;
		chatInput.blur();
	});

	document.addEventListener('keyup', (e) => {
		if (e.code === 'ShiftRight') return;
		shiftDown = false;

		if (chatInput) chatInput.focus();
	});

	document.addEventListener('keydown', (e) => {
		for (const bind in binds.all) {
			const bindObj = binds.all[bind];
			const bindKey = bindObj.bind.length > 1 ? bindObj.bind : 'Key'.concat(bindObj.bind);

			if (e.code === bindKey && shiftDown) bindObj.func();
		}
	});
})();