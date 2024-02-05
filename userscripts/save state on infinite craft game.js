// ==UserScript==
// @name         save infinite craft
// @version      0.1
// @description  loads and autosaves to localstorage on the infinite craft game 
// @author       madacol
// @match        *://neal.fun/infinite-craft/*
// @grant        none
// ==/UserScript==

(function(){
    const exportState = () => JSON.stringify({
        discoveries: window.$nuxt.$root.$children[2].$children[0].$children[0]._data.discoveries, 
        elements: window.$nuxt.$root.$children[2].$children[0].$children[0]._data.elements
    });

    const importState = (state) => {
        const { discoveries, elements } = JSON.parse(state);
        const gameInstance = window.$nuxt.$root.$children[2].$children[0].$children[0]._data;
        gameInstance.discoveries = discoveries;
        gameInstance.elements = elements;
    };

    /* Set up a MutationObserver to listen for changes in the DOM and automatically export the current state. */
    const observer = new MutationObserver((mutations) => {
        const state = exportState();
        localStorage.setItem('gameState', state);
    });

    /* Start observing DOM changes to auto-save the game state. */
    const startObserving = () => {
        const targetNode = document.querySelector('.sidebar');
        observer.observe(targetNode, { childList: true, subtree: true });
    };

    /* Check for a saved state in localStorage and import it if available. */
    const savedState = localStorage.getItem('gameState');
    if (savedState) importState(savedState);
    else localStorage.setItem('gameState', exportState() );

    startObserving();
})();
