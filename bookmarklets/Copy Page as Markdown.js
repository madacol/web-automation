// @name Copy Page as Markdown
// @description Copy selected content or the main article as Markdown, preserving headings, links, lists, code and tables. Preview and copy locally.
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

    /** @param {string} id @param {string} title @param {string} text */
    function textPanel(id, title, text) {
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
    const escapeMarkdown = text => text.replace(/[\\`*_[\]<>#|]/g, '\\$&');

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

    function selectedOrArticle() {
        const selection = window.getSelection();
        if (selection && !selection.isCollapsed && selection.toString().trim()) {
            const fragment = document.createDocumentFragment();
            for (let i = 0; i < selection.rangeCount; i++) fragment.append(selection.getRangeAt(i).cloneContents());
            return fragment;
        }
        return article();
    }

    /** @param {string} text @param {number} minimum */
    function fence(text, minimum) {
        return '`'.repeat(Math.max(minimum, ...[...text.matchAll(/`+/g)].map(match => match[0].length + 1)));
    }

    /** @param {Node} node @returns {string} */
    function markdown(node) {
        if (node.nodeType === Node.TEXT_NODE) return escapeMarkdown((node.textContent || '').replace(/\s+/g, ' '));
        if (node instanceof Element && excluded(node)) return '';
        const tag = node.nodeName;
        if (tag === 'PRE') {
            const text = (node.textContent || '').replace(/\n$/, '');
            const ticks = fence(text, 3);
            return `\n\n${ticks}\n${text}\n${ticks}\n\n`;
        }
        if (tag === 'CODE') {
            const text = node.textContent || '';
            const ticks = fence(text, 1);
            return `${ticks} ${text} ${ticks}`;
        }
        if (node instanceof HTMLOListElement || node instanceof HTMLUListElement) {
            const start = node instanceof HTMLOListElement ? node.start : 1;
            return '\n\n' + [...node.children].filter(child => child.tagName === 'LI').map((item, i) => {
                const text = [...item.childNodes].map(markdown).join('').trim().replace(/\n/g, '\n  ');
                return `${tag === 'OL' ? `${start + i}.` : '-'} ${text}`;
            }).join('\n') + '\n\n';
        }
        if (node instanceof HTMLTableElement) {
            const rows = [...node.rows].map(row => [...row.cells].map(cell => [...cell.childNodes].map(markdown).join('').trim().replace(/\n+/g, ' / ')));
            if (!rows.length) return '';
            const width = Math.max(...rows.map(row => row.length));
            const line = row => '| ' + Array.from({ length: width }, (_, i) => row[i] || '').join(' | ') + ' |';
            return '\n\n' + [line(rows[0]), line(Array(width).fill('---')), ...rows.slice(1).map(line)].join('\n') + '\n\n';
        }
        const text = [...node.childNodes].map(markdown).join('');
        if (/^H[1-6]$/.test(tag)) return `\n\n${'#'.repeat(Number(tag[1]))} ${text.trim()}\n\n`;
        if (['STRONG', 'B'].includes(tag)) return `**${text.trim()}**`;
        if (['EM', 'I'].includes(tag)) return `*${text.trim()}*`;
        if (tag === 'BLOCKQUOTE') return '\n\n' + text.trim().split('\n').map(line => `> ${line}`).join('\n') + '\n\n';
        if (tag === 'A' && node instanceof HTMLAnchorElement) {
            const href = safeLink(node.getAttribute('href') || '');
            return href ? `[${text.trim() || escapeMarkdown(href)}](<${href}>)` : text;
        }
        if (tag === 'IMG' && node instanceof HTMLImageElement) return node.alt ? `[Image: ${escapeMarkdown(node.alt)}]` : '';
        if (tag === 'BR') return '  \n';
        if (tag === 'HR') return '\n\n---\n\n';
        return ['P', 'DIV', 'SECTION', 'ARTICLE', 'MAIN', 'HEADER'].includes(tag) ? `\n\n${text.trim()}\n\n` : text;
    }

    new Set('P DIV SECTION ARTICLE HEADER H1 H2 H3 H4 H5 H6 STRONG EM B I S CODE PRE UL OL LI BLOCKQUOTE A BR HR TABLE THEAD TBODY TFOOT TR TH TD CAPTION'.split(' '));

    const body = markdown(selectedOrArticle()).replace(/\n{3,}/g, '\n\n').trim();
    const output = `# ${escapeMarkdown(document.title || 'Page')}\n\nSource: <${location.href}>\n\n${body}`;
    const view = textPanel('__getbookmarklets_markdown__', 'Copy Page as Markdown', output);
    if (view) view.status.textContent = 'Preview your selection or the main article, then copy.';

})();
