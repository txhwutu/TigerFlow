/// <reference path='../typings/tsd.d.ts' />
/**
 * Module dependencies.
 */
var app = require('../app');
var debugModule = require('debug');
var http = require('http');
var function_1 = require("../public/javascripts/function");
var debug = debugModule('shopfloor:server');
/**
 * Get port from environment and store in Express.
 */
var port = normalizePort(process.env.PORT || '3000');
app.set('port', port);
/**
 * Create HTTP server.
 */
var server = http.createServer(app);
var io = require('socket.io').listen(server);
var exec = require('child_process').exec;
/**
 * Listen on provided port, on all network interfaces.
 */
server.listen(port);
server.on('error', onError);
server.on('listening', onListening);
/**
 * Normalize a port into a number, string, or false.
 */
io.on('connection', function (socket) {
    socket.on('link', function (msg) {
        console.log(function_1.print(msg));
    });
    socket.on('message', function (msg) {
        io.sockets.emit('message', msg);
        console.log(function_1.print(msg.source + msg.s_id + ' ' + msg.destination + msg.d_id + ' ' + msg.command + ' ' + msg.content));
    });
    socket.on('log', function (msg) {
        io.sockets.emit('log', msg);
    });
});
function normalizePort(val) {
    var port = parseInt(val, 10);
    if (isNaN(port)) {
        // named pipe
        return val;
    }
    if (port >= 0) {
        // port number
        return port;
    }
    return false;
}
/**
 * Event listener for HTTP server "error" event.
 */
function onError(error) {
    if (error.syscall !== 'listen') {
        throw error;
    }
    var bind = typeof port === 'string'
        ? 'Pipe ' + port
        : 'Port ' + port;
    // handle specific listen errors with friendly messages
    switch (error.code) {
        case 'EACCES':
            console.error(bind + ' requires elevated privileges');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(bind + ' is already in use');
            process.exit(1);
            break;
        default:
            throw error;
    }
}
/**
 * Event listener for HTTP server "listening" event.
 */
function onListening() {
    var addr = server.address();
    var bind = typeof addr === 'string'
        ? 'pipe ' + addr
        : 'port ' + addr.port;
    debug('Listening on ' + bind);
    exec('start \"Cell\" /min cmd /k node public/javascripts/service/Cell.js');
    exec('start \"Warehouse\" /min cmd /k node public/javascripts/service/Warehouse.js');
}
//# sourceMappingURL=www.js.map