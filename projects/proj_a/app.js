// app.js
// Project A: Moving, Joined 3D Assembiles
//
// Created by Evan Bertis-Sample
// For CS 351 : Intro to Computer Graphics, Winter 2024
// Northwestern University
//


// Global Variables for the application
var gl; // WebGL rendering context
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
var g_indexBuffer; // The index buffer for the application



// Configuration
var materialDirectories = ["./static/materials/base"];
var meshes = ["./static/meshes/cube.obj"];


async function main() {
	// Retrieve the HTML-5 <canvas> element where webGL will draw our pictures
	g_canvasID = document.getElementById('webgl');
	gl = g_canvasID.getContext("webgl", { preserveDrawingBuffer: true });

	// Handle failures
	if (!gl) {
		console.log('Failed to get the rendering context for WebGL. Bye!');
		return;
	}

	// Load the materials
	g_materialRegistry = new MaterialRegistry(materialDirectories);
	await g_materialRegistry.loadMaterials();

	// Load the meshes
	g_meshRegistry = new MeshRegistry();
	await g_meshRegistry.loadMeshes(meshes);

	// Specify the color for clearing <canvas>
	gl.clearColor(1, 1, 1, 1);

	buildScene();
	loadMeshes();
	drawAll();
	
	var tick = function () {
		requestAnimationFrame(tick, g_canvasID);
		// drawAll();
		timerAll();
	};

	tick();
}

// builds the initial scene graph
function buildScene()
{
	g_sceneGraph = new SceneGraph();
	cube = createObject(
		meshName = "cube",
		materialName = "base",
		position = new Vector3([0, 0, -1]),
	)
	g_sceneGraph.addObject(cube);

	console.log("Built scene graph");

	// g_sceneGraph.setCameraPosition(new Vector3([1, 1, 0]));
	g_sceneGraph.print();
}

function loadMeshes()
{
	// load the meshes into the buffers
	g_sceneGraph.traverse(loadMeshHelper);
	// now create the buffers that we will send to the GPU
	// create the vertex buffer
	let vertexArray = vec4ArrayToFloat32Array(g_vertexArray);
	g_vertexBufferID = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, g_vertexBufferID);
	gl.bufferData(gl.ARRAY_BUFFER, vertexArray, gl.STATIC_DRAW);
	// create the normal buffer
	// let normalArray = vec4ArrayToFloat32Array(g_normalArray);
	// g_normalBuffer = gl.createBuffer();
	// gl.bindBuffer(gl.ARRAY_BUFFER, g_normalBuffer);
	// gl.bufferData(gl.ARRAY_BUFFER, normalArray, gl.STATIC_DRAW);

	// create the index buffer
	// let indexArray = new Uint16Array(g_indexArray);
	// g_indexBuffer = gl.createBuffer();
	// gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, g_indexBuffer);
	// gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indexArray, gl.STATIC_DRAW);
}

function vec4ArrayToFloat32Array(vecArray)
{
	let floatArray = new Float32Array(vecArray.length * 4);
	for (let i = 0; i < vecArray.length; i++) {
		floatArray[i * 3] = vecArray[i].elements[0];
		floatArray[i * 3 + 1] = vecArray[i].elements[1];
		floatArray[i * 3 + 2] = vecArray[i].elements[2];
		floatArray[i * 3 + 3] = vecArray[i].elements[3];
	}
	return floatArray;
}

function loadMeshHelper(node, modelMatrix)
{
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
	mesh.loadObject(g_vertexArray, g_normalArray, g_indexArray);
}

function timerAll() 
{

}

function drawAll()
{
	// Clear <canvas>
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	// Draw the scene graph
	g_sceneGraph.traverse(drawNode);
}

function drawNode(node, modelMatrix)
{
	// draw the node
	// get the mesh and material from the node
	// get the model matrix from the node
	// draw the mesh with the material and model matrix
	let mesh = node.renderInfo.mesh;
	if (mesh == "") {
		console.log("Mesh is null");
		return;
	}

	let material = node.renderInfo.material;
	if (material == "") {
		console.log("Material is null");
		return;
	}

	// get the mesh
	mesh = g_meshRegistry.getMesh(node.renderInfo.mesh);
	if (mesh == null) {
		console.log("Mesh is null");
		return;
	}	

	modelMatrix.printMe();
	// load the material
	let materialObject = g_materialRegistry.getMaterial(node.renderInfo.material);
	if (materialObject == null) {
		console.log("Material is null");
		return;
	}
	g_materialRegistry.setMaterial(node.renderInfo.material, gl);
	g_materialRegistry.passUniforms(gl, modelMatrix);
	gl.uniformMatrix4fv(materialObject.uloc_modelMatrix, false, modelMatrix.elements);
	// draw the mesh
	mesh.draw(gl);

}
