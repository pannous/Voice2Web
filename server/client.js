var http = require('http');

var user = 'thomas dERoQWRKdHhySEJ';
var msg = 'hello world';
var host = 'jetsli.de';

process.argv.forEach(function (val, index, array) {
    var sp = val.split('=');
    if(sp[0] == 'msg')
        msg = sp[1];
    if(sp[0] == 'user')
        user = sp[1];
    if(sp[0] == 'host')
        host = sp[1];
});

console.log('host:' + host + ', user:' + user+ ', message:' + msg);
var data = JSON.stringify({
    'user': user, 
    'message': msg
});


var cookie = 'something=anything';
var client = http.createClient(3000, host);
var headers = {
    'Host': host,
    'Cookie': cookie,
    'Content-Type': 'application/json',
    'Content-Length': data.length
};

var request = client.request('POST', '/data', headers);

// listening to the response is optional, I suppose
request.on('response', function(response) {
    response.on('data', function(chunk) {
        //console.log("now data");
    });
    response.on('end', function() {
        //console.log("now end");
    });
});

// you'd also want to listen for errors in production
request.write(data);
request.end();