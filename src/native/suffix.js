if (typeof module !== 'undefined') module.exports = Module;
if (typeof IWorker !== 'undefined') IWorker.fireModuleLoaded();
else if (typeof Krill !== 'undefined' && Krill.IWorker) Krill.IWorker.fireModuleLoaded();
