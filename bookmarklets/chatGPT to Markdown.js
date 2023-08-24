/**
 * Adapted from this bookmarklet https://www.reddit.com/r/ChatGPT/comments/11h50jl/chatgpt_conversation_to_markdown_bookmarklet/
 */
(function () {
    const humanMsgs = document.querySelectorAll(".group.w-full:has(img[alt=User])");
    const chatGPTMsgs = document.querySelectorAll(".group.w-full:has(.prose)");

    if (humanMsgs.length === 0 || chatGPTMsgs.length === 0) {
        return alert(`No messages found.\n humanMsgs: ${humanMsgs.length}\n chatGPTMsgs: ${chatGPTMsgs.length}`);
    }

    if (humanMsgs.length != chatGPTMsgs.length) {
        return alert("count mismatch. \n humanMsgs: ${humanMsgs.length}\n chatGPTMsgs: ${chatGPTMsgs.length}`");
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

        for (let child of chatGPTMsg.querySelector(".prose").children) {
            switch (child.localName) {
                case "p":
                    let img = child.querySelector("img");
                    if (typeof (img) !== "undefined" && img !== null) {
                        const altText = img.alt || "";
                        const url = img.src || "";
                        const title = img.title || "";
                        contentMD += `![${altText}](${url} "${title}")\n\n`;
                    } else {
                        contentMD += child.innerHTML.replace(/([^\n])(\n[^\n])/, "$1\\$2") + "\n\n";
                    }
                    break;

                case "pre":
                    contentMD += "```"
                        + child.querySelector(".items-center span").innerHTML
                        + "\n"
                        + child.querySelector("code").outerText
                        + "```\n\n";
                    break;

                case "ol": {
                    const liElements = child.querySelectorAll("li");
                    for (let i = 0; i < liElements.length; i++) {
                        contentMD += `${i + 1}. ${liElements[i].textContent}\n\n`;
                    }
                    break;
                }

                case "ul": {
                    const liElements = child.querySelectorAll("li");
                    for (let liElement of liElements) {
                        contentMD += `- ${liElement.innerHTML}\n\n`;
                    }
                    break;
                }
                case "table": {
                    const headers = [...child.querySelectorAll("th")].map(header => header.textContent.trim());
                    const rows = [...child.querySelectorAll("tbody tr")]
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
                        + child.innerHTML
                        + "\n\n";
                    break;
                case "h2":
                    contentMD += "### "
                        + child.innerHTML
                        + "\n\n";
                    break;
                case "h3":
                    contentMD += "#### "
                        + child.innerHTML
                        + "\n\n";
                    break;
                case "hr":
                    contentMD += "---\n\n";
                    break;

                default:
                    console.error(`Unknown element: ${child.localName}`);
                    contentMD += child.outerHTML + "\n\n";
                    break;
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

    downloadTextFile(filename, contentMD);
})();
