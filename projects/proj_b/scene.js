// scene.js
// builds the scene graph

// builds the initial scene graph
function buildScene() {
	// Initialize the scene graph and ECS
	g_sceneGraph = new SceneGraph();
	g_ecs = new ECS(g_sceneGraph);

	// build the camera
	// buildCamera();
	buildEnviornment();

	console.log("Scene built");
}

function buildCamera() {
	// build the camera
	let cameraEntity = g_ecs.createEntity(
		entityName = "camera",
		parent = null,
		position = new Vector3([0, 40, 80]),
		rotation = new Quaternion().setFromAxisAngle(1, 0, 0, 30),
		scale = new Vector3([1, 1, 1]),
		meshName = "",
		materialName = "",
		components = [
			new CameraControllerComponent(
				"webgl",
				{
					movementSpeed: 10,
					originalRotation: new Quaternion().setFromAxisAngle(1, 0, 0, 30),
				}
			)
		]
	);

}

function buildEnviornment() {
	// build the terrain
	let terrainEntity = g_ecs.createEntity(
		entityName = "terrain",
		parent = null,
		position = new Vector3([0, 0, 0]),
		rotation = new Quaternion(),
		scale = new Vector3([1, 1, 1]),
		meshName = "terrain",
		materialName = "terrain",
		components = [
		]
	);

	let skyboxEntity = g_ecs.createEntity(
		entityName = "skybox",
		parent = null,
		position = new Vector3([0, 0, 0]),
		rotation = new Quaternion(),
		scale = new Vector3([c_FAR_PLANE / 2, c_FAR_PLANE / 2, c_FAR_PLANE / 2]),
		meshName = "invert_sphere",
		materialName = "skybox",
		components = [
			// new FollowCameraComponent(new Vector3([0, -2, -2])),
		],
	)
}