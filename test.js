var utils = require("./Utils");


(async () => {
    var x = await utils.ramSpace();
    console.log("QUI", x);
})();
