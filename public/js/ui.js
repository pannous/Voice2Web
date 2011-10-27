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
    $('#botname-err').css('visibility', 'hidden    ');
    if(initialized === botName) {
        //alert('Already initialized with ' + botName)
        return;
    }
    
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
            $('#botnames').empty().append($('<span>Online: '+botnames+'</span>'));    
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

function message (from, msg) {  
    console.log(from +", msg:" + msg);
    $('#lines').append($('<p>').append(msg));
    if(msg.indexOf("send mail") !== -1 || msg.indexOf("send email") !== -1) {
        sendEmail();
    }
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
    
    $('#clear-messages').submit(function () {
        $('#lines').remove();        
        return false;
    });
    
    $('#email-messages').submit(function () {        
        sendEmail();
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