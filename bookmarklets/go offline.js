// @name Go Offline
// @description Adds a restrictive policy to the page to block all connections and tries to stop open connections. Beware that this is not foolproof, it doesn't block already opened connections like websockets, it also doesn't affect some workers. Works better in Firefox.

(function() {
    const meta = document.createElement('meta');
    meta.httpEquiv = 'Content-Security-Policy';
    meta.content = "default-src 'unsafe-eval' data: blob:;";
    document.head.appendChild(meta);

    /* stop open connections. In Firefox, this will also close many web sockets */
    window.stop();
})();
