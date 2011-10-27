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
    if(initialized === botName) {
        alert('Already initialized with ' + botName)
        return;
    }
     
    socket.of('/private').on('error', function (reason) {        
        $('#chat').append($('<p>connection failed</p>'));
    }).on('connect', function () {        
        initialized = botName;        
        $('#chat').append($('<p>connected</p>'));                
   
        socket.on('nicknames', function (nicknames) {   
            $('#nicknames').empty().append($('<span>Online: '+nicknames+'</span>'));    
        });

        socket.on('user message', message);
        socket.on('reconnect', function () {
            message('System', 'Reconnected to the server');
        });

        socket.on('reconnecting', function () {
            message('System', 'Attempting to re-connect to the server');
        });

        socket.on('error', function (e) {
            message('System', e ? e.toString() : 'A unknown error occurred');
        });
    });
}

function message (from, msg) {  
    console.log(from +", msg:" + msg);
    $('#lines').append($('<p>').append(msg));
    if(msg.indexOf("send mail") !== -1 || msg.indexOf("send email") !== -1) {
        sendEmail();
    }
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
    var user = $.cookie("USER");
    if(user) {
        initWebSocket(user);
        // TODO fill textfield
    }
        
    $('#set-nickname').submit(function (ev) {
        // change cookie value to submitted user
        var user = $('#nick').val();        
        $.cookie("USER", user, {
            expires : 10
        });        
        initWebSocket(user);
        return false;
    });

    $('#send-message').submit(function () {
        message($('#nick').val(), $('#message').val());
        socket.emit('user message', $('#message').val());
        clear();
        $('#lines').get(0).scrollTop = 10000000;
        return false;
    });
    
    $('#clear-messages').submit(function () {
        $('#lines').remove();        
        return false;
    });
    
    $('#email-messages').submit(function () {        
        sendEmail();
        return false;
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
});