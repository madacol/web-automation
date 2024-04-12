// ==UserScript==
// @name         edit code blocks
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  make code blocks editable by adding the attribute "contenteditable"
// @author       madacol
// @match        *://*.stackoverflow.com/*
// @match        *://*.askubuntu.com/*
// @match        *://*.stackexchange.com/*
// @match        *://*.github.com/*
// @grant        none
// ==/UserScript==

document.querySelectorAll('pre').forEach((code_block) => {
    code_block.contentEditable = true;
    code_block.spellcheck = false;
})