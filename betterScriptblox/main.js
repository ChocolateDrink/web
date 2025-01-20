// ==UserScript==
// @name         better scriptblox
// @version      19/1/2025
// @description  removes the annoying prompts
// @author       warmchocolatedrink
// @match        *://*.scriptblox.com/*
// @run-at       document-start
// ==/UserScript==

const remove = () => {
	const button = document.querySelector('.w-full.bg-green-500');
	if (button) button.click();
};

const click = () => {
	if (!window.location.href.includes('/script')) return;
	document?.body?.click();
};

let interval;
const start = () => {
	if (interval) clearInterval(interval);
	interval = setInterval(() => {
		remove();
		click();
	}, 100);
};

window.addEventListener('hashchange', start);
window.addEventListener('popstate', start);

start();

document.addEventListener('DOMContentLoaded', () => {
	const observer = new IntersectionObserver(entries => {
		entries.forEach(entry => {
			if (!entry.isIntersecting) return;
			entry.target.click();
		});
	}, {
		threshold: 0.1
	});

	new MutationObserver(mutations => {
		mutations.forEach(mutation => {
			mutation.addedNodes.forEach(node => {
				if (!node.matches || !node.matches('.p-4.text-lg')) return;
				observer.observe(node);
			});
		});
	}).observe(document.body, {
		childList: true,
		subtree: true
	});

	const loadMore = document.querySelector('.p-4.text-lg');
	observer.observe(loadMore);
});
