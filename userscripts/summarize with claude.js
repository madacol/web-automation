// ==UserScript==
// @name         Summarize with Claude
// @version      0.1
// @description  Adds a menu option to summarize using Claude's API
// @match        https://*/*
// @grant        GM.xmlHttpRequest
// @grant        GM.getValue
// @grant        GM.setValue
// @grant        GM.registerMenuCommand
// @inject-into  content
// ==/UserScript==

(function() {
    'use strict';

    const CLAUDE_API_ENDPOINT = "https://api.anthropic.com/v1/messages";
    const MODEL = "claude-3-5-sonnet-20240620";
    const MAX_TOKENS = 4096;
    const SYSTEM_PROMPT="Summarize";

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

    async function queryClaude(prompt) {
        const apiKey = await getApiKey();

        const requestBody = {
            model: MODEL,
            max_tokens: MAX_TOKENS,
            temperature: 0,
            system: SYSTEM_PROMPT,
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
            ]
        };
        
        const popover = displayPopover("Loading...");

        GM.xmlHttpRequest({
            method: "POST",
            url: CLAUDE_API_ENDPOINT,
            headers: {
                "Content-Type": "application/json",
                "x-api-key": apiKey,
                "anthropic-version": "2023-06-01"
            },
            data: JSON.stringify(requestBody),
            onload: function(response) {
                if (response.status === 200) {
                    const result = JSON.parse(response.responseText);
                    popover.update(result.content[0].text);
                } else {
                    popover.close();
                    alert(`Error: ${response.status} ${response.statusText}\n\n${response.responseText}`);
                }
            },
            onerror: function(error) {
                popover.close();
                alert(`Error: ${error}`);
            }
        });
    }

    GM.registerMenuCommand("Summarize", function(){
        const selectedText = window.getSelection().toString().trim();
        if (selectedText) {
            queryClaude(selectedText);
        } else {
            alert("Please select some text first.");
        }
    })

})();