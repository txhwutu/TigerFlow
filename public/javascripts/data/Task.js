var Product = require('./Product');
var Task = (function () {
    function Task() {
        this.productIn = new Product();
        this.productOut = new Product();
        this.plannedDueDate = 0;
        this.operation = 0;
        this.processTime = 0;
        this.id = 0;
        this.type = 0;
        this.j_id = 0;
    }
    return Task;
})();
module.exports = Task;
//# sourceMappingURL=Task.js.map