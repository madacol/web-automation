// @name Show Id Links
// @description Add anchor links to all elements with an `id` attribute. Clicking the anchors will scroll to the element. Run again to remove anchors.

(function() {
    'use strict';

    // Check if anchors are already added
    if (!!document.querySelector('a[data-id-linker]')) {
        // Remove all id-linker anchors and styles inserted in a previous run
        document.querySelectorAll('a[data-id-linker]').forEach(x => x.remove());
        document.getElementById('id-linker-styles').remove();
        return;
    }

    /**
     * Add anchors to all elements with an `id` attribute
     */
    const idElements = document.querySelectorAll('[id]');
    idElements.forEach(element => {
        const { id } = element;
        if (id && !element.querySelector('a[data-id-linker]')) {
            const anchor = document.createElement('a');
            anchor.href = '#' + id;
            anchor.textContent = '#' + id;
            anchor.setAttribute('data-id-linker', "true"); // Mark the element
            element.appendChild(anchor);
        }
    });

    /**
     * Add styles
     */

    const style = document.createElement('style');
    style.id = 'id-linker-styles';

    const css = `
        a[data-id-linker] {
            position: absolute !important;
            top: 0 !important;
            right: 0 !important;
            display: inline-block !important;
            margin: 0 !important;
            box-shadow: none !important;
            border: 0 !important;
            padding: 2px 4px !important;
            width: auto !important;
            height: auto !important;
            transform: none !important;
            clear: none !important;
            float: none !important;
            opacity: 0.8 !important;
            z-index: 2147483645 !important;
            transition: z-index 1ms !important;
            font-size: inherit !important;
            font-weight: bold !important;
            text-decoration: none !important;
            cursor: pointer !important;
            background-color: rgba(255, 255, 255, 0.8) !important;
            color: rgba(0, 0, 255, 1) !important
        }
        a[data-id-linker]:hover {
            opacity: 1 !important;
            z-index: 2147483647 !important;
            transition: z-index 3ms !important;
        }

        *:has(> a[data-id-linker]) {
            position: relative !important;
        }
    `;
    if (style.styleSheet) {
        style.styleSheet.cssText = css;
    } else {
        style.appendChild(document.createTextNode(css));
    }
    document.head.appendChild(style);

})();
