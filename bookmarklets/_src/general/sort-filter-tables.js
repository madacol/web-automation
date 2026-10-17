import { button, element } from './ui.js';

const id = '__getbookmarklets_tables__';
const existing = document.getElementById(id);
if (existing) {
    existing.dispatchEvent(new Event('getbookmarklets:close'));
} else {
    const marker = element('div');
    marker.id = id;
    marker.hidden = true;
    const cleanups = [];
    const close = () => { cleanups.forEach(cleanup => cleanup()); marker.remove(); };
    marker.addEventListener('getbookmarklets:close', close);
    const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });
    const number = text => /^[\s$€£¥+\-\d,.%]+$/.test(text) ? Number(text.replace(/[$€£¥,%\s]/g, '')) : NaN;
    let count = 0;
    for (const table of document.querySelectorAll('table')) {
        const header = table.tHead?.rows[0] || table.rows[0];
        if (!header || table.querySelector('table') || [...header.cells].some(cell => cell.tagName !== 'TH') || table.tHead?.rows.length > 1) continue;
        const groups = [...table.tBodies].map(body => ({ body, rows: [...body.rows].filter(row => row !== header) }));
        const rows = groups.flatMap(group => group.rows);
        if (!rows.length || [header, ...rows].some(row => row.cells.length !== header.cells.length || [...row.cells].some(cell => cell.colSpan !== 1 || cell.rowSpan !== 1))) continue;
        count++;
        const toolbar = element('div');
        const shadow = toolbar.attachShadow({ mode: 'open' });
        shadow.append(element('style', ':host{display:block}div{display:flex;gap:8px;flex-wrap:wrap;padding:8px;background:#fff;color:#17202a;font:16px system-ui}input,button{font:inherit;padding:5px}'));
        const controls = element('div');
        const search = element('input');
        search.type = 'search';
        search.setAttribute('aria-label', `Filter table ${count}`);
        search.placeholder = 'Filter rows…';
        controls.append(search);
        const hidden = new Map(rows.map(row => [row, row.hidden]));
        const oldSort = [...header.cells].map(cell => cell.getAttribute('aria-sort'));
        const sortButtons = [];
        let sorted = -1;
        let ascending = true;
        const reset = () => {
            for (const { body, rows } of groups) body.append(...rows);
            for (const row of rows) row.hidden = hidden.get(row);
            [...header.cells].forEach((cell, i) => oldSort[i] === null ? cell.removeAttribute('aria-sort') : cell.setAttribute('aria-sort', oldSort[i]));
            search.value = '';
            sorted = -1;
        };
        [...header.cells].forEach((cell, column) => {
            const label = cell.textContent.trim() || `column ${column + 1}`;
            const control = button(cell, '↕', () => {
                ascending = sorted === column ? !ascending : true;
                sorted = column;
                for (const { body, rows } of groups) {
                    const ordered = [...rows].sort((a, b) => {
                        const left = a.cells[column].textContent.trim();
                        const right = b.cells[column].textContent.trim();
                        const x = number(left), y = number(right);
                        const result = Number.isFinite(x) && Number.isFinite(y) ? x - y : collator.compare(left, right);
                        return result ? result * (ascending ? 1 : -1) : rows.indexOf(a) - rows.indexOf(b);
                    });
                    body.append(...ordered);
                }
                [...header.cells].forEach((other, i) => other.setAttribute('aria-sort', i === column ? ascending ? 'ascending' : 'descending' : 'none'));
            });
            control.setAttribute('aria-label', `Sort by ${label}`);
            sortButtons.push(control);
        });
        search.addEventListener('input', () => {
            const query = search.value.toLocaleLowerCase().trim();
            for (const row of rows) row.hidden = hidden.get(row) || !row.textContent.toLocaleLowerCase().includes(query);
        });
        button(controls, 'Reset table', reset);
        button(controls, 'Close table tools', close);
        shadow.append(controls);
        table.before(toolbar);
        cleanups.push(() => { reset(); sortButtons.forEach(button => button.remove()); toolbar.remove(); });
    }
    if (count) document.documentElement.append(marker);
    else alert('No simple tables with a header row found. Tables with merged cells are left unchanged.');
}
