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
        case 'accetta tutto':
        case 'aceptar todo':
            button.click()
            break
    }
})