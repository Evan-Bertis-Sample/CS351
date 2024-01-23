// config.js
// holds the configuration for the application
// this includes the material descriptors, and meshes used

// Constants
var c_VIEWPORT_WIDTH = 1920;
var c_VIEWPORT_HEIGHT = 1080;
var c_MOVE_SPEED = 0.01;
var c_CAMERA_SENSITIVITY = 0.05;

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
	new MaterialDescriptor(
		"skybox",
		"static/materials/skybox", 
		[
			// new MaterialParameter("u_color", new Vector4([0.0, 1.0, 0.0, 1.0])),
		]
	),
];

var c_MESHES = [
	"./static/meshes/cube.obj",
	"./static/meshes/invert_cube.obj",
	"./static/meshes/sphere.obj",
	"./static/meshes/invert_sphere.obj",
];

var c_CONTROLS = {
	MOVEMENT_AXIS_SET: AxisSets.WASD_KEYS,
	ROTATION_AXIS_SET: AxisSets.MOUSE_MOVEMENT,
}

// camera configuration
var c_CAMERA_STARTING_POSITION = new Vector3([0, 10, 10]);
var c_CAMERA_STARTING_ROTATION = new Quaternion().setFromAxisAngle(1, 0, 0, 45);
var c_CAMERA_SETTINGS = {
	fov: 45,
	near: 0.1,
	far: 100,
};