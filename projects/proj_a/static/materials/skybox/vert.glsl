// base_vert.glsl
// Contains a basic vertex shader

// Vertex shader inputs
attribute vec4 a_position;
attribute vec4 a_normal;
uniform mat4 u_viewMatrix;
uniform mat4 u_projectionMatrix;
uniform mat4 u_modelMatrix;

// varying variables
varying vec4 v_position;
varying vec4 v_normal;

// main
void main()
{
    // Transform the vertex position into screen space
    mat4 mvp = u_projectionMatrix * u_viewMatrix * u_modelMatrix;
    vec4 pos = mvp * a_position;
    pos = pos / pos.w;
    gl_Position = pos;

    // Pass the vertex position and normal to the fragment shader
    v_position = u_modelMatrix * a_position;
    v_normal = u_modelMatrix * a_normal;
}