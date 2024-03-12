precision mediump float;

// varying variables -- passed from vertex shader
varying vec4 v_color;
varying vec2 v_uv;

// Main fragment shader program
void main() {
    // Output the color interpolated from the vertices
    gl_FragColor = v_color;
}
