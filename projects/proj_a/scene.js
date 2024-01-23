// scene.js
// builds the scene graph

// builds the initial scene graph
function buildScene() {
	g_sceneGraph = new SceneGraph();
	g_ecs = new ECS(g_sceneGraph);

	let cameraEntity = g_ecs.getEntity("camera");
	if (cameraEntity == null) {
		console.log("Camera entity is null");
		return;
	}

	g_sceneGraph.setCameraPosition(c_CAMERA_STARTING_POSITION);
	g_sceneGraph.setCameraRotation(c_CAMERA_STARTING_ROTATION);
	cameraEntity.attachComponent(
		new CameraControllerComponent(
			c_CONTROLS.MOVEMENT_AXIS_SET, c_MOVE_SPEED,
			c_CONTROLS.ROTATION_AXIS_SET, c_CAMERA_SENSITIVITY)
	);

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

	let skyboxEntity = g_ecs.createEntity(
		entityName = "skybox",
		parent = null,
		position = new Vector3([0, 0, 0]),
		rotation = new Quaternion(),
		scale = new Vector3([c_CAMERA_SETTINGS.far / 2, c_CAMERA_SETTINGS.far / 2, c_CAMERA_SETTINGS.far / 2]),
		// scale = new Vector3([1, 1, 1]),
		meshName = "invert_sphere",
		materialName = "skybox",
		components = [
			new FollowCameraComponent(new Vector3([0, -2, -2])),
		],
	)

	g_sceneGraph.print();
}