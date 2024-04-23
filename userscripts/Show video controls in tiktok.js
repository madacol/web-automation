// ==UserScript==
// @name         Show Video Controls in TikTok
// @version      0.1
// @description  Allow to control TikTok videos with the keyboard, and move to the next video when the current one ends
// @author       madacol
// @match        *://*tiktok.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // IntersectionObserver to watch when videos come into the viewport
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const video = entry.target;
                video.controls = true;
                video.loop = false;
                video.focus();
                // disable hijacking of spacebar to allow it to pause the video
                video.addEventListener('keydown', event => {
                    if (event.code === 'Space') {
                        event.stopImmediatePropagation();
                    }
                }, true);
                // Adding event listener to move to the next video when current ends
                video.addEventListener('ended', event => {
                    window.scrollBy(0, window.innerHeight); // Scrolls down one viewport height

                    event.stopImmediatePropagation();
                }, true);
            }
        });
    }, {
        root: null, // Observing relative to the viewport
        threshold: 0.5 // Trigger when 50% of the video is visible
    });

    // Select and observe all current and future video elements
    const initializeVideoObserver = () => {
        document.querySelectorAll('video').forEach(video => {
            observer.observe(video);
        });
    };

    // Start by observing videos already present
    initializeVideoObserver();

    // MutationObserver to detect when new videos are added to the DOM
    const mutationObserver = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            mutation.addedNodes.forEach(node => {
                if (node.nodeName === 'VIDEO') {
                    observer.observe(node);
                } else if (node.querySelectorAll) {
                    const videos = node.querySelectorAll('video');
                    videos.forEach(video => {
                        observer.observe(video);
                    });
                }
            });
        });
    });

    // Observe the body for changes to catch dynamically added videos
    mutationObserver.observe(document.body, {
        childList: true,
        subtree: true
    });
})();
