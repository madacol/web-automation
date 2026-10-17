import { element, panel } from './ui.js';
import { article, readerContent } from './article.js';

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
