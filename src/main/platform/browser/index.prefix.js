if (typeof Krillcoin === 'undefined') {
    var Krillcoin = typeof window !== 'undefined' ? window : {};
}
var Proxy; // ensure Proxy exists
(function (exports) {
    exports = typeof exports !== 'undefined' ? exports : {};
    Krillcoin = exports;
    if (!Krillcoin._currentScript) {
        Krillcoin._currentScript = document.currentScript;
    }
    if (!Krillcoin._currentScript) {
        // Heuristic
        const scripts = document.getElementsByTagName('script');
        Krillcoin._currentScript = scripts[scripts.length - 1];
    }
    if (!Krillcoin._path) {
        if (Krillcoin._currentScript && Krillcoin._currentScript.src.indexOf('/') !== -1) {
            Krillcoin._path = Krillcoin._currentScript.src.substring(0, Krillcoin._currentScript.src.lastIndexOf('/') + 1);
        } else {
            // Fallback
            Krillcoin._path = './';
        }
    }
