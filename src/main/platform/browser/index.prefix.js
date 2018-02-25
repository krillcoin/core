if (typeof Krill === 'undefined') {
    var Krill = typeof window !== 'undefined' ? window : {};
}
var Proxy; // ensure Proxy exists
(function (exports) {
    exports = typeof exports !== 'undefined' ? exports : {};
    Krill = exports;
    if (!Krill._currentScript) {
        Krill._currentScript = document.currentScript;
    }
    if (!Krill._currentScript) {
        // Heuristic
        const scripts = document.getElementsByTagName('script');
        Krill._currentScript = scripts[scripts.length - 1];
    }
    if (!Krill._path) {
        if (Krill._currentScript && Krill._currentScript.src.indexOf('/') !== -1) {
            Krill._path = Krill._currentScript.src.substring(0, Krill._currentScript.src.lastIndexOf('/') + 1);
        } else {
            // Fallback
            Krill._path = './';
        }
    }
