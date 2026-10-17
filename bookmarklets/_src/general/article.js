import { element, escapeMarkdown, safeLink } from './ui.js';

/** @param {Element} node */
export function excluded(node) {
    if (node.matches('script,style,noscript,template,nav,aside,footer,form,input,textarea,select,button,iframe,object,embed,[hidden],[aria-hidden="true"]')) return true;
    const style = node.isConnected ? getComputedStyle(node) : node instanceof HTMLElement ? node.style : null;
    return style?.display === 'none' || style?.visibility === 'hidden' || style?.visibility === 'collapse';
}

export function article() {
    const articles = [...document.querySelectorAll('article')].filter(node => !excluded(node));
    const candidates = articles.length ? articles : [...document.querySelectorAll('main,[role="main"]')].filter(node => !excluded(node));
    return candidates.sort((a, b) => (b.textContent?.length ?? 0) - (a.textContent?.length ?? 0))[0] || document.body;
}

export function selectedOrArticle() {
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
export function markdown(node) {
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

const readerTags = new Set('P DIV SECTION ARTICLE HEADER H1 H2 H3 H4 H5 H6 STRONG EM B I S CODE PRE UL OL LI BLOCKQUOTE A BR HR TABLE THEAD TBODY TFOOT TR TH TD CAPTION'.split(' '));

/** @param {Node} node @returns {Node} */
export function readerContent(node) {
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
