// @name Kill Sticky
// @description Overrides sticky, fixed, and overflowing elements.

javascript: (() => {
    document.querySelectorAll('*').forEach(element => {
        const style = getComputedStyle(element);

        // Remove sticky and fixed positioning
        switch (style.position) {
            case 'sticky':
            case 'fixed':
                element.style.setProperty('position', 'static', 'important');
            break;
        }

        // Remove overflow
        switch (style.overflow) {
            case 'hidden':
            case 'scroll':
            case 'auto':
                element.style.setProperty('overflow', 'visible', 'important');
            break;
        }
    });
})();
