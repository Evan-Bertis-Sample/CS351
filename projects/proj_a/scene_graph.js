// scene_graph.js
// A simple implementation of a scene graph
// Used to store the scene graph for the application

// A representation of a Transform in the scene graph
// Stores the position, rotation, and scale of the transform
class Transform {
    // Creates a new transform from the given position, rotation, and scale
    // position: a Vector3 representing the position of the transform
    // rotation: a Quaternion representing the rotation of the transform
    // scale: a Vector3 representing the scale of the transform
    constructor(position = null, rotation = null, scale = null, parent) {
        if (position == null) {
            position = new Vector3([0, 0, 0]);
        }

        if (rotation == null) {
            rotation = new Quaternion();
        }

        if (scale == null) {
            scale = new Vector3([1, 1, 1]);
        }
        
        this.position = position;
        this.rotation = rotation;
        this.scale = scale;
        this.parent = parent;
    }

    getWorldModelMatrix() {
        let modelMatrix = this.getLocalModelMatrix();
        if (this.parent == null) {
            // console.log("No parent");
            return modelMatrix;
        }

        let parentModelMatrix = this.parent.getWorldModelMatrix();
        let parentModelMatrixCopy = new Matrix4().set(parentModelMatrix);
        let worldModelMatrix = parentModelMatrixCopy.multiply(modelMatrix);
        return worldModelMatrix;
    }

    // Returns the model matrix for this transform
    getLocalModelMatrix() {
        // console.log("Local Model Matrix:");
        this.rotation.normalize();
        let rotationMatrix = new Matrix4().setFromQuat(this.rotation.x, this.rotation.y, this.rotation.z, this.rotation.w);
        // console.log("Rotation Matrix:");
        // rotationMatrix.printMe();

        let scaleMatrix = new Matrix4().setScale(this.scale.elements[0], this.scale.elements[1], this.scale.elements[2]);
        // console.log("Scale Matrix:");
        // scaleMatrix.printMe();

        let translationMatrix = new Matrix4().setTranslate(this.position.elements[0], this.position.elements[1], this.position.elements[2]);
        // console.log("Translation Matrix:");
        // translationMatrix.printMe();

        // scale, then rotate, then translate
        // translationMatrix * rotationMatrix * scaleMatrix
        let modelMatrix = translationMatrix.multiply(rotationMatrix.multiply(scaleMatrix));
        // console.log("Model Matrix:");
        // modelMatrix.printMe();
        return modelMatrix;
    }

    // Sets the position of this transform
    // position: a Vector3 representing the position of the transform
    setPosition(position) {
        this.position = position;
    }

    // Sets the rotation of this transform
    // rotation: a Quaternion representing the rotation of the transform
    setRotation(rotation) {
        this.rotation = rotation;
    }

    // Sets the rotation of this transform
    // pitch: the pitch of the rotation in degrees
    // yaw: the yaw of the rotation in degrees
    // roll: the roll of the rotation in degrees
    setRotationFromEulerAngles(pitch, yaw, roll) {
        this.rotation.setFromEuler(pitch, yaw, roll);
    }

    // Sets the rotation of this transform from a rotation matrix
    // rotationMatrix: a 4x4 rotation matrix
    setRotationFromMatrix(rotationMatrix) {
        this.rotation.setFromRotationMatrix(rotationMatrix);
    }

    // Sets the roation of this transform from an axis-angle representation
    // axis: a Vector3 representing the axis of rotation
    // angle: the angle of rotation in degrees
    setRotationFromAxisAngle(axis, angle) {
        this.rotation.setFromAxisAngle(axis.x, axis.y, axis.z, angle);
    }

    // Gets the world position of this transform
    getWorldPosition() {
        // get the model matrix
        let modelMatrix = this.getWorldModelMatrix();
        // get the world position
        let worldPosition = modelMatrix.multiplyVector4(new Vector4([0, 0, 0, 1]));

        // convert to a Vector3
        worldPosition = new Vector3([worldPosition.elements[0], worldPosition.elements[1], worldPosition.elements[2]]);
        return worldPosition;
    }

    // Gets the world rotation of this transform
    getWorldRotation() {
        // get the model matrix
        let modelMatrix = this.getWorldModelMatrix();
        // get the world rotation
        let worldRotation = new Quaternion();
        worldRotation.setFromRotationMatrix(modelMatrix);
        return worldRotation;
    }


}

// A representation of a GameObject in the scene graph
// Stores the transform, mesh, and material of the game object
class RenderInfo {
    // Creates a new RenderInfo
    // material: the material to use for rendering the mesh
    // mesh: the mesh to use for rendering
    constructor(material, mesh) {
        if (material == null) {
            material = "NONE";
        }
        if (mesh == null) {
            mesh = "NONE";
        }
        this.material = material;
        this.mesh = mesh;
        this.bufferID = null;
    }

