require.paths.unshift(__dirname + '/../../lib/');

var express = require('express')
, stylus = require('stylus')
, nib = require('nib')
, sio = require('socket.io');

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

var nicknames = {};
app.post('/data', function(req, res){
    var tmpUser= req.body.user;
    console.log('[FROM APP] post:' + tmpUser + ", msg:" + req.body.message);
    var communication = nicknames[tmpUser];     
    if(!communication)
        communication = addCommunication(tmpUser);
        
    communication.appAvailable = true;
    if(communication.client)
        communication.client.emit('user message', tmpUser, req.body.message);        
    // else TODO store message to be emited at a later time
    
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

function addCommunication(tmpUser) {    
    var communication = {};    
    communication.user = tmpUser;
    nicknames[tmpUser] = communication;
    return communication;
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
io.of('/private').authorization(function (handshakeData, callback) {
    var cookies = parseCookies(handshakeData.headers.cookie);    
    console.log('cookie<' + cookies.USER + ">");
    if(!cookies.USER || cookies.USER.length < 20) {
        console.log('bot name too short');
        callback("Bot name too short", false);
        return;
    }
    
    var communication = nicknames[cookies.USER];
    if(!communication)
        communication = addCommunication(cookies.USER);    
        
    console.log('called sendToClient:' + cookies.USER); 
    handshakeData.identity = cookies.USER;
    callback("app available:" + communication.appAvailable == true, true);
}).on('connection' , function (client) {
    var communication = nicknames[client.handshake.identity]
    console.log('authorized communication:' + communication); 
    if(!communication)
        return;
    
    communication.client = client;
    client.emit('identity', client.handshake.identity);

    console.log('now browser client connected ' + communication.user);
    client.on('user message', function (msg) {
        console.log('on user message! user:' + communication.user +" msg:" + msg);
        client.broadcast.emit('user message', communication.user, msg);
    });

    client.on('nickname', function (nick, callback) {
        if (nicknames[nick]) {
            callback(true);
        } else {
            callback(false);
            //client.broadcast.emit('announcement', nick + ' connected');
            io.sockets.emit('nicknames', getNameCount(nicknames));
        }
    });

    client.on('disconnect', function () {
        if (!communication.user) return;

        delete nicknames[communication.user];
        //client.broadcast.emit('announcement', client.nickname + ' disconnected');
        client.broadcast.emit('nicknames', getNameCount(nicknames));
    });    
});
