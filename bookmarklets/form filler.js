// @name Form Filler
// @description This script records the values of all form fields and stores them in localStorage. When the script is run again, it will ask the user if they want to restore values or save the new ones.

const saveFormValues = () => {
    const formData = [];
    [...document.forms].forEach((form, formIndex) => {
        formData[formIndex] = [];
        [...form.elements].forEach((element, elementIndex) => {
            const type = element.type.toLowerCase();
            let value = null;
            switch (type) {
                case 'text':
                case 'password':
                case 'textarea':
                case 'email':
                case 'date':
                case 'number':
                case 'select-one':
                    value = element.value;
                    break;
                case 'checkbox':
                case 'radio':
                    value = element.checked;
                    break;
                case 'select-multiple':
                    value = Array.from(element.options).map(option => option.selected);
                    break;
                default:
                    return;
            }
            formData[formIndex][elementIndex] = { type, value };
        });
    });
    localStorage.setItem(`_FormFiller_${location.pathname}`, JSON.stringify(formData));
};

const loadFormValues = (storedData) => {
    if (!storedData) return;
    [...document.forms].forEach((form, formIndex) => {
        if (!storedData[formIndex]) return;
        [...form.elements].forEach((element, elementIndex) => {
            const { type, value } = storedData[formIndex][elementIndex] || {};
            switch (type) {
                case 'text':
                case 'password':
                case 'textarea':
                case 'email':
                case 'date':
                case 'number':
                case 'select-one':
                    element.value = value;
                    break;
                case 'checkbox':
                case 'radio':
                    element.checked = value;
                    break;
                case 'select-multiple':
                    Array.from(element.options).forEach((option, idx) => {
                        option.selected = value[idx];
                    });
                    break;
            }
        });
    });
};

function askUser() {
    const overlay = document.createElement('div');
    overlay.innerHTML = /*html*/ `
        <div>
            <h2>Form Filler</h2>
            <p>Would you like to <strong>restore</strong> or <strong>save</strong> the form values?</p>
            <div class="buttons">
                <button id="restore">Restore</button>
                <button id="save">Save</button>
            </div>
            <h3>Stored data:</h3>
            <pre>${JSON.stringify(storedData, null, 2)}</pre>
        </div>
    `;
    overlay.style = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 9999;
        overflow: auto;
    `;
    overlay.querySelector('&> div').style = `
        display: flex;
        flex-direction: column;
        max-height: 100%;
        max-width: 1000px;
        overflow: auto;
        background-color: white;
        padding: 0 20px;
        border-radius: 10px;
        margin: auto;
        color: black;
    `;
    overlay.querySelector('.buttons').style = `
        display: flex;
        justify-content: space-around;
    `;
    overlay.querySelectorAll('button').forEach(button => {
        button.style = `
            padding: 10px 20px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 16px;
            font-weight: bold;
            background-color: #007bff;
            color: white;
        `;
    });
    overlay.querySelector('pre').style = `
        white-space: pre-wrap;
        word-wrap: break-word;
        max-height: 80vh;
        min-height: 100px;
        overflow: auto;
    `;
    document.body.appendChild(overlay);

    overlay.querySelector('#restore').addEventListener('click', () => {
        loadFormValues(storedData);
        overlay.remove();
    });

    overlay.querySelector('#save').addEventListener('click', () => {
        saveFormValues();
        overlay.remove();
    });

    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            overlay.remove();
        }
    });
}

// Detect if there are stored values and ask the user what to do
const storedData = JSON.parse(localStorage.getItem(`_FormFiller_${location.pathname}`));
if (storedData) {
    // show in overlay the choices to restore or save
    askUser();
} else {
    saveFormValues(); // No stored data, save current form values
}
