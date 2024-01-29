// config.js
// holds the configuration for the application
// this includes the material descriptors, and meshes used

// Constants
var c_VIEWPORT_WIDTH = 1920/4;
var c_VIEWPORT_HEIGHT = 1080/4;
var c_PLAYER_MOVE_SPEED = 10;
var c_PLAYER_ROT_SPEED = 10;
var c_CAMERA_SENSITIVITY = 5;
var c_WALKABLE_RADIUS = 10; // controls how far the player can move from the origin
var c_ENABLE_LIGHTING = 1.0; // 0.0 for no lighting, 1.0 for lighting

// Debugging
var g_USE_FETCH = false; // Used to grab files via the fetch method, not usable using the file:// protocol

// Rendering Configuration
var c_MATERIALS = [
	new MaterialDescriptor(
		"gray",
		"static/materials/base",
		[
			new MaterialParameter("u_color", new Vector4([0.65, 0.65, 0.65, 1.0])),
			new MaterialParameter("u_diffuse_influence", 0.8),
			new MaterialParameter("u_specular_influence", 0.2),
			new MaterialParameter("u_frensel_influence", 0.0),
			new MaterialParameter("u_frensel_color", new Vector4([0.0, 0.0, 0.0, 1.0])),
			new MaterialParameter("u_frensel_border", 1.0),
			new MaterialParameter("u_enable_lighting", c_ENABLE_LIGHTING),
		]
	),
	new MaterialDescriptor(
		"robot_inners",
		"static/materials/base",
		[
			new MaterialParameter("u_color", new Vector4([0.5, 0.5, 0.5, 1.0])),
			new MaterialParameter("u_diffuse_influence", 0.8),
			new MaterialParameter("u_specular_influence", 0.2),
			new MaterialParameter("u_frensel_influence", 0.0),
			new MaterialParameter("u_frensel_color", new Vector4([0.0, 0.0, 0.0, 1.0])),
			new MaterialParameter("u_frensel_border", 1.0),
			new MaterialParameter("u_enable_lighting", c_ENABLE_LIGHTING),
		]
	),
	new MaterialDescriptor(
		"robot_outers",
		"static/materials/base",
		[
			new MaterialParameter("u_color", new Vector4([0.7, 0.7, 0.7, 1.0])),
			new MaterialParameter("u_diffuse_influence", 0.8),
			new MaterialParameter("u_specular_influence", 0.2),
			new MaterialParameter("u_frensel_influence", 0.0),
			new MaterialParameter("u_frensel_color", new Vector4([0.0, 0.0, 0.0, 1.0])),
			new MaterialParameter("u_frensel_border", 1.0),
			new MaterialParameter("u_enable_lighting", c_ENABLE_LIGHTING),
		]
	),
	new MaterialDescriptor(
		"robot_veins",
		"static/materials/base",
		[
			new MaterialParameter("u_color", new Vector4([0.8, 0.4, 0.6, 1.0])),
			new MaterialParameter("u_diffuse_influence", 0.8),
			new MaterialParameter("u_specular_influence", 0.2),
			new MaterialParameter("u_frensel_influence", 0.0),
			new MaterialParameter("u_frensel_color", new Vector4([0.0, 0.0, 0.0, 1.0])),
			new MaterialParameter("u_frensel_border", 1.0),
			new MaterialParameter("u_enable_lighting", c_ENABLE_LIGHTING),
		]
	),
	new MaterialDescriptor(
		"skybox",
		"static/materials/skybox",
		[]
	),
	new MaterialDescriptor(
		"black_hole",
		"static/materials/base",
		[
			new MaterialParameter("u_color", new Vector4([0.0, 0.0, 0.0, 1.0])),
			new MaterialParameter("u_diffuse_influence", 0.0),
			new MaterialParameter("u_specular_influence", 0.0),
			new MaterialParameter("u_frensel_influence", 1.0),
			new MaterialParameter("u_frensel_color", new Vector4([1.0, 0.0, 1.0, 1.0])),
			new MaterialParameter("u_frensel_border", 1.5),
			new MaterialParameter("u_enable_lighting", c_ENABLE_LIGHTING),
		]
	),
	new MaterialDescriptor(
		"star",
		"static/materials/base",
		[
			new MaterialParameter("u_color", new Vector4([0.7, 0.0, 1.0, 1.0])),
			new MaterialParameter("u_diffuse_influence", 1.0),
			new MaterialParameter("u_specular_influence", 1.0),
			new MaterialParameter("u_frensel_influence", 1.0),
			new MaterialParameter("u_frensel_color", new Vector4([1.0, 1.0, 1.0, 1.0])),
			new MaterialParameter("u_frensel_border", 1.5),
			new MaterialParameter("u_enable_lighting", c_ENABLE_LIGHTING),
		]
	),
	new MaterialDescriptor(
		"platform",
		"static/materials/base",
		[
			new MaterialParameter("u_color", new Vector4([1.0, 1.0, 1.0, 1.0])),
			new MaterialParameter("u_diffuse_influence", 0.8),
			new MaterialParameter("u_specular_influence", 0.2),
			new MaterialParameter("u_frensel_influence", 1.0),
			new MaterialParameter("u_frensel_color", new Vector4([1.0, 1.0, 1.0, 1.0])),
			new MaterialParameter("u_frensel_border", 0.5),
			new MaterialParameter("u_enable_lighting", c_ENABLE_LIGHTING),
		]
	),
];

var c_MESHES = [
	"./static/meshes/cube.obj",
	"./static/meshes/invert_cube.obj",
	"./static/meshes/sphere.obj",
	"./static/meshes/invert_sphere.obj",
	"./static/meshes/robot.obj",
	"./static/meshes/robot_cube_inners.obj",
	"./static/meshes/robot_cube_outers.obj",
	"./static/meshes/robot_cube_veins.obj",
	"./static/meshes/floor_grout.obj",
	"./static/meshes/floor_tiles.obj",
	"./static/meshes/gyro.obj",
	"./static/meshes/platform.obj",
];

var c_CONTROLS = {
	MOVEMENT_AXIS_SET: AxisSets.WASD_KEYS,
	ROTATION_AXIS_SET: AxisSets.MOUSE_MOVEMENT,
}

// camera configuration
var c_CAMERA_STARTING_POSITION = new Vector3([0, 20, 15]);
var c_CAMERA_STARTING_ROTATION = new Quaternion().setFromAxisAngle(1, 0, 0, 45);
var c_CAMERA_SETTINGS = {
	fov: 60,
	near: 0.1,
	far: 100,
};