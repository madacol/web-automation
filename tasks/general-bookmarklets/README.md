---
status: done
---

# Add five general bookmarklets

## Outcome

Publish Copy Page as Markdown, Form Draft Saver, Link Collector, Sort & Filter Any Table, and Focus Reader in madacol/web-automation and verify their browser behavior. Production registration is tracked separately by the Get Bookmarklets task staged-general-bookmarklets.

## Requirements

- Each distributed script is standalone JavaScript with userscript-style name and description metadata, without external runtime dependencies or background network requests.
- Draft saving excludes password, authentication-code, and payment fields. Reading/export tools preserve the original page; table enhancements restore original row order and visibility when closed.
- Verify actual output, clipboard copying, selection behavior, restoration, privacy exclusions, and DOM safety in Chromium before publishing.
- Marco authorized GitHub publication and explicitly chose staged submissions within the existing platform limit. Leave new submissions pending review.

## Progress

The live condition check was verified against production: false with an empty queue, true after adding a uniquely identified harmless submission, false after deleting it. Evidence: /tmp/bookmarklets-review.gbSrj4/live-condition-evidence.json. The check consumed one submission slot on October 17 around 22:18 UTC.

All five standalone artifacts were generated with pinned Rollup 4.60.4. Ten sandboxed system-Chromium tests pass against the exact artifacts, including actual clipboard writes, selected-content export, draft persistence and sensitive-field exclusions, selected-link deduplication, numeric table sorting/filtering/restoration, reader sanitization/theme controls, and Escape cleanup. The Get Bookmarklets unit suite passes (35 tests); its check command still reports the existing 51 errors and one warning in ten unrelated files.

## Completion

Published all five standalone scripts, shared authoring modules, reproducible build tooling, locked development dependencies, usage/privacy documentation and ten passing browser tests to madacol/web-automation master in commit db7ad690e457857159928c200d5848fe3fa37e9a. All five immutable raw GitHub URLs return HTTP 200, match their locally tested SHA-256 content hashes, and parse as standalone JavaScript. Source publication is complete.

Copy Page as Markdown was added to the production review queue as c8970498-a675-40da-bbbb-4a6bc300a26c. The other four are durably staged in the Get Bookmarklets workspace, where task staged-general-bookmarklets tracks their rate-limited registration. No submission was automatically accepted.
