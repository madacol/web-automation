// @name Re-follow all friends
// @description Re-follow friends you have previously unfollowed on Facebook. Run this script in the "All Friends" page (https://www.facebook.com/friends/list).
// @match https://www.facebook.com/friends/list

(async function() {
    // get first friend
    let friendCard = document.querySelectorAll('[data-visualcompletion="ignore-dynamic"]:has(> a[tabindex])')[0];

    while (friendCard) {
        friendCard.scrollIntoView();
        friendCard.querySelector('[aria-label="More"]').click();
        document.querySelectorAll('[role="menuitem"][tabindex]').forEach( element => {
            if (element.textContent.startsWith("Follow")) {
                element.click()
                console.log(`${element.textContent} --- ${friendCard.textContent}`);
            }
        })
        await waitMs(1000);
        friendCard = friendCard.nextElementSibling;
    }

    function waitMs(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
})();
