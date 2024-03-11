// floating point precision
precision mediump float;

struct Light {
    vec3 position;
    vec3 color;
    float intensity;
    int lightType; // 0 for point light, 1 for directional light
};

struct LightBuffer
{
    Light lights[10];
    int numLights;
};

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
uniform LightBuffer u_lightBuffer;


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

float calculatePointLightDiffuse(Light light, vec4 position, vec4 normal) {
    vec3 lightDirection = normalize(light.position - position.xyz);
    float lightDistance = length(light.position - position.xyz);
    float attenuation = 1.0 / (1.0 + 0.1 * lightDistance + 0.01 * lightDistance * lightDistance);
    float diffuse = max(dot(normal.xyz, lightDirection), 0.0);
    return diffuse * attenuation * light.intensity;
}

float calculatePointLightSpecular(Light light, vec4 v_position, vec4 normal)
{
    vec3 lightDirection = normalize(light.position - v_position.xyz);
    vec3 viewDirection = normalize(u_cameraPosition - v_position.xyz);
    vec3 reflectDirection = reflect(-lightDirection, normal.xyz);
    float specular = pow(max(dot(viewDirection, reflectDirection), 0.0), 32.0);
    float lightDistance = length(light.position - v_position.xyz);
    float attenuation = 1.0 / (1.0 + 0.1 * lightDistance + 0.01 * lightDistance * lightDistance);
    return specular * attenuation * light.intensity;
}

float calculateDirectionalLightDiffuse(Light light, vec4 position, vec4 normal)
{
    vec3 lightDirection = normalize(-light.position);
    float diffuse = max(dot(normal.xyz, lightDirection), 0.0);
    return diffuse * light.intensity;
}


float calculateDirectionalLightSpecular(Light light, vec4 position, vec4 normal)
{
    vec3 lightDirection = normalize(-light.position);
    vec3 viewDirection = normalize(u_cameraPosition - position.xyz);
    vec3 reflectDirection = reflect(-lightDirection, normal.xyz);
    float specular = pow(max(dot(viewDirection, reflectDirection), 0.0), 32.0);
    return specular * light.intensity;
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

    vec4 color = u_color;

    // calculate the ambient light
    vec4 ambientLight = ambientLightColor * color;

    // calculate the diffuse light
    vec4 diffuseLight = vec4(0.0, 0.0, 0.0, 1.0);
    vec4 specularLight = vec4(0.0, 0.0, 0.0, 1.0);

    const int numLights = 2;

    for (int i = 0; i < numLights; i++)
    {
        Light light = u_lightBuffer.lights[i];
        if (light.lightType == 0)
        {
            diffuseLight += vec4(calculatePointLightDiffuse(light, v_position, normal), 0.0, 0.0, 1.0);
            specularLight += vec4(calculatePointLightSpecular(light, v_position, normal), 0.0, 0.0, 1.0);
        }
        else
        {
            diffuseLight += vec4(calculateDirectionalLightDiffuse(light, v_position, normal), 0.0, 0.0, 1.0);
            specularLight += vec4(calculateDirectionalLightSpecular(light, v_position, normal), 0.0, 0.0, 1.0);
        }
    }

    // calculate the frensel effect
    vec4 viewDirection = normalize(vec4(u_cameraPosition, 1.0) - v_position);
    float frensel = 1.0 - dot(normal, viewDirection);
    // make sure that the frensel effect is positive
    // sqrt(pow)
    frensel = sqrt(frensel * frensel);
    frensel = pow(frensel, 1.0 / u_frensel_border);

    vec4 frenselColor = u_frensel_color * frensel;
    // calculate the final color
    color = color * (ambientLight + diffuseLight * u_diffuse_influence + specularLight * u_specular_influence);

    color += frenselColor * u_frensel_influence;
    gl_FragColor = color;
}