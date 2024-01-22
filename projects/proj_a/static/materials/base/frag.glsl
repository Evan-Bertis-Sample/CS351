// floating point precision
precision mediump float;

// constants
const vec4 lightPosition = vec4(1, 10, 10, 1.0);
const vec4 ambientLight = vec4(0.1, 0.1, 0.1, 1.0);
const vec4 lightColor = vec4(1.2, 1.0, 1.0, 1.0);
const float cellShadingWeight = 0.4;

uniform vec3 u_cameraPosition;
uniform vec4 u_color;

// varying variables -- passed from vertex shader
varying vec4 v_position;
varying vec4 v_normal;


float nStep(float x, float numSteps)
{
    return floor(x * numSteps) / float(numSteps);
}

void main()
{
    // normalize the normal vector
    vec4 normal = normalize(v_normal);
    vec4 lightingDirection = normalize(lightPosition - v_position);
    // calculate the dot product of the normal and the lighting direction
    float diffuse = max(dot(normal, lightingDirection), 0.0);

    // calculate the specular component
    vec4 reflectionDirection = reflect(-lightingDirection, normal);
    vec4 viewDirection = normalize(vec4(-u_cameraPosition, 1.0) - v_position);
    float specular = pow(max(dot(reflectionDirection, viewDirection), 0.0), 16.0);

    diffuse = nStep(diffuse, 4.0) * cellShadingWeight + diffuse * (1.0 - cellShadingWeight);
    specular = nStep(specular, 3.0) * cellShadingWeight + specular * (1.0 - cellShadingWeight);


    // calculate the diffuse and specular components
    diffuse = diffuse * 0.8 + 0.2;
    specular = specular * 0.8 + 0.2;

    // calculate the final color
    vec4 finalColor = (ambientLight * u_color) + (lightColor * u_color * diffuse) + (lightColor * specular);
    gl_FragColor = finalColor;
}