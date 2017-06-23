/********************************************/
/*                   HAND                   */
/********************************************/
var offScreen = -10000;
function Hand()
{
    this.handSphere = null;
    this.shadow = null;
    this.palmSphere = null;
    this.handLines = {xLine : null, yLine : null};
    this.type = null;
    this.fxCube = null;

    this.fingers = [];
    this.joints = [];
    this.knuckles = []; //ADD!
    this.carpals = [];
    this.bones = [];
    this.palm = [];

    this.meshes = [];

    this.palmLine = [];
    this.color = "white";
    this.palmSphereColor = "purple";

    this.grabbedObject = false;
    this.grabbedSphereId = null;
    this.selectedText;
    this.updatedText = false;
    this.scale = 1;
    this.visible = false;
    this.posOffset = null;
    
    this.voidHand = new THREE.Object3D();

    this.boundaryLeft;
    this.boundaryRight;

    this.line;

    this.createHand();
}
Hand.prototype.createHand = function()
{
    this.grabSphere = Create.sphere(60, offScreen, offScreen, offScreen, this.currentColor, 0.2, 0.3);
    this.grabSphereRadius = 60;
    this.orientCube = Create.box(15, 15, 15,  offScreen, offScreen, offScreen, "white");

    //**********************************************************//
    //                    FINGERS + JOINTS                      //
    //**********************************************************//

    this.createFingers();

    this.fingerRadius = 11;

    for(var i = 0; i < 9; i++)
    {
        this.palm.push(Create.bone(handThickness, 32, 1, this.color, false, 1));
    }  

    this.orientCube.add(this.grabSphere);
    this.orientCube.material.visible = false;
    this.grabSphere.position.set(0, 20, 0)
    this.grabSphere.material.visible = false;

    this.updateMeshes();
}
Hand.prototype.createFingers = function()
{
    for(var i = 0; i < 5; i++)
    {
        //Finger and joint  Spheres
        this.fingers.push(Create.sphere(handThickness, offScreen, offScreen, offScreen, this.currentColor, 0.2, 0.3));
        this.joints.push(Create.sphere(handThickness, offScreen, offScreen, offScreen, this.currentColor, 0.2, 0.3));
        this.knuckles.push(Create.sphere(handThickness, offScreen, offScreen, offScreen, this.currentColor, 0.2, 0.3));
        this.carpals.push(Create.sphere(handThickness, offScreen, offScreen, offScreen, this.currentColor, 0.2, 0.3));

        var tempArrayL = [];

        tempArrayL.push(Create.bone(handThickness, 32, 1, this.currentColor, false, 1));
        tempArrayL.push(Create.bone(handThickness, 32, 1, this.currentColor, false, 1));
        this.bones.push(tempArrayL);
    }  
}
Hand.prototype.updateMeshes = function()
{
    for(var i = 0; i < this.joints.length; i++)
    {
        this.meshes.push(this.joints[i]);
        this.meshes.push(this.fingers[i]);
        this.meshes.push(this.knuckles[i]);
        this.meshes.push(this.carpals[i]);

        this.meshes.push(this.bones[i][0]);
        this.meshes.push(this.bones[i][1]);
    }

    for(var i = 0; i < this.palm.length; i++)
    {
        this.meshes.push(this.palm[i]); 
    }

    this.meshes.push(this.grabSphere)

    for(var i = 0; i < this.meshes.length; i++)
    {
        if(this.meshes[i].uuid != this.grabSphere.uuid)
            this.voidHand.add(this.meshes[i])
    } //Maybe useful for camera position changes! TRY IT AND GET WORLD POSITION OF HAND!

    this.voidHand.add(this.orientCube)
    //camera.add(this.voidHand)
    camera.add(this.voidHand)
    this.orientCube.position.set(0,0,0);
    //this.orientCube.material.visible = true;
}
Hand.prototype.move = function(hand)
{
    var palmPos = hand.palmPosition;
    var fingers = hand.fingers;

    var xPos = palmPos[0] * xScale;
    var yPos = (palmPos[1] -yOffset) * yScale;
    var zPos = ((palmPos[2] -zOffset) * zScale);
    this.voidHand.position.set(xPos, yPos, zPos)

    //this.orientCube.position.set(palmPos[0] * MIX.userOptions.handSizeX, palmPos[1] * MIX.userOptions.handSizeY, palmPos[2] * MIX.userOptions.handSizeZ)
    //this.orientCube.rotation.x = this.angle.pitch; 
    //this.orientCube.rotation.y = -this.angle.yaw;
    //this.orientCube.rotation.z = this.angle.roll;

    this.moveFingers(fingers);
    this.movePalm();

}

