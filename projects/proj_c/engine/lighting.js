// lighting.js

const LIGHT_TYPE = {
    POINT: 0,
    DIRECTIONAL: 1
}

class Light {
    constructor(lightType, color, intensity, position) {
        this.lightType = lightType;
        this.color = color;
        this.intensity = intensity;
        this.position = position;
    }
}

class LightingRegistry {
    constructor(lights = new Array()) {
        this.lights = lights;
        this.lightLocations = new Map(); // map from gl to map of string to gl locations for each light attribute
        this.lightNumLocations = new Map(); // map from gl to numLights locations
        this.MAX_LIGHTS = 10;
    }

    // load the lights into the gl buffers
    loadLights(gl) {
        let numLights = this.lights.length;
        if (!this.lightLocations.has(gl)) {
            this.findLightLocations(gl)
        }
        
        let lightLocation = this.lightNumLocations.get(gl);
        gl.uniform1i(lightLocation, numLights);

        for (let i = 0; i < numLights; i++) {
            this.passLight(gl, this.lights[i], i);
        }
    }

    passLight(gl, light, index)
    {
        let lightLocations = this.lightLocations.get(gl);
        let positionLocation = lightLocations.get(`position[${index}]`);
        let colorLocation = lightLocations.get(`color[${index}]`);
        let intensityLocation = lightLocations.get(`intensity[${index}]`);
        let lightTypeLocation = lightLocations.get(`lightType[${index}]`);

        gl.uniform3fv(positionLocation, light.position.elements);
        gl.uniform3fv(colorLocation, light.color.elements);
        gl.uniform1f(intensityLocation, light.intensity);
        gl.uniform1i(lightTypeLocation, light.lightType);
    }


    findLightLocations(gl) {
        console.log("Finding light locations");
        let mapLocation = new Map();
        for (let i = 0; i < this.MAX_LIGHTS; i++) {
            let positionName = "u_lightBuffer.lights[0].position".replace("0", i);
            let colorName = "u_lightBuffer.lights[0].color".replace("0", i);
            let intensityName = "u_lightBuffer.lights[0].intensity".replace("0", i);
            let lightTypeName = "u_lightBuffer.lights[0].lightType".replace("0", i);

            let positionLocation = gl.getUniformLocation(gl.program, positionName);
            let colorLocation = gl.getUniformLocation(gl.program, colorName);
            let intensityLocation = gl.getUniformLocation(gl.program, intensityName);
            let lightTypeLocation = gl.getUniformLocation(gl.program, lightTypeName);

            mapLocation.set(`position[${i}]`, positionLocation);
            mapLocation.set(`color[${i}]`, colorLocation);
            mapLocation.set(`intensity[${i}]`, intensityLocation);
            mapLocation.set(`lightType[${i}]`, lightTypeLocation);
        }

        this.lightLocations.set(gl, mapLocation);

        // find the light number locations
        let numLocation = gl.getUniformLocation(gl.program, "u_lightBuffer.numLights");
        this.lightNumLocations.set(gl, numLocation);
    }
}