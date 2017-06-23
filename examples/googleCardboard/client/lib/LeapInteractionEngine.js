var LIE = {REVISION: 1};
LIE.init = function(world)
{
	LIE.WORLD = world;
}
LIE.scene;

/***********************/
/*        Entity       */
/***********************/
LIE.velocityScale = 50;
LIE.Utils = {
	inherits: function(ctor, superCtor) {
        ctor.super_ = superCtor;
        ctor.prototype = Object.create(superCtor.prototype, {
            constructor: {
            value: ctor,
            enumerable: false,
            writable: true,
            configurable: true
            }
        });
    },
}
LIE.Entity = function(params)
{
	this.addToWorld = true;
	this.velocity = new THREE.Vector3();
	this.lastPosition = new THREE.Vector3();
	this.setParameters(params)
}
LIE.Entity.prototype.setParameters = function(params)
{
	// ADD ERROR CHECKING!
	for(key in params)
	{
		if(this[key] === undefined)
			continue

		this[key] = params[key];
	}
}
LIE.Entity.prototype.update = function()
{
	this.mesh.position.copy(this.body.position)
	this.mesh.quaternion.copy(this.body.quaternion)

	this.velocity.subVectors(this.mesh.position, this.lastPosition)
	this.velocity.multiplyScalar(LIE.velocityScale)
	this.body.velocity.copy(this.velocity)
	this.lastPosition.copy(this.mesh.position);
}
LIE.Entity.prototype.updateVelocity = function()
{
	this.body.position.copy(this.mesh.getWorldPosition())
	this.body.quaternion.copy(this.mesh.getWorldQuaternion())

	this.velocity.subVectors(this.mesh.getWorldPosition(), this.lastPosition)
	this.lastPosition = this.mesh.getWorldPosition();
}
/***********************/
/*  Physics Materials  */
/***********************/
LIE.ROUGH_MATERIAL = new CANNON.Material({friction:1, restitution:0.8})
LIE.SLIPPY_MATERIAL = new CANNON.Material({friction:0})
LIE.GROUND_MATERIAL = new CANNON.Material({friction:0.4, restitution:0.2})
/***********************/
/*   Physics Objects   */
/***********************/
LIE.PhysicsObject = function(params)
{
	LIE.Entity.call(this)

	this.mass = 10;
	this.mesh = null;
	this.body = null;
	this.material = LIE.ROUGH_MATERIAL;

	this.addToWorld = true;

	this.setParameters(params);
	this.createObject();

	if(this.addToWorld)
		LIE.PhysicalObjects.push(this);
}
LIE.Utils.inherits(LIE.PhysicsObject, LIE.Entity)

LIE.PhysicsObject.prototype.createObject = function()
{
	var points = []
	var faces = []
	for(var i = 0; i < this.mesh.geometry.vertices.length; i++)
	{
		var v = this.mesh.geometry.vertices[i];
		points.push(new CANNON.Vec3().copy(v))
	}
	for(var i = 0; i < this.mesh.geometry.faces.length; i++)
	{
		var f = this.mesh.geometry.faces[i];
		var array = [];
		array.push(f.a, f.b, f.c);
		faces.push(array);
	}
	var convex = new CANNON.ConvexPolyhedron(points, faces);
	this.body = new CANNON.Body({mass: this.mass, shape: convex, material: this.material});
	this.body.parent = this.parent;
	LIE.WORLD.add(this.body); 

	LIE.scene.add(this.mesh);
}
LIE.PhysicalObjects = []
LIE.PhysicsBox = function(params)
{
	LIE.Entity.call(this);
	this.width = 10;
	this.height = 10;
	this.depth = 10;
	this.mass = 10;
	this.color = "white";
	
	this.mesh;
	this.body;
	this.parent = this;
	this.material = LIE.ROUGH_MATERIAL

	this.setParameters(params)
	this.createObject();

	if(this.addToWorld)
		LIE.PhysicalObjects.push(this);
}
LIE.Utils.inherits(LIE.PhysicsBox, LIE.Entity)

