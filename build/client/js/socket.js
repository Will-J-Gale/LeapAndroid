
var url = "127.0.0.1:2000"; //Change to your desired url
var socket = io(url);

socket.on('handEvent', function(handData){
    console.log(handData.palmPosition);
})
