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
    
    this.forget();
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
    this.cachedText = oldTxt.slice(0, index) + oldTxt.slice(index + txt.length);
    return this;
}
// 'forget' all work greater maxWorkLength
TextManager.prototype.forget = function() {        
    if(this.maxWorkLength < this.work.length)
        this.work = this.work.slice(0, this.maxWorkLength);    
}
TextManager.prototype.add = function(txt, index) {        
    this.forget();
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

TextManager.prototype.deleteLastXY = function(newlineOrSpace, count) {    
    var lines = this.text();    
    var maxIndex = lines.length - 1;    
    var oldMaxIndex = maxIndex;
    for(var i = 0; i < count; i += 1) {
        while(maxIndex >= 0 && lines[maxIndex] == newlineOrSpace) {
            maxIndex -= 1;
        }
    
        while(maxIndex >= 0 && lines[maxIndex] != newlineOrSpace) {
            maxIndex -= 1;
        }        
        if(maxIndex < 0)            
            break;                
    }
    
    if(oldMaxIndex != maxIndex)
        this.remove(maxIndex + 1, lines.length - maxIndex);
        
    return this;
}


var socket;
var initialized;

//io.enable('browser client minification');
//io.enable('browser client etag');
//io.enable('browser client gzip');
//io.set('log level', 1);
//io.set('transports', ['websocket', 'flashsocket', 'htmlfile', 'xhr-polling', 'jsonp-polling']);

function initWebSocket(botName) {
    $('#login-err').hide();
//    if(initialized === botName) {
//        hideLogin();
//        console.log('Already initialized with ' + botName)
//        return;
//    }
    $('#login-expand-form').show();    
    
    function reconnect() {
        if(socket)     
            // TODO why reloading is necessary to make socket working?
            window.location = window.location;
        
        socket = io.connect();         
        socket.emit('botname', botName, function (set) {
            console.log("emit botname " + set);        
            if (set) {
                $('#loginpanel').slideToggle(400);
                networkMsg(set, 'Connected');
                initialized = botName;
                clearInput();
                return $('#chat').addClass('botname-set');
            }
            $('#login-err').show();
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
            initialized = false;
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

handlers['delete line'] = function(params) {
    $('#lines').val(tm.deleteLastXY('\n', params).text());
}

handlers['delete word'] = function(params) {    
    $('#lines').val(tm.deleteLastXY(' ', params).text());
}

var changeDetection = function() {
    var oldVal = tm.text();
    var newVal = $('#lines').val();
    if(oldVal == newVal)
        return;
        
    var pos = $('#lines').getCaret();
    var diffLen = newVal.length - oldVal.length;
    var addedText;
    if(diffLen > 0) {
        addedText = newVal.slice(pos - diffLen, pos)
        tm.add(addedText, pos);    
    } else
        tm.remove(pos, -diffLen);
        
    $('#lines').val(tm.text());
    console.log(pos + " " + diffLen + " " + addedText);
}

function message (from, msg) {
    console.log("message:" + msg);        
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
    //    var previousSelection;
    //    $('#lines').bind('keydown', function(e) {                
    //        previousSelection = $('#lines').getSelection();
    //    });
    $('#lines').bind('keyup', function(e) {                
        changeDetection();
    });
    // for detecting pasting we need a bit timeout!!
    $('#lines').bind('paste', function(e) {        
        setTimeout(function() {
            changeDetection();
        }, 1);
    });

    
    var botName = getUrlVars()['botname'];
    if(!botName)
        botName = $.cookie("USER");
    
    if(botName) {
        $('#nick').val(botName);
        initWebSocket(botName);
    }
        
    $('#set-botname').submit(function (ev) {        
        var botName = $('#nick').val();        
        $.cookie("USER", botName, {
            expires : 10
        });        
        initWebSocket(botName);        
        return false;
    });

    // TODO remove that testing in production
    $('#send-message').submit(function () {
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
    
    $('#login-expand-form').click(function () {
        swapLogin();
        return false;
    });
});

function swapLogin() {
    if($('#loginpanel').is(":visible")) {
        hideLogin();
    } else {
        showLogin();        
    }
}

function hideLogin() {
    $('#login-expand-btn').text('Show Login');
    $('#loginpanel').hide();
}

function showLogin() {
    $('#login-expand-btn').text('Hide Login');
    $('#loginpanel').show();
}

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

$.fn.getCaret = function() {
    // a jquery selector returns a element collection so do:
    var el = $(this)[0];
    if (el.selectionStart) {
        return el.selectionStart;
    } else if (document.selection) {
        this.focus();

        var r = document.selection.createRange();
        if (r == null)
            return 0;    

        var re = el.createTextRange(),
        rc = re.duplicate();
        re.moveToBookmark(r.getBookmark());
        rc.setEndPoint('EndToStart', re);

        return rc.text.length;
    } 
    return 0;
}

$.fn.getSelection = function () {
    var el = $(this)[0];
    if (el.setSelectionRange) {
        //FF
        return $(this).val().substring(el.selectionStart, el.selectionEnd);
    } else if (document.selection && document.selection.createRange) {
        //IE
        //Makes sure tags are being added to the textarea
        //el.focus(); 
        return document.selection.createRange();        
    } else {
        console.log('ERROR: unsupported browser for getSelection');
        return "";
    } 
}

