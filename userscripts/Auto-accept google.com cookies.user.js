// ==UserScript==
// @name        Auto-accept google.com cookies
// @match       https://www.google.com/search*
// @grant       none
// @version     1.0
// @author      madacol
// ==/UserScript==

document.querySelectorAll('button').forEach(button => {
    switch (button.textContent.toLowerCase()) {
        case 'accept all':
            button.click()
            break
    }
})