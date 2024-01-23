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

	// build the robot
	let robotBaseEntity = g_ecs.createEntity(
		entityName = "Robot Parent",
		parent = null,
		position = new Vector3([0, 0, 0]),
		rotation = new Quaternion().setFromAxisAngle(0, 1, 0, 45),
		scale = new Vector3([1, 1, 1]),
		meshName = "",
		materialName = "",
		components = [
			new BobComponent(0.2, 0.005),
			new RotateComponent(new Vector3([0, 1, 0]), 0.1),
		],
	)

	let robotInnersEntity = g_ecs.createEntity(
		entityName = "robot_inners",
		parent = robotBaseEntity,
		position = new Vector3([0, 0, 0]),
		rotation = new Quaternion(),
		scale = new Vector3([1, 1, 1]),
		meshName = "robot_cube_inners",
		materialName = "robot_inners",
		components = [],
	)

	let robotOutersEntity = g_ecs.createEntity(
		entityName = "robot_outers",
		parent = robotBaseEntity,
		position = new Vector3([0, 0, 0]),
		rotation = new Quaternion(),
		scale = new Vector3([1, 1, 1]),
		meshName = "robot_cube_outers",
		materialName = "robot_outers",
		components = [],
	)

	let robotVeinsEntity = g_ecs.createEntity(
		entityName = "robot_veins",
		parent = robotBaseEntity,
		position = new Vector3([0, 0, 0]),
		rotation = new Quaternion(),
		scale = new Vector3([1, 1, 1]),
		meshName = "robot_cube_veins",
		materialName = "robot_veins",
		components = [],
	)

	let floorBaseEntity = g_ecs.createEntity(
		entityName = "floor",
		parent = null,
		position = new Vector3([0, -1.5, 0]),
		rotation = new Quaternion(),
		scale = new Vector3([20, 20, 20]),
		meshName = "",
		materialName = "",
		components = [],
	)

	let floorGroutEntity = g_ecs.createEntity(
		entityName = "floor_grout",
		parent = floorBaseEntity,
		position = new Vector3([0, 0, 0]),
		rotation = new Quaternion(),
		scale = new Vector3([1, 1, 1]),
		meshName = "floor_grout",
		materialName = "floor_grout",
		components = [],
	)

	let floorTilesEntity = g_ecs.createEntity(
		entityName = "floor_tiles",
		parent = floorBaseEntity,
		position = new Vector3([0, 0, 0]),
		rotation = new Quaternion(),
		scale = new Vector3([1, 1, 1]),
		meshName = "floor_tiles",
		materialName = "floor_tiles",
		components = [],
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