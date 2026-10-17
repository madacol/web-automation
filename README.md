# Web automation

Bookmarklets and userscripts for browser tasks. The standalone scripts in `bookmarklets/` can be pasted into Get Bookmarklets or served directly from their raw GitHub URLs.

## General bookmarklets

- [Copy Page as Markdown](<bookmarklets/Copy Page as Markdown.js>): preview and copy selected content or the main article, including headings, links, lists, code, tables and its source URL.
- [Form Draft Saver](<bookmarklets/Form Draft Saver.js>): explicitly save, restore or delete drafts in the current site's local storage. Password, payment and authentication-code fields are excluded. Stored drafts are accessible to that site and other users of the same browser profile.
- [Link Collector](<bookmarklets/Link Collector.js>): deduplicate web links from a selection or the page and copy Markdown or plain URLs, preserving meaningful query parameters.
- [Sort & Filter Any Table](<bookmarklets/Sort & Filter Any Table.js>): add sorting and search to simple HTML tables. Reset or close restores original row order and visibility; merged-cell tables are left unchanged.
- [Focus Reader](<bookmarklets/Focus Reader.js>): show a sanitized, text-focused article with font-size and theme controls. Images are represented by their alternative text; closing restores the original view.

Each of these scripts runs locally without downloading runtime libraries. Export tools preview text before copying it. Run a script again or press Escape to close its dialog; table tools also provide a close button. Browser security policies can prevent clipboard copying, in which case the output remains selectable for manual copying.

## Development

Use Node 24 or later and pnpm. The build uses pinned Rollup; browser checks use pinned Playwright and an existing sandboxed Chromium at `/usr/bin/chromium`, without downloading a browser.

```sh
pnpm install
pnpm build:bookmarklets
pnpm test:bookmarklets
```

Edit the modules under `bookmarklets/_src/general/`, then rebuild and commit the generated standalone files. The browser tests execute those exact standalone files, including real clipboard copying, form persistence and sensitive-field exclusions, selection handling, numeric table sorting, restoration, reader sanitization and cleanup.
