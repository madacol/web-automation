import { button, element, panel } from './ui.js';

const view = panel('__getbookmarklets_drafts__', 'Form Draft Saver');
if (view) {
    const key = `getbookmarklets:form-draft:${location.pathname}${location.search}`;
    view.content.append(element('p', 'Save and restore this page’s form fields in this site’s local storage. Password, payment and authentication-code fields are skipped.'));
    const sensitive = /password|passcode|(?:^|[^a-z])(?:pin|otp)(?:[^a-z]|$)|pin.?code|auth.?code|verification.?code|token|secret|card|credit|debit|payment|cvv|cvc|security.?code|ssn|social.?security|bank|iban|routing|account.?number|one-time-code|cc-/i;
    const fields = () => [...document.querySelectorAll('input,textarea,select')].filter(field => {
        if (!(field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement || field instanceof HTMLSelectElement)) return false;
        if (!field.id && !field.name || field.matches(':disabled,[readonly],[hidden]') || !field.getClientRects().length) return false;
        if (field instanceof HTMLInputElement && !['text', 'search', 'email', 'url', 'tel', 'number', 'date', 'time', 'datetime-local', 'month', 'week', 'checkbox', 'radio'].includes(field.type)) return false;
        const description = [field.id, field.name, field.autocomplete, field.getAttribute('aria-label'), ...[...(field.labels || [])].map(label => label.textContent), field.closest('fieldset')?.querySelector('legend')?.textContent].join(' ');
        return !sensitive.test(description) && getComputedStyle(field).display !== 'none' && getComputedStyle(field).visibility !== 'hidden';
    });
    const identity = field => ({ id: field.id, name: field.name, tag: field.tagName, type: field.type });
    const same = (field, record) => field.tagName === record.tag && field.type === record.type && (record.id ? field.id === record.id && field.name === record.name : field.name === record.name);

    button(view.toolbar, 'Save draft', () => {
        try {
            const eligible = fields();
            const records = eligible.map(field => ({
                ...identity(field),
                occurrence: eligible.filter(other => same(other, identity(field))).indexOf(field),
                value: field.value,
                checked: field instanceof HTMLInputElement ? field.checked : false,
                selected: field instanceof HTMLSelectElement && field.multiple ? [...field.selectedOptions].map(option => option.value) : null
            }));
            localStorage.setItem(key, JSON.stringify({ version: 1, fields: records }));
            view.status.textContent = `Saved ${records.length} fields.`;
        } catch {
            view.status.textContent = 'Could not save this draft in the site’s local storage.';
        }
    });
    button(view.toolbar, 'Restore draft', () => {
        try {
            const saved = JSON.parse(localStorage.getItem(key) || 'null');
            if (!saved || saved.version !== 1 || !Array.isArray(saved.fields)) {
                view.status.textContent = 'No saved draft for this page.';
                return;
            }
            const eligible = fields();
            let count = 0;
            for (const record of saved.fields) {
                if (!record || typeof record.value !== 'string' || !Number.isInteger(record.occurrence)) continue;
                const field = eligible.filter(field => same(field, record))[record.occurrence];
                if (!field) continue;
                if (field instanceof HTMLInputElement && ['checkbox', 'radio'].includes(field.type)) {
                    if (field.value !== record.value) continue;
                    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'checked').set.call(field, record.checked === true);
                } else if (field instanceof HTMLSelectElement && field.multiple && Array.isArray(record.selected)) {
                    for (const option of field.options) option.selected = record.selected.includes(option.value);
                } else {
                    const prototype = field instanceof HTMLInputElement ? HTMLInputElement.prototype : field instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLSelectElement.prototype;
                    Object.getOwnPropertyDescriptor(prototype, 'value').set.call(field, record.value);
                }
                field.dispatchEvent(new Event('input', { bubbles: true }));
                field.dispatchEvent(new Event('change', { bubbles: true }));
                count++;
            }
            view.status.textContent = `Restored ${count} fields. Review them before submitting.`;
        } catch {
            view.status.textContent = 'Could not read the saved draft.';
        }
    });
    button(view.toolbar, 'Delete draft', () => {
        try {
            localStorage.removeItem(key);
            view.status.textContent = 'Deleted this page’s saved draft.';
        } catch {
            view.status.textContent = 'Could not delete the saved draft.';
        }
    });
}
