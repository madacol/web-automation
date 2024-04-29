// ==UserScript==
// @name         Youtube Shorts Redirecter
// @version      0.3
// @description  Redirects youtube shorts to the traditional video player
// @author       madacol
// @match        *://*.youtube.com/shorts/*
// @run-at       document-start
// @grant        none
// ==/UserScript==

window.location.href = window.location.href.replace(/\?.*/, '').replace('/shorts/', '/watch?v=');