LIE.PhysicsBox.prototype.createObject = function()
{
	var geometry = new THREE.BoxGeometry( this.width, this.height, this.depth );
	var material = new THREE.MeshPhysicalMaterial( { color: this.color } );
	this.mesh = new THREE.Mesh( geometry, material );
	this.mesh.castShadow = true;
	this.mesh.receiveShadow = true;
	var boxShape = new CANNON.Box(new CANNON.Vec3(this.width / 2, this.height / 2, this.depth / 2 ));
	this.body = new CANNON.Body({mass: this.mass, shape: boxShape, material: this.material});
	this.body.parent = this.parent;
	LIE.WORLD.add(this.body);

	LIE.scene.add(this.mesh);
}

LIE.PhysicsSphere = function(params)
{
	LIE.Entity.call(this);

	this.radius = 10;
	this.mass = 10;
	this.color = "white";
	this.faces = 64;
	
	this.mesh;
	this.body;
	this.parent = this;
	this.material = LIE.ROUGH_MATERIAL;

	this.setParameters(params)
	this.createObject();

	if(this.addToWorld)
		LIE.PhysicalObjects.push(this);
}
LIE.Utils.inherits(LIE.PhysicsSphere, LIE.Entity)

LIE.PhysicsSphere.prototype.createObject = function()
{
	var sphereGeo = new THREE.SphereGeometry(this.radius, this.faces, this.faces);       //Set the hand's sphere's geometry
    var sphereMat = new THREE.MeshPhysicalMaterial({ color: this.color, transparent: false, opacity: 1});      //Set the hand's sphere's material
    sphereMat.polygonOffset = true;
    sphereMat.polygonOffsetFactor = -0.1;
	this.mesh = new THREE.Mesh(sphereGeo, sphereMat)
	this.mesh.castShadow = true;
	this.mesh.receiveShadow = true;
	var sphereShape = new CANNON.Sphere(this.radius); // Step 1
	this.body = new CANNON.Body({mass: this.mass, shape: sphereShape, material: this.material}); // Step 2
	this.body.parent = this.parent;
	LIE.WORLD.add(this.body); // Step 3

	LIE.scene.add(this.mesh);
}

LIE.PhysicsCylinder = function(params)
{
	LIE.Entity.call(this);
	this.radiusTop = 10;
	this.radiusBottom = 10;
	this.height = 20;
	this.detail = 32;
	this.mass = 10;
	this.color = "white";
	
	this.mesh;
	this.body;
	this.parent = this;
	this.material = LIE.ROUGH_MATERIAL;

	this.setParameters(params)
	this.createObject(params);

	if(this.addToWorld)
		LIE.PhysicalObjects.push(this);
}
LIE.Utils.inherits(LIE.PhysicsCylinder, LIE.Entity)

LIE.PhysicsCylinder.prototype.createObject = function()
{
	var material = new THREE.MeshPhysicalMaterial( { shading: THREE.SmoothShading, color : this.color} );
	material.polygonOffset = true;
	material.polygonOffsetFactor = -0.1;
	var geometry = new THREE.CylinderGeometry( this.radiusTop, this.radiusBottom, this.height, this.detail );
	this.mesh = new THREE.Mesh( geometry, material );
	this.mesh.castShadow = true;
	this.mesh.receiveShadow = true;
	this.mesh.castShadow = true;
	this.mesh.userData.active = true;

	var cylinderShape = new CANNON.Cylinder(this.radiusTop, this.radiusBottom, this.height, 64)
	this.body = new CANNON.Body({mass: this.mass, shape: cylinderShape, material: this.material})
	this.body.parent = this.parent;
	LIE.WORLD.add(this.body)

	var quat = new CANNON.Quaternion();
	quat.setFromAxisAngle(new CANNON.Vec3(1,0,0),-Math.PI/2);
	var translation = new CANNON.Vec3(0,0,0);
	this.body.shapes[0].transformAllPoints(translation, quat);

	LIE.scene.add(this.mesh);
}
LIE.PhysicsMesh = function(params)
{
	LIE.Entity.call(this)
	this.mesh = null;
	this.mass = 10;
	
	this.body;
	this.parent = this;
	this.material = LIE.ROUGH_MATERIAL;

	this.addToWorld = true;

	this.setParameters(params);
	this.createObject();

	if(this.addToWorld)
		LIE.PhysicalObjects.push(this);

}
LIE.Utils.inherits(LIE.PhysicsMesh, LIE.Entity)
LIE.PhysicsMesh.prototype.createObject = function()
{
	var shape = new CANNON.Trimesh(this.mesh.geometry.vertices, this.mesh.geometry.faces)
	this.body = new CANNON.Body({mass:this.mass, shape: shape, material: this.material})
	LIE.WORLD.add(this.body)
}
LIE.PhysicsHandSphere = function(params)
{
	LIE.Entity.call(this);

	this.radius = 10;
	this.mass = 10;
	this.color = "white";
	this.faces = 64;

	this.mesh = null;
	this.body = null;
	this.material = LIE.ROUGH_MATERIAL;

	this.parent = this;

	this.setParameters(params)
	this.createObject();

	if(this.addToWorld)
		LIE.PhysicalObjects.push(this);
}
LIE.Utils.inherits(LIE.PhysicsHandSphere, LIE.Entity)

