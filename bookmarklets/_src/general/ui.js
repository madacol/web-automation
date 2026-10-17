/** @template {keyof HTMLElementTagNameMap} T @param {T} tag @param {string} [text] */
export function element(tag, text = '') {
    const node = document.createElement(tag);
    node.textContent = text;
    return node;
}

/** @param {HTMLElement} parent @param {string} label @param {() => void} action */
export function button(parent, label, action) {
    const node = element('button', label);
    node.type = 'button';
    node.addEventListener('click', action);
    parent.append(node);
    return node;
}

/** @param {string} id @param {string} title */
export function panel(id, title) {
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

/** @param {string} id @param {string} title @param {string} text */
export function textPanel(id, title, text) {
    const view = panel(id, title);
    if (!view) return null;
    const textarea = element('textarea');
    textarea.setAttribute('aria-label', 'Output');
    textarea.readOnly = true;
    textarea.value = text;
    view.content.append(textarea);
    button(view.toolbar, 'Copy', async () => {
        try {
            await navigator.clipboard.writeText(textarea.value);
            view.status.textContent = 'Copied.';
        } catch {
            textarea.focus();
            textarea.select();
            view.status.textContent = 'Copy unavailable here. The text is selected for manual copying.';
        }
    });
    return { ...view, textarea };
}

/** @param {string} text */
export const escapeMarkdown = text => text.replace(/[\\`*_[\]<>#|]/g, '\\$&');

/** @param {string} href */
export function safeLink(href) {
    try {
        const url = new URL(href, document.baseURI);
        return ['http:', 'https:', 'mailto:', 'tel:'].includes(url.protocol) ? url.href.replace(/</g, '%3C').replace(/>/g, '%3E') : null;
    } catch {
        return null;
    }
}
