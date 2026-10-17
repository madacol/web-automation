import { defineConfig } from '@playwright/test';

export default defineConfig({
    testDir: './tests/bookmarklets',
    workers: 1,
    timeout: 15000,
    use: {
        browserName: 'chromium',
        launchOptions: { executablePath: '/usr/bin/chromium', chromiumSandbox: true },
        permissions: ['clipboard-read', 'clipboard-write']
    }
});
