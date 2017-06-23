//app.js
var express = require('express');
var app = express();
var serv = require('http').Server(app);
var io = require('socket.io')(serv,{});

var port = 2000;
var socketList = [];

//Leap motion initialization
var leapjs      = require('leapjs');
var controller  = new leapjs.Controller({enableGestures: true});

//Sends the location of the file the client should load
app.get('/',function(req, res) {
	res.sendFile(__dirname + '/client/index.html');
});
app.use('/client',express.static(__dirname + '/client'));
serv.listen(port);

//Gets IP address
require('dns').lookup(require('os').hostname(), function (err, ip, fam) {

    var address = ip + ":" + port;
    console.log('\n' +  "Connect your phone to: " + address + '\n');
})

//Handles what happens a client has connected to the server
io.sockets.on('connection', function(socket){
    socket.id = Math.random();
    socketList.push(socket);
    console.log(socket.id + ": Connected")
    socket.emit('connected', socket.id);
    socket.on('disconnect',function(){
        delete socketList[socket.id];
        console.log(socket.id + ": Disconnected")
    });	

    socket.on('angle', function(data){
        var string = JSON.parse(data)
        //console.log(string);
    })
});

//Handles leap motion input and sends it to all clients
controller.on('deviceFrame', function(frame) 
{
    if(frame.hands.length == 0)
    {
        //Do something when there are no hands
    }
    else if(frame.hands.length < 3)
    {
        for(var i = 0; i < frame.hands.length; i++)
        {

            //Constructs finger data to add to the handData
            var fingers = [];
            for(var k = 0; k < frame.hands[i].fingers.length; k++)
            {
                var finger = {
                    tipPosition: frame.hands[i].fingers[k].tipPosition,
                    pipPosition: frame.hands[i].fingers[k].pipPosition,
                    mcpPosition: frame.hands[i].fingers[k].mcpPosition,
                    carpPosition: frame.hands[i].fingers[k].carpPosition,
                    direction: frame.hands[i].fingers[k].direction
                };

                fingers.push(finger);
            }

            //Creates the hand data to send to the clients
            var handData = {
                type:frame.hands[i].type,
                palmPosition:frame.hands[i].palmPosition,
                fingers: fingers,
                grabStrength: frame.hands[i].grabStrength,
                pinchStrength: frame.hands[i].pinchStrength,
                pitch: frame.hands[i].pitch(),
                roll: frame.hands[i].roll(),
                yaw: frame.hands[i].yaw()
            }

            //Sends the data to all the clients
            for(var j = 0; j <  socketList.length; j++)
            {
                var socket = socketList[j];            
                socket.emit('handEvent', handData)
            } 
        }
    }
});
controller.connect();