    // Sets the material of this RenderInfo
    // material: the material to use for rendering the mesh -- name of the material
    setMaterial(material) {
        this.material = material;
    }

    // Sets the mesh of this RenderInfo
    // mesh: the mesh to use for rendering
    setMesh(mesh) {
        this.mesh = mesh;
    }
}

// A node in the scene graph
// Stores the render info and transform of the node
class SceneNode {
    // Creates a new SceneNode
    // renderInfo: the RenderInfo to use for rendering this node
    // transform: the Transform to use for rendering this node
    constructor(renderInfo, transform) {
        if (renderInfo == null) {
            renderInfo = new RenderInfo(null, null);
        }
        if (transform == null) {
            transform = new Transform();
        }
        this.renderInfo = renderInfo;
        this.transform = transform;
        this.children = [];
        this.parent = null;
    }

    // Sets the parent of this SceneNode
    // parent: the parent to use for this SceneNode
    setParent(parent) {
        this.parent = parent;
        this.transform.parent = parent.transform;
    }

    // Sets the render info of this SceneNode
    // renderInfo: the RenderInfo to use for rendering this node
    setRenderInfo(renderInfo) {
        this.renderInfo = renderInfo;
    }

    // Sets the transform of this SceneNode
    // transform: the Transform to use for rendering this node
    setTransform(transform) {
        this.transform = transform;
    }

    // Adds children to this SceneNode
    // children: the children to add to this SceneNode
    // returns the SceneNode
    addChildren(children) {
        for (var i = 0; i < children.length; i++) {
            this.addChild(children[i]);
        }
        return this;
    }

    // Adds a child to this SceneNode
    // child: the child to add to this SceneNode
    // returns the child so you can nest addChildren calls
    addChild(child) {
        child.setParent(this);
        this.children.push(child);
        return child;
    }

    // Removes a child from this SceneNode
    // child: the child to remove from this SceneNode
    removeChild(child) {
        this.children = this.children.filter(function (value, index, arr) {
            return value != child;
        });

        child.parent = null;
    }

    // Returns the model matrix for this SceneNode
    // Note : This is a decently expensive operation, so use sparingly, especially if the scene graph is large
    // It is best to traverse the scene graph and use the model matrix of the node you are currently on
    getModelMatrix() {
        if (this.parent == null) {
            return this.transform.getModelMatrix();
        } else {
            return this.parent.getModelMatrix().multiply(this.transform.getModelMatrix());
        }
    }
}

// A representation of a scene graph
// Stores the root node of the scene graph
class SceneGraph {
    // Creates a new SceneGraph
    // root: the root node of the scene graph
    constructor() {
        this.root = new SceneNode(null, new Transform());
        this.camera = this.root.addChild(new SceneNode(null, new Transform()));
        this.projectionMatrix = new Matrix4();
        this.projectionMatrix.setPerspective(
            c_CAMERA_SETTINGS.fov,
            c_VIEWPORT_WIDTH / c_VIEWPORT_HEIGHT,
            c_CAMERA_SETTINGS.near,
            c_CAMERA_SETTINGS.far
        );
        this.viewMatrix = new Matrix4();
    }

    // Gets the view matrix of the scene graph
    // returns the view matrix
    getViewMatrix() {
        // using the camera node, get the view matrix
        let position = this.camera.transform.position;
        let rotation = this.camera.transform.rotation;

        // construct the view matrix
        let viewMatrix = new Matrix4();
        viewMatrix.setFromQuat(rotation.x, rotation.y, rotation.z, rotation.w);
        viewMatrix.translate(-position.elements[0], -position.elements[1], -position.elements[2]);
        return viewMatrix;
    }

    // gets the projection matrix of the scene graph
    // returns the projection matrix
    getProjectionMatrix() {
        return this.projectionMatrix;
    }

    // Traverses the scene graph
    // callback: the function to call on each node, takes in a TransformNode, and the model matrix of the node
    traverse(callback) {
        // push an identity matrix to the matrix stack
        // this is the model matrix of the root node
        let identityMatrix = new Matrix4();
        this._traverseHelper(this.root, callback, identityMatrix, 0);
    }

    // Helper function for traversing the scene graph
    // node: the node to traverse
    // callback: the function to call on each node, takes in a TransformNode, and the model matrix of the node
    // parentModelMatrix: the model matrix of the parent node
    _traverseHelper(node, callback, parentModelMatrix, depth) {
        let localModelMatrix = node.transform.getLocalModelMatrix();
        let modelMatrix = parentModelMatrix.multiply(localModelMatrix);
        // console.log("Depth: " + depth);
        // console.log(node);
        // modelMatrix.printMe();
        callback(node, modelMatrix, depth);
        for (var i = 0; i < node.children.length; i++) {
            let modelMatrixCopy = new Matrix4().set(modelMatrix)
            this._traverseHelper(node.children[i], callback, modelMatrixCopy, depth + 1);
        }
    }

