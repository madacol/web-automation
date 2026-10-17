import { escapeMarkdown, textPanel } from './ui.js';
import { markdown, selectedOrArticle } from './article.js';

const body = markdown(selectedOrArticle()).replace(/\n{3,}/g, '\n\n').trim();
const output = `# ${escapeMarkdown(document.title || 'Page')}\n\nSource: <${location.href}>\n\n${body}`;
const view = textPanel('__getbookmarklets_markdown__', 'Copy Page as Markdown', output);
if (view) view.status.textContent = 'Preview your selection or the main article, then copy.';
