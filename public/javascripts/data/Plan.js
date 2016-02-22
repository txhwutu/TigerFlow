var Task = require('./Task');
var Plan = (function () {
    function Plan() {
        this.task = new Task();
        this.actualDueDate = 0;
        this.cost = 0;
        this.order = 0;
        this.m_id = 0;
        this.realTime = 0;
        this.delay = 0;
    }
    return Plan;
})();
module.exports = Plan;
//# sourceMappingURL=Plan.js.map