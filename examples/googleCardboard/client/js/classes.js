/********************************************/
/*                   HAND                   */
/********************************************/

function Hand()
{
    this.handSphere = null;
    this.palmSphere = null;
    this.handLines = {xLine : null, yLine : null};
    this.type = null;

    this.fingers = [];
    this.joints = [];
    this.knuckle = []; //ADD!
    this.jointLines = [];
    this.carpals = [];

    this.bones = [];

    this.palmLine = [];
    this.color = "yellow";
    this.palmSphereColor = "purple";

    this.grabbedState = false;
    this.grabbedObject = false;
    this.grabbedSphereId = null;
    this.selectedText;
    this.updatedText = false;
    this.scale = 1;
    this.visible = false;

    this.meshes = [];

    
}

Hand.prototype.moveHand = function(x, y, z)
{
    if(!this.visible)
    {
        this.showHand(true);
    }

    this.handSphere.position.set(x, y , z);
   
    if (this.handSphere.position.x > rightWall.position.x)      //Test if the hand stays in the sphere's area
        this.handSphere.position.x = rightWall.position.x;
    if (this.handSphere.position.x < leftWall.position.x)
        this.handSphere.position.x = leftWall.position.x;
    if (this.handSphere.position.y > ceiling.position.y)
        this.handSphere.position.y = ceiling.position.y;
    if (this.handSphere.position.y < floor.position.y)
        this.handSphere.position.y = floor.position.y;
    if (this.handSphere.position.z > boxFront)
        this.handSphere.position.z = boxFront;
    if (this.handSphere.position.z < backWall.position.z)
        this.handSphere.position.z = backWall.position.z;
};

Hand.prototype.moveJoints = function()
{ 
    var scale;

    for(var i = 0; i < this.bones.length; i++)
    {
        this.bones[i][0].position.set(this.knuckle[i].position.x, this.knuckle[i].position.y, this.knuckle[i].position.z); 
        this.bones[i][1].position.set(this.joints[i].position.x, this.joints[i].position.y, this.joints[i].position.z);
        
        this.bones[i][0].lookAt(new THREE.Vector3( this.joints[i].position.x, this.joints[i].position.y, this.joints[i].position.z));
        this.bones[i][1].lookAt(new THREE.Vector3( this.fingers[i].position.x, this.fingers[i].position.y, this.fingers[i].position.z));

        var scale1 =  this.knuckle[i].position.distanceTo((this.joints[i].position)) / boneLength;
        var scale2 =  this.joints[i].position.distanceTo((this.fingers[i].position)) / boneLength;
        this.bones[i][0].scale.setZ(scale1);
        this.bones[i][1].scale.setZ(scale2);
        
    }
    for(var i = 0; i < this.palmLine.length; i++)
    {
        if(i < 5)
        {   
            try 
            {
                this.palmLine[i].position.set(this.knuckle[i].position.x, this.knuckle[i].position.y, this.knuckle[i].position.z)
                this.palmLine[i].lookAt(this.knuckle[i+1].position)
                scale = this.knuckle[i].position.distanceTo(this.knuckle[i+1].position) / boneLength;
                this.palmLine[i].scale.setZ(scale);
            } 
            catch (error) 
            {
                this.palmLine[i].lookAt(this.carpals[i].position);
                scale = this.knuckle[i].position.distanceTo(this.carpals[i].position) / boneLength;
                this.palmLine[i].scale.setZ(scale);
            }
        }
        else
        {
            var j = (this.palmLine.length - i) - 1; //Finds the difference and takes it away from i then -1 to get 4,3,2,1,0 instead of ++
            this.palmLine[i].position.set(this.carpals[j].position.x, this.carpals[j].position.y,this.carpals[j].position.z)
            
            try
            {
                this.palmLine[i].lookAt(this.carpals[j+1].position);
                scale = this.carpals[j].position.distanceTo(this.carpals[j+1].position) / boneLength;
                this.palmLine[i].scale.setZ(scale);
            }
            catch(e)
            {
                this.palmLine[i].lookAt(this.carpals[j+1].position);
                scale = this.carpals[i].position.distanceTo(this.knuckle[j].position) / boneLength;
                this.palmLine[i].scale.setZ(scale);
            }
        }
        
    }
};
Hand.prototype.changeColor = function(color)
{
    this.color = color;
    var setColor = new THREE.Color(color);
    this.handSphere.material.color = setColor;

    for(var i = 0; i < this.joints.length; i++)
    {
        this.joints[i].material.color = setColor;
        this.fingers[i].material.color = setColor;
        this.knuckle[i].material.color = setColor;
        this.carpals[i].material.color = setColor;

        this.bones[i][0].material.color = setColor;
        this.bones[i][1].material.color = setColor;
    }

    for(var i = 0; i < this.palmLine.length; i++)
    {
        this.palmLine[i].material.color = setColor;
    }
}

