// ==UserScript==
// @name        Always show transcript
// @match       https://www.youtube.com/watch*
// @grant       none
// @version     1.0
// @author      madacol
// @description show transcript on all youtube videos
// @run-at      document-idle
// ==/UserScript==
(async ()=>{
    (await getElementNotYetRendered(()=>document.querySelector('button[aria-label="Show transcript"]'))).click()

    function getElementNotYetRendered(elementGetter, delay = 200, timeout = 10000) {
        let retries = Math.ceil(timeout / delay);
        return new Promise((resolve, reject) => {
            (function resolveIfElementFound() {
                setTimeout(() => {
                    const element = elementGetter()
                    if (element?.toString().includes("Element")) return resolve(element)
                    if (element?.toString().includes("NodeList") && element.length > 0) return resolve(element)

                    if (retries-- <= 0) return console.error(`Max retries reached: element was not found
                    element: "${element}"
                    elementGetter: "${elementGetter}"
                    `);
                    resolveIfElementFound()
                }, delay);
            })()
        })
    }
})();