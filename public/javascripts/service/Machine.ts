import Job = require('../data/Job');
import Product = require('../data/Product');
import Task = require('../data/Task');
import Plan = require('../data/Plan');
import Status = require('../data/Status');
import async = require('async');
import {print} from '../function';
import Message = require("../data/Message");
import moment = require('moment')

var io = require('socket.io-client');
var socket = io.connect('http://localhost:3000');
var id=parseInt(process.argv[2]);
var task:Task[];
var taskQueue:Plan[]=[];
var state:Status=Status.idle;
var pointer:number=0;
var f=true;
var threshold:number=60000;

function operate(task:Plan){
    console.log(print('\tprocessing task'));
}

function load(p:Product){
    console.log(print('\tloading product'+p.id));
    var m:Message=new Message('Machine',id,'Warehouse','','load',JSON.stringify(p));
    socket.emit('message',m);
}

function unload(p:Product){
    console.log(print('\tunloading product'+ p.id));
    var m:Message=new Message('Machine',id,'Warehouse','','unload',JSON.stringify(p));
    socket.emit('message',m);
}

function makePlan(plan:Plan){
    console.log(print('making plan'));
    if (plan.m_id != id){
        plan.m_id = id;
        plan.task.processTime = Math.ceil(Math.random() * 50000);
    }
    for (var i=pointer+1;i<taskQueue.length;i++) {
        if (taskQueue[i].actualDueDate+plan.task.processTime>plan.task.plannedDueDate) break;
    }
    if (i>taskQueue.length){
        plan.order=pointer;
        plan.actualDueDate=new Date().getTime()+plan.task.processTime;
        plan.cost=Number.NEGATIVE_INFINITY;
    }
    else {
        plan.order=i;
        plan.actualDueDate=taskQueue[i-1].actualDueDate+plan.task.processTime;
        plan.cost=plan.actualDueDate-plan.task.plannedDueDate;
        for (var j=i;j<taskQueue.length;j++) {
            var c = taskQueue[i].actualDueDate + plan.task.processTime - taskQueue[i].task.plannedDueDate;
            if (plan.cost < c) plan.cost = c;
        }
    }
    if (plan.cost>threshold) plan.delay++;
    var m:Message=new Message('Machine',id,'Cell','','decide',JSON.stringify(plan));
    socket.emit('message',m);
}

function run(){
    if (state==Status.idle) {
        state=Status.working;
        async.whilst(
            function () { return taskQueue.length > pointer && state==Status.working;},
            function (callback) {
                console.log(print('task'+taskQueue[pointer].task.id  + ' start'));
                load(taskQueue[pointer].task.productIn);
                operate(taskQueue[pointer]);
                setTimeout(function() {
                    unload(taskQueue[pointer].task.productOut);
                    console.log(print('task'+taskQueue[pointer].task.id + ' finish'));
                    taskQueue[pointer].realTime=new Date().getTime();
                    var d=taskQueue[pointer].realTime-taskQueue[pointer].actualDueDate;
                    for (let k=pointer+1;k<taskQueue.length;k++) {
                        taskQueue[k].actualDueDate +=d ;
                        taskQueue[k].cost +=d;
                    }
                    for (let k = pointer + 1; k < taskQueue.length; k++) {
                        if (judgeDelay(taskQueue[k])) {
                            taskQueue.splice(k,1);
                            break;
                        }
                    }
                    var m:Message = new Message('Machine', id, 'UI', '', 'task queue', JSON.stringify(taskQueue));
                    socket.emit('message', m);
                    pointer++;
                    callback();
                },taskQueue[pointer].task.processTime);
            },
            function (err) {
                state = Status.idle;
                console.log('idle');
            }
        )
    }
}

function init(){
    console.log(print('initializing'));
    var d=new Date().getTime();
    for (let j=0;j<10;j++) {
        var p:Plan=new Plan();
        p.m_id=id;
        p.task.id=j+id*1000;
        p.task.processTime=Math.ceil(Math.random()*50000);
        d+=p.task.processTime;
        p.actualDueDate=d;
        p.task.plannedDueDate=d+Math.ceil(Math.random()*500000);
        p.cost=p.actualDueDate-p.task.plannedDueDate;
        console.log('\t'+p.task.id+' '+p.task.processTime/1000+' '+moment(p.task.plannedDueDate).format('HH:mm:ss.SSS'));
        taskQueue.push(p);
    }
    var m:Message=new Message('Machine',id,'UI','','task queue',JSON.stringify(taskQueue));
    socket.emit('message',m);
    run();
}

function judgeDelay(plan:Plan):boolean {
        if (plan.cost > threshold) {
            if (plan.delay==0) {
                var m:Message = new Message('Machine', id, 'UI', '', 'submit', JSON.stringify(plan));
                socket.emit('message', m);
                socket.emit('log', print('Task' + plan.task.id + ' delay'));
                return true;
            } else if (plan.delay==1){
                socket.emit('log', print('Task' + plan.task.id + ' cannot avoid delay'));
            }
            plan.delay++;
        }
    return false;
}

socket.emit('log',print('Machine'+id+' connection'));
init();

socket.on('message',function(msg){
    if (f) {
        var info = JSON.parse(msg.content);
        switch (msg.command) {
            case 'on-off':
                if (info == 'on') run();
                else if (info == 'off') state = Status.idle;
                break;
            case 'make plan':
                makePlan(info);
                break;
            case 'execute':
                if (info.m_id == id) {
                    taskQueue.splice(info.order, 0, info);
                    for (let j=info.order+1;j<taskQueue.length;j++) {
                        taskQueue[j].actualDueDate+=info.task.processTime;
                        taskQueue[j].cost+=info.task.processTime;
                    }
                    for (let j=info.order+1;j<taskQueue.length;j++) {
                        if (judgeDelay(taskQueue[j])) {
                            taskQueue.splice(j,1);
                            break;
                        }
                    }
                    run();
                    var m:Message = new Message('Machine', id, 'UI', '', 'task queue', JSON.stringify(taskQueue));
                    socket.emit('message', m);
                    console.log(print('add task' + info.task.id));
                }
             case 'state':
                 var m:Message = new Message('Machine', id, 'UI', '', 'task queue', JSON.stringify(taskQueue));
                 socket.emit('message', m);
                 break;
            case 'close':
                if (msg.d_id==id) {
                    var m:Message = new Message('Machine', id, 'Cell', '', 'close', JSON.stringify({}));
                    socket.emit('message', m);
                    var p:Plan[] = [];
                    f = false;
                    state=Status.failure;
                    for (let j = pointer; j < taskQueue.length; j++) p.push(taskQueue[j]);
                    var m:Message = new Message('Machine', id, 'Cell', '', 'submit', JSON.stringify(p));
                    socket.emit('message', m);
                    setTimeout(function () {
                        process.exit();
                    }, 50);
                }
                break;
            case 'modify':
                for (let k=pointer+1;k<taskQueue.length;k++) {
                    if (taskQueue[k].task.id == info.jid) {
                        taskQueue[k].task.plannedDueDate=new Date(info.year, info.month - 1, info.day, info.hour, info.minute).getTime();
                        taskQueue[k].cost=taskQueue[k].actualDueDate - taskQueue[k].task.plannedDueDate;
                        if (judgeDelay(taskQueue[k])) {
                            taskQueue.splice(k,1);
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
