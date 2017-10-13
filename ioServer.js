const getStocks = require('./getStock');

const port = process.env.PORT || 3001;
let STOCKS = {};

var server = require('http').createServer();
var io = require('socket.io')(server);

io.on('connection', function(client){
	let intervalID = false;
	let lastUpdatedTime = 0;
	console.log('connection');

  	client.on('registStocks', stock_ids => {
  		let isInit = false;
  		// console.log('registStocks', stock_ids)
  		stock_ids.forEach(id => {
  			if(!STOCKS[id]){
  				STOCKS[id] = {
  					id: id,
  					updatedTime: false
  				}
  			}
  		});

  		// console.log(STOCKS);

  		if(!intervalID){
  			intervalID = setInterval(async () => {
  				console.log(`interval start ${intervalID}`);

  				const now = new Date();
  				const nowH = now.getHours();
  				const isRealTimeMode = nowH >= 8 && nowH <= 12;

  				if(!isInit || isRealTimeMode){
  					let lastTime = 0;
					const response = await getStocks(Object.keys(STOCKS));  
					response.msgArray.forEach(msg => {
				  		STOCKS[msg.c] = {
				  			...STOCKS[msg.c],
				  			updatedTime: msg.tlong,
				  			openPrice: msg.o,
				  			nowPrice: msg.z
				  		}
				  		if(msg.tlong > lastTime){
				  			lastTime = msg.tlong;
				  		}
				  	});		
				  	if(lastTime > lastUpdatedTime){
				  		lastUpdatedTime = lastTime;
				  		client.emit('updateStocks', STOCKS);	
				  		isInit = true;
				  	}			
  				}
			}, 10000)
  		}
  	});

  	client.on('disconnect', function(){
  		console.log('disconnect');
  	});
});
server.listen(port, () => {
  console.log(`Server is running on port ${port}`)
});