LIE.PhysicsHandSphere.prototype.createObject = function()
{
	var sphereGeo = new THREE.SphereGeometry(this.radius, this.faces, this.faces);       //Set the hand's sphere's geometry
    var sphereMat = new THREE.MeshPhysicalMaterial({ color: this.color, transparent: false, opacity: 1});      //Set the hand's sphere's material
    sphereMat.polygonOffset = true;
    sphereMat.polygonOffsetFactor = -0.1;
	this.mesh = new THREE.Mesh(sphereGeo, sphereMat)
	this.mesh.castShadow = true;
	this.mesh.receiveShadow = true;
}
LIE.PhysicsHandSphere.prototype.update = function()
{
	return;
	this.velocity.subVectors(this.mesh.getWorldPosition(), this.lastPosition)
	this.velocity.multiplyScalar(LIE.velocityScale)
	this.body.velocity.copy(this.velocity)
	this.lastPosition.copy(this.mesh.getWorldPosition());
}
LIE.PhysicsHandBox = function(params)
{
	LIE.Entity.call(this);
	this.width = 10;
	this.height = 10;
	this.depth = 10;
	this.mass = 10;
	this.color = "white";
	
	this.mesh;
	this.body;
	this.parent = this;
	this.material = LIE.ROUGH_MATERIAL

	this.setParameters(params)
	this.createObject();

	if(this.addToWorld)
		LIE.PhysicalObjects.push(this);
}
LIE.Utils.inherits(LIE.PhysicsHandBox, LIE.Entity)

LIE.PhysicsHandBox.prototype.createObject = function()
{
	var geometry = new THREE.BoxGeometry( this.width, this.height, this.depth );
	var material = new THREE.MeshPhysicalMaterial( { color: this.color } );
	this.mesh = new THREE.Mesh( geometry, material );
	this.mesh.castShadow = true;
	this.mesh.receiveShadow = true;
}
LIE.PhysicsHandBox.prototype.update = function()
{
	return;
	this.velocity.subVectors(this.mesh.getWorldPosition(), this.lastPosition)
	this.velocity.multiplyScalar(LIE.velocityScale)
	this.body.velocity.copy(this.velocity)
	this.body.hasCollided = false;
	this.lastPosition.copy(this.mesh.getWorldPosition());
}
LIE.PhysicsHandCylinder = function(params)
{
	LIE.Entity.call(this);
	this.radiusTop = 10;
	this.radiusBottom = 10;
	this.height = 20;
	
	this.detail = 32;
	this.mass = 10;
	this.color = "white";
	
	this.mesh = null;
	this.body = null;
	this.material = LIE.ROUGH_MATERIAL;

	this.parent = this;

	this.setParameters(params)
	this.meshHeight = this.height;
	this.createObject(params);

	if(this.addToWorld)
		LIE.PhysicalObjects.push(this);
}
LIE.Utils.inherits(LIE.PhysicsHandCylinder, LIE.Entity)

