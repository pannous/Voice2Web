var http = require('http');

var data = JSON.stringify({
    'user': 'Jeannie ifc tdd dyxhxyxy', 
    'message':'hello world'
});

var host = '0.0.0.0';
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