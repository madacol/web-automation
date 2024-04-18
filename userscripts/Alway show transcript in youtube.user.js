// ==UserScript==
// @name        Show transcript on Ctrl+f
// @match       https://www.youtube.com/watch*
// @grant       none
// @version     1.0
// @author      madacol
// ==/UserScript==
document.addEventListener('keydown', async (event) => {
    // Check if Ctrl+F was pressed
    if (event.ctrlKey && event.key === 'f') {
        document.querySelector('button[aria-label="Show transcript"]').click()
    }
})