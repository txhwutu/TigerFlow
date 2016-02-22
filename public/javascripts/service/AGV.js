var Position = require('../data/Position');
var function_1 = require('../function');
var Message = require("../data/Message");
var io = require('socket.io-client');
var socket = io.connect('http://localhost:3000');
var location = new Position();
var id = parseInt(process.argv[2]);
function move(path) {
    //    console.log(print('moving from '+path[0]+' to '+path[path.length-1]));
}
function pickup(p) {
    console.log(function_1.print('picking up ' + p.pt.id + ' for Machine' + p.m_id));
    move(p.path1);
    var m = new Message('AGV', id, 'Warehouse', '', 'get', JSON.stringify(p.pt));
    socket.emit('message', m);
    move(p.path2);
}
function deliver(p) {
    console.log(function_1.print('delivering ' + p.pt.id + ' for Machine' + p.m_id));
    move(p.path1);
    move(p.path2);
    var m = new Message('AGV', id, 'Warehouse', '', 'send', JSON.stringify(p.pt));
    socket.emit('message', m);
}
socket.emit('log', function_1.print('AGV' + id + ' connection'));
socket.on('message', function (msg) {
    var info = JSON.parse(msg.content);
    switch (msg.command) {
        case 'pick up':
            if (msg.d_id == id) {
                move(info.path1);
                pickup(info);
                move(info.path2);
            }
            break;
        case 'deliver':
            if (msg.d_id == id) {
                deliver(info);
            }
            break;
        default: break;
    }
});
//# sourceMappingURL=AGV.js.map