LIE.PhysicsHandCylinder.prototype.createObject = function()
{
	var material = new THREE.MeshPhysicalMaterial( { shading: THREE.SmoothShading, color : this.color} );
	material.polygonOffset = true;
	material.polygonOffsetFactor = -0.1;
	var geometry = new THREE.CylinderGeometry( this.radiusTop, this.radiusBottom, this.meshHeight, this.detail );
	this.mesh = new THREE.Mesh( geometry, material );

	geometry.applyMatrix( new THREE.Matrix4().makeRotationX( Math.PI / -2 ) );
	geometry.applyMatrix( new THREE.Matrix4().makeTranslation(this.mesh.position.x, this.mesh.position.y, this.mesh.position.z + (this.meshHeight / 2)));

	this.mesh.castShadow = true;
	this.mesh.userData.active = true;
	this.mesh.castShadow = true;
	this.mesh.receiveShadow = true;
}
LIE.PhysicsHandCylinder.prototype.update = function()
{
	return;
	this.velocity.subVectors(this.mesh.getWorldPosition(), this.lastPosition)
	this.velocity.multiplyScalar(LIE.velocityScale)
	this.body.velocity.copy(this.velocity)
	this.body.hasCollided = false;
	this.lastPosition.copy(this.mesh.getWorldPosition());
}

LIE.InteractableObject = function(params)
{
	LIE.Entity.call(this)
	this.mesh = null;
	this.body = null;
	this.createInitialBox = true;
	this.initBoxParams = new THREE.Vector3(10, 10, 10)
	this.mass = 10;
	this.bodies = [];
	this.addToWorld = true;
	this.physicsEnabled = true;
	this.customUpdate = true;
	this.helper = null
	this.offset = true;
	this.offsetAmount = new THREE.Vector3(-180, 0, -20)

	this.setParameters(params);

	if(this.createInitialBox)
		this.createObject()

	if(this.addToWorld)
		LIE.PhysicalObjects.push(this)
}
LIE.Utils.inherits(LIE.InteractableObject, LIE.Entity)
LIE.InteractableObject.prototype.createObject = function()
{
	var geometry = new THREE.BoxGeometry( 700, 20, 20 );
	var material = new THREE.MeshPhysicalMaterial( { color: "orange" } );
	this.helper = new THREE.Mesh( geometry, material );
	this.helper.castShadow = true;
	this.helper.receiveShadow = true;

	var boxShape = new CANNON.Box(new CANNON.Vec3(350, 10, 10 ));
	this.body = new CANNON.Body({mass: this.mass, shape: boxShape});
	this.body.parent = this;
	
	LIE.WORLD.add(this.body);
	LIE.scene.add(this.mesh);
}
LIE.InteractableObject.prototype.update = function()
{
	this.mesh.position.copy(this.body.position)
	this.mesh.quaternion.copy(this.body.quaternion)

	this.helper.position.copy(this.body.position)
	this.helper.quaternion.copy(this.body.quaternion)

	if(this.bodies.length > 0)
	{
		for(var i = 0; i < this.boundingBoxes.length; i++)
		{
			var bBox = this.boundingBoxes[i];
			bBox.voidMesh.position.copy(this.body.position).add(this.body.shapeOffsets[i]);
			bBox.voidMesh.quaternion.copy(this.body.quaternion)
			bBox.helper.update(bBox.voidMesh);
		}
	}
	
}
LIE.InteractableObject.prototype.showBoundingBox = function()
{
	for(var i = 0; i < this.body.shapes.length; i++)
	{
		var boxGeo = new THREE.Geometry()
		var tempVert = []
		console.log(this.body.shapes[i].convexPolyhedronRepresentation.vertices)
		for(var  j = 0; j < this.body.shapes[i].convexPolyhedronRepresentation.vertices.length; j++)
		{
			tempVert.push(new THREE.Vector3().copy(this.body.shapes[i].convexPolyhedronRepresentation.vertices[j]))
		}
		console.log(boxGeo)
		boxGeo.vertices = tempVert
		var boxMat = new THREE.MeshBasicMaterial({color:"white", wireframe:true})
		var voidMesh = new THREE.Mesh(boxGeo, boxMat)

		var boundingObjectHelper = new THREE.BoxHelper(voidMesh, "white")
		this.boundingBoxes.push({voidMesh: voidMesh, helper:boundingObjectHelper})
		LIE.scene.add(voidMesh)
	}
}
LIE.InteractableObject.prototype.addShape = function(shapeParams, offset)
{

}

