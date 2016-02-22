///<reference path='../../typings/tsd.d.ts'/>
import moment=require('moment');
export function print(msg:any,d?:number):string{
    if (d) return moment(d).format('MMMM Do YYYY,HH:mm:ss.SSS')+' > '+msg;
    else return moment().format('MMMM Do YYYY,HH:mm:ss.SSS')+' > '+msg;
}
