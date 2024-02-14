// scene.js
// builds the scene graph

// builds the initial scene graph
function buildScene() {
	// Initialize the scene graph and ECS
	g_sceneGraph = new SceneGraph();
	g_ecs = new ECS(g_sceneGraph);

	buildEnviornment();

	console.log("Scene built");
}

function buildEnviornment() {

	// build the platform
	let platformScale = c_WALKABLE_RADIUS + 3;
	let platformEntity = g_ecs.createEntity(
		entityName = "platform",
		parent = null,
		position = new Vector3([0, -1.5, 0]),
		rotation = new Quaternion(),
		scale = new Vector3([platformScale, platformScale, platformScale]),
		meshName = "platform",
		materialName = "platform",
		components = [
			new RotateComponent(new Vector3([0, 1, 0]), 5)
		]
	);

	let skyboxEntity = g_ecs.createEntity(
		entityName = "skybox",
		parent = null,
		position = new Vector3([0, 0, 0]),
		rotation = new Quaternion(),
		scale = new Vector3([100, 100, 100]),
		meshName = "invert_sphere",
		materialName = "skybox",
		components = [
			// new FollowCameraComponent(new Vector3([0, -2, -2])),
		],
	)
}