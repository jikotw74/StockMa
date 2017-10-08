const port = process.env.PORT || 3001;

var server = require('http').createServer();
var io = require('socket.io')(server);
io.on('connection', function(client){
	console.log('connection');
  	client.on('event', function(data){});
  	client.on('test', function(data){
  		console.log(data);
  		client.emit('test_response', data + (new Date().getTime()))
  	});
  	client.on('disconnect', function(){});
});
server.listen(port);