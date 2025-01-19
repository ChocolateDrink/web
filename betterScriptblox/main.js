// ==UserScript==
// @name         scriptblox remover
// @version      19/1/2025
// @description  removes the annoying prompts
// @author       warmchocolatedrink
// @match        *://*.scriptblox.com/*
// @run-at       document-start
// ==/UserScript==

const toRemove = [
	'.w-full.bg-green-500'
];

let interval;

const remove = () => {
	toRemove.forEach(query => {
		const button = document.querySelector(query);
		if (button) button.click();
	});
};

const click = () => {
	if (!window.location.href.includes('/script')) return;
	document?.body?.click();
};

const start = () => {
	if (interval) clearInterval(interval);
	interval = setInterval(() => {
		remove();
		click();
		clearInterval(interval);
	}, 1);
};

window.addEventListener('hashchange', start);
window.addEventListener('popstate', start);

start();