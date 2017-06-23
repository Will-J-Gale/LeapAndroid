//app.js
var express = require('express');
var app = express();
var serv = require('http').Server(app);
var io = require('socket.io')(serv,{});

var leapjs      = require('leapjs');
var controller  = new leapjs.Controller({enableGestures: true});
var port = 2000;

var socketList = [];

app.get('/',function(req, res) {
	res.sendFile(__dirname + '/client/index.html');
});
app.use('/client',express.static(__dirname + '/client'));
serv.listen(port);

require('dns').lookup(require('os').hostname(), function (err, ip, fam) {

    var address = ip + ":" + port;
    console.log('\n' +  "Connect your phone to: " + address + '\n');
})
//console.log("Arguments: ", process.argv[2], Number(process.argv[2]) instanceof Number)
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

controller.on('deviceFrame', function(frame) 
{
  // loop through available gestures
    if(frame.hands.length == 0)
    {
        
    }
    else if(frame.hands.length < 3)
    {
        for(var i = 0; i < frame.hands.length; i++)
        {
            /*var fingers = [];
            var joints = [];
            var knuckle = [];
            var carpal = [];*/

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
            for(var j = 0; j <  socketList.length; j++)
            {
                var socket = socketList[j];
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
            
                socket.emit('handEvent', handData)
                /*socket.emit('handPosition', frame.hands[i].palmPosition, hType);
                socket.emit('palmSpherePos', frame.hands[i].sphereCenter, hType);
                socket.emit('fingerPosition', fingers, hType);
                socket.emit('jointPosition', joints, hType);
                socket.emit('knucklePosition', knuckle, hType);
                socket.emit('carpalPosition', carpal, hType);
                socket.emit('jointsPosition', hType);
                socket.emit('grabbed', frame.hands[i].grabStrength, hType);*/

            } 
        }
    }
});

function removeHands(hType, remove, socket)
{
    
 
}
controller.connect();


