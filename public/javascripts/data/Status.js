/**
 * Created by txh on 2015/11/24.
 */
var Status;
(function (Status) {
    Status[Status["working"] = 0] = "working";
    Status[Status["failure"] = 1] = "failure";
    Status[Status["idle"] = 2] = "idle";
})(Status || (Status = {}));
;
module.exports = Status;
//# sourceMappingURL=Status.js.map