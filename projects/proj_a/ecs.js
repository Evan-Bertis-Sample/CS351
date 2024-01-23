// ecs.js
// The entity component system
// Built half-hazardly ontop of the scene graph
// Each entity is a node in the scene graph, and each component is able to access the node's transform

// Component
// Defines an interface for a component
// Each component has access to the node's transform
class Component {
    // Attaches a node to a component
    attachNode(node) {
        if (this.node != undefined)
        {
            console.log("Warning: Attaching a node to a component that already has a node attached");
        }

        this.node = node;
        this.transform = node.transform;
    }

    // Start is called before the first frame update
    start() {
        // do nothing
    }

    // Updates the component
    // deltaTime : the time since the last frame
    update(deltaTime) {
        // do nothing
    }
}

// Entity
// Ties a list of components to a node in the scene graph
class Entity {
    constructor(name, node) {
        this.name = name;
        this.node = node;
        this.components = [];
    }

    // Gets the transform of the entity
    getTransform() {
        return this.node.transform;
    }

    // Attaches a component to this entity
    // component : the component to attach
    attachComponent(component) {
        component.attachNode(this.node);
        this.components.push(component);
    }

    // Gets the component of the given type
    // type : the type of the component
    getComponent(type) {
        for (let i = 0; i < this.components.length; i++) {
            if (this.components[i] instanceof type) {
                return this.components[i];
            }
        }

        return null;
    }

    // Adds a child to the entity
    // child : the child to add
    addChild(child) {
        // check if the child is an entity
        if (!(child instanceof Entity)) {
            console.log("Warning: child is not an entity");
            return;
        }
        this.node.addChild(child);
    }

    // Start is called before the first frame update
    start() {
        for (let i = 0; i < this.components.length; i++) {
            this.components[i].start();
        }
    }

    // Updates the entity
    // deltaTime : the time since the last frame
    update(deltaTime) {
        for (let i = 0; i < this.components.length; i++) {
            this.components[i].update(deltaTime);
        }
    }
}

// ECS is the entity component system
// It is tied to the scene graph
class ECS {
    constructor(sceneGraph) {
        this.sceneGraph = sceneGraph;
        this.entities = {};

        // add the camera to the entity list
        this.addEntity("camera", new Entity("camera", this.sceneGraph.camera));
    }

    // Creates a new entity
    // name : the name of the entity
    // parent : the parent of the entity
    // position : the position of the entity
    // rotation : the rotation of the entity
    // scale : the scale of the entity
    // meshName : the mesh to attach to the entity
    // materialName : the material to attach to the entity
    // components : the components to attach to the entity
    createEntity(entityName = "", parent = null, position = null, rotation = null, scale = null, meshName = "", materialName = "", components = new Array()) {
        if (entityName == "")
        {
            // create a new name from a GUID
            entityName = generateUUID();
        }
        // create the node
        let node = createObject(meshName, materialName, position, rotation, scale);
        // now create the entity
        let entity = new Entity(entityName, node);
        // attach the components
        for (let i = 0; i < components.length; i++) {
            // assert that the component is a component
            if (!(components[i] instanceof Component)) {
                console.log("Warning: component is not a component");
                continue;
            }
            entity.attachComponent(components[i]);
        }
        // add the entity to the ECS
        this.addEntity(entityName, entity);

        // add the entity to the scene graph
        if (parent != null) {  
            // check if the parent is an entity
            if (!(parent instanceof Entity)) {
                console.log("Warning: parent is not an entity");
                return;
            }

            let parentNode = parent.node;
            parentNode.addChild(node);
        }
        else
        {
            this.sceneGraph.addObject(node);
        }
        return entity;
    }

    // Adds an entity to the ECS
    // name : the name of the entity
    // entity : the entity to add
    addEntity(name, entity) {
        this.entities[name] = entity;
    }

    // Gets an entity from the ECS
    // name : the name of the entity
    getEntity(name) {
        return this.entities[name];
    }

    // Starts the ECS
    start() {
        for (let key in this.entities) {
            this.entities[key].start();
        }
    }

    // Updates the ECS
    // deltaTime : the time since the last frame
    update(deltaTime) {
        for (let key in this.entities) {
            this.entities[key].update(deltaTime);
        }
    }
}

// COMPONENTS

// bobbing component
// makes an object bob up and down
class BobComponent extends Component {
    constructor(amplitude = 1, frequency = 1) {
        super();
        this.amplitude = amplitude;
        this.frequency = frequency;
        this.time = 0;
    }

    // Updates the component
    // deltaTime : the time since the last frame
    update(deltaTime) {
        this.time += deltaTime;
        let offset = Math.sin(this.time * this.frequency) * this.amplitude;
        this.transform.position.elements[1] = offset;
    }
}

