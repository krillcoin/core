if (typeof module !== 'undefined') module.exports = Module;
if (typeof IWorker !== 'undefined') IWorker.fireModuleLoaded();
else if (typeof Krillcoin !== 'undefined' && Krillcoin.IWorker) Krillcoin.IWorker.fireModuleLoaded();
