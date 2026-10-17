// @name Focus Reader
// @description Read the main article in a clean text-focused view with adjustable text size and light, sepia or night themes. Close to return to the original page.
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

    /** @param {string} href */
    function safeLink(href) {
        try {
            const url = new URL(href, document.baseURI);
            return ['http:', 'https:', 'mailto:', 'tel:'].includes(url.protocol) ? url.href.replace(/</g, '%3C').replace(/>/g, '%3E') : null;
        } catch {
            return null;
        }
    }

    /** @param {Element} node */
    function excluded(node) {
        if (node.matches('script,style,noscript,template,nav,aside,footer,form,input,textarea,select,button,iframe,object,embed,[hidden],[aria-hidden="true"]')) return true;
        const style = node.isConnected ? getComputedStyle(node) : node instanceof HTMLElement ? node.style : null;
        return style?.display === 'none' || style?.visibility === 'hidden' || style?.visibility === 'collapse';
    }

    function article() {
        const articles = [...document.querySelectorAll('article')].filter(node => !excluded(node));
        const candidates = articles.length ? articles : [...document.querySelectorAll('main,[role="main"]')].filter(node => !excluded(node));
        return candidates.sort((a, b) => (b.textContent?.length ?? 0) - (a.textContent?.length ?? 0))[0] || document.body;
    }

    const readerTags = new Set('P DIV SECTION ARTICLE HEADER H1 H2 H3 H4 H5 H6 STRONG EM B I S CODE PRE UL OL LI BLOCKQUOTE A BR HR TABLE THEAD TBODY TFOOT TR TH TD CAPTION'.split(' '));

    /** @param {Node} node @returns {Node} */
    function readerContent(node) {
        if (node.nodeType === Node.TEXT_NODE) return document.createTextNode(node.textContent || '');
        const empty = document.createDocumentFragment();
        if (node instanceof Element && excluded(node)) return empty;
        if (node instanceof HTMLImageElement) return element('p', node.alt ? `[Image: ${node.alt}]` : '');
        const output = readerTags.has(node.nodeName) ? document.createElement(node.nodeName.toLowerCase()) : empty;
        if (output instanceof HTMLAnchorElement && node instanceof HTMLAnchorElement) {
            const href = safeLink(node.getAttribute('href') || '');
            if (href) {
                output.href = href;
                output.target = '_blank';
                output.rel = 'noopener noreferrer';
            }
        }
        for (const child of node.childNodes) output.appendChild(readerContent(child));
        return output;
    }

    const content = readerContent(article());
    const view = panel('__getbookmarklets_reader__', 'Focus Reader');
    if (view) {
        const reading = element('div');
        reading.setAttribute('role', 'region');
        reading.setAttribute('aria-label', 'Article');
        reading.style.fontSize = '20px';
        reading.style.lineHeight = '1.7';
        reading.append(content);
        view.content.append(reading);
        const fontLabel = element('label', 'Text size ');
        const font = element('input');
        font.setAttribute('aria-label', 'Text size');
        font.type = 'range';
        font.min = '16';
        font.max = '32';
        font.value = '20';
        fontLabel.append(font);
        font.addEventListener('input', () => { reading.style.fontSize = `${font.value}px`; });
        const themeLabel = element('label', 'Theme ');
        const theme = element('select');
        theme.setAttribute('aria-label', 'Theme');
        const themes = { light: ['#fff', '#17202a'], sepia: ['#f8f4e7', '#30271d'], night: ['#1c2025', '#f1f4f8'] };
        for (const name of Object.keys(themes)) {
            const option = element('option', name);
            option.value = name;
            theme.append(option);
        }
        themeLabel.append(theme);
        theme.addEventListener('change', () => {
            const [background, foreground] = themes[theme.value];
            view.dialog.style.setProperty('--bg', background);
            view.dialog.style.setProperty('--fg', foreground);
        });
        view.toolbar.append(fontLabel, themeLabel);
        view.status.textContent = 'Text-focused reading view. Close to return to the original page.';
    }

})();
