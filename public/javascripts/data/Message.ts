class Message {
    source:string;
    s_id:any;
    destination:string;
    d_id:any;
    timeStamp:number;
    command:string;
    content:any;

    constructor(s:string,sid:any,d:string,did:any,c:string,ct:any){
        this.source=s
        this.s_id = sid;
        this.destination=d;
        this.d_id=did;
        this.timeStamp=new Date().getTime();
        this.command=c;
        this.content=ct;
    }
}
export = Message