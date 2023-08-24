/**
 * Adapted from this bookmarklet https://www.reddit.com/r/ChatGPT/comments/11h50jl/chatgpt_conversation_to_markdown_bookmarklet/
 */
(function () {
    let alertMsg = "";
    const humanMsgs = document.querySelectorAll(".group.w-full:has(img[alt=User])");
    const chatGPTMsgs = document.querySelectorAll(".group.w-full:has(.prose)");

    if (humanMsgs.length === 0 || chatGPTMsgs.length === 0) {
        return alert(`No messages found.\n humanMsgs: ${humanMsgs.length}\n chatGPTMsgs: ${chatGPTMsgs.length}`);
    }

    if (humanMsgs.length != chatGPTMsgs.length) {
        return alert(`count mismatch. \n humanMsgs: ${humanMsgs.length}\n chatGPTMsgs: ${chatGPTMsgs.length}`);
    }

    let title = document.querySelector("title").innerHTML;
    let timestamp = new Date().toISOString();
    const titleTimestamped = `${title} ${timestamp}`;
    let contentMD = `# ${titleTimestamped}\n\n`;
    humanMsgs.forEach((humanMsg, i) => {

        /**
         * Human messages
         */
        contentMD += "## HUMAN:\n\n";

        for (let child of humanMsg.querySelector('.break-words').children) {
            contentMD += child.outerText + "\n\n";
        }

        /**
         * ChatGPT messages
         */
        let chatGPTMsg = chatGPTMsgs[i];
        contentMD += "## CHATGPT:\n\n";

        /**
         * chatGPTMsgs children that have `.break-words` are the text messages
         * and the ones that don't have `.break-words` are the code executions
         */

        for (let child of chatGPTMsg.querySelector(".break-words").parentElement.children) {
            if (!child.classList.contains("break-words")) {
                /* these are code executions parragraphs */
                const [codeLabel, codeBlock, resultBlock] = child.children;
                contentMD += `\`${codeLabel.outerText}\`\n\n`;
                if (!codeBlock) {
                    console.error("No code block found");
                    codeLabel.querySelector("[role=button]").click();
                    alertMsg = "Some code blocks were collapsed and will not appear\n\nPlease, rerun this script again to include them\n\n(I just tried to expand them, so this message should not appear in the next rerun.";
                    continue;
                }
                contentMD += "```"
                    + codeBlock.querySelector(".items-center span").outerText
                    + "\n"
                    + codeBlock.querySelector("code").outerText
                    + "\n```\n\n";
                if (resultBlock.outerText) {
                    contentMD += "```\n"
                        + resultBlock.outerText
                        + "\n```\n\n";
                }
            } else {
                /* these are text messages, markdown rendered as html */
                for (let childText of child.querySelector(".prose").children) {
                    switch (childText.localName) {
                        case "p":
                            let img = childText.querySelector("img");
                            if (typeof (img) !== "undefined" && img !== null) {
                                const altText = img.alt || "";
                                const url = img.src || "";
                                const title = img.title || "";
                                contentMD += `![${altText}](${url} "${title}")\n\n`;
                            } else {
                                contentMD += childText.innerHTML.replace(/([^\n])(\n[^\n])/, "$1\\$2") + "\n\n";
                            }
                            break;

                        case "pre":
                            contentMD += "```"
                                + childText.querySelector(".items-center span").innerHTML
                                + "\n"
                                + childText.querySelector("code").outerText
                                + "\n```\n\n";
                            break;

                        case "ol": {
                            const liElements = childText.querySelectorAll("li");
                            for (let i = 0; i < liElements.length; i++) {
                                contentMD += `${i + 1}. ${liElements[i].textContent}\n\n`;
                            }
                            break;
                        }

                        case "ul": {
                            const liElements = childText.querySelectorAll("li");
                            for (let liElement of liElements) {
                                contentMD += `- ${liElement.innerHTML}\n\n`;
                            }
                            break;
                        }
                        case "table": {
                            const headers = [...childText.querySelectorAll("th")].map(header => header.textContent.trim());
                            const rows = [...childText.querySelectorAll("tbody tr")]
                                .map(row =>
                                    [...row.querySelectorAll("td")].map(cell => cell.textContent.trim())
                                );
                            const headersMD = `| ${headers.join(" | ")} |\n|${headers.map(() => "-----").join("|")}|`;
                            const rowsMD = rows.map(row => `| ${row.join(" | ")} |`).join("\n");

                            contentMD += `${headersMD}\n${rowsMD}\n\n`;
                            break;
                        }
                        case "h1":
                            contentMD += "## "
                                + childText.innerHTML
                                + "\n\n";
                            break;
                        case "h2":
                            contentMD += "### "
                                + childText.innerHTML
                                + "\n\n";
                            break;
                        case "h3":
                            contentMD += "#### "
                                + childText.innerHTML
                                + "\n\n";
                            break;
                        case "hr":
                            contentMD += "---\n\n";
                            break;

                        default:
                            console.error(`Unknown element: ${childText.localName}`);
                            contentMD += childText.outerHTML + "\n\n";
                            break;
                    }
                }
            }
        }

    });


    let filename = titleTimestamped + ".md";

    function downloadTextFile(filename, content) {
        let link = document.createElement("a");
        link.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(content));
        link.setAttribute("download", filename);
        link.style.display = "none";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (alertMsg) alert(alertMsg);

    downloadTextFile(filename, contentMD);
})();
