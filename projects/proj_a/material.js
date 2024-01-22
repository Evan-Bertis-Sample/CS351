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

class Material {
    // name: the name of the material
    // vertexShaderSource: the source code for the vertex shader
    // fragmentShaderSource: the source code for the fragment shader
    // params: an array of MaterialParameter objects
    constructor(name, vertexShaderSource, fragmentShaderSource, params = new Array()) {
        this.name = name;
        this.vertexShaderSource = vertexShaderSource;
        this.fragmentShaderSource = fragmentShaderSource;
        this.params = params;
        this.uLoc_modelMatrix = -1;
        this.uLoc_viewMatrix = -1;
        this.uLoc_projectionMatrix = -1;
        this.uLoc_cameraPosition = -1;

        this.uLoc_params = new Map();
    }

    loadShader(gl) {
        console.log("Loading shader: " + this.name);
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
        for (let i = 0; i < this.params.length; i++) {
            let param = this.params[i];
            let location = gl.getUniformLocation(gl.program, param.name);
            if (location < 0) {
                console.log('Failed to get the storage location of ' + param.name);
                return;
            }
            this.uLoc_params.set(param.name, location);
        }
    }

    loadParameters(gl) {
        for (let i = 0; i < this.params.length; i++) {
            let param = this.params[i];
            console.log("Loading parameter " + param.name);
            let location = this.uLoc_params.get(param.name);
            if (location < 0) {
                console.log('Failed to get the storage location of ' + param.name);
                return;
            }
            param.loadParameter(gl, location);
        }
    }
}

class MaterialRegistry {
    constructor(materialDescriptors = new Array()) {
        this.materials = new Map();
        this.materialDescriptors = materialDescriptors;
        this.currentlyLoadedMaterial = "";
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
    async loadMaterials()
    {
        // Get all the materials in the shader directory
        // using FileReader
        var materialDescriptors = this.materialDescriptors;
        console.log("Found " + materialDescriptors.length + " materials");
        console.log(materialDescriptors);
        // For each material directory, load it into the shader registry
        for (var i = 0; i < materialDescriptors.length; i++)
        {
            // load the material
            var materialLocation = materialDescriptors[i].shaderDirectory;
            let vertexShaderPath = materialLocation + "/vert.glsl";
            let fragmentShaderPath = materialLocation + "/frag.glsl";
            let materialName = materialDescriptors[i].name;

            // check if these files exist using fetch
            try {
                console.log("Loading material: " + materialName);
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

                console.log("Loaded material: " + materialName);
                console.log(vertSource)
                console.log(fragSource)

                // add the material to the registry
                var material = new Material(materialName, vertSource, fragSource, materialDescriptors[i].params);
                this.addMaterial(material);
            }
            catch (error) {
                console.log("Failed to load material: " + materialName);
                console.log(error);
            }
        }
    }

    addMaterial(material) {
        this.materials.set(material.name, material);
    }

    getMaterial(name) {
        return this.materials.get(name);
    }

    // sets the material to use for the next object
    // name: the name of the material
    setMaterial(name, gl) {
        if (this.currentlyLoadedMaterial == name) {
            return;
        }

        this.currentlyLoadedMaterial = name;
        let material = this.getMaterial(name);
        material.loadShader(gl);
    }

    // sets the material parameters for the next object
    // these are all the uniforms that any material should have
    passUniforms(gl, modelMatrix, viewMatrix, projectionMatrix, cameraPosition) {
        let material = this.getMaterial(this.currentlyLoadedMaterial);
        if (material == null) {
            console.log("Can't pass uniforms, material is null");
            return;
        }
        if (material.uLoc_modelMatrix < 0)
        {
            console.log("Material Model Matrix is null");
            return;
        }

        if (material.uLoc_viewMatrix < 0)
        {
            console.log("Material View Matrix is null");
            return;
        }

        if (material.uLoc_projectionMatrix < 0)
        {
            console.log("Material Projection Matrix is null");
            return;
        }

        console.log("Passing uniforms for material: " + this.currentlyLoadedMaterial)
        gl.uniformMatrix4fv(material.uLoc_modelMatrix, false, modelMatrix.elements);
        gl.uniformMatrix4fv(material.uLoc_viewMatrix, false, viewMatrix.elements);
        gl.uniformMatrix4fv(material.uLoc_projectionMatrix, false, projectionMatrix.elements);
        gl.uniform3fv(material.uLoc_cameraPosition, cameraPosition.elements);
        material.loadParameters(gl);
    }
}