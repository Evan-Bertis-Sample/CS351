// floating point precision
precision mediump float;

// constants
const vec4 lightingDirection = vec4(1.0, 1.0, 1.0, 0.0);
const vec4 ambientLight = vec4(0.2, 0.1, 0.2, 1.0);
const vec4 lightColor = vec4(1.0, 1.0, 1.0, 1.0);
const vec4 objectColor = vec4(0.8, 0.0, 0.8, 1.0);

// varying variables -- passed from vertex shader
varying vec4 v_position;
varying vec4 v_normal;

void main()
{
    // normalize the normal vector
    vec4 normal = normalize(v_normal);

    // calculate the dot product of the normal and the lighting direction
    float diffuse = max(dot(normal, lightingDirection), 0.0);

    // set the color of the fragment
    gl_FragColor = objectColor * lightColor * diffuse + ambientLight;
}