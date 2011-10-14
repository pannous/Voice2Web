var sio = require('socket.io');
var express = require('express');

var app = module.exports = express.createServer();
app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

var tmp = [];
app.get('/', function(req, res){
  res.render('index', {  
    locals: {
      title: 'Voice 4 Web'
    }
  });
});

app.post('/data', function(req, res){
  console.log(req.body);
  //io.sockets.emit('message', 'test');
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('accepted\n');
});


app.listen(3000, function() {
  console.log("Express server listening on port %d", app.address().port);
});
var io = sio.listen(app);

// .on  (connection => listen
// .emit(message    => send message
io.sockets.on('connection', function (client) {
  console.log('now1');
  client.emit('message', 'test');
  var interval = setInterval(function() {
     client('This is a message from the server!  ' + new Date().getTime());
  }, 2000);

  client.on('disconnect',function(){
     clearInterval(interval);
     console.log('Client has disconnected');
  });
});
