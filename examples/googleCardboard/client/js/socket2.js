/**********************************/
/*******All Socket Listeners*******/
/**********************************/

var socket = io();

socket.on('handPosition', function(pos, hType)
{
    var hand = getHand(hType);

    hand.handSphere.position.set(-pos[0], -pos[2], -pos[1] * zScale);	
});

socket.on('palmSpherePos', function(pos, hType)
{
    var hand = getHand(hType);

    hand.palmSphere.position.set(-pos[0], -pos[2], -pos[1] * zScale)
    
});

socket.on('fingerPosition', function(fingersPos, hType)
{
    var hand = getHand(hType);

    for(var i = 0; i < fingersPos.length; i++)
    {
        hand.fingers[i].position.set(-fingersPos[i][0], -fingersPos[i][2], -fingersPos[i][1] * zScale);
    }		
});

socket.on('jointPosition', function(fingersPos, hType)
{
    
    var hand = getHand(hType);

    for(var i = 0; i < fingersPos.length; i++)
    {
        hand.joints[i].position.set(-fingersPos[i][0], -fingersPos[i][2], -fingersPos[i][1] * zScale);
    }		
});

socket.on('knucklePosition', function(fingersPos, hType)
{
    var hand = getHand(hType);
    
    for(var i = 0; i < fingersPos.length; i++)
    {
        hand.knuckle[i].position.set(-fingersPos[i][0], -fingersPos[i][2], -fingersPos[i][1] * zScale);
    }		
    
});

socket.on('carpalPosition', function(fingersPos, hType)
{
    var hand = getHand(hType);

    for(var i = 0; i < fingersPos.length; i++)
    {
        hand.carpals[i].position.set(-fingersPos[i][0], -fingersPos[i][2], -fingersPos[i][1] * zScale);
    }	
});

socket.on('connected', function(data)
{
    console.log("Connected... ID: " + data);	
});

socket.on('jointsPosition', function(hType)
{
    hand = getHand(hType);
    hand.moveJoints();
});

socket.on('grabbed', function(gStrength, hType)
{
    var hand = getHand(hType);

    if(gStrength > grabStrength)
    {
        if(hand.color == "yellow")
        {
            hand.changeColor("red");
            hand.grabbedState = true;
        }
    }
    else
    {
        if(hand.color == "red")
        {
            hand.changeColor("yellow");
            hand.grabbedState = false;
        }
    }
});

socket.on('removeHands', function(removeHands, hType)
{
    var hand = getHand(hType);
    hand.showHand(!removeHands);

});
function getHand(hType)
{
    if( hType == "left")
    {
        return lHand;
    }
    else
    {
        return rHand;
    }
}

