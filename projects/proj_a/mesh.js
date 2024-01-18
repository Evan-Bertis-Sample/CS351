// mesh.js
// Contains Mesh, MeshRegistry
//

// A representation of a mesh
// Stores the vertices, normals, and indices of the mesh
class Mesh {
    // Creates a new Mesh
    // vertices: an array of Vector3s
    // normals: an array of Vector3s
    // indices: an array of indices that map to the vertices and normals to form triangles -- triangles should be wound counter-clockwise
    constructor(vertices, normals, indices) {
        this.vertices = vertices;
        this.normals = normals;
        this.indices = indices;

        // stores the start indices of the mesh in the vertex, normal, and index buffers
        this.vertexStartIndex = -1;
        this.normalStartIndex = -1;
        this.indexStartIndex = -1;
    }

    // Sets the vertices of this mesh
    // vertices: an array of vertices
    setVertices(vertices) {
        this.vertices = vertices;
    }

    // Sets the normals of this mesh
    // normals: an array of normals
    setNormals(normals) {
        this.normals = normals;
    }

    // Sets the indices of this mesh
    // indices: an array of indices
    setIndices(indices) {
        this.indices = indices;
    }

    // Gets the triangles of this mesh
    // returns an array of triangles
    // triangles are represented as an array of 3 Vector4s for vertices, and 3 Vector4s for normals are in the form (vertex, normal)
    getTriangles() {
        let triangles = [];
        for (var i = 0; i < this.indices.length; i += 3) {
            let triangle = [];
            for (var j = 0; j < 3; j++) {
                let vertex = this.vertices[this.indices[i + j]];
                let normal = this.normals[this.indices[i + j]];

                let vertex4 = new Vector4(vertex.elements[0], vertex.elements[1], vertex.elements[2], 1);
                triangle.push(vertex4);
                let normal4 = new Vector4(normal.elements[0], normal.elements[1], normal.elements[2], 0);
                triangle.push(normal4);
            }
            triangles.push(triangle);
        }

        return triangles;
    }

    // prints the mesh to the console
    print() {
        console.log("Vertices: ");
        for (var i = 0; i < this.vertices.length; i++) {
            console.log(this.vertices[i]);
        }
        console.log("Normals: ");
        for (var i = 0; i < this.normals.length; i++) {
            console.log(this.normals[i]);
        }
        console.log("Indices: ");
        for (var i = 0; i < this.indices.length; i++) {
            console.log(this.indices[i]);
        }
    }

    // Loads the mesh using the given gl context
    // vertexBuffer : a list of Vector4s representing the vertices
    // normalBuffer : a list of Vector4s representing the normals
    // indexBuffer : a list of indices
    loadObject(vertexBuffer, normalBuffer, indexBuffer)
    {
        if (this.vertexStartIndex != -1) {
            // already loaded
            return;
        }

        // append the vertices, normals, and indices to the buffers
        this.vertexStartIndex = vertexBuffer.length;
        this.normalStartIndex = normalBuffer.length;
        for (var i = 0; i < this.vertices.length; i++) {
            vertexBuffer.push(
                new Vector4(this.vertices[i].elements[0], 
                            this.vertices[i].elements[1], 
                            this.vertices[i].elements[2], 
                            1)
            );
        }

        // TODO: fix this
        for (var i = 0; i < this.vertices.length; i++) {
            normalBuffer.push(
                new Vector4(1, 0, 0, 0)
            );
        }

        this.indexStartIndex = indexBuffer.length;
        for (var i = 0; i < this.indices.length; i++) {
            indexBuffer.push(this.indices[i] + this.vertexStartIndex);
        }
    }

    // Draws the mesh using the given gl context
    // gl : the gl context
    draw(gl) {
        if (this.vertexStartIndex == -1) {
            // not loaded
            console.log("Mesh not loaded");
            return;
        }

        // draw the mesh
        gl.drawElements(gl.TRIANGLES, this.indices.length, gl.UNSIGNED_SHORT, this.indexStartIndex * 2);
    }

}

// A representation of a mesh registry
// Stores a map of meshes
class MeshRegistry {
    // Creates a new MeshRegistry
    constructor() {
        this.meshes = new Map();
    }

    // Adds a mesh to the registry
    // name: the name of the mesh
    // mesh: the mesh to add
    addMesh(name, mesh) {
        this.meshes.set(name, mesh);
    }

    // Gets a mesh from the registry
    // name: the name of the mesh
    // returns the mesh
    getMesh(name) {
        return this.meshes.get(name);
    }

    // Loads a collection of meshes from an array of file paths, and adds them to the registry
    // filePaths: an array of file paths
    async loadMeshes(filePaths) {
        for (var i = 0; i < filePaths.length; i++) {
            await this.loadMesh(filePaths[i]);
        }
    }

    // Loads a mesh from a file, and adds it to the registry
    // name: the location of the mesh file
    // returns the mesh name to access the mesh from the registry
    async loadMesh(filePath) {
        // check if this file exists using fetch
        try {
            const response = await fetch(filePath);

            if (!response.ok) {
                throw new Error('Failed to load mesh: ' + filePath);
            }
            // load the mesh
            // get the mesh source from the resonse
            const source = await response.text();
            // parse the mesh
            let mesh = this.parseMesh(source);

            // get the name of the mesh
            let name = filePath.split("/")[filePath.split("/").length - 1];
            // remove the file extension
            name = name.split(".")[0];

            console.log("Loaded mesh: " + name);
            // add the mesh to the registry
            this.addMesh(name, mesh);
            return name;
        }
        catch (error) {
            console.log("Failed to load mesh: " + filePath);
            console.log(error);
        }
    }

    // Parses a mesh from a string
    // source: the string to parse the mesh from -- should be in the obj format
    // returns the mesh
    parseMesh(source) {
        let vertices = [];
        let normals = [];
        let indices = [];

        let lines = source.split("\n");

        for (var i = 0; i < lines.length; i++) {
            let line = lines[i];
            let tokens = line.split(" ");

            if (tokens[0] == "v") {
                // vertex
                let x = parseFloat(tokens[1]);
                let y = parseFloat(tokens[2]);
                let z = parseFloat(tokens[3]);
                let vertex = new Vector3([x, y, z]);
                vertices.push(vertex);
            }
            else if (tokens[0] == "vn") {
                // normal
                let x = parseFloat(tokens[1]);
                let y = parseFloat(tokens[2]);
                let z = parseFloat(tokens[3]);
                let normal = new Vector3([x, y, z]);
                normals.push(normal);
            }
            else if (tokens[0] == "f") {
                // face
                let v1 = parseInt(tokens[1].split("/")[0]) - 1;
                let v2 = parseInt(tokens[2].split("/")[0]) - 1;
                let v3 = parseInt(tokens[3].split("/")[0]) - 1;
                indices.push(v1);
                indices.push(v2);
                indices.push(v3);
            }
        }

        let mesh = new Mesh(vertices, normals, indices);
        // mesh.print();
        return mesh;
    }
}