require('./public/js/common.js');
require('./handler.js');

var express = require('express')
, stylus = require('stylus')
, nib = require('nib')
, sio = require('socket.io')
, handler = new JeannieHandler();

var app = express.createServer();

app.configure(function () {
    app.use(stylus.middleware({
        src: __dirname + '/public', 
        compile: compile
    }))
    // to make post body parsable
    app.use(express.bodyParser());
    app.use(express.static(__dirname + '/public'));
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');

    function compile (str, path) {
        return stylus(str)
        .set('filename', path)
        .use(nib());
    };
});

app.get('/', function (req, res) {
    res.render('index',  {
        locals: {
            title: 'Voice 4 Web'
        }
    });
});

var botnames = {};
app.post('/data', function(req, res){    
    var botname = req.body.user;
    var msg = req.body.message;
    var client = botnames[botname];
    if(client && client.emit)        
        client.emit('user message', botname, msg);
    else {
        // save message for later displaying
        if(!client)
            client = {};        
        if(!client.oldmessages)
            client.oldmessages = [msg];
        else
            client.oldmessages.push(msg);
        botnames[botname] = client;
    }
    
    res.writeHead(200, {
        'Content-Type': 'text/plain'
    });
    res.end('accepted\n');  
});

function parseCookies(_cookies) {
    var cookies = {};
    _cookies && _cookies.split(';').forEach(function( cookie ) {
        cookie = cookie.replace(/\%20/g, " ");
        var parts = cookie.split('=');
        cookies[ parts[ 0 ].trim() ] = ( parts[ 1 ] || '' ).trim();
    });
    return cookies;
}

function getNameCount(list) {
    var count = 0;
    for(var nick in list) {            
        count++;
    }
    return count;
}

app.listen(3000, function () {
    var addr = app.address();
    console.log('app listening on http://' + addr.address + ':' + addr.port);
});

var io = sio.listen(app);
io.sockets.on('connection' , function (freshClient) {
    console.log('[BROWSER] client connected without nick: ' + freshClient.header);
    freshClient.on('botname', function (botname, callback) {
        // AFTER setting botnames
        var oldClient = botnames[botname];
        if(botname && botname.length >= 15) {
            if(oldClient !== freshClient) {           
                freshClient.botname = botname;
                freshClient.on('disconnect', function () {
                    if (!freshClient.botname) return;

                    delete botnames[freshClient.botname];               
                    freshClient.broadcast.emit('botnames', getNameCount(botnames));
                });
                freshClient.on('handlerInfo', function (message, callback) {
                    callback(handler.calcInfo(message));
                });
                
                console.log('NEW client connected: ' + freshClient.botname);                
                if(oldClient) {
                    var om = oldClient.oldmessages;
                    if(om)
                        for(var key in om) {                        
                            freshClient.emit('user message', botname, om[key]);
                        }
                    
                    // TODO allow clients under one bot name
                    // use freshClient.join(botname) instead of botnames hash!!??
                    // so that we get a 'room' feature and do not need to handle clear etc on our own
                    if(oldClient.emit) {
                        oldClient.emit('user message', botname, 'WARNING: multiple clients are not supported');                    
                        oldClient.emit('error', botname);
                    }
                }               
                botnames[botname] = freshClient;
            } else
                console.log('OLD client connected: ' + freshClient.botname);                
                       
            //client.broadcast.emit('announcement', nick + ' connected');                
            io.sockets.emit('botnames', getNameCount(botnames));
            callback(true);
        } else {
            console.log("FALSE on botname:" + botname);
            callback(false);            
        }
    });
});