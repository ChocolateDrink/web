// ==UserScript==
// @name         aniwatch bypass
// @version      23/1/2025
// @description  bypasses aniwatche's anti devtools
// @author       warmchocolatedrink
// @match        *://*.aniwatchtv.to/*
// @run-at       document-start
// ==/UserScript==

const search = new URLSearchParams(window.location.search);
if (!search.has('_debug')) {
	const url = new URL(window.location.href);
	url.searchParams.set('_debug', 'ok');
	history.replaceState(null, '', url);
}