    // Adds children to the scene
    // NOTE: as of now, the children are added to the camera node -- this will probably change in the future
    // object : the scenenode to add to the scene
    // returns the SceneNode
    addObjects(children) {
        this.root.addChildren(children);
        return this;
    }

    // Adds a child to the scene
    // NOTE: as of now, the child is added to the camera node -- this will probably change in the future
    // child: the child to add to the scene
    // returns the child so you can nest addChildren calls
    addObject(child) {
        this.root.addChild(child);
        return child;
    }

    // Prints the scene graph to the console
    print() {
        console.log("Scene Graph:");
        this._printHelper(this.root, 0);
    }

    // Helper function for printing the scene graph
    // node: the node to print
    // depth: the depth of the node in the scene graph
    _printHelper(node, depth) {
        let indent = "";
        for (var i = 0; i < depth; i++) {
            indent += "    ";
        }
        console.log(indent + "Node:");
        console.log(indent + "    RenderInfo:");
        console.log(indent + "        Material: " + node.renderInfo.material);
        console.log(indent + "        Mesh: " + node.renderInfo.mesh);
        console.log(indent + "    Transform:");
        console.log(indent + "        Position: " + node.transform.position.elements);
        console.log(indent + "        Rotation: " + "x : " + node.transform.rotation.x + ", y : " + node.transform.rotation.y + ", z : " + node.transform.rotation.z + ", w : " + node.transform.rotation.w);
        console.log(indent + "        Scale: " + node.transform.scale.elements);
        for (var i = 0; i < node.children.length; i++) {
            this._printHelper(node.children[i], depth + 1);
        }
    }

    // CAMERA FUNCTIONS
    // These functions are used to manipulate the camera in the scene graph
    // The camera is the first child of the root node

    // Sets the position of the camera
    // position: a Vector3 representing the position of the camera
    setCameraPosition(position) {
        // reverse the position
        this.camera.transform.position = position;
    }

    // Sets the rotation of the camera
    // rotation: a Quaternion representing the rotation of the camera
    setCameraRotation(rotation) {
        // rotation.printMe();
        this.camera.transform.rotation = rotation;
    }

    // Sets the rotation of the camera
    // pitch: the pitch of the rotation in degrees
    // yaw: the yaw of the rotation in degrees
    // roll: the roll of the rotation in degrees
    setCameraRotationFromEulerAngles(pitch, yaw, roll) {
        let rotation = new Quaternion();
        rotation.setFromEuler(pitch, yaw, roll);
        this.setCameraRotation(rotation);
    }

    // rotationMatrix: a 4x4 rotation matrix
    setCameraRotationFromMatrix(rotationMatrix) {
        let rotation = new Quaternion();
        rotation.setFromRotationMatrix(rotationMatrix);
        this.setCameraRotation(rotation);
    }

    // Sets the roation of the camera from an axis-angle representation
    // axis: a Vector3 representing the axis of rotation
    // angle: the angle of rotation in degrees
    setCameraRotationFromAxisAngle(axis, angle) {
        let rotation = new Quaternion();
        rotation.setFromAxisAngle(axis.x, axis.y, axis.z, angle);
        this.setCameraRotation(rotation);
    }

    // Gets the camera position
    // returns a Vector3 representing the camera position
    getCameraPosition() {
        return this.camera.transform.position;
    }

    // Gets the camera rotation
    // returns a Quaternion representing the camera rotation
    getCameraRotation() {
        // inverse the rotation
        let rotation = new Quaternion();
        rotation.x = this.camera.transform.rotation.x;
        rotation.y = this.camera.transform.rotation.y;
        rotation.z = this.camera.transform.rotation.z;
        rotation.w = this.camera.transform.rotation.w;
        rotation.inverse();
        return rotation;
    }
}

// Some helper functions for the scene graph
// These functions are used to create the scene graph

// Creates a new SceneNode with the given mesh, materials, and position, scale, and rotation
// meshName: the mesh to use for rendering this node : name of the mesh
// materialName: the material to use for rendering this node : name of the material
// position: the position of this node -- defaults to [0, 0, 0]
// scale: the scale of this node -- defaults to [1, 1, 1]
// rotation: the rotation of this node -- defaults to identity quaternion
function createObject(meshName = "", materialName = "", position = null, rotation = null, scale = null) {
    let renderInfo = new RenderInfo(materialName, meshName);
    let transform = new Transform(position, rotation, scale);
    return new SceneNode(renderInfo, transform);
}     