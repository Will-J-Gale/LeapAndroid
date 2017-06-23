/*window.onerror = function(message, url, lineNumber)
{
    socet.emit("error", {message: message, url: url, line: lineNumber});
    return false;
}*/

/** USEL FOR SENDING DEBUG MESSAGES TO SOCET! */

var camera, scene, renderer;
var effect, controls;
var element, container;
var stats = new Stats();
stats.showPanel( 0 ); // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild( stats.dom )

var clock = new THREE.Clock();

init();

scene.add(new THREE.AmbientLight(0x555555)); 

//**********************************************************//
//                    FINGERS + JOINTS                      //
//**********************************************************//


function init() {
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    element = renderer.domElement;
    container = document.getElementById('example');
    container.appendChild(element);

    effect = new THREE.StereoEffect(renderer);

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(90, 1, 1, 1000);
    camera.position.set(0, 0, -50);
    camera.lookAt(0, 0, 100);
    scene.add(camera);

    controls = new THREE.OrbitControls(camera, element);
    controls.rotateUp(Math.PI /20);
    controls.rotateLeft(Math.PI / 2)
    controls.target.set(
    camera.position.x + 0.1,
    camera.position.y,
    camera.position.z
    );
    controls.noZoom = true;
    controls.noPan = true;

    function setOrientationControls(e) {
    if (!e.alpha) {
        return;
    }

    controls = new THREE.DeviceOrientationControls(camera, true);
    controls.connect();
    controls.update();

    element.addEventListener('click', fullscreen, false);

    window.removeEventListener('deviceorientation', setOrientationControls, true);
    }
    window.addEventListener('deviceorientation', setOrientationControls, true);

    var hemLight = new THREE.HemisphereLight(0x777777, 0x000000, 0.6);
    scene.add(hemLight);

    floor = createWall(boxWidth, depth, -rotation, null, null, null, boxBottom, boxCentre, true, wallColor);
    ceiling = createWall(boxWidth, depth, rotation, null, null, null, boxTop , boxCentre, false, wallColor);
    leftWall = createWall(depth, boxHeight, null, -rotation, null, boxLeft, null, boxCentre, false, wallColor);
    rightWall = createWall(depth, boxHeight, null, rotation, null,  boxRight , null,  boxCentre, false, wallColor);
    backWall = createWall(boxWidth, boxHeight, null, rotation*2, null,  null , null,  boxBack, false, wallColor);

    /*lHand.type = "left";
    lHand.handSphere = createSphere(handSphereSize, offScreen, offScreen, offScreen, lHand.color);
    lHand.handSphere.visible = false;
    lHand.palmSphere = createSphere(grabSphereSize, offScreen, offScreen, offScreen, lHand.palmSphereColor);
    lHand.palmSphere.visible = false;

    ////////////////////////////////////////////////////////////////////////////////////////////////

    //Creating right hand objects and shadow
    rHand.type = "right";
    rHand.handSphere = createSphere(handSphereSize, offScreen, offScreen, offScreen, rHand.color);
    rHand.handSphere.visible = false;
    rHand.palmSphere = createSphere(grabSphereSize, offScreen, offScreen, offScreen, rHand.palmSphereColor);
    rHand.palmSphere.visible = false;*/


    var shadowLight = new THREE.DirectionalLight(0xffffff, 1);
    shadowLight.castShadow = true;
    shadowLight.target = floor
    shadowLight.shadow.mapSize.width = shadowDetail; // default is 512
    shadowLight.shadow.mapSize.height = shadowDetail; // default is 512
    shadowLight.shadow.camera.near = 20;
    shadowLight.shadow.camera.far = 1000;
    shadowLight.shadow.camera.left = -800; // CHANGED
    shadowLight.shadow.camera.right = 800; // CHANGED
    shadowLight.shadow.camera.top = 800; // CHANGED
    shadowLight.shadow.camera.bottom = -800; // CHANGED

    shadowLight.position.set(0, 200, 460); // CHANGED
    scene.add(shadowLight);

    var directLight = new THREE.DirectionalLight(0xFFFFFF);      //Create a spotlight to see the sphere's 3D texture
    directLight.position.set(0, 190, -460);       //Set the spotlight above the grids
    scene.add(directLight);  

    /*for(var i = 0; i < 5; i++)
    {
        //Finger and joint  Spheres
        lHand.fingers.push(createSphere(jointSphereSize, offScreen, offScreen, offScreen, lHand.color));
        lHand.joints.push(createSphere(jointSphereSize, offScreen, offScreen, offScreen, lHand.color));
        lHand.knuckle.push(createSphere(jointSphereSize, offScreen, offScreen, offScreen, lHand.color));
        lHand.carpals.push(createSphere(jointSphereSize, offScreen, offScreen, offScreen, lHand.color));
        
        rHand.fingers.push(createSphere(jointSphereSize, offScreen, offScreen, offScreen, rHand.color));
        rHand.joints.push(createSphere(jointSphereSize, offScreen, offScreen, offScreen, rHand.color));
        rHand.knuckle.push(createSphere(jointSphereSize, offScreen, offScreen, offScreen,rHand.color));
        rHand.carpals.push(createSphere(jointSphereSize, offScreen, offScreen, offScreen, rHand.color));

        var tempArrayL = [];
        var tempArrayR = [];

        tempArrayL.push(createBone(boneRad, boneFaces, boneLength, boneColor));
        tempArrayL.push(createBone(boneRad, boneFaces, boneLength, boneColor));
        lHand.bones.push(tempArrayL);
        
        tempArrayR.push(createBone(boneRad, boneFaces, boneLength, boneColor));
        tempArrayR.push(createBone(boneRad, boneFaces, boneLength, boneColor));
        rHand.bones.push(tempArrayR);
    }  


    for(var i = 0; i < 9; i++)
    {
        lHand.palmLine.push(createBone(boneRad, boneFaces, boneLength, boneColor));
        rHand.palmLine.push(createBone(boneRad, boneFaces, boneLength, boneColor));
    }   */ 
                

    /*for(var i = 0; i < numChannels; i++)
    {
        audioObjects[i] = new AudioSphere;
        audioObjects[i].sphere = createSphere(audioSphereSize, -(audioSphereXOffset*(i - numChannels/2)),(audioSphereYOffset*(i - numChannels/2)), 460, color[i]);
        audioObjects[i].color = color[i];
        
        audioObjects[i].id = audioSphereText[i];
    }

    var loader = new THREE.FontLoader();        //Load the font which is going to be used for the texts
    loader.load( textFont, function ( font ) 
    {
        for (var i = 0; i < numChannels; i++)     //Loop as long as the number of tracks
        {
            var xTextScale = audioObjects[i].id.length / 2;
            audioObjects[i].text = createText(audioObjects[i].id, font, audioObjects[i].sphere.position.x + (textXOffset * xTextScale), 
                                                audioObjects[i].sphere.position.y, audioObjects[i].sphere.position.z - textZOffset,
                                                textSize, textColor);
        }
    });*/

    playButton.button = createCube(50, 10, 30, 0, boxBottom, 260, playButton.color);
    playButton.edges = new THREE.EdgesHelper(playButton.button, "black");
    scene.add(playButton.edges)

    playButton.pressedFunc = function(){
        playSounds();
    }

    var arrowHelper = new THREE.ArrowHelper( new THREE.Vector3( 1, 0, 0 ), new THREE.Vector3( 0, 2, -100 ), length, 0xff0000 );
    arrowHelper.line.material.linewidth = 5;
    var arrowHelper2 = new THREE.ArrowHelper( new THREE.Vector3( 0, 1, 0 ), new THREE.Vector3( 0, 2, -100 ), length, 0x00ff00 );
    arrowHelper2.line.material.linewidth = 5;
    var arrowHelper3 = new THREE.ArrowHelper( new THREE.Vector3( 0, 0, 1 ), new THREE.Vector3( 0, 2, -100 ), length, 0x0000ff );
    arrowHelper3.line.material.linewidth = 5;
    scene.add( arrowHelper, arrowHelper2, arrowHelper3 );

    window.addEventListener('resize', resize, false);
    setTimeout(resize, 1);

    //rHand.addToCamera();
    //lHand.addToCamera();
}

