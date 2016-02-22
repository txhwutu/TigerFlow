import Product = require('../data/Product');
import Warehouse = require('./Warehouse');
import Path = require('../data/Path');
import Position = require('../data/Position');
import {print} from '../function';
import Message = require("../data/Message");

var io = require('socket.io-client');
var socket = io.connect('http://localhost:3000');
var location:Position=new Position();
var id=parseInt(process.argv[2]);

function move(path:Position[]){
//    console.log(print('moving from '+path[0]+' to '+path[path.length-1]));
}

function pickup(p:Path){
    console.log(print('picking up '+p.pt.id+' for Machine'+p.m_id));
    move(p.path1);
    var m:Message=new Message('AGV',id,'Warehouse','','get',JSON.stringify(p.pt));
    socket.emit('message',m);
    move(p.path2);
}

function deliver(p:Path){
    console.log(print('delivering ' + p.pt.id+' for Machine'+p.m_id));
    move(p.path1);
    move(p.path2);
    var m:Message=new Message('AGV',id,'Warehouse','','send',JSON.stringify(p.pt));
    socket.emit('message',m);
}

socket.emit('log',print('AGV'+id+' connection'));

socket.on('message',function(msg){
    var info=JSON.parse(msg.content);
    switch (msg.command){
        case 'pick up':
            if (msg.d_id==id){
                move(info.path1);
                pickup(info);
                move(info.path2);
            }
            break;
        case 'deliver':
            if (msg.d_id==id){
                deliver(info);
            }
            break;
        default:break;
    }
});