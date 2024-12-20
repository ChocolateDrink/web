// ==UserScript==
// @name         better chat avenue
// @version      20/12/2024
// @description  tampermonkey extention to make chat ave sites better
// @author       warmchocolatedrink
// @match        https://www.chat-avenue.com/teen/
// @match        https://www.teen-chat.org/chat/
// @run-at       start
// ==/UserScript==

(() => {
	'use strict';

	fetch('https://raw.githubusercontent.com/ChocolateDrink/web/refs/heads/main/betterChatAve/src/main.js')
		.then(response => {
			if (!response.ok) throw new Error('http error: ' + response.status);
			return response.text();
		})
		.then(src => new Function(src)())
		.catch(_ => {throw new Error('an error occurred while executing')});
})();