// material.js
// An abstraction of a material for a 3D object
// Stores a material's fragment and vertex shaders

class Material {
    constructor(name, vertexShaderSource, fragmentShaderSource) {
        this.name = name;
        this.vertexShaderSource = vertexShaderSource;
        this.fragmentShaderSource = fragmentShaderSource;
        // stores the parameters for the shader
        // key: parameter name
        // value: (parameter value, parameter size)
        this.params = new Map();
    }

    loadShader(gl) {
        console.log("Loading shader: " + this.name);
        initShaders(gl, this.vertexShaderSource, this.fragmentShaderSource);
        // set the attributes
        var aLoc_position = gl.getAttribLocation(gl.program, 'a_position');
        if (aLoc_position < 0) {
            console.log('Failed to get the storage location of a_Position');
            return;
        }

        // var a_normal = gl.getAttribLocation(gl.program, 'a_normal');
        // if (a_normal < 0) {
        //     console.log('Failed to get the storage location of a_normal');
        //     return;
        // }

        // set the vertex attribute pointer
        gl.vertexAttribPointer(aLoc_position, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(aLoc_position);

        // get location of the uniform variables
        this.uLoc_modelMatrix = gl.getUniformLocation(gl.program, 'u_modelMatrix');
        if (this.uLoc_modelMatrix < 0) {
            console.log('Failed to get the storage location of u_modelMatrix');
            return;
        }
    }
}

class MaterialRegistry {
    constructor(materialDirectories) {
        this.materials = new Map();
        this.materialDirectories = materialDirectories;
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
        var materialDirectories = this.materialDirectories;
        console.log("Found " + materialDirectories.length + " materials");
        console.log(materialDirectories);

        // For each material directory, load it into the shader registry
        for (var i = 0; i < materialDirectories.length; i++)
        {
            var materialLocation = materialDirectories[i];
            let vertexShaderPath = materialLocation + "/vert.glsl";
            let fragmentShaderPath = materialLocation + "/frag.glsl";
            let materialName = materialLocation.split("/")[materialLocation.split("/").length - 1];

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
                var material = new Material(materialName, vertSource, fragSource);
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
    passUniforms(gl, modelMatrix) {
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
        console.log("Passing uniforms for material: " + this.currentlyLoadedMaterial)
        // modelMatrix.printMe();

        // pass the model matrix
        gl.uniformMatrix4fv(material.uLoc_modelMatrix, false, modelMatrix.elements);
    }
}