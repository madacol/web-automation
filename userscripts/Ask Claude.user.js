// ==UserScript==
// @name         Ask Claude
// @version      0.1
// @description  Add menu options to process selected text using Claude's API with different prompts. I DO NOT RECOMMEND using this as a bookmarklet, you will be exposing your API keys to the webpage.
// @video        https://raw.githubusercontent.com/madacol/web-automation/refs/heads/master/userscripts/Summarize%20with%20claude.mp4
// @match        *://*/*
// @grant        GM.xmlHttpRequest
// @grant        GM.getValue
// @grant        GM.setValue
// @grant        GM.registerMenuCommand
// @inject-into  content
// ==/UserScript==

'use strict';

const CLAUDE_API_ENDPOINT = "https://api.anthropic.com/v1/messages";
const MODEL = "claude-3-5-sonnet-20240620";
const MAX_TOKENS = 4096;

// Define different configurations for various commands
const COMMANDS = [
    {
        name: "Summarize",
        getSystemPrompt: () => "What are the questions that this text tries to answer? Capture the main points and core meaning of the text.\n\nWhen formulating your questions:\n\na. Address the central theme or argument\nb. Identify key supporting ideas\nc. Highlight facts and evidences\nd. Reveal the author's purpose or perspective\ne. Explore any significant implications or conclusions\n\nAnswer all of your generated questions one-by-one in detail.",
    },
    {
        name: "Ask",
        getSystemPrompt: () => prompt("Enter a prompt for Claude:")
    },
];

// Register menu commands
COMMANDS.forEach(command => {
    GM.registerMenuCommand(command.name, () => {
        const selectedText = window.getSelection().toString().trim();
        if (!selectedText)
            return alert("Please select some text first.");
        queryClaude(selectedText, command.getSystemPrompt());
    });
});

async function queryClaude(prompt, systemPrompt) {
    const apiKey = await getApiKey();

    const requestBody = {
        model: MODEL,
        max_tokens: MAX_TOKENS,
        temperature: 0,
        system: systemPrompt,
        messages: [
            {
                role: "user",
                content: [
                    {
                        type: "text",
                        text: prompt
                    }
                ]
            }
        ],
        stream: true
    };
    
    const popover = displayPopover("Loading...");

    try {
        const response = await fetch(CLAUDE_API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let accumulatedText = "";

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n');
            
            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    const data = line.slice(6);
                    if (data !== '[DONE]') {
                        try {
                            const parsed = JSON.parse(data);
                            if (parsed.type === 'content_block_delta' && parsed.delta.type === 'text_delta') {
                                accumulatedText += parsed.delta.text;
                                popover.update(accumulatedText);
                            }
                        } catch (e) {
                            console.error('Error parsing JSON:', e);
                        }
                    }
                }
            }
        }
    } catch (error) {
        alert(`Error: ${error.message}\n\n${error.stack}`);
    }
};

async function getApiKey() {
    const apiKey = await GM.getValue("anthropicApiKey", "");
    if (!apiKey) {
        const newApiKey = prompt("Enter your Anthropic API key:");
        if (!newApiKey) throw new Error("Empty API key");
        await GM.setValue("anthropicApiKey", newApiKey);
        return newApiKey;
    }
    return apiKey;
}

function displayPopover(text) {
    const popover = document.createElement('div');
    popover.setAttribute('popover', "auto");
    popover.style.cssText = `
        max-width: 80vw;
        max-height: 80vh;
        margin: auto;
        overflow: auto;
        z-index: 9999;
        padding: 1em;
        border: 2px solid black;
    `;

    const responsePre = document.createElement('pre');
    responsePre.textContent = text;
    responsePre.style.cssText = `
        text-wrap: wrap;
    `;

    popover.appendChild(responsePre);
    document.documentElement.appendChild(popover);

    popover.showPopover();

    return {
        update(newText) {
            responsePre.textContent = newText;
        },
        close() {
            document.documentElement.removeChild(popover);
        }
    }
}
