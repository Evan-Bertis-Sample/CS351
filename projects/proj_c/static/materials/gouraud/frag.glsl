precision mediump float;

// Interpolated color from the vertex shader
varying vec4 v_color;
varying vec2 v_uv;

void main() {
    gl_FragColor = v_color; // Use the interpolated color directly
}
