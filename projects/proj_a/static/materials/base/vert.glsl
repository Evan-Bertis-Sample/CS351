// base_vert.glsl
// Contains a basic vertex shader

// Vertex shader inputs
attribute vec4 a_position;
uniform mat4 u_modelMatrix;

// main
void main()
{
    gl_Position = u_modelMatrix * a_position;
}