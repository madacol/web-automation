// @name No Hijack
// @description Blocks common event hijacking techniques, like disabling paste, right-click, text selection, and some keyboard shortcuts. Run the bookmarklet again to undo.

javascript: (() => {
    if (window._NoHijackHandlers) {
        for (const [eventName, handler] of Object.entries(window._NoHijackHandlers)) {
            document.removeEventListener(eventName, handler, true);
        }
        window._NoHijackHandlers = null;
        return;
    }


    const block = e => e.stopImmediatePropagation();
    window._NoHijackHandlers = {
        copy: block,
        cut: block,
        paste: block,
        contextmenu: block,
        selectstart: block,
        keydown: e => {
            if (e.altKey && e.key.match(/[0-9]/)) {
                e.stopImmediatePropagation();
            }
        }
    };
    for (const [eventName, handler] of Object.entries(window._NoHijackHandlers)) {
        document.addEventListener(eventName, handler, true);
    }
})();