function resize() {
    var width = container.offsetWidth;
    var height = container.offsetHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setSize(width, height);
    effect.setSize(width, height);
}

function update(dt) {
    resize();
    controls.update(dt);
    
}

function render(dt) {
    effect.render(scene, camera);
}

function animate(t) {
    requestAnimationFrame(animate);
    stats.begin();

    update(clock.getDelta());
    render(clock.getDelta());

    //Display updates
    stats.end();

}

function fullscreen() {
    if (container.requestFullscreen) {
    container.requestFullscreen();
    } else if (container.msRequestFullscreen) {
    container.msRequestFullscreen();
    } else if (container.mozRequestFullScreen) {
    container.mozRequestFullScreen();
    } else if (container.webkitRequestFullscreen) {
    container.webkitRequestFullscreen();
    }
}

/****************************************/
/* Extra functions to update interface  */ 
/****************************************/ 

function createCube(width, height, depth, x, y, z, color)
{
    var geometry = new THREE.BoxGeometry( width, height, depth );
    var material = new THREE.MeshPhongMaterial( { color: color } );
    var mesh = new THREE.Mesh( geometry, material );

    mesh.position.set(x, y, z)

    scene.add( mesh );
    return mesh;
}

function updateText(text, hand)
{
    if(hand == "left")
    {
        scene.remove(lHand.selectedText);
        
        loader.load( textFont, function ( font ) 
        {
            var xScale = text.length/ 2;
 
            lHand.selectedText = createText(text, font, (selectedTextPos.x + textLeftOffset) - (textXOffset * xScale) , selectedTextPos.y, selectedTextPos.z, textSize, textColor)
            scene.add(lHand.selectedText);
        });
    }
    else
    {
        //scene.remove(rHand.selectedText);
        
        loader.load( textFont, function ( font ) 
        {
            //var xScale = text.length / 2;
            //rHand.selectedText = createText(text, font, (selectedTextPos.x + textRightOffset) - (textXOffset * xScale), selectedTextPos.y, selectedTextPos.z, textSize, textColor)
            //scene.add(rHand.selectedText);
        });
    } 
}


