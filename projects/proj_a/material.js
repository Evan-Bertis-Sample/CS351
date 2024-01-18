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
        initShaders(gl, this.vertexShaderSource, this.fragmentShaderSource);
        // for the future, add parameters to the shader
        currentlyLoadedMaterial = this;
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
}