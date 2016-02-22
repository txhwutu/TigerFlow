import Plan = require('../data/Plan');
import State = require('../data/State');
import Job = require('../data/Job');
import Task = require('../data/Task');
import Machine = require('./Machine');
import {print} from '../function';
import Message = require('../data/Message');

var io = require('socket.io-client');
var exec = require('child_process').exec;
var socket = io.connect('http://localhost:3000');
var states:State[];
var job:Job[];
var plan:Plan[]=[];
var machine_num=0;
var flag=0;
var mark=1;
var tid:number=0;
var pointer:number=0;
var stop:boolean=true;

function decide(pln:Plan){
    if (plan[pointer].cost> pln.cost) plan[pointer]=pln;
}

function segment(job:Job){
    var p:Plan=new Plan();
    p.task.id=tid;
//    plan.task.productOut=job.product;
    p.task.plannedDueDate=job.dueDate;
    plan.push(p);
    console.log(print('segmenting job'));
    tid++;
}

function allocate() {
    var m:Message=new Message('Cell','','Machine','*','make plan',JSON.stringify(plan[pointer]));
    socket.emit('message',m);
    console.log(print('cell allocating task'));
}

socket.emit('link','Cell connection');

socket.on('message',function(msg){
    var info=JSON.parse(msg.content);
    switch (msg.command) {
        case 'submit':
            if (msg.source=='UI') {
                var job = new Job();
                if (info.rushOrder=='on') job.dueDate = new Date(info.year, info.month - 1, info.day, info.hour, info.minute).getTime();
                else job.dueDate=Number.MAX_VALUE;
                segment(job);
            }else if (msg.source=='Machine') plan=plan.concat(info);
            if (stop && pointer<plan.length) {
                allocate();
                stop=false;
            }
            break;
        case 'decide':
            console.log(print('Machine'+msg.s_id+' return plan'));
            if (flag==0) plan[pointer]=info; else decide(info);
            flag++;
            if (flag==machine_num) {
                console.log(print('decide finished'));
                var m:Message=new Message('Cell','','Machine','*','execute',JSON.stringify(plan[pointer]));
                socket.emit('message',m);
                flag=0;
                pointer++;
                if (pointer<plan.length) allocate();
                else stop=true;
            }
            break;
        case 'create machine':
            if (info.amount>0) {
                for (let i = 0; i < info.amount; i++) {
                    exec('start \"Machine' + mark + '\" /min cmd /k node public/javascripts/service/Machine.js ' + mark);
                    socket.emit('log', print('Machine' + mark + ' created'));
                    machine_num++;
                    mark++;
                }
                console.log(print(info.amount + ' Machine created'));
            }else socket.emit('log', print('no Machine created'));
            break;
        case 'close':
            if (msg.source=='Machine'){
                machine_num--;
                console.log(print(msg.source+msg.s_id+' closed'));
                socket.emit('log',print('Machine'+msg.s_id+' closed',msg.timeStamp));
            }
            break;
        default:break;
    }
});