Hand.prototype.moveFingers = function(fingersArray)
{
    for(var i = 0; i < fingersArray.length; i++)
    {
        //Set position of all joint spheres
        this.fingers[i].position.set(fingersArray[i].tipPosition[0] * handSizeX, fingersArray[i].tipPosition[1] * handSizeY, fingersArray[i].tipPosition[2] * handSizeZ);
        this.joints[i].position.set(fingersArray[i].pipPosition[0] * handSizeX, fingersArray[i].pipPosition[1] * handSizeY, fingersArray[i].pipPosition[2] * handSizeZ);
        this.knuckles[i].position.set(fingersArray[i].mcpPosition[0] * handSizeX, fingersArray[i].mcpPosition[1] * handSizeY, fingersArray[i].mcpPosition[2] * handSizeZ);
        this.carpals[i].position.set(fingersArray[i].carpPosition[0] * handSizeX, fingersArray[i].carpPosition[1] * handSizeY, fingersArray[i].carpPosition[2] * handSizeZ);

        this.bones[i][0].position.set(this.knuckles[i].position.x, this.knuckles[i].position.y, this.knuckles[i].position.z); 
        this.bones[i][1].position.set(this.joints[i].position.x, this.joints[i].position.y, this.joints[i].position.z);
        
        this.bones[i][0].lookAt(new THREE.Vector3( this.joints[i].position.x, this.joints[i].position.y, this.joints[i].position.z));
        this.bones[i][1].lookAt(new THREE.Vector3( this.fingers[i].position.x, this.fingers[i].position.y, this.fingers[i].position.z));

        var scale1 =  this.knuckles[i].position.distanceTo((this.joints[i].position));
        var scale2 =  this.joints[i].position.distanceTo((this.fingers[i].position));
        this.bones[i][0].scale.setZ(scale1);
        this.bones[i][1].scale.setZ(scale2);
    }
}
Hand.prototype.movePalm = function()
{
    var scale;
    for(var i = 0; i < this.palm.length; i++)
    {
        if(i < 5)
        {   
            try 
            {
                this.palm[i].position.set(this.knuckles[i].position.x, this.knuckles[i].position.y, this.knuckles[i].position.z)
                this.palm[i].lookAt(this.knuckles[i+1].position)
                scale = this.knuckles[i].position.distanceTo(this.knuckles[i+1].position);
                this.palm[i].scale.setZ(scale);
            } 
            catch (error) 
            {
                this.palm[i].lookAt(this.carpals[i].position);
                scale = this.knuckles[i].position.distanceTo(this.carpals[i].position);
                this.palm[i].scale.setZ(scale);
            }
        }
        else
        {
            var j = (this.palm.length - i) - 1; //Finds the difference and takes it away from i then -1 to get 4,3,2,1,0 instead of ++
            this.palm[i].position.set(this.carpals[j].position.x, this.carpals[j].position.y,this.carpals[j].position.z)
            
            try
            {
                this.palm[i].lookAt(this.carpals[j+1].position);
                scale = this.carpals[j].position.distanceTo(this.carpals[j+1].position);
                this.palm[i].scale.setZ(scale);
            }
            catch(e)
            {
                this.palm[i].lookAt(this.carpals[j+1].position);
                scale = this.carpals[i].position.distanceTo(this.knuckles[j].position);
                this.palm[i].scale.setZ(scale);
            }
        }
    }
}
Hand.prototype.changeColor = function(color)
{
    this.color = color;
    this.handSphere.material.color = new THREE.Color(color);
}

