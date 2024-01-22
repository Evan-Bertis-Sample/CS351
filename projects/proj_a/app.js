// app.js
// Project A: Moving, Joined 3D Assembiles
//
// Created by Evan Bertis-Sample
// For CS 351 : Intro to Computer Graphics, Winter 2024
// Northwestern University
//


// Global Variables for the application
var g_gl; // WebGL rendering context
var g_canvasID; // HTML-5 'canvas' element ID#

var g_sceneGraph; // The scene graph for the application
var g_materialRegistry; // The material registry for the application
var g_meshRegistry; // The mesh registry for the application

// These buffers aren't actually sent to the GPU
// Rather, they are used to store the vertices, normals, and indices, then used create the buffers
var g_vertexArray = []; // The vertex buffer for the application
var g_normalArray = []; // The normal buffer for the application
var g_indexArray = []; // The index buffer for the application

// These buffers are sent to the GPU
var g_vertexBufferID; // The vertex buffer for the application
var g_normalBuffer; // The normal buffer for the application

// controls
var g_cameraPosition = new Vector3([0, 0, 30]);


async function main() {
	await initialize();
	update();
	drawAll();

	var tick = function () {
		requestAnimationFrame(tick, g_canvasID);
		drawAll();
		update();
	};

	tick();
}

// Initializes WebGL and the scene
// Grabs the global context and sets the viewport
// Loads the materials and meshes
// Builds the scene graph
// Initializes the input
async function initialize() {
	// Retrieve the HTML-5 <canvas> element where webGL will draw our pictures
	g_canvasID = document.getElementById('webgl');
	g_gl = g_canvasID.getContext("webgl", { preserveDrawingBuffer: true });
	// Handle failures
	if (!g_gl) {
		console.log('Failed to get the rendering context for WebGL. Bye!');
		return;
	}
	// set the viewport to be sized correctly
	g_canvasID.width = c_VIEWPORT_WIDTH;
	g_canvasID.height = c_VIEWPORT_HEIGHT;
	g_gl.viewport(0, 0, g_canvasID.width, g_canvasID.height);
	g_gl.clearColor(1, 1, 1, 1);
	g_gl.enable(g_gl.DEPTH_TEST);
	g_gl.clear(g_gl.COLOR_BUFFER_BIT);
	// Load the materials
	g_materialRegistry = new MaterialRegistry(c_MATERIALS);
	await g_materialRegistry.loadMaterials();
	// Load the meshes
	g_meshRegistry = new MeshRegistry();
	await g_meshRegistry.loadMeshes(c_MESHES);
	buildScene();
	loadMeshes();
	addEventListeners();
}

function addEventListeners() {
	document.addEventListener('keydown', keyDownHandler);
}

function keyDownHandler(event) {
	if (event.key == "ArrowUp") {
		g_cameraPosition.elements[2] -= c_MOVE_SPEED;
	}
	if (event.key == "ArrowDown") {
		g_cameraPosition.elements[2] += c_MOVE_SPEED;
	}
	if (event.key == "ArrowLeft") {
		g_cameraPosition.elements[0] -= c_MOVE_SPEED;
	}
	if (event.key == "ArrowRight") {
		g_cameraPosition.elements[0] += c_MOVE_SPEED;
	}
	if (event.key == "w") {
		g_cameraPosition.elements[1] += c_MOVE_SPEED;
	}
	if (event.key == "s") {
		g_cameraPosition.elements[1] -= c_MOVE_SPEED;
	}
}



