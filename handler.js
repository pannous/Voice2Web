JeannieHandler = function() {};

// guess handler from message
JeannieHandler.prototype.calcInfo = function(msg){
    var lowerMsg = msg.toLowerCase();
    var info = {};
    if(lowerMsg.indexOf('clear messages') == 0) {
        info.handler = 'clear messages';
    } else if(lowerMsg.indexOf('clear last') == 0) {
        info.handler = 'clear last';
    } else if(lowerMsg.indexOf('goto beginning') == 0 || lowerMsg.indexOf('go to beginning') == 0) {
        info.handler = 'goto beginning';
    // sende email    
    } else if(lowerMsg.indexOf("send mail") == 0 || lowerMsg.indexOf("send email") == 0) {
        info.handler = 'send email';
    // TODO accept new line at msg end too + accept next line
    } else if(lowerMsg.indexOf("new line") == 0 || lowerMsg.indexOf("new paragraph") == 0) {
        var index1 = lowerMsg.indexOf("new line");
        var index2 = lowerMsg.indexOf("new paragraph");
        if(index1 < 0 || index2 >= 0 && index1 < index2)
            index1 = index2 + "new paragraph".length;
        else
            index1 = index1 + "new line".length;
        var str = msg.substring(index1);
        index1 = str.indexOf(' ')
        if(index1 >= 0)
            str = str.substring(index1+1);
    
        info.handler = 'new line';
        info.parameters = str;        
    } else {
        info.handler = 'default';
        info.parameters = lowerMsg;
    }
    return info;
}

exports.calcInfo = JeannieHandler.prototype.calcInfo;