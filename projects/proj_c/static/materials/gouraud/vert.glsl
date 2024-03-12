precision mediump float;

struct Light {
    vec3 position;
    vec3 color;
    float intensity;
    int lightType; // 0 for point light, 1 for directional light
};

struct LightBuffer
{
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
uniform LightBuffer u_lightBuffer;

// constants
const vec4 ambientLightColor = vec4(0.44, 0.45, 0.49, 1.0);
const float cellShadingWeight = 0.4;



// varying variables to pass to fragment shader
varying vec4 v_color;
varying vec2 v_uv;
varying vec4 v_position;
varying vec4 v_normal;

vec3 calculatePointLightDiffuse(Light light, vec4 position, vec4 normal) {
    vec3 lightDirection = normalize(light.position - position.xyz);
    float lightDistance = length(light.position - position.xyz);
    float attenuation = 1.0 / (1.0 + 0.1 * lightDistance + 0.01 * lightDistance * lightDistance);
    float diffuse = max(dot(normal.xyz, lightDirection), 0.0);
    return diffuse * attenuation * light.intensity * light.color;
}

vec3 calculatePointLightSpecular(Light light, vec4 v_position, vec4 normal)
{
    vec3 lightDirection = normalize(light.position - v_position.xyz);
    vec3 viewDirection = normalize(u_cameraPosition - v_position.xyz);
    vec3 reflectDirection = reflect(-lightDirection, normal.xyz);
    float specular = pow(max(dot(viewDirection, reflectDirection), 0.0), 32.0);
    float lightDistance = length(light.position - v_position.xyz);
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

void main() {
    // Transform the vertex position into screen space
    mat4 mvp = u_projectionMatrix * u_viewMatrix * u_modelMatrix;
    vec4 pos = mvp * a_position;
    vec4 worldPosition = u_modelMatrix * a_position;
    vec4 normal = normalize(u_modelMatrix * a_normal);

    // check that the vertex is in front of the camera
    if(pos.z < 0.0) {
        // if not, set the vertex position to the origin
        pos = vec4(0.0, 0.0, 0.0, 0.0);
    }


    pos = pos / pos.w;
    gl_Position = pos;


    // Initial color setup
    vec4 color = u_color;

    if(u_enable_lighting != 0.0) {
        vec4 ambientLight = ambientLightColor;
        vec4 diffuseLight = vec4(0.0);
        vec4 specularLight = vec4(0.0);

        for (int i = 0; i < 16; i++) {
            if (i >= u_lightBuffer.numLights) {
                break;
            }
            Light light = u_lightBuffer.lights[i];
            if (light.lightType == 0) { // Point light
                diffuseLight += vec4(calculatePointLightDiffuse(light, worldPosition, normal), 1.0);
                specularLight += vec4(calculatePointLightSpecular(light, worldPosition, normal), 1.0);
            } else { // Directional light
                diffuseLight += vec4(calculateDirectionalLightDiffuse(light, worldPosition, normal), 1.0);
                specularLight += vec4(calculateDirectionalLightSpecular(light, worldPosition, normal), 1.0);
            }
        }

        // Calculate the Fresnel effect
        vec4 viewDirection = normalize(vec4(u_cameraPosition, 1.0) - worldPosition);
        float frensel = pow(max(1.0 - dot(normal, viewDirection), 0.0), u_frensel_border);
        vec4 frenselColor = u_frensel_color * frensel;

        color = color * (ambientLight + diffuseLight * u_diffuse_influence + specularLight * u_specular_influence) + frenselColor * u_frensel_influence;
    }

    // Pass the computed color and texture coordinates to the fragment shader
    v_color = color;
    v_uv = a_uv;
    v_normal = normal;
    v_position = worldPosition;
}
