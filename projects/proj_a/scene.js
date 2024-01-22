// scene.js
// builds the scene graph

// builds the initial scene graph
function buildScene() {
	g_sceneGraph = new SceneGraph();
	g_ecs = new ECS(g_sceneGraph);
	// let cubeRotation = new Quaternion().setFromAxisAngle(1, 1, 0, 45);
	// cube = createObject(
	// 	meshName = "cube",
	// 	materialName = "gray",
	// 	position = new Vector3([0, 0, 0]),
	// 	rotation = cubeRotation
	// )
	// sphere = createObject(
	// 	meshName = "sphere",
	// 	materialName = "red",
	// 	position = new Vector3([0, 0, -5]),
	// )
	// g_sceneGraph.addObject(cube);
	// g_sceneGraph.addObject(sphere);
	// setCamera();
	// console.log("Built scene graph");

	let cubeEntity = g_ecs.createEntity(
		entityName = "cube",
		parent = null,
		position = new Vector3([0, 0, 0]),
		rotation = new Quaternion().setFromAxisAngle(0, 1, 0, 45),
		scale = new Vector3([1, 1, 1]),
		meshName = "cube",
		materialName = "gray",
		components = [
			new BobComponent(1, 0.01),
		],
	)
	console.log(cubeEntity);
	g_sceneGraph.print();
}