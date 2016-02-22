import Product = require('./Product');
class Job
{
    id:number;
    dueDate:number;
    type:number;
    product:Product;

    constructor(){
        this.dueDate=0;
        this.product=new Product();
        this.type=0;
        this.id=0;
    }
}
export = Job;