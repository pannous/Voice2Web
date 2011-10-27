// TODO settings for production:
//    io.enable('browser client minification');
//    io.enable('browser client etag');
//    io.enable('browser client gzip');
//    io.set('log level', 1);
//    io.set('transports', [
//        'websocket'
//        , 'flashsocket'
//        , 'htmlfile'
//        , 'xhr-polling'
//        , 'jsonp-polling'
//        ]);

var socket = io.connect('http://localhost:3000/');
var initialized;

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
                clear();
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

var handlers = {};

handlers['default'] = function(msg) {
    var txt = $("#lines").val();
    if(txt && txt.length > 0)
        $("#lines").val(txt + " " + msg);
    else
        $('#lines').val(msg);
}

handlers['send email'] = function() {
    sendEmail();
}

handlers['clear messages'] = function() {
    $('#lines').val('');
    clear();
}

handlers['new line'] = function(msg) {
    $('#lines').val($('#lines').val() + "\n" + msg);
    clear();
}

handlers['goto beginning'] = function() {
    setCaretToPos(document.getElementById("lines"), 0);
}

handlers['delete last'] = function() {
    alert('not yet implemented');
}

// TODO move to server side
function getHandlerInfo(msg){
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

function message (from, msg) {
    console.log(from +", msg:" + msg);
    
    var info = getHandlerInfo(msg);    
    if(info.handler)
        handlers[info.handler](info.parameters);
    else
        handlers['default'](msg);
}

function networkMsg (error, msg) {   
    console.log(error);
    $('#network').empty();
    $('#network').append($('<p>').append(msg));    
}

function sendEmail() { 
    // seperate addresses with a ;
    var addresses = "";
    var body = getAllText();
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
        clear();
        $('#lines').get(0).scrollTop = 10000000;
        return false;
    });    
    
    $('#email-messages').click(function () {        
        message('', 'send email');
        return false;
    });
    
    $('#clear-messages').click(function () {        
        message('', 'clear messages');
        return false;
    });
    
    $('#del-last-input').click(function () {        
        message('', 'delete last');
        return false;
    });
    
    $('#new-line').click(function () {        
        message('', 'new line');
        return false;
    });
    
    $('#goto-start').click(function () {        
        message('', "goto beginning");
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

function clear () {        
    $('#message').val('').focus();
}

function getAllText () {    
    return $("#lines").val();
}

function setSelectionRange(input, selectionStart, selectionEnd) {
    if (input.setSelectionRange) {
        input.focus();
        input.setSelectionRange(selectionStart, selectionEnd);
    }
    else if (input.createTextRange) {
        var range = input.createTextRange();
        range.collapse(true);
        range.moveEnd('character', selectionEnd);
        range.moveStart('character', selectionStart);
        range.select();
    }
}

function setCaretToPos (input, pos) {
    setSelectionRange(input, pos, pos);
}