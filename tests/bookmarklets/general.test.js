import { readFile } from 'node:fs/promises';
import { expect, test } from '@playwright/test';

const titles = ['Copy Page as Markdown', 'Form Draft Saver', 'Link Collector', 'Sort & Filter Any Table', 'Focus Reader'];

/** @param {string} title */
async function source(title) {
    return readFile(new URL(`../../bookmarklets/${title}.js`, import.meta.url), 'utf8');
}

/** @param {import('@playwright/test').Page} page @param {string} html */
async function fixture(page, html) {
    await page.route('**/*', route => route.fulfill({
        contentType: 'text/html',
        body: `<!doctype html><html><head><title>Useful page</title><style>.private{display:none}</style></head><body>${html}</body></html>`
    }));
    await page.goto('https://fixture.example/article');
}

test('Markdown preserves article structure and copies the actual preview to the clipboard', async ({ page }) => {
    await fixture(page, '<nav>Unrelated navigation</nav><main><h2>Chapter</h2><p>A <strong>useful</strong> <a href="/guide?q=1">guide</a>.</p><ul><li>First</li><li>Second</li></ul><pre><code>let x = 1;</code></pre><p class="private">Hidden secret</p><form><textarea>Private draft</textarea></form></main>');
    const requests = [];
    page.on('request', request => requests.push(request.url()));
    await page.evaluate(await source('Copy Page as Markdown'));
    const preview = await page.getByRole('textbox', { name: 'Output' }).inputValue();
    expect(preview).toContain('# Useful page');
    expect(preview).toContain('https://fixture.example/article');
    expect(preview).toContain('## Chapter');
    expect(preview).toContain('**useful**');
    expect(preview).toContain('[guide](<https://fixture.example/guide?q=1>)');
    expect(preview).toContain('- First');
    expect(preview).toContain('```\nlet x = 1;\n```');
    expect(preview).not.toMatch(/Unrelated navigation|Hidden secret|Private draft/);
    await page.getByRole('button', { name: 'Copy', exact: true }).click();
    await expect(page.getByRole('status')).toHaveText('Copied.');
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(preview);
    expect(requests).toEqual([]);
});

test('Markdown exports just the selection and handles backticks in code', async ({ page }) => {
    await fixture(page, '<main><p id="selection">Only <em>these words</em>.</p><p>Outside selection</p><pre><code>const ticks = "```";</code></pre></main>');
    await page.evaluate(() => {
        const range = document.createRange();
        range.selectNodeContents(document.getElementById('selection'));
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
    });
    await page.evaluate(await source('Copy Page as Markdown'));
    await expect(page.getByRole('textbox', { name: 'Output' })).toHaveValue(/Only \*these words\*\./);
    expect(await page.getByRole('textbox', { name: 'Output' }).inputValue()).not.toContain('Outside selection');
    await page.getByRole('button', { name: 'Close', exact: true }).click();
    await page.evaluate(() => window.getSelection().removeAllRanges());
    await page.evaluate(await source('Copy Page as Markdown'));
    expect(await page.getByRole('textbox', { name: 'Output' }).inputValue()).toContain('````\nconst ticks = "```";\n````');
});

test('drafts survive reload, restore input events, and exclude sensitive fields', async ({ page }) => {
    await fixture(page, '<form><input id="name" name="name"><textarea id="message" name="message"></textarea><input id="agree" name="agree" type="checkbox"><input id="password" name="password" type="password"><input id="card" name="card_number" autocomplete="cc-number"><input id="otp" name="otp" autocomplete="one-time-code"><input name="token" type="hidden" value="secret-token"></form><script>window.changes=0;document.addEventListener("input",()=>window.changes++);</script>');
    await page.locator('#name').fill('Alice');
    await page.locator('#message').fill('Keep this draft');
    await page.locator('#agree').check();
    await page.locator('#password').fill('never-save-password');
    await page.locator('#card').fill('never-save-card');
    await page.locator('#otp').fill('never-save-otp');
    await page.evaluate(() => localStorage.setItem('unrelated', 'keep'));
    await page.evaluate(await source('Form Draft Saver'));
    await page.getByRole('button', { name: 'Save draft', exact: true }).click();
    const saved = await page.evaluate(() => JSON.stringify(localStorage));
    expect(saved).toContain('Keep this draft');
    expect(saved).not.toMatch(/never-save|secret-token/);
    await page.reload();
    await page.evaluate(await source('Form Draft Saver'));
    await page.getByRole('button', { name: 'Restore draft', exact: true }).click();
    await page.getByRole('button', { name: 'Close', exact: true }).click();
    await expect(page.locator('#name')).toHaveValue('Alice');
    await expect(page.locator('#message')).toHaveValue('Keep this draft');
    await expect(page.locator('#agree')).toBeChecked();
    await expect(page.locator('#password')).toHaveValue('');
    await expect(page.locator('#card')).toHaveValue('');
    expect(await page.evaluate(() => window.changes)).toBeGreaterThan(0);
    await page.evaluate(await source('Form Draft Saver'));
    await page.getByRole('button', { name: 'Delete draft', exact: true }).click();
    expect(await page.evaluate(() => localStorage.getItem('unrelated'))).toBe('keep');
    expect(await page.evaluate(() => JSON.stringify(localStorage))).not.toContain('Keep this draft');
});

