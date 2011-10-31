TextManager = function() {
    this.cachedText = undefined;
    this.work = [];
    this.maxWorkLength = 0;
}

TextManager.prototype.text = function() {
    if(this.cachedText === undefined) {
        this.cachedText = "";        
        for(var i = 0; i < this.maxWorkLength; i+=1) {
            var w = this.work[i];
            if(w.add)
                this.applyAdd(w.text, w.index);        
            else
                this.applyRemove(w.text, w.index);
        }
    }
    return this.cachedText;
}

TextManager.prototype.clear = function() {        
    this.remove(0, this.text().length);
    return this;
}
TextManager.prototype.remove = function(fromIndex, length) {        
    if(length <= 0)
        return this;
    
    var removedTxt = this.text().slice(fromIndex, fromIndex + length);
    this.applyRemove(removedTxt, fromIndex);
    this.work.push({
        'add' : false, 
        'text': removedTxt, 
        'index' : fromIndex
    });
    this.maxWorkLength += 1;
    return this;
}
TextManager.prototype.applyRemove = function(txt, index) {    
    var oldTxt = this.text();
    this.cachedText = oldTxt.slice(0, index) + oldTxt.slice(index + txt.length, index + txt.length + oldTxt.length);
    return this;
}
TextManager.prototype.add = function(txt, index) {        
    // 'forget' all work greater maxWorkLength
    if(this.maxWorkLength < this.work.length) {
        this.work = this.work.slice(0, this.maxWorkLength);
    }
    this.applyAdd(txt, index);
    this.work.push({
        'add' : true, 
        'text': txt, 
        'index' : index 
    });
    this.maxWorkLength += 1;
    return this;
}

TextManager.prototype.applyAdd = function(changedTxt, index) {
    var oldTxt = this.text();
    if(index && oldTxt.length > index)
        this.cachedText = oldTxt.slice(0, index) + changedTxt + oldTxt.slice(index);
    else
        this.cachedText += changedTxt;
    return this;
}

TextManager.prototype.undo = function() {    
    if(this.maxWorkLength > 0) {
        this.cachedText = undefined;
        this.maxWorkLength -= 1;
    }
    return this;
}

TextManager.prototype.redo = function() {
    if(this.maxWorkLength < this.work.length) {
        this.cachedText = undefined;
        this.maxWorkLength += 1;
    }
    return this;
}


var socket = io.connect('http://localhost:3000/');
var initialized;

//io.enable('browser client minification');
//io.enable('browser client etag');
//io.enable('browser client gzip');
//io.set('log level', 1);
//io.set('transports', ['websocket', 'flashsocket', 'htmlfile', 'xhr-polling', 'jsonp-polling']);

function initWebSocket(botName) {
    $('#botname-err').css('visibility', 'hidden');
    if(initialized === botName) {
        //alert('Already initialized with ' + botName)
        return;
    }
    $('#botname-expand').show();
    $('#botname').hide();
    
    function reconnect() {        
        socket.emit('botname', botName, function (set) {
            console.log("emit botname " + set);        
            if (set) {            
                networkMsg(set, 'Connected');
                initialized = botName;
                clearInput();
                return $('#chat').addClass('botname-set');
            }
            $('#botname-err').css('visibility', 'visible');
        });
    }
    reconnect();     
    socket.on('error', function (err) {
        networkMsg(err, 'Connection failed');
    });
    
    socket.on('connect', function () {        
        socket.on('botnames', function (botnames) {   
            $('#botnames').empty().append($('<span>People Online: '+botnames+'</span>'));    
        });

        socket.on('user message', message);
        socket.on('reconnect', function () {
            networkMsg(null, 'Reconnected to the server');
            reconnect();
        });

        socket.on('reconnecting', function () {
            networkMsg(null, 'Attempting to re-connect to the server');
        });
        
        socket.on('error', function (e) {
            networkMsg(e, 'A unknown network error occurred');
        });                
    });        
}

var tm = new TextManager();
var handlers = {};
handlers['default'] = function(msg) {
    var txt = tm.text();
    if(txt.length == 0 || txt.endsWith('\n') || txt.endsWith(' '))
        tm.add(msg);
    else
        tm.add(" " + msg);   
    
    $('#lines').val(tm.text());
}

handlers['send email'] = function() {
    sendEmail();
}

handlers['clear messages'] = function() {
    tm.clear();
    $('#lines').val('');
    clearInput();
}

handlers['new line'] = function(msg) {
    tm.add("\n" + msg);
    $('#lines').val(tm.text());
    clearInput();
}

handlers['goto beginning'] = function() {
    $('#lines').selectRange(0, 0);
}

handlers['undo'] = function() {    
    $('#lines').val(tm.undo().text());
}

