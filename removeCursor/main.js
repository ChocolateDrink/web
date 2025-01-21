// ==UserScript==
// @name         cursor remover
// @version      21/1/2025
// @description  toggles cursor visiblity when you press \
// @author       warmchocolatedrink
// @match        *://*/*
// @run-at       document-start
// ==/UserScript==

const sites = ['youtube']; // add sites you want this to work on

if (!sites.some(site => location.href.includes(site))) {
	console.log('site not whitelisted');
	throw new Error();
}

let visible = true;

document.addEventListener('keydown', (e) => {
	if (e.key !== '\\') return;

	visible = !visible;
	document.documentElement.style.cursor = visible ? 'auto' : 'none';
});