LIE.ConvexObject = function(params)
{
	LIE.Entity.call(this)

	this.mesh = null;
	this.body = null;
	this.mass = 50;

	this.setParameters(params)

	this.createObject();
}
LIE.Utils.inherits(LIE.ConvexObject, LIE.Entity)
LIE.ConvexObject.prototype.createObject = function()
{
	var verts = []
	var faces = [];
	for(var i = 0; i < this.mesh.geometry.vertices.length; i++)
	{
		var v = this.mesh.geometry.vertices[i];
		var newV = new CANNON.Vec3(v.x, v.y, v.z)
		verts.push(newV)
	}

	for(var i = 0; i < this.mesh.geometry.faces.length; i++)
	{
		var f = this.mesh.geometry.faces[i];
		var newF = [f.a, f.b, f.c]
		faces.push(newF)
	}

	var shape = new CANNON.ConvexPolyhedron(verts, faces);
	this.body = new CANNON.Body({mass: this.mass, shape: shape, material: this.material});
	this.body.parent = this.parent;
	LIE.WORLD.add(this.body);
}
LIE.Hand = function()
{
	this.meshes = [];	
	this.fingers = [];
	this.joints = [];
	this.knuckles = [];
	this.carpals = [];

	this.bones = [];
	this.palm = [];

	this.handThickness = 7;

	this.createHand();

}
LIE.Hand.prototype.createHand = function()
{
	this.orientCube = new LIE.PhysicsHandSphere({addToWorld:false, mass:0, radius: 5, parent:this})
	this.orientCube.mesh.material.visible = false;
	this.grabSphere = new LIE.PhysicsHandSphere({addToWorld:false, mass:0, radius: 20, parent:this})
	this.grabSphere.mesh.material.visible = false;

	this.orientCube.mesh.add(this.grabSphere.mesh)
	this.grabSphere.mesh.position.y = -20

	this.pinchSphere = new LIE.PhysicsHandSphere({addToWorld:false, mass:0, radius:30, parent:this, color:"red"})
	this.pinchSphere.mesh.material.visible = false;
	
	for(var i = 0; i < 9; i++)
    {
		var height = 10;
		if(i == 0)
			height = 75
		else if(i == 1 || i == 2 || i == 3 || i == 8)
			height = 20
		else if(i == 4)
			height = 50;

        this.palm.push(new LIE.PhysicsHandCylinder({addToWorld:false, mass:0, radiusTop: this.handThickness, radiusBottom: this.handThickness, height:height}));
    }

	for(var i = 0; i < 5; i++)
    {
        //Finger and joint  Spheres
        this.fingers.push(new LIE.PhysicsHandSphere({addToWorld:false, mass:0, radius: this.handThickness, parent: this}));
        this.joints.push(new LIE.PhysicsHandSphere({addToWorld:false, mass:0, radius: this.handThickness, parent: this}));
        this.knuckles.push(new LIE.PhysicsHandSphere({addToWorld:false, mass:0, radius: this.handThickness, parent: this}));
        this.carpals.push(new LIE.PhysicsHandSphere({addToWorld:false, mass:0, radius: this.handThickness, parent: this}));

        var tempArrayL = [];
		var boneLength1 = 40;
		var boneLength2 = 35
		if( i == 0)
		{
			boneLength1 = 45
			boneLength2 = 40
		}
		else if(i == 4)
		{
			boneLength1 = 30
			boneLength2 = 25
		}
			
        tempArrayL.push(new LIE.PhysicsHandCylinder({addToWorld:false, mass:0, radiusTop: this.handThickness, radiusBottom: this.handThickness, height: boneLength1, parent: this}));
        tempArrayL.push(new LIE.PhysicsHandCylinder({addToWorld:false, mass:0, radiusTop: this.handThickness, radiusBottom: this.handThickness, height: boneLength2, parent: this}));
        this.bones.push(tempArrayL);
    }  
	this.fingers[1].mesh.add(this.pinchSphere.mesh)
	this.updateMeshes();
}
LIE.Hand.prototype.updateMeshes = function()
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

	for(var i = 0; i < this.meshes.length; i++)
	{
		camera.add(this.meshes[i].mesh)
	}
	camera.add(this.orientCube.mesh)
    //this.meshes.push(this.grabSphere)

    /*for(var i = 0; i < this.meshes.length; i++)
    {
        if(this.meshes[i].uuid != this.grabSphere.uuid)
            this.voidHand.add(this.meshes[i])
    } //Maybe useful for camera position changes! TRY IT AND GET WORLD POSITION OF HAND!

    this.voidHand.add(this.orientCube)
    //MIX.CAMERA.add(this.voidHand)
    MIX.CAMERA.add(this.voidHand)
    this.orientCube.position.set(0,0,0);*/

}
CANNON.Quaternion.prototype.lookAt = function(from, to)
{
	var fwd = new THREE.Vector3(0,0,-1)
	var forwardVector = new THREE.Vector3().subVectors(from, to).normalize();

	var dot = new THREE.Vector3(0, 0, -1).dot(forwardVector)

	if(Math.abs(dot - (-1.0)) < 0.000001)
	{
		return new THREE.Quaternion(fwd.x, fwd.y, fwd.z, Math.PI);
	}
	if(Math.abs(dot - (1.0)) < 0.000001)
	{
		return this;
	}

	var rotAngle = Math.acos(dot)
	var rotAxis = new THREE.Vector3().crossVectors(fwd, forwardVector)
	rotAxis.normalize();
	this.setFromAxisAngle(rotAxis, rotAngle)
}
LIE.Hand.prototype.move = function(hand)
{
	var yOffset = 250;
	var zOffset = 175;
	this.orientCube.mesh.position.set(hand.palmPosition[0], hand.palmPosition[1] - yOffset, hand.palmPosition[2] - zOffset)
	this.orientCube.mesh.rotation.set(hand.pitch, -hand.yaw, hand.roll);

	this.moveFingers(hand.fingers)
	this.movePalm();
	if(hand.grabStrength > 0.8 && this.hasHighlightedObject && !this.hasGrabbedObject)
		this.grabObject();
	else if(this.hasGrabbedObject)
	{
		if(hand.grabStrength < 0.8)
			this.letObjectGo();
		else
			this.grabbedObject.updateVelocity();
	}
	else if(hand.pinchStrength > 0.8 && this.hasPinchHighlighted && !this.hasGrabbedObject && !this.hasPinchedObject)
		this.pinchObject()
	else if(this.hasPinchedObject)
	{
		if(hand.pinchStrength < 0.8)
			this.letPinchGo();
		else
			this.pinchedObject.updateVelocity();
	}

}
LIE.Hand.prototype.moveFingers = function(fingersArray)
{
	var yOffset = 250;
	var zOffset = 175;
	for(var i = 0; i < fingersArray.length; i++)
    {
        //Set position of all joint spheres
        this.fingers[i].mesh.position.set(fingersArray[i].tipPosition[0], fingersArray[i].tipPosition[1] - yOffset, fingersArray[i].tipPosition[2] - zOffset);
		this.fingers[i].mesh.lookAt(new THREE.Vector3().copy(this.fingers[i].mesh.position).add(new THREE.Vector3(fingersArray[i].direction[0], fingersArray[i].direction[1], fingersArray[i].direction[2])))
        this.joints[i].mesh.position.set(fingersArray[i].pipPosition[0], fingersArray[i].pipPosition[1] - yOffset, fingersArray[i].pipPosition[2] - zOffset);
        this.knuckles[i].mesh.position.set(fingersArray[i].mcpPosition[0], fingersArray[i].mcpPosition[1] - yOffset, fingersArray[i].mcpPosition[2] - zOffset);
        this.carpals[i].mesh.position.set(fingersArray[i].carpPosition[0], fingersArray[i].carpPosition[1] - yOffset, fingersArray[i].carpPosition[2] - zOffset);

        this.bones[i][0].mesh.position.copy(this.knuckles[i].mesh.position); 
        this.bones[i][1].mesh.position.copy(this.joints[i].mesh.position);

		//this.bones[i][0].body.quaternion.lookAt(this.bones[i][0].body.position, this.joints[i].body.position)
        //this.bones[i][1].body.quaternion.lookAt(this.bones[i][1].body.position, this.fingers[i].body.position)

		this.bones[i][0].mesh.lookAt(this.joints[i].mesh.position)
        this.bones[i][1].mesh.lookAt(this.fingers[i].mesh.position)

		this.fingers[i].update();
		this.joints[i].update();
		this.knuckles[i].update();
		this.carpals[i].update();
		this.bones[i][0].update()
		this.bones[i][1].update();
		
		var scale1 =  this.knuckles[i].mesh.getWorldPosition().distanceTo((this.joints[i].mesh.getWorldPosition())) / this.bones[i][0].mesh.geometry.parameters.height;
        var scale2 =  this.joints[i].mesh.getWorldPosition().distanceTo((this.fingers[i].mesh.getWorldPosition())) / this.bones[i][1].mesh.geometry.parameters.height;
        this.bones[i][0].mesh.scale.setZ(scale1);
        this.bones[i][1].mesh.scale.setZ(scale2);
    }
}
LIE.Hand.prototype.movePalm = function()
{
	for(var i = 0; i < this.palm.length; i++)
    {
        if(i < 5)
        {   
            try 
            {
                this.palm[i].mesh.position.copy(this.knuckles[i].mesh.position)
				this.palm[i].mesh.lookAt(this.knuckles[i+1].mesh.position)
				this.palm[i].body.position.copy(this.palm[i].mesh.getWorldPosition())
				this.palm[i].body.quaternion.copy(this.palm[i].mesh.getWorldQuaternion())
                
                scale = this.knuckles[i].mesh.getWorldPosition().distanceTo(this.knuckles[i+1].mesh.getWorldPosition()) / this.palm[i].mesh.geometry.parameters.height;
                this.palm[i].mesh.scale.setZ(scale);
            } 
            catch (error) 
            {
				this.palm[i].mesh.position.copy(this.knuckles[i].mesh.position)
                this.palm[i].mesh.lookAt(this.carpals[i].mesh.position);
                scale = this.knuckles[i].mesh.getWorldPosition().distanceTo(this.carpals[i].mesh.getWorldPosition()) / this.palm[i].mesh.geometry.parameters.height;
                this.palm[i].mesh.scale.setZ(scale);
            }
        }
        else
        {
            var j = (this.palm.length - i) - 1; //Finds the difference and takes it away from i then -1 to get 4,3,2,1,0 instead of ++
            this.palm[i].mesh.position.copy(this.carpals[j].mesh.position)
            
            try
            {
                this.palm[i].mesh.lookAt(this.carpals[j+1].mesh.position);
                scale = this.carpals[j].mesh.getWorldPosition().distanceTo(this.carpals[j+1].mesh.getWorldPosition())/ this.palm[i].mesh.geometry.parameters.height;
                this.palm[i].mesh.scale.setZ(scale);
            }
            catch(e)
            {
                this.palm[i].mesh.lookAt(this.carpals[j+1].mesh.position);
				scale = this.carpals[i].mesh.getWorldPosition().distanceTo(this.knuckles[j].mesh.getWorldPosition()) / this.palm[i].mesh.geometry.parameters.height;;
                this.palm[i].mesh.scale.setZ(scale);
            }
        }
		this.palm[i].update();
    }
}
LIE.Hand.prototype.grabObject = function()
{
	this.makeInactive();
	this.hasGrabbedObject = true;
	this.grabbedObject = this.highlightedObject;
	scene.remove(this.grabbedObject.mesh)
	this.grabbedObject.physicsEnabled = false;
	this.grabbedObject.mesh.position.set(0,0,0)
	if(this.grabbedObject.offset)
		this.grabbedObject.mesh.position.add(this.grabbedObject.offsetAmount)
	this.grabbedObject.mass = 0;
	//this.grabbedObject.mesh.quaternion.copy(quaternion)

	
	this.grabSphere.mesh.add(this.grabbedObject.mesh)
	//this.grabbedObject.mesh.lookAt(lookAtPos)
	//this.grabbedObject.body.velocity.copy(this.grabSphere.velocity)
	
}
LIE.Hand.prototype.letObjectGo = function()
{
	var quaternion = this.grabbedObject.mesh.getWorldQuaternion();
	this.grabSphere.mesh.remove(box.mesh)
	this.grabbedObject.physicsEnabled = true;

	//box.body.velocity.set(0,0,0)
	
	scene.add(this.grabbedObject.mesh)

	this.hasGrabbedObject = false;
	this.grabbedObject = null;
	this.hasHighlightedObject = false
	this.highlightedObject = null;

	var self = this;
	setTimeout(function(){
		self.makeActive();
	}, 2000, self)
}
LIE.Hand.prototype.pinchObject = function()
{
	this.makeInactive();
	this.hasPinchedObject = true;
	this.pinchedObject = this.pinchHighlightedObject;
	var quaternion = this.pinchedObject.mesh.getWorldQuaternion();
	scene.remove(this.pinchedObject.mesh)
	this.pinchedObject.physicsEnabled = false;
	this.pinchedObject.mesh.position.set(0,0,0)

	this.pinchedObject.body.position.set(-100000, -100000, -100000)
	this.pinchSphere.mesh.add(this.pinchedObject.mesh)

	this.pinchedObject.mesh.quaternion.copy(quaternion)
}
LIE.Hand.prototype.letPinchGo = function()
{
	var quaternion = this.pinchedObject.mesh.getWorldQuaternion();
	this.pinchSphere.mesh.remove(box.mesh)
	this.pinchedObject.physicsEnabled = true;
	scene.add(this.pinchedObject.mesh)

	this.hasPinchedObject = false;
	this.pinchedObject = null;
	this.hasPinchHighlighted = false
	this.pinchHighlightedObject = null;

	var self = this;
	setTimeout(function(){
		self.makeActive();
	}, 2000, self)
}
LIE.Hand.prototype.hide = function()
{
	for(var i = 0; i < this.meshes.length; i++)
	{
		this.meshes[i].mesh.visible = false;
	}
}
LIE.Hand.prototype.show = function()
{
	for(var i = 0; i < this.meshes.length; i++)
	{
		this.meshes[i].mesh.visible = true;
	}
}

LIE.update = function()
{
	for(var i = 0; i < LIE.PhysicalObjects.length; i++)
	{
		var pObj = LIE.PhysicalObjects[i];

       	if(pObj.physicsEnabled && pObj.body != null)
		{
			if(pObj.customUpdate)
			{
				pObj.update();
				continue;
			}
		}	
	}
}

/*********************/
/*       TO DO       */
/*********************/
/*
	CANNON.js lines 606-640 is custom collision for hand --- REPEAT FOR AABB BOXES!
*/

//DEBUGGING

var Create = {

	sphere: function(radius, color)
	{
		var sphereGeo = new THREE.SphereGeometry(radius, 64, 64)
		var sphereMat = new THREE.MeshPhongMaterial({color:color})
		return new THREE.Mesh(sphereGeo, sphereMat);
	},
	box: function(w, h, d, color)
	{
		var boxGeo = new THREE.BoxGeometry(w, h, d)
		var boxMat = new THREE.MeshPhongMaterial({color:color})
		
		return new THREE.Mesh(boxGeo, boxMat);
	}
}