function createSphere(radius, x, y, z, color)
{
    var sphereGeo = new THREE.SphereGeometry(radius, 16, 16);       //Set the hand's sphere's geometry
    var sphereMat = new THREE.MeshPhongMaterial({ color: color });      //Set the hand's sphere's material
    sphereMat.polygonOffset = true;
    sphereMat.polygonOffsetFactor = -0.1;
    var sphere = new THREE.Mesh(sphereGeo, sphereMat);       //Create the hand's sphere using its geometry and material
    sphere.castShadow = true;
    sphere.position.x = x;
    sphere.position.y = y;
    sphere.position.z = z;
    scene.add(sphere);
    return sphere;
}

function createLine(vert1, vert2, color)
{
    var lineMat = new THREE.LineBasicMaterial({ color: color });     //Set the Xline material
    var lineGeo = new THREE.Geometry();     //Set the Xline geometry
    lineMat.polygonOffset = true;
    lineMat.polygonOffsetFactor = -0.1;

    lineGeo.vertices.push(vert1);     //Set the beginning of the line
    lineGeo.vertices.push(vert2);     //Set the ending of the line
    var line = new THREE.Line(lineGeo, lineMat);        //Create the Xline using its geometry and material
    scene.add(line);
    return line;
}
function createJoint(vertArray, color)
{
    var lineMat = new THREE.LineBasicMaterial({ color: color, linewidth : lineWidth});     //Set the Xline material
    lineMat.polygonOffset = true;
    lineMat.polygonOffsetFactor = -0.1;
    var lineGeo = new THREE.Geometry();     //Set the Xline geometry
    for(var i = 0; i < vertArray.length; i++)
    {
        lineGeo.vertices.push(vertArray[i]);
    }
    line = new THREE.Line(lineGeo, lineMat); 
    line.geometry.verticesNeedUpdate = true;       //Create the Xline using its geometry and material
    scene.add(line);
    return line;
}
function createGrid(size, step, rotX, rotY, rotZ, transX, transY, transZ, lineCol, gridCol)
{
    var grid = new THREE.GridHelper(size, step);    //Create a grid for the background of the scene
               
    if(transX != null)
       grid.translateX(transX);     

    if(transY != null)
       grid.translateY(transY);

    if(transZ != null)
       grid.translateZ(transZ);      
                                                    //Set the grid to the background
    grid.setColors(lineCol, gridCol);               //Set the grid's colors
    
    if(rotX != null)
        grid.rotation.x = rotX 

    if(rotY != null)
        grid.rotation.y = rotY;    

    if(rotZ != null)
        grid.rotation.z = rotZ;
                                                        //Turn the grid in front of the camera
    scene.add(grid); 

    return grid;                              //Add the grid to the scene
}
function createWall(width, height, rotX, rotY, rotZ, x, y, z, receiverShadow, color)
{
    var wallMat = new THREE.MeshLambertMaterial({color: color});        //Create the bottom material
    wallMat.polygonOffset = true;
    wallMat.polygonOffsetFactor = -0.1;

    var wall = new THREE.Mesh(new THREE.PlaneGeometry(width, height), wallMat); 
    wall.receiveShadow = receiverShadow;

    if(x != null)
    {
        wall.translateX(x);
    }
    if(y != null)
    {
        wall.translateY(y); 
    }
    if(z != null)
    {
        wall.translateZ(z); 
    } 
    if(rotX != null)
    {
        wall.rotation.x = rotX;
    } 
    if(rotY != null)
    {
        wall.rotation.y = rotY;
    }
    if(rotZ != null)
    {
        wall.rotation.z = rotZ;
    }     
    wall.recieveShadow = true;
    wall.castShadow = false;
    wall.visible = true;
    scene.add(wall);
    return wall;
}
function createText(text, font, x, y, z, size, color)
{
    var textGeo = new THREE.TextGeometry( text, {       //Set the Text's geometry
            font: font,
            size: size,
            height: 2,
            curveSegments: 20,
            bevelThickness: 2,
            bevelSize: 5,
            bevelEnabled: false
        } );
    var textMat = new THREE.MeshPhongMaterial({color: color});
    var physicalText = new THREE.Mesh(textGeo, textMat);
    physicalText.rotation.y = Math.PI;
    physicalText.position.set(x, y, z);
    scene.add(physicalText);
    
    return physicalText;
}

function spectralCentroidDisplay()
{
	for(var i = 0; i < centroidArray.length; i++)
	{
		var tempYPos = changeRange(centroidArray[i], freqBottom, freqTop, boxBottom, boxTop);
		audioObjects[i].sphere.position.y = tempYPos;
		audioObjects[i].text.position.y = tempYPos;
    }
}

function createBone(radius, faces, length, color)
{
    material = new THREE.MeshPhongMaterial( { shading: THREE.SmoothShading, color : color} );
    material.polygonOffset = true;
    material.polygonOffsetFactor = -0.1;
    geometry = new THREE.CylinderGeometry( radius, radius, length, faces );
    geometry.applyMatrix( new THREE.Matrix4().makeRotationX( Math.PI / -2 ) );

    bone = new THREE.Mesh( geometry, material );
    
    geometry.applyMatrix( new THREE.Matrix4().makeTranslation(bone.position.x, bone.position.y, bone.position.z + (length / 2)));
    bone.lookAt(new THREE.Vector3(0, 1, 0) );
    bone.castShadow = true;
    bone.position.set(offScreen, offScreen, offScreen)
    scene.add( bone );
    return bone
}

animate();