test('link collection respects selection, deduplicates URLs and keeps meaningful query parameters', async ({ page }) => {
    await fixture(page, '<section id="links"><a href="/a?item=12">One</a><a href="/a?item=12">Duplicate</a><a href="https://other.example/b">Two</a><a href="javascript:alert(1)">Unsafe link</a></section><a href="/outside">Outside selection</a>');
    await page.evaluate(() => {
        const range = document.createRange();
        range.selectNodeContents(document.getElementById('links'));
        window.getSelection().addRange(range);
    });
    await page.evaluate(await source('Link Collector'));
    const output = page.getByRole('textbox', { name: 'Output' });
    expect(await output.inputValue()).toBe('- [One](<https://fixture.example/a?item=12>)\n- [Two](<https://other.example/b>)');
    await page.getByLabel('Format', { exact: true }).selectOption('urls');
    expect(await output.inputValue()).toBe('https://fixture.example/a?item=12\nhttps://other.example/b');
    await page.getByRole('button', { name: 'Copy', exact: true }).click();
    await expect(page.getByRole('status')).toHaveText('Copied.');
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(await output.inputValue());
});

test('table sorting is numeric, filters rows, and restores the original table without submitting its form', async ({ page }) => {
    await fixture(page, '<form><table><thead><tr><th>Name</th><th>Price</th></tr></thead><tbody><tr id="b"><td>Beta</td><td>$20</td></tr><tr id="a"><td>Alpha</td><td>$3</td></tr><tr id="c"><td>Charlie</td><td>$1,000</td></tr></tbody></table></form><script>window.submissions=0;document.querySelector("form").onsubmit=e=>{e.preventDefault();window.submissions++;};</script>');
    await page.evaluate(await source('Sort & Filter Any Table'));
    await page.getByRole('button', { name: 'Sort by Price', exact: true }).click();
    expect(await page.locator('tbody tr').evaluateAll(rows => rows.map(row => row.id))).toEqual(['a', 'b', 'c']);
    await page.getByRole('button', { name: 'Sort by Price', exact: true }).click();
    expect(await page.locator('tbody tr').evaluateAll(rows => rows.map(row => row.id))).toEqual(['c', 'b', 'a']);
    await page.getByRole('searchbox', { name: 'Filter table 1' }).fill('Beta');
    await expect(page.locator('tbody tr:visible')).toHaveCount(1);
    await expect(page.locator('tbody tr:visible')).toHaveAttribute('id', 'b');
    await page.getByRole('button', { name: 'Close table tools', exact: true }).click();
    expect(await page.locator('tbody tr').evaluateAll(rows => rows.map(row => row.id))).toEqual(['b', 'a', 'c']);
    await expect(page.locator('tbody tr:visible')).toHaveCount(3);
    expect(await page.evaluate(() => window.submissions)).toBe(0);
});

test('the reader sanitizes content, changes its font/theme and preserves the original page', async ({ page }) => {
    await fixture(page, '<nav>Menu noise</nav><article><h1>Read this</h1><p>Useful article content.</p><a href="javascript:window.hacked=true">Unsafe</a><p onclick="window.hacked=true">Still readable</p><img alt="An illustration" src="https://images.example/test.png"><script>window.articleLoaded=true;</script></article><button id="original" onclick="window.originalClicked=true">Original button</button>');
    const requests = [];
    page.on('request', request => requests.push(request.url()));
    await page.evaluate(await source('Focus Reader'));
    const reader = page.getByRole('region', { name: 'Article' });
    await expect(reader).toContainText('Useful article content.');
    await expect(reader).toContainText('An illustration');
    expect(await reader.innerHTML()).not.toMatch(/<script|onclick|javascript:|<img/);
    await page.getByLabel('Text size', { exact: true }).focus();
    await page.keyboard.press('End');
    await expect(reader).toHaveCSS('font-size', '32px');
    await page.getByLabel('Theme', { exact: true }).selectOption('night');
    await expect(page.getByRole('dialog')).toHaveCSS('background-color', 'rgb(28, 32, 37)');
    await page.getByRole('button', { name: 'Close', exact: true }).click();
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(page.locator('article')).toContainText('Useful article content.');
    await page.locator('#original').click();
    expect(await page.evaluate(() => window.originalClicked)).toBe(true);
    expect(requests).toEqual([]);
});

for (const title of titles.filter(title => title !== 'Sort & Filter Any Table')) {
    test(`${title} closes cleanly with Escape and can be reopened`, async ({ page }) => {
        await fixture(page, '<main><p>Some text <a href="/one">with a link</a>.</p><form><textarea name="message"></textarea></form></main>');
        const script = await source(title);
        await page.evaluate(script);
        await expect(page.getByRole('dialog')).toBeVisible();
        await page.keyboard.press('Escape');
        await expect(page.getByRole('dialog')).toHaveCount(0);
        await page.evaluate(script);
        await expect(page.getByRole('dialog')).toHaveCount(1);
    });
}
