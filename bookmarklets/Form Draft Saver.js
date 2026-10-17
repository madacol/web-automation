// @name Form Draft Saver
// @description Save and restore unfinished forms in this site’s local storage. Password, payment and authentication-code fields are skipped.
(function () {
    'use strict';

    /** @template {keyof HTMLElementTagNameMap} T @param {T} tag @param {string} [text] */
    function element(tag, text = '') {
        const node = document.createElement(tag);
        node.textContent = text;
        return node;
    }

    /** @param {HTMLElement} parent @param {string} label @param {() => void} action */
    function button(parent, label, action) {
        const node = element('button', label);
        node.type = 'button';
        node.addEventListener('click', action);
        parent.append(node);
        return node;
    }

    /** @param {string} id @param {string} title */
    function panel(id, title) {
        const existing = document.getElementById(id);
        if (existing) {
            existing.dispatchEvent(new Event('getbookmarklets:close'));
            return null;
        }
        const previous = document.activeElement;
        const host = element('div');
        host.id = id;
        host.style.setProperty('display', 'block', 'important');
        const shadow = host.attachShadow({ mode: 'open' });
        const style = element('style', ':host{all:initial}dialog{box-sizing:border-box;width:min(92vw,850px);max-height:90vh;padding:20px;border:1px solid #aaa;border-radius:12px;background:var(--bg,#fff);color:var(--fg,#17202a);font:16px/1.5 system-ui}dialog::backdrop{background:#0008}header,.toolbar{display:flex;gap:10px;align-items:center;flex-wrap:wrap}header{justify-content:space-between}h2{margin:0;font-size:21px}.content{margin:16px 0;overflow:auto;max-height:65vh}textarea{box-sizing:border-box;width:100%;height:45vh;font:14px/1.5 monospace;padding:10px}button,select{font:inherit;padding:6px 12px;cursor:pointer}label{display:inline-flex;align-items:center;gap:7px}p[role=status]{min-height:1.5em;margin-bottom:0}pre{white-space:pre-wrap}a{color:inherit;text-decoration:underline}table{border-collapse:collapse}td,th{border:1px solid #999;padding:5px}img{max-width:100%}');
        const dialog = element('dialog');
        dialog.setAttribute('aria-label', title);
        const header = element('header');
        header.append(element('h2', title));
        button(header, 'Close', () => dialog.close());
        const content = element('div');
        content.className = 'content';
        const toolbar = element('div');
        toolbar.className = 'toolbar';
        const status = element('p');
        status.setAttribute('role', 'status');
        status.setAttribute('aria-live', 'polite');
        dialog.append(header, content, toolbar, status);
        shadow.append(style, dialog);
        dialog.addEventListener('close', () => {
            host.remove();
            if (previous instanceof HTMLElement && previous.isConnected) previous.focus({ preventScroll: true });
        });
        host.addEventListener('getbookmarklets:close', () => dialog.close());
        document.documentElement.append(host);
        dialog.showModal();
        return { host, dialog, content, toolbar, status };
    }

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

})();
