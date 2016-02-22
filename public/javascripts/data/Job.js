var Product = require('./Product');
var Job = (function () {
    function Job() {
        this.dueDate = 0;
        this.product = new Product();
        this.type = 0;
        this.id = 0;
    }
    return Job;
})();
module.exports = Job;
//# sourceMappingURL=Job.js.map