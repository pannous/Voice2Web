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
    var client = nicknames[req.body.user];
    if(client) {
        client.emit('user message', req.body.user + ' phone', req.body.message);
        res.writeHead(200, {'Content-Type': 'text/plain'});
        res.end('accepted\n');
    } else {
        res.writeHead(404, {'Content-Type': 'text/plain'});
        res.end('not found\n');
    }
});

app.listen(3000, function () {
    var addr = app.address();
    console.log('app listening on http://' + addr.address + ':' + addr.port);
});

var io = sio.listen(app);
io.sockets.on('connection', function (client) {
    console.log('now browser client connected ' + client.nickname);
    client.on('user message', function (msg) {
        client.broadcast.emit('user message', client.nickname, msg);
    });

    client.on('nickname', function (nick, fn) {
        if (nicknames[nick]) {
            fn(true);
        } else {
            fn(false);
            client.nickname = nick;
            nicknames[nick] = client;
            client.broadcast.emit('announcement', nick + ' connected');
            io.sockets.emit('nicknames', getNames(nicknames));
        }
    });

    client.on('disconnect', function () {
        if (!client.nickname) return;

        delete nicknames[client.nickname];
        client.broadcast.emit('announcement', client.nickname + ' disconnected');
        client.broadcast.emit('nicknames', getNames(nicknames));
    });
    
    function getNames(list) {
        var names = {};
        for(var nick in list) {            
            names[nick] = nick;
        }
        return names;
    }
});