Hand.prototype.pinch = function(hand)
{
    var pincher;
    var closest = 50;
    var index;
    for(var f = 1; f < 5; f++)
    {
        current = hand.fingers[f];
        distance = Leap.vec3.distance(hand.thumb.tipPosition, current.tipPosition);
        if(current != hand.thumb && distance < closest)
        {
            closest = distance;
            pincher = current;
            index = f; 
        }
    } 
    return fingerType[index];
}

Hand.prototype.movePalmSphere = function(x, y, z)
{
    this.palmSphere.position.set(x * xScale, (y - yOffset) * yScale, (z-zOffset) * zScale)
}

Hand.prototype.hideHand = function()
{
    this.visible = false;

    this.handSphere.position.set(offScreen, offScreen, offScreen);
    this.handSphere.visible = false;

    this.handLines.xLine.visible = false;
    this.handLines.yLine.visible = false;

    this.shadow.visible = false;


    for(var i = 0; i < this.joints.length; i++)
    {
        this.joints[i].position.set(offScreen, offScreen, offScreen);
        this.fingers[i].position.set(offScreen, offScreen, offScreen);
        this.knuckle[i].position.set(offScreen, offScreen, offScreen);
        this.carpals[i].position.set(offScreen, offScreen, offScreen);

        this.joints[i].visible = false;
        this.fingers[i].visible = false;
        this.knuckle[i].visible = false;
        this.carpals[i].visible = false;
    }

    for(var i = 0; i < this.bones.length; i++)
    {
        this.bones[i][0].visible = false;
        this.bones[i][1].visible = false;
    }

    for(var i = 0; i < this.palmLine.length; i++)
    {
        this.palmLine[i].visible = false; 
    }
}
Hand.prototype.showHand = function()
{
    this.visible = true;
    this.handSphere.visible = true;

    this.handLines.xLine.visible = true;
    this.handLines.yLine.visible = true;

    this.shadow.visible = true;

    this.palmLine.visible = true;

    for(var i = 0; i < this.joints.length; i++)
    {
        this.joints[i].visible = true;
        this.fingers[i].visible = true;
        this.knuckle[i].visible = true;
        this.carpals[i].visible = true;
    }

    for(var i = 0; i < this.bones.length; i++)
    {
        this.bones[i][0].visible = true;
        this.bones[i][1].visible = true;
    }

    for(var i = 0; i < this.palmLine.length; i++)
    {
        this.palmLine[i].visible = true; 
    }
}

