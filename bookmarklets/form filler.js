// @name Form Filler
// @description This script records the values of all form fields and generates a bookmarklet that will restore them. To use it, fill out the form fields and click this script, a link with the bookmarklet will show up, save it and whenever you want to restore the form fields with the same values, click the bookmarklet.

(() => {
    const scriptCode = ['(() => {'];
    [...document.forms].forEach((form, formIndex) => {
        [...form.elements].forEach((element, elementIndex) => {
            const elementType = element.type.toLowerCase();
            const codeToRecoverElement = `document.forms[${formIndex}].elements[${elementIndex}]`;

            switch (elementType) {
                case 'text':
                case 'password':
                case 'textarea':
                case 'email':
                case 'date':
                case 'number':
                case 'select-one':
                    const value = JSON.stringify(element.value);
                    scriptCode.push(`${codeToRecoverElement}.value = ${value};`);
                    break;
                case 'checkbox':
                case 'radio':
                    scriptCode.push(`${codeToRecoverElement}.checked = ${element.checked};`);
                    break;
                case 'select-multiple':
                    [...element.options].forEach((opt, idx) => {
                        scriptCode.push(`${codeToRecoverElement}.options[${idx}].selected = ${opt.selected};`);
                    });
                    break;
                // Include additional input types as needed
            }
        });
    });

    scriptCode.push('})();');
    const bookmarkletCode = `javascript:${encodeURIComponent(scriptCode.join('\n'))}`;
    
    // Create the bookmarklet link and append it to the body of the page
    const link = document.createElement('a');
    link.href = bookmarkletCode;
    link.textContent = 'Fill Form Bookmarklet'; // Text to display on the link
    link.style.position = 'fixed';
    link.style.top = '10px';
    link.style.left = '10px';
    link.style.backgroundColor = '#f0f0f0';
    link.style.padding = '5px';
    link.style.border = '1px solid #ccc';
    link.style.borderRadius = '3px';
    link.style.zIndex = '10000';
    document.body.appendChild(link);
})();
