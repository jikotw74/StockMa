const getStocks = require('./getStock');

const port = process.env.PORT || 3001;
let STOCKS = {};

var server = require('http').createServer();
var io = require('socket.io')(server);
let lastCheckTime = 0;
let running = false;

setInterval(async () => {
	if(running){
		return;
	}
  	// console.log(`interval start ${intervalID}`);
  	const now = new Date();
  	const nowH = now.getHours();
  	const isRealTimeMode = nowH >= 8 && nowH <= 12;
  	if(lastCheckTime === 0 || isRealTimeMode){
  		let lastTime = 0;
  		running = true;
		const response = await getStocks(Object.keys(STOCKS));  
		if(response && response.msgArray){
			response.msgArray.forEach(msg => {
				STOCKS[msg.c] = {
					...STOCKS[msg.c],
					updatedTime: msg.tlong,
					lastPrice: msg.y,
					nowPrice: msg.z
				}
				if(msg.tlong > lastTime){
					lastTime = msg.tlong;
				}
			});		
			if(lastTime > lastCheckTime){
				lastCheckTime = lastTime;
				io.emit('updateStocks', STOCKS);
			}	
		}
		running = false;				
  	}
}, 10000);

io.on('connection', function(client){
	let lastTime = 0;
  	let intervalID = false;
	console.log('connection');

  	client.on('registStocks', stock_ids => {
  		// console.log('registStocks', stock_ids)
  		stock_ids.forEach(id => {
  			if(!STOCKS[id]){
  				STOCKS[id] = {
  					id: id,
  					updatedTime: false
  				}
  				lastCheckTime = 0;
  			}
  		});
  	});

  	client.on('disconnect', function(){
  		console.log('disconnect');
  		clearInterval(intervalID);
  		intervalID = false;
  	});
});
server.listen(port, () => {
  console.log(`Server is running on port ${port}`)
});