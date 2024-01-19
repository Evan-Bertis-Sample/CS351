// base_vert.glsl
// Contains a basic vertex shader

// Vertex shader inputs
attribute vec4 a_position;
attribute vec4 a_normal;
uniform mat4 u_modelMatrix;

// main
void main()
{
    // Transform the vertex position into screen space
    vec4 screenPos = u_modelMatrix * a_position;
    screenPos = screenPos / screenPos.w;

    // now convert it into texture space
    screenPos = screenPos * 0.5 + 0.5;
    
    gl_Position = screenPos;
}