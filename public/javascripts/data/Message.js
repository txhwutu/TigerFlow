var Message = (function () {
    function Message(s, sid, d, did, c, ct) {
        this.source = s;
        this.s_id = sid;
        this.destination = d;
        this.d_id = did;
        this.timeStamp = new Date().getTime();
        this.command = c;
        this.content = ct;
    }
    return Message;
})();
module.exports = Message;
//# sourceMappingURL=Message.js.map