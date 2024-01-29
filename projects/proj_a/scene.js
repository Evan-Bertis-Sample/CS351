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
		new CameraController(
			"Robot Parent", c_CAMERA_STARTING_POSITION, 5, 1
		)
	);

	// build the robot
	buildRobot();

	buildEnviornment();

	let skyboxEntity = g_ecs.createEntity(
		entityName = "skybox",
		parent = null,
		position = new Vector3([0, 0, 0]),
		rotation = new Quaternion(),
		scale = new Vector3([c_CAMERA_SETTINGS.far / 2, c_CAMERA_SETTINGS.far / 2, c_CAMERA_SETTINGS.far / 2]),
		meshName = "invert_sphere",
		materialName = "skybox",
		components = [
			new FollowCameraComponent(new Vector3([0, -2, -2])),
		],
	)
}

function buildRobot() {
	let robotBaseEntity = g_ecs.createEntity(
		entityName = "Robot Parent",
		parent = null,
		position = new Vector3([0, 0, 0]),
		rotation = new Quaternion(),
		scale = new Vector3([1, 1, 1]),
		meshName = "",
		materialName = "",
		components = [
			new BobComponent(0.2, 10),
			// new RotateComponent(new Vector3([0, 1, 0]), 0.1),
			new PlayerController(
				c_CONTROLS.MOVEMENT_AXIS_SET, c_PLAYER_MOVE_SPEED, c_PLAYER_ROT_SPEED, 20, new Quaternion().setFromAxisAngle(0, 1, 0, 45)
			),
			new RobotLegOrchestratorComponent(
				[
					"robot_leg_0",
					"robot_leg_1",
					"robot_leg_2",
					"robot_leg_3",
				]
			),
		]
	);

	let robotInnersEntity = g_ecs.createEntity(
		entityName = "robot_inners",
		parent = robotBaseEntity,
		position = new Vector3([0, 0, 0]),
		rotation = new Quaternion(),
		scale = new Vector3([1, 1, 1]),
		meshName = "robot_cube_inners",
		materialName = "robot_inners",
		components = []
	);

	let robotOutersEntity = g_ecs.createEntity(
		entityName = "robot_outers",
		parent = robotBaseEntity,
		position = new Vector3([0, 0, 0]),
		rotation = new Quaternion(),
		scale = new Vector3([1, 1, 1]),
		meshName = "robot_cube_outers",
		materialName = "robot_outers",
		components = []
	);

	let robotVeinsEntity = g_ecs.createEntity(
		entityName = "robot_veins",
		parent = robotBaseEntity,
		position = new Vector3([0, 0, 0]),
		rotation = new Quaternion(),
		scale = new Vector3([1, 1, 1]),
		meshName = "robot_cube_veins",
		materialName = "robot_veins",
		components = []
	);

	// spawn robot legs
	let numLegs = 8;
	let groundY = -1.5;
	let segmentLength = 1;
	let segmentSize = 0.25;
	let legDistance = 2.5 + segmentSize;
	let segmentOffset = segmentLength / 2;

	for (let i = 0; i < numLegs; i++) {
		buildLeg(i, numLegs, legDistance, segmentLength, robotBaseEntity, groundY, segmentSize);
	}
}

