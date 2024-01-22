// scene.js
// builds the scene graph

// builds the initial scene graph
function buildScene() {
	g_sceneGraph = new SceneGraph();
	let cubeRotation = new Quaternion().setFromAxisAngle(1, 1, 0, 45);
	cubeRotation.printMe();
	cube = createObject(
		meshName = "cube",
		materialName = "gray",
		position = new Vector3([0, 0, 0]),
		rotation = cubeRotation
	)
	sphere = createObject(
		meshName = "sphere",
		materialName = "red",
		position = new Vector3([0, 0, -5]),
	)
	g_sceneGraph.addObject(cube);
	g_sceneGraph.addObject(sphere);
	setCamera();
	console.log("Built scene graph");

	// g_sceneGraph.setCameraPosition(new Vector3([1, 1, 0]));
	g_sceneGraph.print();
}