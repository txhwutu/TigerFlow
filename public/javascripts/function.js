///<reference path='../../typings/tsd.d.ts'/>
var moment = require('moment');
function print(msg, d) {
    if (d)
        return moment(d).format('MMMM Do YYYY,HH:mm:ss.SSS') + ' > ' + msg;
    else
        return moment().format('MMMM Do YYYY,HH:mm:ss.SSS') + ' > ' + msg;
}
exports.print = print;
//# sourceMappingURL=function.js.map