var Create = {
    wall: function(width, height, rotX, rotY, rotZ, x, y, z, color, hasShadow, isTransparent, opacityVal)
    {
        var wallMat = new THREE.MeshStandardMaterial({color: color, transparent: isTransparent, opacity: opacityVal, metalness:0.2, roughness: 0.7, side:THREE.FrontSide});        //Create the bottom material{ transparent: true, opacity: 0.5 }
        wallMat.polygonOffset = true;
        wallMat.polygonOffsetFactor = -0.1;

        var wall = new THREE.Mesh(new THREE.PlaneGeometry(width, height), wallMat); 
        wall.receiveShadow = hasShadow; 

        if(x != null)
            wall.translateX(x);
        if(y != null)
            wall.translateY(y); 
        if(z != null)
            wall.translateZ(z); 
        if(rotX != null)
            wall.rotation.x = rotX;
        if(rotY != null)
            wall.rotation.y = rotY;
        if(rotZ != null)
            wall.rotation.z = rotZ;   

        scene.add(wall);
        wall.normalColor = color;
        wall.userData.active = true;
        return wall;
    },
    box: function(width, height, depth, x, y, z, color)
    {
        var geometry = new THREE.BoxGeometry( width, height, depth );
        var material = new THREE.MeshPhongMaterial( { color: color } );
        var mesh = new THREE.Mesh( geometry, material );

        mesh.position.set(x, y, z)
        mesh.userData.active = true;

        scene.add( mesh );
        return mesh;
    },
    sphere: function(radius, x, y, z, color, metalness, roughness)
    {
        var tempMetal = metalness || 0.2;
        var tempRough = roughness || 0.3;
        var sphereGeo = new THREE.SphereGeometry(radius, 16, 16);       //Set the hand's sphere's geometry
        var sphereMat = new THREE.MeshStandardMaterial({ color: color, transparent: false, opacity: 1, metalness: tempMetal, roughness: tempRough});      //Set the hand's sphere's material
        sphereMat.polygonOffset = true;
        sphereMat.polygonOffsetFactor = -0.1;

        var sphere = new THREE.Mesh(sphereGeo, sphereMat);       //Create the hand's sphere using its geometry and material

        sphere.position.x = x;
        sphere.position.y = y;
        sphere.position.z = z;
        sphere.castShadow = true;
        sphere.userData.active = true; 

        scene.add(sphere);
        return sphere;
    },
    bone: function(radius, faces, length, color, isTransparent, opacityVal)
    {
        material = new THREE.MeshStandardMaterial( { shading: THREE.SmoothShading, transparent: isTransparent, opacity: opacityVal, color : color, metalness: 0.2, roughness: 0.3} );
        material.polygonOffset = true;
        material.polygonOffsetFactor = -0.1;
        geometry = new THREE.CylinderGeometry( radius, radius, length, faces );
        geometry.applyMatrix( new THREE.Matrix4().makeRotationX( Math.PI / -2 ) );

        bone = new THREE.Mesh( geometry, material );
        
        geometry.applyMatrix( new THREE.Matrix4().makeTranslation(bone.position.x, bone.position.y, bone.position.z + (length / 2)));
        bone.lookAt(new THREE.Vector3(0, 1, 0) );
        bone.castShadow = true;
        bone.position.set(offScreen, offScreen, offScreen);

        bone.userData.active = true;

        scene.add( bone );
        return bone
    }, 
    text: function(text, x, y, z, size, color, hasShadow)
    {
        var textGeo = new THREE.TextGeometry( text, {       //Set the Text's geometry
                font: MIX.FONT,
                size: size,
                height: 2,
                curveSegments: 20,
                bevelThickness: 2,
                bevelSize: 5,
                bevelEnabled: false
            } );
        var textMat = new THREE.MeshPhongMaterial({color: color});
        var physicalText = new THREE.Mesh(textGeo, textMat);
        physicalText.position.set(x, y, z);
        physicalText.castShadow = hasShadow || false;
        physicalText.geometry.computeBoundingBox();
        var xOffset = physicalText.geometry.boundingBox.max.x / 2;

        var yOffset = physicalText.geometry.boundingBox.max.y / 2
        physicalText.geometry.applyMatrix( new THREE.Matrix4().makeTranslation(physicalText.position.x - xOffset, physicalText.position.y - yOffset, 0));
        physicalText.userData.active = true;

        scene.add(physicalText);
        return physicalText;
    },
    glow:function(color)
    {
        var spriteMaterial = new THREE.SpriteMaterial( 
        { 
            map: MIX.GLOW_TEXTURE, 
            color: color, 
            transparent: true, 
            blending: THREE.AdditiveBlending
        });

        var sprite = new THREE.Sprite( spriteMaterial );
        sprite.scale.set(75, 75, 1.0);
        sprite.userData.active = true;
        
        return sprite;
    }
}


