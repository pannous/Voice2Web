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
$('#botname-expand').hide();
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
    // TODO add into last <p>
    //    $('#lines').append(' ' + msg);
    var para = $("#lines p:last");
    if(para && para.length > 0)
        para.text(para.text() + " " + msg);
    else
        $('#lines').append($('<p>').append(msg));
}

handlers['send email'] = function() {
    sendEmail();
}

handlers['clear message'] = function() {
    $('#lines').remove();
    clear();
}

handlers['new line'] = function(msg) {
    $('#lines').append($('<p>').append(msg));
    clear();
}

// TODO move to server side
function getHandlerInfo(msg){
    var lowerMsg = msg.toLowerCase();
    var info = {};
    if(lowerMsg.indexOf('clear message') == 0) {
        info.handler = 'clear message';
    } else if(lowerMsg.indexOf("send mail") == 0 || lowerMsg.indexOf("send email") == 0) {
        info.handler = 'send email';
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
    body = body.replace(/BR/g, "%0D%0A");    
    var subject = "Send from my webvoice"; 
    var href = "mailto:" + addresses + "?" + "subject=" + subject + "&" + "body=" + body;
    var wndMail;
    wndMail = window.open(href, "_blank", "scrollbars=yes,resizable=yes,width=10,height=10");
    if(wndMail)
        wndMail.close();
}

// DOM manipulation
$(function () {    
    var botName = $.cookie("USER");
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

    $('#send-message').submit(function () {
        message($('#nick').val(), $('#message').val());
        socket.emit('user message', $('#nick').val(), $('#message').val());
        clear();
        $('#lines').get(0).scrollTop = 10000000;
        return false;
    });    
    
    $('#email-messages').submit(function () {        
        message('', 'send email');
        return false;
    });
    
    $('#clear-last-message').submit(function () {        
        message('', 'clear message');
        return false;
    });
    
    $('#del-last-input').submit(function () {        
        message('', 'delete');
        return false;
    });
    
    $('#new-line').submit(function () {        
        message('', 'new line');
        return false;
    });
    
    $('#botname-expand').submit(function () {        
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
    var optionTexts = [];
    $("#lines p").each(function() {        
        optionTexts.push($(this).text());
    });
    return optionTexts.join(" BR ");
}