var Plan = require('../data/Plan');
var Status = require('../data/Status');
var async = require('async');
var function_1 = require('../function');
var Message = require("../data/Message");
var moment = require('moment');
var io = require('socket.io-client');
var socket = io.connect('http://localhost:3000');
var id = parseInt(process.argv[2]);
var task;
var taskQueue = [];
var state = Status.idle;
var pointer = 0;
var f = true;
var threshold = 60000;
function operate(task) {
    console.log(function_1.print('\tprocessing task'));
}
function load(p) {
    console.log(function_1.print('\tloading product' + p.id));
    var m = new Message('Machine', id, 'Warehouse', '', 'load', JSON.stringify(p));
    socket.emit('message', m);
}
function unload(p) {
    console.log(function_1.print('\tunloading product' + p.id));
    var m = new Message('Machine', id, 'Warehouse', '', 'unload', JSON.stringify(p));
    socket.emit('message', m);
}
function makePlan(plan) {
    console.log(function_1.print('making plan'));
    if (plan.m_id != id) {
        plan.m_id = id;
        plan.task.processTime = Math.ceil(Math.random() * 50000);
    }
    for (var i = pointer + 1; i < taskQueue.length; i++) {
        if (taskQueue[i].actualDueDate + plan.task.processTime > plan.task.plannedDueDate)
            break;
    }
    if (i > taskQueue.length) {
        plan.order = pointer;
        plan.actualDueDate = new Date().getTime() + plan.task.processTime;
        plan.cost = Number.NEGATIVE_INFINITY;
    }
    else {
        plan.order = i;
        plan.actualDueDate = taskQueue[i - 1].actualDueDate + plan.task.processTime;
        plan.cost = plan.actualDueDate - plan.task.plannedDueDate;
        for (var j = i; j < taskQueue.length; j++) {
            var c = taskQueue[i].actualDueDate + plan.task.processTime - taskQueue[i].task.plannedDueDate;
            if (plan.cost < c)
                plan.cost = c;
        }
    }
    if (plan.cost > threshold)
        plan.delay++;
    var m = new Message('Machine', id, 'Cell', '', 'decide', JSON.stringify(plan));
    socket.emit('message', m);
}
function run() {
    if (state == Status.idle) {
        state = Status.working;
        async.whilst(function () { return taskQueue.length > pointer && state == Status.working; }, function (callback) {
            console.log(function_1.print('task' + taskQueue[pointer].task.id + ' start'));
            load(taskQueue[pointer].task.productIn);
            operate(taskQueue[pointer]);
            setTimeout(function () {
                unload(taskQueue[pointer].task.productOut);
                console.log(function_1.print('task' + taskQueue[pointer].task.id + ' finish'));
                taskQueue[pointer].realTime = new Date().getTime();
                var d = taskQueue[pointer].realTime - taskQueue[pointer].actualDueDate;
                for (var k = pointer + 1; k < taskQueue.length; k++) {
                    taskQueue[k].actualDueDate += d;
                    taskQueue[k].cost += d;
                }
                for (var k = pointer + 1; k < taskQueue.length; k++) {
                    if (judgeDelay(taskQueue[k])) {
                        taskQueue.splice(k, 1);
                        break;
                    }
                }
                var m = new Message('Machine', id, 'UI', '', 'task queue', JSON.stringify(taskQueue));
                socket.emit('message', m);
                pointer++;
                callback();
            }, taskQueue[pointer].task.processTime);
        }, function (err) {
            state = Status.idle;
            console.log('idle');
        });
    }
}
function init() {
    console.log(function_1.print('initializing'));
    var d = new Date().getTime();
    for (var j = 0; j < 10; j++) {
        var p = new Plan();
        p.m_id = id;
        p.task.id = j + id * 1000;
        p.task.processTime = Math.ceil(Math.random() * 50000);
        d += p.task.processTime;
        p.actualDueDate = d;
        p.task.plannedDueDate = d + Math.ceil(Math.random() * 500000);
        p.cost = p.actualDueDate - p.task.plannedDueDate;
        console.log('\t' + p.task.id + ' ' + p.task.processTime / 1000 + ' ' + moment(p.task.plannedDueDate).format('HH:mm:ss.SSS'));
        taskQueue.push(p);
    }
    var m = new Message('Machine', id, 'UI', '', 'task queue', JSON.stringify(taskQueue));
    socket.emit('message', m);
    run();
}
function judgeDelay(plan) {
    if (plan.cost > threshold) {
        if (plan.delay == 0) {
            var m = new Message('Machine', id, 'UI', '', 'submit', JSON.stringify(plan));
            socket.emit('message', m);
            socket.emit('log', function_1.print('Task' + plan.task.id + ' delay'));
            return true;
        }
        else if (plan.delay == 1) {
            socket.emit('log', function_1.print('Task' + plan.task.id + ' cannot avoid delay'));
        }
        plan.delay++;
    }
    return false;
}
socket.emit('log', function_1.print('Machine' + id + ' connection'));
init();
socket.on('message', function (msg) {
    if (f) {
        var info = JSON.parse(msg.content);
        switch (msg.command) {
            case 'on-off':
                if (info == 'on')
                    run();
                else if (info == 'off')
                    state = Status.idle;
                break;
            case 'make plan':
                makePlan(info);
                break;
            case 'execute':
                if (info.m_id == id) {
                    taskQueue.splice(info.order, 0, info);
                    for (var j = info.order + 1; j < taskQueue.length; j++) {
                        taskQueue[j].actualDueDate += info.task.processTime;
                        taskQueue[j].cost += info.task.processTime;
                    }
                    for (var j = info.order + 1; j < taskQueue.length; j++) {
                        if (judgeDelay(taskQueue[j])) {
                            taskQueue.splice(j, 1);
                            break;
                        }
                    }
                    run();
                    var m = new Message('Machine', id, 'UI', '', 'task queue', JSON.stringify(taskQueue));
                    socket.emit('message', m);
                    console.log(function_1.print('add task' + info.task.id));
                }
            case 'state':
                var m = new Message('Machine', id, 'UI', '', 'task queue', JSON.stringify(taskQueue));
                socket.emit('message', m);
                break;
            case 'close':
                if (msg.d_id == id) {
                    var m = new Message('Machine', id, 'Cell', '', 'close', JSON.stringify({}));
                    socket.emit('message', m);
                    var p = [];
                    f = false;
                    state = Status.failure;
                    for (var j = pointer; j < taskQueue.length; j++)
                        p.push(taskQueue[j]);
                    var m = new Message('Machine', id, 'Cell', '', 'submit', JSON.stringify(p));
                    socket.emit('message', m);
                    setTimeout(function () {
                        process.exit();
                    }, 50);
                }
                break;
            case 'modify':
                for (var k = pointer + 1; k < taskQueue.length; k++) {
                    if (taskQueue[k].task.id == info.jid) {
                        taskQueue[k].task.plannedDueDate = new Date(info.year, info.month - 1, info.day, info.hour, info.minute).getTime();
                        taskQueue[k].cost = taskQueue[k].actualDueDate - taskQueue[k].task.plannedDueDate;
                        if (judgeDelay(taskQueue[k])) {
                            taskQueue.splice(k, 1);
                            break;
                        }
                        break;
                    }
                }
                break;
            default: break;
        }
    }
});
//# sourceMappingURL=Machine.js.map