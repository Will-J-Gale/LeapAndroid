/**********************************/
/*      All Socket Listeners      */
/**********************************/
/*var handData = {
    type:frame.hands[i].type,
    position:frame.hands[i].palmPosition,
    tip:fingers,
    joints:joints,
    knuckles:knuckle,
    grabStrength: frame.hands[i].grabStrength,
    carpals:carpal

}*/

//Target
/*var hand = {
    palmPosition: [x, y, z],
    pitch: pitch,
    roll: roll,
    yaw, yaw,
    fingers: [finger, finger, finger, finger, finger],
    grabStrength: grabStrength,
    pinchStrength: pinchStrength, 

}*/
    
var socket = io();
socket.on('handEvent', function(handData)
{
    
    var hand = getHand(handData.type)
    rHand.move(handData)
    
});

function getHand(hType)
{
    if( hType == "left")
        return lHand;
    else
        return rHand;
}

