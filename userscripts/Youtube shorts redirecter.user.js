// ==UserScript==
// @name         Youtube Shorts Redirecter
// @version      0.2
// @description  Redirects youtube yhorts to the traditional video player
// @author       madacol
// @match        *://*.youtube.com/shorts/*
// @run-at       document-start
// @grant        none
// ==/UserScript==

const url = new URL(window.location.href);
const videoId = url.pathname.split('/').pop();
window.location.href = `https://www.youtube.com/watch?v=${videoId}`;
