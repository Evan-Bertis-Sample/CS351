// config.js
// holds the configuration for the application
// this includes the material descriptors, and meshes used

// Constants
var c_DOWNSAMPLE_FACTOR = 1; // The factor to downsample the screen by
var c_PLAYER_MOVE_SPEED = 10;
var c_PLAYER_ROT_SPEED = 10;
var c_CAMERA_SENSITIVITY = 5;
var c_WALKABLE_RADIUS = 60; // controls how far the player can move from the origin
var c_ENABLE_LIGHTING = 1.0; // 0.0 for no lighting, 1.0 for lighting

// WebGL Configuration
var c_WEBGL_IDS = ["webgl", "webgl-2"]; // The id of the canvas elements

// camera configuration
// maps the camera id to a camera descriptor
var c_FAR_PLANE = 1000;
var c_CAMERAS = new Map([
	[
		"webgl", new CameraDescriptor(
			"webgl",
			new Vector3([0, 30, 40]),
			new Quaternion().setFromAxisAngle(1, 0, 0, 35),
			{
				mode: "perspective",
				allowDynamicReize: true,
				fov: 35,
				near: 1,
				far: c_FAR_PLANE,
			}
		)
	],
	[
		"webgl-2", new CameraDescriptor(
			"webgl-2",
			new Vector3([100, 650, 100]),
			new Quaternion().setFromAxisAngle(1, 0, 0, 45).multiplySelf(new Quaternion().setFromAxisAngle(0, 1, 0, -45)),
			{
				mode: "orthographic",
				allowDynamicReize: true,
				linkTo: ["webgl", 1/3],
			}
		)
	]
]);

// Debugging
var g_USE_FETCH = false; // Used to grab files via the fetch method, not usable using the file:// protocol

// Rendering Configuration
// Used by the MaterialRegistry to create materials
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
			new MaterialParameter("u_show_grid", 0.0),
		]
	),
	new MaterialDescriptor(
		"red",
		"static/materials/base",
		[
			new MaterialParameter("u_color", new Vector4([1.0, 0.0, 0.0, 1.0])),
			new MaterialParameter("u_diffuse_influence", 0.8),
			new MaterialParameter("u_specular_influence", 0.2),
			new MaterialParameter("u_frensel_influence", 0.0),
			new MaterialParameter("u_frensel_color", new Vector4([0.0, 0.0, 0.0, 1.0])),
			new MaterialParameter("u_frensel_border", 1.0),
			new MaterialParameter("u_enable_lighting", c_ENABLE_LIGHTING),
			new MaterialParameter("u_show_grid", 0.0),
		]
	),
	new MaterialDescriptor(
		"green",
		"static/materials/base",
		[
			new MaterialParameter("u_color", new Vector4([0.0, 1.0, 0.0, 1.0])),
			new MaterialParameter("u_diffuse_influence", 0.8),
			new MaterialParameter("u_specular_influence", 0.2),
			new MaterialParameter("u_frensel_influence", 0.0),
			new MaterialParameter("u_frensel_color", new Vector4([0.0, 0.0, 0.0, 1.0])),
			new MaterialParameter("u_frensel_border", 1.0),
			new MaterialParameter("u_enable_lighting", c_ENABLE_LIGHTING),
			new MaterialParameter("u_show_grid", 0.0),
		]
	),
	new MaterialDescriptor(
		"blue",
		"static/materials/base",
		[
			new MaterialParameter("u_color", new Vector4([0.0, 0.0, 1.0, 1.0])),
			new MaterialParameter("u_diffuse_influence", 0.8),
			new MaterialParameter("u_specular_influence", 0.2),
			new MaterialParameter("u_frensel_influence", 0.0),
			new MaterialParameter("u_frensel_color", new Vector4([0.0, 0.0, 0.0, 1.0])),
			new MaterialParameter("u_frensel_border", 1.0),
			new MaterialParameter("u_enable_lighting", c_ENABLE_LIGHTING),
			new MaterialParameter("u_show_grid", 0.0),
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
			new MaterialParameter("u_show_grid", 0.0),
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
			new MaterialParameter("u_show_grid", 0.0),
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
			new MaterialParameter("u_show_grid", 0.0),
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
			new MaterialParameter("u_show_grid", 0.0),
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
			new MaterialParameter("u_show_grid", 0.0),
		]
	),
	new MaterialDescriptor(
		"crystal_blue",
		"static/materials/base",
		[
			new MaterialParameter("u_color", new Vector4([0.0, 0.8, 1.0, 1.0])),
			new MaterialParameter("u_diffuse_influence", 1.0),
			new MaterialParameter("u_specular_influence", 1.0),
			new MaterialParameter("u_frensel_influence", 1.0),
			new MaterialParameter("u_frensel_color", new Vector4([1.0, 1.0, 1.0, 1.0])),
			new MaterialParameter("u_frensel_border", 1.5),
			new MaterialParameter("u_enable_lighting", c_ENABLE_LIGHTING),
			new MaterialParameter("u_show_grid", 0.0),
		]
	),
	new MaterialDescriptor(
		"crystal_purple",
		"static/materials/base",
		[
			new MaterialParameter("u_color", new Vector4([0.3, 0.0, 1.0, 1.0])),
			new MaterialParameter("u_diffuse_influence", 1.0),
			new MaterialParameter("u_specular_influence", 1.0),
			new MaterialParameter("u_frensel_influence", 1.0),
			new MaterialParameter("u_frensel_color", new Vector4([1.0, 1.0, 1.0, 1.0])),
			new MaterialParameter("u_frensel_border", 1.5),
			new MaterialParameter("u_enable_lighting", c_ENABLE_LIGHTING),
			new MaterialParameter("u_show_grid", 0.0),
		]
	),
	new MaterialDescriptor(
		"crystal_pink",
		"static/materials/base",
		[
			new MaterialParameter("u_color", new Vector4([0.7, 0.0, 1.0, 1.0])),
			new MaterialParameter("u_diffuse_influence", 1.0),
			new MaterialParameter("u_specular_influence", 1.0),
			new MaterialParameter("u_frensel_influence", 1.0),
			new MaterialParameter("u_frensel_color", new Vector4([1.0, 1.0, 1.0, 1.0])),
			new MaterialParameter("u_frensel_border", 1.5),
			new MaterialParameter("u_enable_lighting", c_ENABLE_LIGHTING),
			new MaterialParameter("u_show_grid", 0.0),
		]
	),
	new MaterialDescriptor(
		"platform",
		"static/materials/base",
		[
			new MaterialParameter("u_color", new Vector4([1.0, 1.0, 1.0, 1.0])),
			new MaterialParameter("u_diffuse_influence", 0.8),
			new MaterialParameter("u_specular_influence", 0.2),
			new MaterialParameter("u_frensel_influence", 0.1),
			new MaterialParameter("u_frensel_color", new Vector4([1.0, 1.0, 1.0, 1.0])),
			new MaterialParameter("u_frensel_border", 0.5),
			new MaterialParameter("u_enable_lighting", c_ENABLE_LIGHTING),
			new MaterialParameter("u_show_grid", 1.0),
		]
	),
];

// Used by the MeshRegistry to create meshes
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
	"./static/meshes/plane.obj",
	"./static/meshes/arrow.obj",
	"./static/meshes/robot_head.obj",
	"./static/meshes/crystal.obj",
	"./static/meshes/hex_sphere.obj",
];


var c_CONTROLS = {
	MOVEMENT_AXIS_SET: AxisSets.WASD_KEYS,
	ROTATION_AXIS_SET: AxisSets.MOUSE_MOVEMENT,
}
