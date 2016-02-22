import Product = require('./Product');
class Task{
    j_id:number;
    id:number;
    type:number;
    productIn:Product;
    productOut:Product;
    operation:number;
    plannedDueDate:number;
    processTime:number;

    constructor(){
        this.productIn=new Product();
        this.productOut=new Product();
        this.plannedDueDate=0;
        this.operation=0;
        this.processTime=0;
        this.id=0;
        this.type=0;
        this.j_id=0;
    }
}
export = Task