// rotate component
// makes an object rotate about an axis
class RotateComponent extends Component {
    constructor(axis = new Vector3([0, 1, 0]), speed = 1) {
        super();
        this.axis = axis;
        this.speed = speed;
    }

    // Updates the component
    // deltaTime : the time since the last frame
    update(deltaTime) {
        let rotation = new Quaternion().setFromAxisAngle(this.axis.elements[0], this.axis.elements[1], this.axis.elements[2], this.speed * deltaTime);
        this.transform.rotation = rotation.multiplySelf(this.transform.rotation);
    }
}   

class CameraControllerComponent extends Component {
    constructor(movementAxisSet = AxisSets.WASD_KEYS_KEYS, movementSpeed = 1, roationAxisSet = AxisSets.MOUSE_MOVEMENT, rotationSpeed = 1) {
        super();
        this.movementAxisSet = movementAxisSet;
        this.movementSpeed = movementSpeed;
        this.rotationAxisSet = roationAxisSet;
        this.rotationSpeed = rotationSpeed;
    }

    // Updates the component
    // deltaTime : the time since the last frame
    update(deltaTime) {
        let axis = g_inputManager.getAxis(this.movementAxisSet);
        // the axis is a vector3 with the direction of movement at x,y
        // we want to make it a vector3 with the direction of movement at x,z
        axis.elements[2] = axis.elements[1];
        axis.elements[1] = 0;
        let moveAmount = deltaTime * this.movementSpeed;
        let oldPosition = this.transform.position;
        let newPosition = new Vector3(
            [
                // must negate the movement because the camera is the parent of the scene graph
                // so moving the camera forward is actually moving the scene graph backwards
                oldPosition.elements[0] + axis.elements[0] * moveAmount,
                oldPosition.elements[1] + axis.elements[1] * moveAmount,
                oldPosition.elements[2] - axis.elements[2] * moveAmount,
            ]
        )
        this.transform.position = newPosition;


        // // now handle rotation
        // let rotationAxis = g_inputManager.getAxis(this.rotationAxisSet);
        // // if the mouse hasn't moved, don't rotate
        // if (rotationAxis.elements[0] == 0 || rotationAxis.elements[1] == 0) {
        //     return;
        // }
        // let rotationAmount = deltaTime * this.rotationSpeed;
        // let oldRotation = this.transform.rotation;
        // rotationAxis = rotationAxis.normalize();
        // let newRotation = new Quaternion().setFromAxisAngle(rotationAxis.elements[1], rotationAxis.elements[0], 0, rotationAmount);
        // let defaultRotation = c_CAMERA_STARTING_ROTATION;
        // // newRotation = newRotation.multiplySelf(defaultRotation);
        // newRotation = newRotation.multiplySelf(oldRotation);
        // this.transform.rotation = newRotation;
    }
}

class FollowEntityComponent extends Component {
    constructor(entityName = "", offset = new Vector3([0, 0, 0])) {
        super();
        this.entityName = entityName;
        this.offset = offset;
    }

    // Updates the component
    // deltaTime : the time since the last frame
    update(deltaTime) {
        let entity = g_ecs.getEntity(this.entityName);
        if (entity == null) {
            console.log("Warning: entity is null");
            return;
        }

        let entityPosition = entity.getTransform().position;
        if (entityPosition == null) {
            console.log("Warning: entity position is null");
            return;
        }

        let newPosition = new Vector3(
            [
                entityPosition.elements[0] + this.offset.elements[0],
                entityPosition.elements[1] + this.offset.elements[1],
                entityPosition.elements[2] + this.offset.elements[2],
            ]
        )

        this.transform.position = newPosition;
    }
}

class FollowCameraComponent extends Component {
    constructor(offset = new Vector3([0, 0, 0])) {
        super();
        this.offset = offset;
    }

    // Updates the component
    // deltaTime : the time since the last frame
    update(deltaTime) {
        let cameraPosition = g_sceneGraph.getCameraPosition();
        if (cameraPosition == null) {
            console.log("Warning: camera position is null");
            return;
        }
        console.log("Camera position: " + cameraPosition.elements[0] + ", " + cameraPosition.elements[1] + ", " + cameraPosition.elements[2]);
        
        let newPosition = new Vector3(
            [
                cameraPosition.elements[0] + this.offset.elements[0],
                cameraPosition.elements[1] + this.offset.elements[1],
                cameraPosition.elements[2] + this.offset.elements[2],
            ]
        )
        console.log("New position: " + newPosition.elements[0] + ", " + newPosition.elements[1] + ", " + newPosition.elements[2]);
        this.transform.position = newPosition;

        let cameraRotation = g_sceneGraph.getCameraRotation();
        if (cameraRotation == null) {
            console.log("Warning: camera rotation is null");
            return;
        }

        // this.transform.rotation = cameraRotation;
    }
}