function loadMeshes() {
	// load the meshes into the buffers
	g_sceneGraph.traverse(loadMeshHelper);
	// now create the buffers that we will send to the GPU
	// create the vertex buffer

	console.log("Loaded Vertex Array: ");
	console.log(g_vertexArray);

	console.log("Loaded Normal Array: ");
	console.log(g_normalArray);

	if (g_vertexArray.length == 0) {
		console.log("Vertex array is empty");
		return;
	}

	if (g_normalArray.length == 0) {
		console.log("Normal array is empty");
		return;
	}

	if (g_normalArray.length != g_vertexArray.length) {
		console.log("Vertex array and normal array are different lengths");
		return;
	}

	// interleave the vertex and normal arrays
	// sorted by vertex, normal, vertex, normal, etc.
	let interleavedArray = [];
	for (let i = 0; i < g_vertexArray.length; i++) {
		interleavedArray.push(g_vertexArray[i].elements[0]);
		interleavedArray.push(g_vertexArray[i].elements[1]);
		interleavedArray.push(g_vertexArray[i].elements[2]);
		interleavedArray.push(g_vertexArray[i].elements[3]);

		interleavedArray.push(g_normalArray[i].elements[0]);
		interleavedArray.push(g_normalArray[i].elements[1]);
		interleavedArray.push(g_normalArray[i].elements[2]);
		interleavedArray.push(g_normalArray[i].elements[3]);
	}

	// let vertexArray = vec4ArrayToFloat32Array(interleavedArray);
	let vertexArray = new Float32Array(interleavedArray);
	g_vertexBufferID = g_gl.createBuffer();
	g_gl.bindBuffer(g_gl.ARRAY_BUFFER, g_vertexBufferID);
	g_gl.bufferData(g_gl.ARRAY_BUFFER, vertexArray, g_gl.STATIC_DRAW);
}

function loadMeshHelper(node, modelMatrix) {
	if (node.renderInfo.mesh == "") {
		console.log("Skipping node with no mesh");
		return;
	}

	// get the mesh
	let mesh = g_meshRegistry.getMesh(node.renderInfo.mesh);
	if (mesh == null) {
		console.log("Mesh is null");
		return;
	}

	// load the mesh
	mesh.loadObject(g_vertexArray, g_normalArray);
}

function drawAll() {
	// Clear <canvas>
	g_gl.clear(g_gl.COLOR_BUFFER_BIT | g_gl.DEPTH_BUFFER_BIT);
	// Draw the scene graph
	g_sceneGraph.traverse(drawNode);
}

function drawNode(node, modelMatrix) {
	// draw the node
	// get the mesh and material from the node
	// get the model matrix from the node
	// draw the mesh with the material and model matrix
	let mesh = node.renderInfo.mesh;
	if (mesh == "") {
		// console.log("Mesh is null");
		return;
	}

	let material = node.renderInfo.material;
	if (material == "") {
		// console.log("Material is null");
		return;
	}

	// get the mesh
	mesh = g_meshRegistry.getMesh(node.renderInfo.mesh);
	if (mesh == null) {
		// console.log("Mesh is null");
		return;
	}

	// modelMatrix.printMe();
	// load the material
	let materialObject = g_materialRegistry.getMaterial(node.renderInfo.material);
	if (materialObject == null) {
		console.log("Material is null");
		return;
	}
	g_materialRegistry.setMaterial(node.renderInfo.material, g_gl);
	g_materialRegistry.passUniforms(g_gl, modelMatrix, g_sceneGraph.viewMatrix, g_sceneGraph.projectionMatrix, g_sceneGraph.camera.transform.position);
	// draw the mesh
	mesh.draw(g_gl);

}

function update() {
	setCamera();
}

function setCamera() {
	g_cameraPosition.printMe();
	g_sceneGraph.setCameraPosition(g_cameraPosition);

	let cameraDirection = new Vector3([-g_cameraPosition.elements[0], -g_cameraPosition.elements[1], -g_cameraPosition.elements[2]]);

	// calculate the up vector
	let up = new Vector3([0, 1, 0]);
	let cameraRight = cameraDirection.cross(up);
	let cameraUp = cameraRight.cross(cameraDirection);
	cameraUp = cameraUp.normalize();

	let eye = new Vector3([0, 0, 0]);

	// look at the origin
	let rotationMatrix = new Matrix4();
	rotationMatrix.setLookAt(
		g_cameraPosition.elements[0], g_cameraPosition.elements[1], g_cameraPosition.elements[2],
		eye.elements[0], eye.elements[1], eye.elements[2],
		cameraUp.elements[0], cameraUp.elements[1], cameraUp.elements[2]
	);

	// test axis angles
	// rotationMatrix = new Matrix4();
	// rotationMatrix.setRotate(-45, 1, 0, 0);
	g_sceneGraph.setCameraRotationFromMatrix(rotationMatrix);
}

