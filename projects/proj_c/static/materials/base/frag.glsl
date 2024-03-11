// floating point precision
precision mediump float;

// constants
const vec4 directionalLight = vec4(1, 2, 1, 0);
const vec4 ambientLightColor = vec4(0.44, 0.45, 0.49, 1.0);
const vec4 lightColor = vec4(0.6, 0.54, 0.88, 1.0);
const float cellShadingWeight = 0.4;
const float gridSize = 0.5;
const vec4 gridColor = vec4(0.6, 0.52, 0.85, 1.0);

uniform vec3 u_cameraPosition;
uniform vec4 u_color;
uniform float u_diffuse_influence;
uniform float u_specular_influence;
uniform float u_frensel_influence;
uniform vec4 u_frensel_color;
uniform float u_frensel_border;
uniform float u_show_grid;

// varying variables -- passed from vertex shader
varying vec4 v_position;
varying vec4 v_normal;
varying float v_enable_lighting;
varying vec2 v_uv;

float nStep(float x, float numSteps) {
    return floor(x * numSteps) / float(numSteps);
}

vec4 lerp(vec4 a, vec4 b, float t) {
    return a * (1.0 - t) + b * t;
}

void main() {
    // normalize the normal vector
    vec4 normal = normalize(v_normal);

    if(v_enable_lighting == 0.0) {
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
    // make sure that the frensel effect is positive
    // sqrt(pow)
    frensel = sqrt(frensel * frensel);
    frensel = pow(frensel, 1.0 / u_frensel_border);

    vec4 frenselColor = u_frensel_color * frensel;
    // calculate the final color
    vec4 finalColor = (ambientLightColor * u_color) + (lightColor * u_color * diffuse) + (lightColor * specular);
    // add the frensel effect
    finalColor = finalColor + (frenselColor * u_frensel_influence);

    // add a grid to the object, based on x and z coordinates, but only if the normal is pointing up
    float grid = 0.0;
    if(mod(v_position.x, gridSize * 10.0) < gridSize || mod(v_position.z, gridSize * 10.0) < gridSize) {
        grid = 1.0;
    }

    // multiply it by the dot product of the normal and the up vector

    if(u_show_grid > 0.0) {
        grid *= max(dot(normal, vec4(0, 1, 0, 0)), 0.0);

        // multiply the grid by the distance from the origin
        grid *= 1.0 - (length(v_position) / 60.0);

        // clamp the grid value
        grid = clamp(grid, 0.0, 1.0);

        // now lerping the grid color with the final color
        finalColor = lerp(finalColor, gridColor, grid);
    }

    gl_FragColor = finalColor;
}