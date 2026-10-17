import { element, escapeMarkdown, safeLink, textPanel } from './ui.js';

const selection = window.getSelection();
const ranges = selection && !selection.isCollapsed ? Array.from({ length: selection.rangeCount }, (_, i) => selection.getRangeAt(i).cloneRange()) : [];
const links = new Map();
for (const anchor of document.querySelectorAll('a[href]')) {
    if (ranges.length && !ranges.some(range => range.intersectsNode(anchor))) continue;
    const style = getComputedStyle(anchor);
    if (style.display === 'none' || style.visibility === 'hidden' || !anchor.getClientRects().length || anchor.closest('[hidden],[aria-hidden="true"]')) continue;
    const href = safeLink(anchor.getAttribute('href') || '');
    if (!href) continue;
    const url = new URL(href);
    if (!['http:', 'https:'].includes(url.protocol) || links.has(url.href)) continue;
    links.set(url.href, (anchor.innerText || anchor.querySelector('img')?.alt || url.href).replace(/\s+/g, ' ').trim());
}
const markdown = [...links].map(([url, label]) => `- [${escapeMarkdown(label)}](<${url}>)`).join('\n');
const view = textPanel('__getbookmarklets_links__', 'Link Collector', markdown);
if (view) {
    const label = element('label', 'Format ');
    const format = element('select');
    format.setAttribute('aria-label', 'Format');
    for (const [value, text] of [['markdown', 'Markdown'], ['urls', 'URLs only']]) {
        const option = element('option', text);
        option.value = value;
        format.append(option);
    }
    label.append(format);
    view.toolbar.prepend(label);
    format.addEventListener('change', () => {
        view.textarea.value = format.value === 'urls' ? [...links.keys()].join('\n') : markdown;
    });
    view.status.textContent = `${links.size} unique links${ranges.length ? ' from your selection' : ' on this page'}.`;
}
