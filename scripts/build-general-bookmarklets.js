import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { rollup } from 'rollup';

const entries = [
    ['copy-page-as-markdown', 'Copy Page as Markdown', 'Copy selected content or the main article as Markdown, preserving headings, links, lists, code and tables. Preview and copy locally.'],
    ['form-draft-saver', 'Form Draft Saver', 'Save and restore unfinished forms in this site’s local storage. Password, payment and authentication-code fields are skipped.'],
    ['link-collector', 'Link Collector', 'Collect unique web links from your selection or the whole page. Copy them as Markdown or plain URLs without changing their query parameters.'],
    ['sort-filter-tables', 'Sort & Filter Any Table', 'Add column sorting and quick search to simple HTML tables. Close the tools or run again to restore original row order and visibility.'],
    ['focus-reader', 'Focus Reader', 'Read the main article in a clean text-focused view with adjustable text size and light, sepia or night themes. Close to return to the original page.']
];
await mkdir(new URL('../bookmarklets/', import.meta.url), { recursive: true });
for (const [slug, title, description] of entries) {
    const bundle = await rollup({ input: fileURLToPath(new URL(`../bookmarklets/_src/general/${slug}.js`, import.meta.url)) });
    try {
        await bundle.write({
            file: fileURLToPath(new URL(`../bookmarklets/${title}.js`, import.meta.url)),
            format: 'iife',
            banner: `// @name ${title}\n// @description ${description}`
        });
        console.log(title);
    } finally {
        await bundle.close();
    }
}
