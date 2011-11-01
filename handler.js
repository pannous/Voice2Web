//***********************************
// - make login/logout working!
// - correct to: ...
//   correct this to: ...
// - UN DO is very important
//   and delete last input => 'undo said'
// - remove is synomyn of delete
//***********************************

//TODO require('common.js');
var common = new Common();
JeannieHandler = function() {
    this.strToNo = {};    
    this.noArray = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"];
    var size = this.noArray.length;
    for (var i = 0; i < size; i++) {
        this.strToNo[this.noArray[i]] = i;
    }
    for (i = 0; i < size; i++) {
        this.strToNo[i + ""] = i;
        this.noArray.push(i + "");
    }
};

// accept match only if command is word (not a part of a word)
JeannieHandler.prototype.isMatch = function(msg, command) {
    if(common.isArray(command)) {
        if(this.getMatch(msg, command))
            return true;
        else
            return false;
    }
    
    return this.getMatch(msg, command) >= 0;
}

JeannieHandler.prototype.getMatch = function(msg, command) {
    var index = 0;
    if(common.isArray(command)) {
        for(var key in command) {
            var current = command[key];
            index = this.getMatch(msg, current);
            if(index >= 0)
                return [current, index];
        }
        return undefined;
    } 
    
    var cl = command.length;
    do {
        index = msg.indexOf(command, index);
        if(index < 0)
            return undefined;
        if(index >= 0 && msg.charAt(index + cl) == ' ')
            return index;            
        
        index += 1;
    } while(true);        
}

// accept command only if it is at the end or at the beginning of the message
JeannieHandler.prototype.isCommand = function(msg, command) {
    if(common.isArray(command)) {
        if(this.getCommand(msg, command))
            return true;
        else
            return false;
    }
    
    return this.getCommand(msg, command) >= 0;
}
JeannieHandler.prototype.getCommand = function(msg, command) {
    var index;
    if(common.isArray(command)) {
        for(var key in command) {
            var current = command[key];
            index = this.getCommand(msg, current);
            if(index >= 0)
                return [current, index];
        }
        return undefined;
    }
    
    index = msg.indexOf(command);
    if(index == 0 || index == msg.length)
        return index;
    // if command is at the end but also within the message
    if(msg.endsWith(command))
        return msg.length;
    return -1;
}

// guess handler from message
JeannieHandler.prototype.calcInfo = function(msg){
    var lowerMsg = msg.toLowerCase();
    var info = {};    
    if(this.isCommand(lowerMsg, ['clear messages', 'remove messages', 'delete content', 
            'remove content', 'delete all', 'remove all'])) {
        info.handler = 'clear messages';
        return info;
    } else if(this.isCommand(lowerMsg, 'clear last')) {
        info.handler = 'clear last';
        return info;
    } else if(this.isCommand(lowerMsg, ['goto beginning', 'go to beginning'])) {
        info.handler = 'goto beginning';
        return info;
    } else if(this.isCommand(lowerMsg, ["redo"])) {
        info.handler = 'redo';    
        return info;
    } else if(this.isCommand(lowerMsg, ["send mail", "send email", "sende email", "sende mail"])) {
        info.handler = 'send email';    
        return info;
    } 
        
    var ret = this.deleteLast(lowerMsg, 'line');
    if(ret)
        return ret;
    
    ret = this.deleteLast(lowerMsg, 'word');
    if(ret)
        return ret;
    
    if(this.isCommand(lowerMsg, ['undo', 'delete', 'revert'])) {
        info.handler = 'undo';
        return info;
    }
    
    ret = this.getCommand(lowerMsg, ["new line", "next line", "new paragraph"])    
    if(ret) {        
        val = ret[0];
        var index1 = ret[1] + val.length;               
        var str = msg.substring(index1);
        index1 = str.indexOf(' ')
        if(index1 >= 0)
            str = str.substring(index1 + 1);
    
        info.handler = 'new line';
        info.parameters = str;        
    } else {
        info.handler = 'default';
        info.parameters = lowerMsg;
    }
    return info;
}

JeannieHandler.prototype.deleteLast = function(lowerMsg, lineOrWord) {
    var info = {};
    var val = 1;
    if(this.isCommand(lowerMsg, ["delete last " + lineOrWord, "delete " + lineOrWord, 
        "remove last " + lineOrWord, "remove " + lineOrWord, ])) {
        info.handler = 'delete ' + lineOrWord;
        info.parameters = val;
        return info;
    } else {                
        var deleteIndex = lowerMsg.indexOf('delete');
        if(deleteIndex < 0)
            deleteIndex = lowerMsg.indexOf('remove');
        var noRes = this.getMatch(lowerMsg, this.noArray);
        if(noRes) {
            var number = this.strToNo[noRes[0]];
            if(number !== undefined)
                val = number;
        }
        
        if(deleteIndex == 0 && (lowerMsg.endsWith(lineOrWord) || lowerMsg.endsWith(lineOrWord + 's'))) {
            info.handler = 'delete ' + lineOrWord;
            info.parameters = val;
            return info;
        }
    }
    return undefined;
}

if (typeof module !== "undefined") module.exports.calcInfo = JeannieHandler.prototype.calcInfo;