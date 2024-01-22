// scene.js
// builds the scene graph

// builds the initial scene graph
function buildScene() {
	g_sceneGraph = new SceneGraph();
	g_ecs = new ECS(g_sceneGraph);

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
			new RotateComponent(new Vector3([0, 1, 0]), 0.1),
		],
	)

	let sphereEntity = g_ecs.createEntity(
		entityName = "sphere",
		parent = cubeEntity,
		position = new Vector3([0, 0, -5]),
		rotation = new Quaternion(),
		scale = new Vector3([1, 1, 1]),
		meshName = "sphere",
		materialName = "red",
		components = [
			new BobComponent(-1.5, 0.01),
		],
	)

	g_sceneGraph.print();
}