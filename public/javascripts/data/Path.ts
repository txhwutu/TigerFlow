import Product = require("./Product");
import Position=require('./Position');
class Path{
    m_id:number;
    path1:Position[];
    path2:Position[];
    pt:Product;

    constructor(){
        this.m_id=0;
        this.path1=[];
        this.path2=[];
        this.pt==new Product();
    }
}

export = Path