function buildLeg(i, numLegs, legDistance, segmentLength, robotBaseEntity, groundY, segmentSize) {
	let theta = (i / numLegs) * 2 * Math.PI;
	let legPosition = new Vector3([Math.cos(theta) * legDistance, 0, Math.sin(theta) * legDistance]);
	let legRotation = new Quaternion();

	// ids for the leg components
	let legUpperID = "robot_leg_" + i + "_upper";
	let legLowerID = "robot_leg_" + i + "_lower";
	let pelvisID = "robot_leg_" + i + "_pelvis";
	let kneeID = "robot_leg_" + i + "_knee";
	let footIdealMarkerID = "robot_leg_" + i + "_foot_ideal_marker"; // used to mark the position of the foot for debugging
	let footActualMarkerID = "robot_leg_" + i + "_foot_actual_marker"; // used to mark the position of the foot for debugging
	let kneeActualMarkerID = "robot_leg_" + i + "_knee_actual_marker"; // used to mark the position of the foot for debugging

	let footPosOffset = legPosition.mul(segmentLength * 2);
	// create the leg
	let legBaseEntity = g_ecs.createEntity(
		entityName = "robot_leg_" + i,
		parent = robotBaseEntity,
		position = legPosition,
		rotation = legRotation,
		scale = new Vector3([1, 1, 1]),
		meshName = "",
		materialName = "",
		components = [
			new RobotLegCompoent(
				legUpperID,
				legLowerID,
				pelvisID,
				kneeID,
				footPosOffset,
				groundY,
				1,
				segmentLength,
				segmentLength,
				footIdealMarkerID,
				footActualMarkerID,
				kneeActualMarkerID
			)
		]
	);

	// create the upper leg
	let upperLeg = g_ecs.createEntity(
		entityName = legUpperID,
		parent = null,
		position = new Vector3([0, 0.1, 0]),
		rotation = new Quaternion(),
		scale = new Vector3([segmentSize, segmentLength / 2, segmentSize]),
		meshName = "cube",
		materialName = "robot_inners",
		components = [
			new RobotLegSegmentComponent(
				legBaseEntity.name,
				SEGMENT_TYPE.UPPER_LEG
			)
		]
	);

	// create the lower leg
	let lowerLeg = g_ecs.createEntity(
		entityName = legLowerID,
		parent = null,
		position = new Vector3([0, -1, 0]),
		rotation = new Quaternion(),
		scale = new Vector3([segmentSize, segmentLength / 2, segmentSize]),
		meshName = "cube",
		materialName = "robot_outers",
		components = [
			new RobotLegSegmentComponent(
				legBaseEntity.name,
				SEGMENT_TYPE.LOWER_LEG
			)
		]
	);

	// create the pelvis
	let pelvis = g_ecs.createEntity(
		entityName = pelvisID,
		parent = legBaseEntity,
		position = legPosition.mul(-segmentSize).sub(new Vector3([0, 0.5, 0])),
		rotation = new Quaternion(),
		scale = new Vector3([segmentSize, segmentSize, segmentSize]),
		meshName = "sphere",
		materialName = "robot_outers",
		components = []
	);

	// create the knee
	let kneePos = legPosition.mul(segmentLength * 4).add(new Vector3([0, 1, 0]));
	let knee = g_ecs.createEntity(
		entityName = kneeID,
		parent = pelvis,
		position = kneePos,
		rotation = new Quaternion(),
		scale = new Vector3([0.1, 0.1, 0.1]),
		meshName = "",
		materialName = "red",
		components = []
	);

	// create the ideal position marker
	g_ecs.createEntity(
		entityName = footIdealMarkerID,
		parent = null,
		position = new Vector3([0, 0, 0]),
		rotation = new Quaternion(),
		scale = new Vector3([0.1, 0.1, 0.1]),
		meshName = "",
		materialName = "red",
		components = []
	);

	// create the actual position marker
	g_ecs.createEntity(
		entityName = footActualMarkerID,
		parent = null,
		position = new Vector3([0, 0, 0]),
		rotation = new Quaternion(),
		scale = new Vector3([segmentSize, segmentSize, segmentSize]),
		meshName = "sphere",
		materialName = "robot_outers",
		components = []
	);

	// create the knee actual position marker
	g_ecs.createEntity(
		entityName = kneeActualMarkerID,
		parent = null,
		position = new Vector3([0, 0, 0]),
		rotation = new Quaternion(),
		scale = new Vector3([segmentSize, segmentSize, segmentSize]),
		meshName = "sphere",
		materialName = "robot_outers",
		components = []
	);
}

function buildEnviornment() {
	let numSpheres = 6;
	let sphereRadius = 20;
	let innerMaterial = "star";
	let outerMaterial = "gray";
	let scale = new Vector3([1, 1, 1]);

	let dysonParent = g_ecs.createEntity(
		entityName = "dyson_sphere_parent",
		parent = null,
		position = new Vector3([0, 0, 0]),
		rotation = new Quaternion(),
		scale = new Vector3([1, 1, 1]),
		meshName = "",
		materialName = "",
		components = [
			new RotateComponent(new Vector3([0, 1, 0]), 8),
		]
	);

	for (let i = 0; i < numSpheres; i++) {
		let theta = (i / numSpheres) * 2 * Math.PI;
		let pos = new Vector3([Math.cos(theta) * sphereRadius, 0, Math.sin(theta) * sphereRadius]);
		let identifier = "dyson_sphere_" + i;
		let entity = buildDysonSphere(identifier, pos, scale, innerMaterial, outerMaterial, dysonParent);
	}
}

function buildDysonSphere(identifier, position, scale, innerMaterial, outerMaterial, parent)
{
	let sphereEntity = g_ecs.createEntity(
		entityName = identifier,
		parent = parent,
		position = position,
		rotation = new Quaternion(),
		scale = scale,
		meshName = "sphere",
		materialName = innerMaterial,
		components = [
			new ShakerComponent(0.5),
		]
	);

	let outerSphereEntity = g_ecs.createEntity(
		entityName = identifier + "_outer",
		parent = sphereEntity,
		position = new Vector3([0, 0, 0]),
		rotation = new Quaternion(),
		scale = new Vector3([2, 2, 2]),
		meshName = "gyro",
		materialName = outerMaterial,
		components = [
			new RotateComponent(new Vector3([1, 1, 1]), 10),
			new ShakerComponent(0.5),
		]
	);

	return sphereEntity;
}
