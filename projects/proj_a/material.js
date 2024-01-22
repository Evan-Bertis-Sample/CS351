// material.js
// An abstraction of a material for a 3D object
// Stores a material's fragment and vertex shaders

// Used to describe a shader parameter passed in as a uniform using WebGl
class MaterialParameter {
    constructor(name = "", value = null) {
        this.name = name;
        this.value = value;
    }

    // loads the parameter into the shader
    loadParameter(gl, location) {
        if (this.value == null) {
            console.log("Shader parameter is null");
            return;
        }

        if (this.value instanceof Vector3) {
            gl.uniform3fv(location, this.value.elements);
        }
        else if (this.value instanceof Vector4) {
            gl.uniform4fv(location, this.value.elements);
        }
        else if (this.value instanceof Matrix4) {
            gl.uniformMatrix4fv(location, false, this.value.elements);
        }
        else {
            console.log("Shader parameter type not supported");
            return;
        }
    }
}

// Used to load shaders and create a material instance
class MaterialDescriptor {
    constructor(name = "", shaderDirectory = "", params = new Array()) {
        this.name = name;
        this.shaderDirectory = shaderDirectory;
        this.params = params;
    }
}

class ShaderSet {
    constructor(name, vertexShaderSource = "", fragmentShaderSource = "", paramNames = new Array()) {
        this.name = name;
        this.vertexShaderSource = vertexShaderSource;
        this.fragmentShaderSource = fragmentShaderSource;
        this.paramNames = paramNames;
        this.uLoc_modelMatrix = -1;
        this.uLoc_viewMatrix = -1;
        this.uLoc_projectionMatrix = -1;
        this.uLoc_cameraPosition = -1;
        this.uLoc_params = new Map();
    }

    loadShader(gl) {
        // console.log("Loading shader: " + this.name);
        initShaders(gl, this.vertexShaderSource, this.fragmentShaderSource);
        // set the attributes
        var aLoc_position = gl.getAttribLocation(gl.program, 'a_position');
        if (aLoc_position < 0) {
            console.log('Failed to get the storage location of a_position');
            console.log("aLoc_position: " + aLoc_position);
            return;
        }

        var aLoc_normal = gl.getAttribLocation(gl.program, 'a_normal');
        if (aLoc_normal < 0) {
            console.log('Failed to get the storage location of a_normal');
            console.log("aLoc_normal: " + aLoc_normal);
            return;
        }

        // the vertex buffer is sorted as follows:
        // vertex, normal, vertex, normal, etc.
        // this was loaded initially before loading the shaders
        // set the vertex attribute pointer
        // vertexAttribPointer(index, size, type, normalized, stride, offset)
        gl.vertexAttribPointer(aLoc_position, 4, gl.FLOAT, false, 8 * Float32Array.BYTES_PER_ELEMENT, 0);
        gl.enableVertexAttribArray(aLoc_position);

        // set the normal attribute pointer
        gl.vertexAttribPointer(aLoc_normal, 4, gl.FLOAT, false, 8 * Float32Array.BYTES_PER_ELEMENT, 4 * Float32Array.BYTES_PER_ELEMENT);
        gl.enableVertexAttribArray(aLoc_normal);

        // get location of the uniform variables
        this.uLoc_modelMatrix = gl.getUniformLocation(gl.program, 'u_modelMatrix');
        if (this.uLoc_modelMatrix < 0) {
            console.log('Failed to get the storage location of u_modelMatrix');
            return;
        }

        this.uLoc_viewMatrix = gl.getUniformLocation(gl.program, 'u_viewMatrix');
        if (this.uLoc_viewMatrix < 0) {
            console.log('Failed to get the storage location of u_viewMatrix');
            return;
        }

        this.uLoc_projectionMatrix = gl.getUniformLocation(gl.program, 'u_projectionMatrix');
        if (this.uLoc_projectionMatrix < 0) {
            console.log('Failed to get the storage location of u_projectionMatrix');
            return;
        }

        this.uLoc_cameraPosition = gl.getUniformLocation(gl.program, 'u_cameraPosition');
        if (this.uLoc_cameraPosition < 0) {
            console.log('Failed to get the storage location of u_cameraPosition');
            return;
        }

        // now find the locations of the shader parameters
        for (let i = 0; i < this.paramNames.length; i++) {
            let paramName = this.paramNames[i];
            let location = gl.getUniformLocation(gl.program, paramName);
            if (location < 0) {
                console.log('Failed to get the storage location of ' + paramName);
                return;
            }
            this.uLoc_params.set(paramName, location);
        }
    }

    loadParameters(gl, params) {
        for (let i = 0; i < this.paramNames.length; i++) {
            let param = params[i];
            // console.log("Loading parameter " + param.name);
            let location = this.uLoc_params.get(param.name);
            if (location < 0) {
                console.log('Failed to get the storage location of ' + param.name);
                return;
            }
            param.loadParameter(gl, location);
        }
    }
}

class Material {
    // name: the name of the material
    // shaderName: the name of the shader used
    // params: an array of MaterialParameter objects
    constructor(name, shaderName, params = new Array()) {
        this.name = name;
        this.shaderName = shaderName;
        this.params = params;
    }

    // loads the material into the shader
    loadParameters(gl, shader) {
        shader.loadParameters(gl, this.params);
    }
}

class MaterialRegistry {
    constructor(materialDescriptors = new Array()) {
        this.materials = new Map();
        this.shaders = new Map();
        this.materialDescriptors = materialDescriptors;
        this.currentlyLoadedMaterial = "";
        this.currentlyLoadedShader = "";
    }