Hand.prototype.grab = function(audioArray)
{
    for(var i = 0; i < audioArray.length; i++)
    {
        if(this.palmSphere.position.distanceTo(audioArray[i].sphere.position) < grabOffset + 10)
        {
            this.grabbedObject = true;
            this.grabbedSphereId = i;
        }
       
    }
}
Hand.prototype.movePalmSphere = function(x, y, z)
{
    this.palmSphere.position.set(x * xScale, (y - yOffset) * yScale, (z-zOffset) * zScale)
}
Hand.prototype.scalePalmSphere = function(scale)
{
    this.palmSphere.scale.set(scale, scale, scale);
    this.scale = scale;
}

Hand.prototype.showHand = function(state)
{
    this.visible = state;

    for(var i = 0; i < this.joints.length; i++)
    {

        this.joints[i].visible = state;
        this.fingers[i].visible = state;
        this.knuckle[i].visible = state;
        this.carpals[i].visible = state;
    }

    for(var i = 0; i < this.bones.length; i++)
    {
        this.bones[i][0].visible = state;
        this.bones[i][1].visible = state;
    }

    for(var i = 0; i < this.palmLine.length; i++)
    {
        this.palmLine[i].visible = state; 
    }
}

Hand.prototype.updateMeshes = function()
{
    for(var i = 0; i < this.joints.length; i++)
    {

        this.meshes.push(this.joints[i])
        this.meshes.push(this.fingers[i])
        this.meshes.push(this.knuckle[i])
        this.meshes.push(this.carpals[i])
    }

    for(var i = 0; i < this.bones.length; i++)
    {
        this.meshes.push(this.bones[i][0])
        this.meshes.push(this.bones[i][1])
    }

    for(var i = 0; i < this.palmLine.length; i++)
    {
        this.meshes.push(this.palmLine[i]);
    }
}
Hand.prototype.addToCamera = function()
{
    this.updateMeshes();
    for(var i = 0; i < this.meshes.length; i++)
    {
        camera.add(this.meshes[i]);
    }
}

/********************************************/
/*                  Audio                   */
/********************************************/

var AudioSphere = function()
{
  this.audioURL = null;
  this.sphere = null;

  this.audioBuffer = null;
  this.panNode = null;
  this.gainNode = null;

  this.text = null;
  this.id = null;
  this.color = null;
  this.selectedColor = null
}

AudioSphere.prototype.moveSphere = function(pos)
{
    this.sphere.position.set(pos.x, pos.y, pos.z)

    //X position is backwards...On purpose!
    if(this.sphere.position.x < boxRight + (audioSphereSize))
        this.sphere.position.x = boxRight + (audioSphereSize);
    if(this.sphere.position.x > boxLeft - (audioSphereSize))
        this.sphere.position.x = boxLeft - (audioSphereSize);
    if(this.sphere.position.y > boxTop - (audioSphereSize))
        this.sphere.position.y = boxTop - (audioSphereSize);
    if(this.sphere.position.y < boxBottom + (audioSphereSize))
        this.sphere.position.y = boxBottom + (audioSphereSize);
    if(this.sphere.position.z > boxBack - (audioSphereSize))
        this.sphere.position.z = boxBack - (audioSphereSize);
    if(this.sphere.position.z < boxFront + (audioSphereSize))
        this.sphere.position.z = boxFront + (audioSphereSize);

    var xTextScale = this.id.length / 2;
    this.text.position.set(this.sphere.position.x + (textXOffset * xTextScale), this.sphere.position.y, this.sphere.position.z - textZOffset);
}

function Button()
{
    this.button = null;
    this.edges = null;
    this.pressedFunc = null;

    this.color = "red";
    this.pressedColor = "green";

    this.pressed = false;
    this.pressable = true;

}