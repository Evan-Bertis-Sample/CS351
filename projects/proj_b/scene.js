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
	// build the stars
	let numStars = 1000;
	let starRadius = 80;
	let minimumRadius = 50;
	let starMaterial = "star";
	let starSizeVariation = 0.5;

	let starParent = g_ecs.createEntity(
		entityName = "star_parent",
		parent = null,
		position = new Vector3([0, 0, 0]),
		rotation = new Quaternion(),
		scale = new Vector3([1, 1, 1]),
		meshName = "",
		materialName = "",
		components = [
			new RotateComponent(new Vector3([0, 1, 0]), 0.5),
		]
	);

	for (let i = 0; i < numStars; i++) {
		let theta = Math.random() * 2 * Math.PI;
		let phi = Math.random() * 2 * Math.PI;
		let r = Math.random() * (starRadius - minimumRadius) + minimumRadius;
		let x = r * Math.sin(theta) * Math.cos(phi);
		let y = r * Math.sin(theta) * Math.sin(phi);
		let z = r * Math.cos(theta);
		let pos = new Vector3([x, y, z]);
		let size = Math.random() * starSizeVariation;
		let sizeVec = new Vector3([size, size, size]);

		let identifier = "star_" + i;
		let entity = buildStar(identifier, pos, sizeVec, starParent, starMaterial);
	}

	// build the dyson spheres
	let numSpheres = 10;
	let sphereRadius = 40;
	let innerMaterial = "black_hole";
	let outerMaterial = "platform";
	let sphereScale = new Vector3([1, 1, 1]);

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
		let entity = buildDysonSphere(identifier, pos, sphereScale, innerMaterial, outerMaterial, dysonParent);
	}

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
		components = []
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

function buildStar(identifier, position, scale, parent, starMaterial) {
	let starEntity = g_ecs.createEntity(
		entityName = identifier,
		parent = parent,
		position = position,
		rotation = new Quaternion(),
		scale = scale,
		meshName = "sphere",
		materialName = starMaterial,
		components = [
			new RotateComponent(new Vector3([0, 1, 0]), 5),
		]
	);

	return starEntity;
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
			new RotateComponent(new Vector3([1, 1, 1]), 30),
			new ShakerComponent(0.5),
		]
	);

	return sphereEntity;
}