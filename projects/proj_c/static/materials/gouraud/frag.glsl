precision mediump float;

// Interpolated color from the vertex shader
varying vec4 v_color;
varying vec2 v_uv;

void main() {
    gl_FragColor = v_color;
    // gl_FragColor = vec4(v_uv.x, v_uv.y, 0.0, 1.0) * v_color;
}
