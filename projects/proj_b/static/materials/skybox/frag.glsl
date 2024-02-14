// floating point precision
precision mediump float;

// constants
const vec4 darkSkyColor = vec4(0.3, 0.45, 0.69, 1.0);
const vec4 lightSkyColor = vec4(0.42, 0.59, 0.81, 1.0);
const float mixingZoneSize = 15.0;
const float bottom = -10.0;
const float numSteps = 5.0;
const float stepInfluence = 0.3;

uniform vec3 u_cameraPosition;

// varying variables -- passed from vertex shader
varying vec4 v_position;
varying vec4 v_normal;
varying vec2 v_uv;

float nStep(float x, float numSteps) {
    return floor(x * numSteps) / float(numSteps);
}

// main function
void main() {
    // mix the colors based on the y position of the fragment
    float mixFactor = clamp((v_position.y - bottom) / mixingZoneSize, 0.0, 1.0);
    float stepped = nStep(mixFactor, numSteps);
    mixFactor = mix(mixFactor, stepped, stepInfluence);
    vec4 color = mix(darkSkyColor, lightSkyColor, mixFactor);
    gl_FragColor = color;
}