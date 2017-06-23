var scene, camera, renderer, world;
var xScale = 1.5,
    yScale = 0.7,
    zScale = 0.5,
    handSizeX = 1.5,
    handSizeY = 1,
    handSizeZ = 1;

var yOffset = 500,
    zOffset = 150;

var handThickness = 7;

var offscreen = -100000;
/* THREE SETUP */
var stats = new Stats();
stats.showPanel( 0 ); // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild( stats.dom )

var clock = new THREE.Clock();

renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

element = renderer.domElement;
container = document.getElementById('example');
container.appendChild(element);

effect = new THREE.StereoEffect(renderer);

scene = new THREE.Scene();
scene.add(new THREE.AmbientLight(0x555555)); 

camera = new THREE.PerspectiveCamera(90, 1, 1, 1000);
camera.position.set(0, 0, -50);
camera.lookAt(0, 0, 100);
scene.add(camera);

controls = new THREE.OrbitControls(camera, element);
//controls.rotateUp(Math.PI /2);
controls.rotateLeft(Math.PI / 2)
camera.position.set(0, 50, -200)
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

var directLight = new THREE.DirectionalLight(0xFFFFFF);      //Create a spotlight to see the sphere's 3D texture
directLight.position.set(0, 190, -460);       //Set the spotlight above the grids
scene.add(directLight);  

var shadowLight = new THREE.SpotLight(0xFFFFFF, 1)
shadowLight.castShadow = true;
shadowLight.shadow.mapSize.width = 1024; // default is 512
shadowLight.shadow.mapSize.height = 1024; // default is 512
shadowLight.shadow.camera.near = 0.1;
shadowLight.shadow.camera.far = 750;
shadowLight.position.y = 500;
scene.add(shadowLight)

/** LIE SETUP */
var world = new CANNON.World();
world.gravity.set(0,-9.82 * 70, 0);
world.broadphase = new CANNON.NaiveBroadphase();
world.broadphase.useBoundingBoxes = true;
world.solver.iterations = 10;
LIE.init(world)

rHand = new Hand();
lHand = new Hand();

LIE.scene = scene;

var ground = new LIE.PhysicsBox({width: 1000, height: 10, depth: 1000, mass:0, color:"grey"})
ground.body.position.set(0, 0, 0)
ground.mesh.position.copy(ground.body.position)
ground.physicsEnabled = false;

var box = new LIE.PhysicsBox({color: "red", mass:100, width: 60, height:30, depth:30})
box.body.position.set(0,50,0);
box.physicsEnabled = true;


var sphere = new LIE.PhysicsSphere({radius:20, mass: 100, color:"green"});
sphere.physicsEnabled = true;
sphere.body.position.set(100, 50, 0)

/*var cylinder = new LIE.PhysicsCylinder({radiusTop:20, radiusBottom:20, height: 50, mass:100, color:"blue"});
cylinder.physicsEnabled = true;
cylinder.body.position.set(-100, 50, 0)*/


box.body.collisionFilterMask = 1 | 4; 
sphere.body.collisionFilterMask = 1 | 4; 
//cylinder.body.collisionFilterMask = 1 | 4; 


window.addEventListener('resize', resize, false);
setTimeout(resize, 1);

function resize() {
    var width = container.offsetWidth;
    var height = container.offsetHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setSize(width, height);
    effect.setSize(width, height);
}
var fps = 30.0;
var timeStep = 1.0 / fps; // seconds

function animate(t) {

    requestAnimationFrame(animate)

    stats.begin();

    LIE.update();
    //LIE.WORLD.step(timeStep);

    resize();
    controls.update(clock.getDelta());

    effect.render(scene, camera);

    //Display updates
    stats.end();

}

function updatePhysics()
{
    LIE.update();
    LIE.WORLD.step(timeStep);
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
animate();

