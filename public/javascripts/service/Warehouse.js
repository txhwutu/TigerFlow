var Path = require('../data/Path');
var function_1 = require('../function');
var Message = require("../data/Message");
var exec = require('child_process').exec;
var io = require('socket.io-client');
var socket = io.connect('http://localhost:3000');
var product;
var map;
var states;
var Vid = 0;
var pth = new Path();
var AGV_num = 0;
var mark = 1;
function add(p, id) {
    console.log(function_1.print('warehouse add ' + p.id + ' from AGV ' + id));
}
function allocate(p, id) {
    console.log(function_1.print('warehouse allocate ' + p.id + ' to AGV ' + id));
}
function calPath(id) {
    Vid = Math.ceil(Math.random() * AGV_num);
}
socket.emit('link', 'Warehouse connetion');
socket.on('message', function (msg) {
    var info = JSON.parse(msg.content);
    switch (msg.command) {
        case 'create AGV':
            if (info.amount > 0) {
                for (var i = 0; i < info.amount; i++) {
                    exec('start \"AGV' + mark + '\" /min cmd /k node public/javascripts/service/AGV.js ' + mark);
                    socket.emit('log', function_1.print('AGV' + mark + ' created'));
                    AGV_num++;
                    mark++;
                }
                console.log(function_1.print(info.amount + ' AGV created'));
            }
            else
                socket.emit('log', function_1.print('no AGV created'));
            break;
        case 'load':
            calPath(msg.s_id);
            pth.pt = info;
            pth.m_id = msg.s_id;
            var m = new Message('Warehouse', '', 'AGV', Vid, 'pick up', JSON.stringify(pth));
            socket.emit('message', m);
            break;
        case 'unload':
            calPath(msg.s_id);
            pth.pt = info;
            var m = new Message('Warehouse', '', 'AGV', Vid, 'deliver', JSON.stringify(pth));
            socket.emit('message', m);
            break;
        case 'get':
            allocate(info, msg.s_id);
            break;
        case 'send':
            add(info, msg.s_id);
            break;
        case 'close':
            if (msg.source == 'AGV') {
                AGV_num--;
                console.log(function_1.print(msg.source + msg.s_id + ' close'));
                socket.emit('log', function_1.print('AGV' + msg.s_id + ' closed', msg.timeStamp));
            }
            break;
        default: break;
    }
});
//# sourceMappingURL=Warehouse.js.map