handlers['redo'] = function() {    
    $('#lines').val(tm.redo().text());
}

// TODO test this
var helperFn = function(params, newlineOrSpace) {
    var lines = $('#lines').val();
    var changed = false;
    var maxIndex = lines.length - 1;
    if(lines.endsWith(newlineOrSpace))
        maxIndex -= 1;
    
    for(var i = 0; i < params; i += 1) {        
        while(maxIndex >= 0 && lines[maxIndex] != newlineOrSpace) {
            maxIndex -= 1;
        }
        changed = true;
        if(maxIndex >= 0) {            
            lines = lines.substring(0, maxIndex + 1);
            // in case of one remaining char which is '\n' or space => remove it
            if(lines.length == 1)
                lines = "";            
        } else {
            lines = "";
            break;
        }
        
        maxIndex = lines.length -1;
        
    }
    
    if(changed)
        $('#lines').val(lines);
// TODO user feedback
}

handlers['delete line'] = function(params) {
    helperFn(params, '\n');    
}

handlers['delete word'] = function(params) {    
    helperFn(params, ' ');
}

function message (from, msg) {
    console.log(from +", msg:" + msg);        
    socket.emit('handlerInfo', msg, function (info) {    
        if(info.handler) {
            var h = handlers[info.handler]
            if(h) {
                try {
                    h(info.parameters);
                } catch(ex) {
                    console.log('problem when executing:' + info.handler + ", with " + info.parameters + ", error:" + ex + ", msg:" + msg);
                }                
            } else
                console.log('no handler implemented:' + info.handler + ", message:" + msg);
                
            return;
        } else
            console.log('no handler was found for message:' + msg);        
            
        handlers['default'](msg); 
    });    
}

function networkMsg (error, msg) {   
    console.log(error);
    $('#network').empty();
    $('#network').append($('<p>').append(msg));    
}

function sendEmail() { 
    // seperate addresses with a ;
    var addresses = "";
    var body = tm.text();
    body = body.replace(/\n/g, "%0D%0A");    
    var subject = "Send from my webvoice"; 
    var href = "mailto:" + addresses + "?" + "subject=" + subject + "&" + "body=" + body;
    var wndMail;
    wndMail = window.open(href, "_blank", "scrollbars=yes,resizable=yes,width=10,height=10");
    if(wndMail)
        wndMail.close();
}

// DOM manipulation
$(function () {    
    $('#botname-expand').hide();
    $('#lines').css("width", "500").css("height", "250");
    var botName = $.cookie("USER");
    if(botName) {
        $('#nick').val(botName);
        initWebSocket(botName);
    }
        
    $('#set-botname').click(function (ev) {        
        var botName = $('#nick').val();        
        $.cookie("USER", botName, {
            expires : 10
        });        
        initWebSocket(botName);        
        return false;
    });

    $('#send-message').click(function () {
        message($('#nick').val(), $('#message').val());
        socket.emit('user message', $('#nick').val(), $('#message').val());
        clearInput();
        $('#lines').get(0).scrollTop = 10000000;
        return false;
    });    
    
    $('#email-messages').click(function () {        
        message('', 'send email');
        focus();
        return false;
    });
    
    $('#clear-messages').click(function () {        
        message('', 'clear messages');
        focus();
        return false;
    });
    
    //    $('#del-last-input').click(function () {        
    //        message('', 'delete input');
    //        return false;
    //    });

    $('#del-last-line').click(function () {        
        message('', 'delete line');
        focus();
        return false;
    });
    
    $('#del-last-word').click(function () {        
        message('', 'delete word');
        focus();
        return false;
    });
    
    $('#new-line').click(function () {        
        message('', 'new line');
        focus();
        return false;
    });
    
    $('#goto-start').click(function () {        
        message('', "goto beginning");
        return false;
    });
    
    $('#undo').click(function () {        
        message('', "undo");
        return false;
    });
    
    $('#redo').click(function () {        
        message('', "redo");
        return false;
    });
    
    $('#botname-expand').click(function () {        
        if($('#botname').is(":visible")) {
            $('#botname-expand-btn').text('Show Login');
            $('#botname').hide();
        } else {
            $('#botname-expand-btn').text('Hide Login');
            $('#botname').show();
        }
        return false;
    });
});

function clearInput () {        
    $('#message').val('').focus();
}

function focus () {        
    $('#message').focus();
}

$.fn.selectRange = function(start, end) {
    return this.each(function() {
        if (this.setSelectionRange) {
            this.focus();
            this.setSelectionRange(start, end);
        } else if (this.createTextRange) {
            var range = this.createTextRange();
            range.collapse(true);
            range.moveEnd('character', end);
            range.moveStart('character', start);
            range.select();
        }
    });
};