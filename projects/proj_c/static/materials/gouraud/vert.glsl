// vert.glsl
// Contains a basic vertex shader
precision mediump float;

struct Light {
    vec3 position;
    vec3 color;
    float intensity;
    int lightType; // 0 for point light, 1 for directional light
};

struct LightBuffer {
    Light lights[16];
    int numLights;
};

// Vertex shader inputs
attribute vec4 a_position;
attribute vec4 a_normal;
attribute vec2 a_uv;

// uniforms
uniform mat4 u_viewMatrix;
uniform mat4 u_projectionMatrix;
uniform mat4 u_modelMatrix;
uniform float u_enable_lighting;

uniform vec3 u_cameraPosition;
uniform vec4 u_color;
uniform float u_diffuse_influence;
uniform float u_specular_influence;
uniform float u_frensel_influence;
uniform vec4 u_frensel_color;
uniform float u_frensel_border;
uniform float u_show_grid;
uniform LightBuffer u_lightBuffer;

const vec4 ambientLightColor = vec4(0.44, 0.45, 0.49, 1.0);
const float gridSize = 0.5;
const vec4 gridColor = vec4(0.6, 0.52, 0.85, 1.0);

varying vec4 v_color;
varying vec2 v_uv;

vec4 lerp(vec4 a, vec4 b, float t) {
    return a * (1.0 - t) + b * t;
}

vec3 calculatePointLightDiffuse(Light light, vec4 position, vec4 normal) {
    vec3 lightDirection = normalize(light.position - position.xyz);
    float lightDistance = length(light.position - position.xyz);
    float attenuation = 1.0 / (1.0 + 0.1 * lightDistance + 0.01 * lightDistance * lightDistance);
    float diffuse = max(dot(normal.xyz, lightDirection), 0.0);
    return diffuse * attenuation * light.intensity * light.color;
}

vec3 calculatePointLightSpecular(Light light, vec4 pos, vec4 normal)
{
    vec3 lightDirection = normalize(light.position - pos.xyz);
    vec3 viewDirection = normalize(u_cameraPosition - pos.xyz);
    vec3 reflectDirection = reflect(-lightDirection, normal.xyz);
    float specular = pow(max(dot(viewDirection, reflectDirection), 0.0), 32.0);
    float lightDistance = length(light.position - pos.xyz);
    float attenuation = 1.0 / (1.0 + 0.1 * lightDistance + 0.01 * lightDistance * lightDistance);
    return specular * attenuation * light.intensity * light.color;
}

vec3 calculateDirectionalLightDiffuse(Light light, vec4 position, vec4 normal)
{
    vec3 lightDirection = normalize(-light.position);
    float diffuse = max(dot(normal.xyz, lightDirection), 0.0);
    return diffuse * light.intensity * light.color;
}


vec3 calculateDirectionalLightSpecular(Light light, vec4 position, vec4 normal)
{
    vec3 lightDirection = normalize(-light.position);
    vec3 viewDirection = normalize(u_cameraPosition - position.xyz);
    vec3 reflectDirection = reflect(-lightDirection, normal.xyz);
    float specular = pow(max(dot(viewDirection, reflectDirection), 0.0), 32.0);
    return specular * light.intensity * light.color;
}

// main
void main() {
    // Transform the vertex position into screen space
    mat4 mvp = u_projectionMatrix * u_viewMatrix * u_modelMatrix;
    vec4 pos = mvp * a_position;

    // check that the vertex is in front of the camera
    if(pos.z < 0.0) {
        // if not, set the vertex position to the origin
        pos = vec4(0.0, 0.0, 0.0, 0.0);
    }

    pos = pos / pos.w;
    gl_Position = pos;

    if(u_enable_lighting == 0.0) {
        vec4 normalColor = vec4(a_normal.x, a_normal.y, a_normal.z, 1.0) * 0.5 + 0.5;
        // mix the normal color with the object color
        v_color = normalColor;
        return;
    }

    vec4 normal = u_modelMatrix * a_normal;

    // calculate the diffuse light
    vec4 diffuseLight = vec4(0.0, 0.0, 0.0, 1.0);
    vec4 specularLight = vec4(0.0, 0.0, 0.0, 1.0);

    v_color = u_color;
    v_uv = a_uv;
    return;

    for(int i = 0; i < 16; i++) {
        if(i >= u_lightBuffer.numLights) {
            break;
        }

        Light light = u_lightBuffer.lights[i];
        if(light.lightType == 0) {
            // point light
            diffuseLight += vec4(calculatePointLightDiffuse(light, pos, normal), 1.0);
            specularLight += vec4(calculatePointLightSpecular(light, pos, normal), 1.0);
        } else {
            diffuseLight += vec4(calculateDirectionalLightDiffuse(light, pos, normal), 1.0);
            specularLight += vec4(calculateDirectionalLightSpecular(light, pos, normal), 1.0);
        }
    }

    // calculate the frensel effect
    vec4 viewDirection = normalize(vec4(u_cameraPosition, 1.0) - pos);
    float frensel = 1.0 - dot(normal, viewDirection);
    // make sure that the frensel effect is positive
    // sqrt(pow)
    frensel = sqrt(frensel * frensel);
    frensel = pow(frensel, 1.0 / u_frensel_border);

    vec4 frenselColor = u_frensel_color * frensel;
    vec4 color = u_color;
    // calculate the final color
    color = color * (ambientLightColor + diffuseLight * u_diffuse_influence + specularLight * u_specular_influence);
    color += frenselColor * u_frensel_influence;

    // this is for the grid on the platform
    // i didn't feel like texturing the model

    // add a grid to the object, based on x and z coordinates, but only if the normal is pointing up
    float grid = 0.0;
    if(mod(pos.x, gridSize * 10.0) < gridSize || mod(pos.z, gridSize * 10.0) < gridSize) {
        grid = 1.0;
    }

    // multiply it by the dot product of the normal and the up vector

    if(u_show_grid > 0.0) {
        grid *= max(dot(normal, vec4(0, 1, 0, 0)), 0.0);

        // multiply the grid by the distance from the origin
        grid *= 1.0 - (length(pos) / 60.0);

        // clamp the grid value
        grid = clamp(grid, 0.0, 1.0);

        // now lerping the grid color with the final color
        color = lerp(color, gridColor, grid);
    }

    v_color = color;
    v_uv = a_uv;
}