/*Options = function()
{
    //Hands
    this.xScale = X_SCALE;
    this.yScale = Y_SCALE;
    this.zScale = Z_SCALE;
    
    this.grabStrength = GRAB_STRENGTH;
    this.yOffset = Y_OFFSET;
    this.zOffset = Z_OFFSET;
    
    this.activeDistance = ACTIVE_DISTANCE;

    //OpenHand
    this.upOpenThresh = UP_OPEN_THRESH;
    this.dOpenThresh = DOWN_OPEN_THRESH;
    this.lOpenThresh = LEFT_OPEN_THRESH;
    this.rOpenThresh = RIGHT_OPEN_THRESH;
    this.fwdOpenThresh = FWD_OPEN_THRESH;
    this.bwdOpenThresh = BWD_OPEN_THRESH;

    //Closed Hand;
    this.upClosedThresh = UP_CLOSED_THRESH;
    this.dClosedThresh = DOWN_CLOSED_THRESH;
    this.lClosedThresh = LEFT_CLOSED_THRESH;
    this.rClosedThresh = RIGHT_CLOSED_THRESH;
    this.fwdClosedThresh = FWD_CLOSED_THRESH;
    this.bwdClosedThresh = BWD_CLOSED_THRESH;

    //Misc
    this.fullScreen = Utils.toggleFullScreen;
    this.view = VIEWS.FRONT;
    this.deleteAllTracks = Utils.deleteAllTracks;
    this.twistAngle = TWIST_ANGLE;

    //this.auxModeThresh = AUX_MODE_THRESH;
    //this.auxModeOption = AUX_MODE_DEFAULT;
    this.eqModeOption = EQ_MODE_DEFAULT;

    this.fps = 60;

    this.tipsEnabled = false;
    this.changeSoloMode = true;

    this.boxWidth = 800;
    this.aspectRatio = '16/9';
    this.zoom = 0;

    this.handSizeX = HAND_SIZE_X;
    this.handSizeY = HAND_SIZE_Y;
    this.handSizeZ = HAND_SIZE_Z;
    
    this.handThickness = 1;
    this.buttonHoldDelay = BUTTON_HOLD_DELAY;
    

    this.default = function()
    {
        //Hands
        this.xScale = X_SCALE;
        this.yScale = Y_SCALE;
        this.zScale = Z_SCALE;
        
        this.grabStrength = GRAB_STRENGTH;
        this.yOffset = Y_OFFSET;
        this.zOffset = Z_OFFSET;
        
        this.activeDistance = ACTIVE_DISTANCE;

        //OpenHand
        this.upOpenThresh = UP_OPEN_THRESH;
        this.dOpenThresh = DOWN_OPEN_THRESH;
        this.lOpenThresh = LEFT_OPEN_THRESH;
        this.rOpenThresh = RIGHT_OPEN_THRESH;
        this.fwdOpenThresh = FWD_OPEN_THRESH;
        this.bwdOpenThresh = BWD_OPEN_THRESH;

        //Closed Hand;
        this.upClosedThresh = UP_CLOSED_THRESH;
        this.dClosedThresh = DOWN_CLOSED_THRESH;
        this.lClosedThresh = LEFT_CLOSED_THRESH;
        this.rClosedThresh = RIGHT_CLOSED_THRESH;
        this.fwdClosedThresh = FWD_CLOSED_THRESH;
        this.bwdClosedThresh = BWD_CLOSED_THRESH;

        //Misc
        this.fullScreen = Utils.toggleFullScreen;
        this.view = VIEWS.FRONT;
        this.deleteAllTracks = Utils.deleteAllTracks;
        this.twistAngle = TWIST_ANGLE;

        //this.auxModeThresh = AUX_MODE_THRESH;
        //this.auxModeOption = AUX_MODE_DEFAULT;
        this.eqModeOption = EQ_MODE_DEFAULT;

        this.fps = 60;

        this.tipsEnabled = false;
        this.changeSoloMode = true;

        this.boxWidth = 800;
        this.aspectRatio = '16/9';
        this.zoom = 0;

        this.handSizeX = HAND_SIZE_X;
        this.handSizeY = HAND_SIZE_Y;
        this.handSizeZ = HAND_SIZE_Z;

        this.buttonHoldDelay = BUTTON_HOLD_DELAY;
        

    this.handThickness = 1;
    }

    this.addHelpers = function(){CollisionEngine.addHelpers()}
    this.removeHelpers = function(){CollisionEngine.removeHelpers()}
}*/