    print() {
        console.log("Printing materials");
        for (let [key, value] of this.materials) {
            console.log(key)
            console.log(value)
        }

        console.log("Printing shaders");
        for (let [key, value] of this.shaders) {
            console.log(key)
            console.log(value)
        }
    }

    // loads all the materials from the shader directory
    // the shader directory should be laid out as follows:
    //  shaderDirectory
    //      material1 -> whatever the material is called
    //          vert.glsl -> the vertex shader
    //          frag.glsl -> the fragment shader
    //      material2
    //          vert.glsl
    //          frag.glsl
    //      ...
    // If the shader directory is not laid out like this, then the materials will not be loaded correctly
    async loadMaterials() {
        // Get all the materials in the shader directory
        // using FileReader
        var materialDescriptors = this.materialDescriptors;
        console.log("Found " + materialDescriptors.length + " materials");
        console.log(materialDescriptors);
        // For each material directory, load it into the shader registry
        for (var i = 0; i < materialDescriptors.length; i++) {
            // parse materialLocation to get the name of the shader
            let shaderLocation = materialDescriptors[i].shaderDirectory;
            let shaderName = shaderLocation.split("/").pop(); // get the last element
            let materialName = materialDescriptors[i].name;
            if (shaderName == "") {
                console.log("Failed to load material: " + materialName);
                console.log("Shader name is empty");
                continue;
            }

            // load the shader because it hasn't been loaded yet
            if (!this.shaders.has(shaderName)) {
                // load the shader from the path
                let vertexShaderPath = shaderLocation + "/vert.glsl";
                let fragmentShaderPath = shaderLocation + "/frag.glsl";

                // check if these files exist using fetch
                try {
                    console.log("Loading shader: " + shaderName);
                    const vertResponse = await fetch(vertexShaderPath);
                    const fragResponse = await fetch(fragmentShaderPath);

                    if (!vertResponse.ok) {
                        throw new Error('Failed to load vertex shader: ' + vertexShaderPath);
                    }
                    if (!fragResponse.ok) {
                        throw new Error('Failed to load fragment shader: ' + fragmentShaderPath);
                    }
                    // load the material
                    // get the shader source from the resonse
                    const vertSource = await vertResponse.text();
                    const fragSource = await fragResponse.text();

                    // console.log(vertSource)
                    // console.log(fragSource)

                    let paramNames = new Array();
                    for (let j = 0; j < materialDescriptors[i].params.length; j++) {
                        paramNames.push(materialDescriptors[i].params[j].name);
                    }

                    // add the shader to the registry
                    let shader = new ShaderSet(shaderName, vertSource, fragSource, paramNames);
                    console.log(shader);
                    this.addShader(shader);
                }
                catch (error) {
                    console.log("Failed to load material: " + materialName);
                    console.log(error);
                }
            }

            // add the material to the registry
            var material = new Material(materialName, shaderName, materialDescriptors[i].params);
            this.addMaterial(material);
        }
    }

    addMaterial(material) {
        this.materials.set(material.name, material);
    }

    getMaterial(name) {
        return this.materials.get(name);
    }

    addShader(shader) {
        this.shaders.set(shader.name, shader);
    }
    getShader(name) {
        return this.shaders.get(name);
    }

    // sets the material to use for the next object
    // name: the name of the material
    setMaterial(name, gl) {
        if (this.currentlyLoadedMaterial == name) {
            return;
        }

        this.currentlyLoadedMaterial = name;
        let material = this.getMaterial(name);
        if (material == null) {
            console.log("Can't set material, material is null");
            return;
        }

        // load the shader
        let shader = this.shaders.get(material.shaderName);
        if (material.shaderName != this.currentlyLoadedMaterial) {
            // console.log("Loading shader: " + material.shaderName);
            if (shader == null) {
                console.log("Can't set material, shader is null");
                return;
            }
            shader.loadShader(gl);
            this.currentlyLoadedShader = material.shaderName;
        }
        else
        {
            console.log("Skipping shader loading");
        }

        material.loadParameters(gl, shader);
    }

    // sets the material parameters for the next object
    // these are all the uniforms that any material should have
    passUniforms(gl, modelMatrix, viewMatrix, projectionMatrix, cameraPosition) {
        let material = this.getMaterial(this.currentlyLoadedMaterial);
        // console.log(material);
        if (material == null) {
            console.log("Can't pass uniforms, material is null");
            return;
        }

        let shader = this.getShader(this.currentlyLoadedShader);
        // console.log(shader);
        if (shader == null) {
            console.log("Can't read shader, shader is null");
            return;
        }

        let uLoc_modelMatrix = shader.uLoc_modelMatrix;
        let uLoc_viewMatrix = shader.uLoc_viewMatrix;
        let uLoc_projectionMatrix = shader.uLoc_projectionMatrix;
        let uLoc_cameraPosition = shader.uLoc_cameraPosition;

        if (uLoc_modelMatrix < 0) {
            console.log("Material Model Matrix is null");
            return;
        }

        if (uLoc_viewMatrix < 0) {
            console.log("Material View Matrix is null");
            return;
        }

        if (uLoc_projectionMatrix < 0) {
            console.log("Material Projection Matrix is null");
            return;
        }

        if (uLoc_cameraPosition < 0) {
            console.log("Camera Position is null");
            return;
        }

        // console.log("Passing uniforms for material: " + this.currentlyLoadedMaterial)
        gl.uniformMatrix4fv(uLoc_modelMatrix, false, modelMatrix.elements);
        gl.uniformMatrix4fv(uLoc_viewMatrix, false, viewMatrix.elements);
        gl.uniformMatrix4fv(uLoc_projectionMatrix, false, projectionMatrix.elements);
        gl.uniform3fv(uLoc_cameraPosition, cameraPosition.elements);
    }
}