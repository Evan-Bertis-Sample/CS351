// config.js
// holds the configuration for the application
// this includes the material descriptors, and meshes used

// Constants
var c_VIEWPORT_WIDTH = 480;
var c_VIEWPORT_HEIGHT = 270;
var c_MOVE_SPEED = 0.01;

// Rendering Configuration
var c_MATERIALS = [
	new MaterialDescriptor(
		"gray",
		"static/materials/base", 
		[
			new MaterialParameter("u_color", new Vector4([0.65, 0.65, 0.65, 1.0])),
		]
	),
	new MaterialDescriptor(
		"red",
		"static/materials/base", 
		[
			new MaterialParameter("u_color", new Vector4([1.0, 0.0, 0.0, 1.0])),
		]
	),
];

var c_MESHES = [
	"./static/meshes/cube.obj",
	"./static/meshes/sphere.obj",
];

var c_CONTROLS = {
	MOVEMENT_AXIS_SET: MovementAxisSets.WASD_KEYS,
}

// camera configuration
var c_CAMERA_STARTING_POSITION = new Vector3([0, 15, 15]);
var c_CAMERA_STARTING_ROTATION = new Quaternion().setFromAxisAngle(1, 0, 0, 45);
var c_CAMERA_SETTINGS = {
	fov: 45,
	near: 0.1,
	far: 100,
};