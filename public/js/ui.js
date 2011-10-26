// socket.io specific code
var socket = io.connect();

var colors = [        
"orange", "red", "white", "blue", "brown"    
];

var nickToColor = {};

socket.on('connect', function () {
    $('#chat').addClass('connected');
});

// listener for broadcastinformation like connecting&disconnecting
socket.on('announcement', function (msg) {
    $('#lines').append($('<p>').append($('<em>').text(msg)));
});

// print names of all connected people
socket.on('nicknames', function (nicknames) {
    $('#nicknames').empty().append($('<span>Online: </span>'));
    // TODO nicknames should be an array so that we can get the length easily
    var noOfNicks = 0;
    for (var key in nicknames) {
        noOfNicks ++;
    }
    
    var counter = 0;    
    for (var key in nicknames) {        
        var colr = colors[counter++ % noOfNicks];        
        nickToColor[nicknames[key]] = colr;
        $('#nicknames').append($('<b>').css('backgroundColor', colr.toString()).text(nicknames[key] + ' '));
    }
});

// listen to messages of every user
socket.on('user message', message);
socket.on('reconnect', function () {
    //$('#lines').remove();
    message('System', 'Reconnected to the server');
});

socket.on('reconnecting', function () {
    message('System', 'Attempting to re-connect to the server');
});

socket.on('error', function (e) {
    message('System', e ? e : 'A unknown error occurred');
});

function message (from, msg) {
    var colr = nickToColor[from];
    if(colr === undefined)
        colr = 'gray';
    
    $('#lines').append($('<p>').css('backgroundColor', colr).append(msg));
    if(msg.indexOf("send mail") !== -1 || msg.indexOf("send email") !== -1) {
        sendEmail("root@pannous.info", getAllText());
    }
}

//*
//* seperate addresses with a ;
//*
function sendEmail(addresses, body) {        
    body = body.replace(/BR/g, "%0D%0A");    
    var subject = "Send from my webvoice"; 
    var href = "mailto:" + addresses + "?" + "subject=" + subject + "&" + "body=" + body;
    var wndMail;
    wndMail = window.open(href, "_blank", "scrollbars=yes,resizable=yes,width=10,height=10");
    if(wndMail)
        wndMail.close();
}

// dom manipulation
$(function () {
    $('#set-nickname').submit(function (ev) {
        socket.emit('nickname', $('#nick').val(), function (set) {
            if (!set) {
                clear();
                return $('#chat').addClass('nickname-set');
            }
            $('#nickname-err').css('visibility', 'visible');
        });
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
        sendEmail("root@pannous.info", getAllText());
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