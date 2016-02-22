import Product = require('../data/Product');
import Status = require('../data/Status');
import Path = require('../data/Path');
import {print} from '../function';
import Message = require("../data/Message");

var exec=require('child_process').exec;
var io = require('socket.io-client');
var socket = io.connect('http://localhost:3000');
var product:Product[];
var map:number[][];
var states:Status[];
var Vid:number=0;
var pth:Path=new Path();
var AGV_num=0;
var mark=1;

function add(p:Product,id:number){
    console.log(print('warehouse add '+p.id+' from AGV '+id));
}

function allocate(p:Product,id:number){
    console.log(print('warehouse allocate '+p.id+' to AGV '+id));
}

    function calPath(id:number){
    Vid=Math.ceil(Math.random() * AGV_num);
}

socket.emit('link','Warehouse connetion')

socket.on('message',function(msg){
    var info=JSON.parse(msg.content);
    switch (msg.command){
        case 'create AGV':
            if (info.amount>0) {
                for (let i = 0; i < info.amount; i++) {
                    exec('start \"AGV' + mark + '\" /min cmd /k node public/javascripts/service/AGV.js ' + mark);
                    socket.emit('log', print('AGV' + mark + ' created'));
                    AGV_num++;
                    mark++;
                }
                console.log(print(info.amount + ' AGV created'));
            }else socket.emit('log', print('no AGV created'));
            break;
        case 'load':
            calPath(msg.s_id);
            pth.pt=info;
            pth.m_id=msg.s_id;
            var m:Message=new Message('Warehouse','','AGV',Vid,'pick up',JSON.stringify(pth));
            socket.emit('message',m);
            break;
        case 'unload':
            calPath(msg.s_id);
            pth.pt=info;
            var m:Message=new Message('Warehouse','','AGV',Vid,'deliver',JSON.stringify(pth));
            socket.emit('message',m);
            break;
        case 'get':
            allocate(info,msg.s_id);
            break;
        case 'send':
            add(info,msg.s_id);
            break;
        case 'close':
            if (msg.source=='AGV'){
                AGV_num--;
                console.log(print(msg.source+msg.s_id+' close'));
                socket.emit('log',print('AGV'+msg.s_id+' closed',msg.timeStamp));
            }
            break;
        default:break;
    }
});