// floating point precision
precision mediump float;

// constants
const vec4 directionalLight = vec4(1, 2, 1, 0);
const vec4 ambientLightColor = vec4(0.44, 0.45, 0.49, 1.0);
const vec4 lightColor = vec4(0.73, 0.82, 0.83, 1.0);
const float cellShadingWeight = 0.4;

uniform vec3 u_cameraPosition;
uniform vec4 u_color;
uniform float u_diffuse_influence;
uniform float u_specular_influence;
uniform float u_frensel_influence;
uniform vec4 u_frensel_color;
uniform float u_frensel_border;

// varying variables -- passed from vertex shader
varying vec4 v_position;
varying vec4 v_normal;
varying float v_enable_lighting;

float nStep(float x, float numSteps) {
    return floor(x * numSteps) / float(numSteps);
}

void main() {
    // normalize the normal vector
    vec4 normal = normalize(v_normal);

    // gl_FragColor = vec4(v_enableLighting, v_enableLighting, v_enableLighting, 1.0);
    // return;

    if (v_enable_lighting == 0.0) {
        vec4 normalColor = vec4(normal.x, normal.y, normal.z, 1.0) * 0.5 + 0.5;
        // mix the normal color with the object color
        gl_FragColor = normalColor;
        return;
    }

    vec4 lightingDirection = normalize(directionalLight);
    // calculate the dot product of the normal and the lighting direction
    float diffuse = max(dot(normal, lightingDirection), 0.0);

    // calculate the specular component
    vec4 reflectionDirection = reflect(-lightingDirection, normal);
    vec4 viewDirection = normalize(vec4(u_cameraPosition, 1.0) - v_position);
    float specular = pow(max(dot(reflectionDirection, viewDirection), 0.0), 16.0);

    diffuse = nStep(diffuse, 5.0) * cellShadingWeight + diffuse * (1.0 - cellShadingWeight);
    specular = nStep(specular, 3.0) * cellShadingWeight + specular * (1.0 - cellShadingWeight);

    // calculate the diffuse and specular components
    diffuse = diffuse * 0.8 + 0.2;
    specular = specular * 0.8 + 0.2;

    diffuse = diffuse * u_diffuse_influence;
    specular = specular * u_specular_influence;

    // ensure that the specular lighting is muted in shadow
    specular = specular * diffuse;
    specular = specular * specular;

    // calculate the frensel effect
    float frensel = 1.0 - dot(normal, viewDirection);
    frensel = pow(frensel, 1.0 / u_frensel_border);

    vec4 frenselColor = u_frensel_color * frensel;
    // calculate the final color
    vec4 finalColor = (ambientLightColor * u_color) + (lightColor * u_color * diffuse) + (lightColor * specular);
    // add the frensel effect
    finalColor = finalColor + frenselColor * u_frensel_influence;

    gl_FragColor = finalColor;
}