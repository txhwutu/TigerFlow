import Task = require('./Task');
class Plan{
    m_id:number;
    task:Task;
    actualDueDate:number;
    realTime:number;
    order:number;
    cost:number;
    delay:number;

    constructor(){
        this.task=new Task();
        this.actualDueDate=0;
        this.cost=0;
        this.order=0;
        this.m_id=0;
        this.realTime=0;
        this.delay=0;
    }
}
export = Plan