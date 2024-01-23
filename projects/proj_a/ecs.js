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

// Component used for debugging...
class PlayerController extends Component {
    constructor(movementAxisSet = AxisSets.WASD_KEYS_KEYS, movementSpeed = 1, rotationSpeed = 1, originalRotation = new Quaternion()) {
        super();
        this.movementAxisSet = movementAxisSet;
        this.movementSpeed = movementSpeed;
        this.rotationSpeed = rotationSpeed;
        this.originalRotation = originalRotation;
    }

    // Updates the component
    // deltaTime : the time since the last frame
    update(deltaTime) {
        let axis = g_inputManager.getAxis(this.movementAxisSet);

        // if the axis is zero, don't do anything
        if (axis.elements[0] == 0 && axis.elements[1] == 0) {
            return;
        }
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

        // rotates towards the movement direction
        // make a look at matrix
        let lookAtMatrix = new Matrix4().setLookAt(
            newPosition.elements[0], newPosition.elements[1], newPosition.elements[2],
            oldPosition.elements[0], oldPosition.elements[1], oldPosition.elements[2],
            0, 1, 0
        )
        // lookAtMatrix.printMe();
        // create a quaternion from the look at matrix
        let rotation = new Quaternion().setFromRotationMatrix(lookAtMatrix);
        rotation = rotation.multiplySelf(this.originalRotation);
        // slerp between the current rotation and the new rotation
        let output = new Quaternion();
        Quaternion.slerp(this.transform.rotation, rotation, output, this.rotationSpeed * deltaTime);
        this.transform.rotation = output;
    }
}

class CameraController extends Component {
    constructor(entityName = "", offset = new Vector3([0, 0, 0]), lerpSpeed = 0.1, deadZone = 0.1) {
        super();
        this.entityName = entityName;
        this.offset = offset;
        this.lerpSpeed = lerpSpeed;
        this.deadZone = deadZone;
        this.cameraVelocity = new Vector3([0, 0, 0]);
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

        // check if the entity is within the deadzone
        let difference = new Vector3(
            [
                entityPosition.elements[0] - this.transform.position.elements[0] + this.offset.elements[0],
                entityPosition.elements[1] - this.transform.position.elements[1] + this.offset.elements[1],
                entityPosition.elements[2] - this.transform.position.elements[2] + this.offset.elements[2],
            ]
        )

        const mag = (v) => Math.sqrt(v.elements[0] * v.elements[0] + v.elements[1] * v.elements[1] + v.elements[2] * v.elements[2]);
        if (mag(difference) < this.deadZone) {
            // console.log("Within deadzone");
            // still add the velocity
            let newPosition = new Vector3(
                [
                    this.transform.position.elements[0] + this.cameraVelocity.elements[0] * deltaTime,
                    this.transform.position.elements[1] + this.cameraVelocity.elements[1] * deltaTime,
                    this.transform.position.elements[2] + this.cameraVelocity.elements[2] * deltaTime,
                ]
            )
            this.transform.position = newPosition;

            // dampen the velocity
            this.cameraVelocity.elements[0] *= 0.9;
            this.cameraVelocity.elements[1] *= 0.9;
            this.cameraVelocity.elements[2] *= 0.9;
            return;
        }

        let newPosition = new Vector3(
            [
                entityPosition.elements[0] + this.offset.elements[0],
                entityPosition.elements[1] + this.offset.elements[1],
                entityPosition.elements[2] + this.offset.elements[2],
            ]
        )

        const lerp = (a, b, t) => (1 - t) * a + t * b;

        // lerp between the current position and the new position
        let currentPosition = this.transform.position;
        let lerpAmount = this.lerpSpeed * deltaTime;
        let lerpedPosition = new Vector3(
            [
                lerp(currentPosition.elements[0], newPosition.elements[0], lerpAmount),
                this.transform.position.elements[1],
                lerp(currentPosition.elements[2], newPosition.elements[2], lerpAmount),
            ]
        )

        this.cameraVelocity = new Vector3(
            [
                (lerpedPosition.elements[0] - currentPosition.elements[0]) / deltaTime,
                (lerpedPosition.elements[1] - currentPosition.elements[1]) / deltaTime,
                (lerpedPosition.elements[2] - currentPosition.elements[2]) / deltaTime,
            ]
        )

        this.transform.position = lerpedPosition;
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
        // console.log("Camera position: " + cameraPosition.elements[0] + ", " + cameraPosition.elements[1] + ", " + cameraPosition.elements[2]);
        
        let newPosition = new Vector3(
            [
                cameraPosition.elements[0] + this.offset.elements[0],
                cameraPosition.elements[1] + this.offset.elements[1],
                cameraPosition.elements[2] + this.offset.elements[2],
            ]
        )
        // console.log("New position: " + newPosition.elements[0] + ", " + newPosition.elements[1] + ", " + newPosition.elements[2]);
        this.transform.position = newPosition;

        let cameraRotation = g_sceneGraph.getCameraRotation();
        if (cameraRotation == null) {
            console.log("Warning: camera rotation is null");
            return;
        }

        // this.transform.rotation = cameraRotation;
    }
}

class RobotLegCompoent extends Component {
    // Constructor
    constructor(upperLegEntityID, lowerLegEntityID, groundY, speed = 1, footPositionMarkerEntityID = null) {
        super();
        this.upperLegEntityID = upperLegEntityID;
        this.lowerLegEntityID = lowerLegEntityID;
        this.footPositionMarkerID = footPositionMarkerEntityID;
        this.groundY = groundY;
        this.speed = speed;
        this.time = 0;
        this.upperLegEntity = null;
        this.lowerLegEntity = null;
    }

    // Start is called before the first frame update
    start() {
        this.upperLegEntity = g_ecs.getEntity(this.upperLegEntityID);
        this.lowerLegEntity = g_ecs.getEntity(this.lowerLegEntityID);
        this.footPositionMarkerEntity = g_ecs.getEntity(this.footPositionMarkerID);
        this.footPlacementPosition = this.calculateIdealFootPlacementPosition();
        this.footVelocity = new Vector3([0, 0, 0]);
    }

    // Updates the component
    // deltaTime : the time since the last frame
    update(deltaTime) {
        // update the foot placement position
        let idealFootPosition = this.calculateIdealFootPlacementPosition();
        const mag = (v) => Math.sqrt(v.elements[0] * v.elements[0] + v.elements[1] * v.elements[1] + v.elements[2] * v.elements[2]);
        const add = (a, b) => new Vector3([a.elements[0] + b.elements[0], a.elements[1] + b.elements[1], a.elements[2] + b.elements[2]]);
        const subtract = (a, b) => new Vector3([a.elements[0] - b.elements[0], a.elements[1] - b.elements[1], a.elements[2] - b.elements[2]]);
        const lerp = (a, b, t) => (1 - t) * a + t * b;
        const lerpVector = (a, b, t) => new Vector3([lerp(a.elements[0], b.elements[0], t), lerp(a.elements[1], b.elements[1], t), lerp(a.elements[2], b.elements[2], t)]);
        const multiply = (a, b) => new Vector3([a.elements[0] * b, a.elements[1] * b, a.elements[2] * b]);
        let difference = subtract(idealFootPosition, this.footPlacementPosition);
        let distance = mag(difference);

        if (distance > 0.01)
        {
            // snap to the ideal position
            let lerpedPosition = lerpVector(this.footPlacementPosition, idealFootPosition, 0.8);
            this.footVelocity = new Vector3(
                [
                    (lerpedPosition.elements[0] - this.footPlacementPosition.elements[0]) / deltaTime,
                    (lerpedPosition.elements[1] - this.footPlacementPosition.elements[1]) / deltaTime,
                    (lerpedPosition.elements[2] - this.footPlacementPosition.elements[2]) / deltaTime,
                ]
            )
            this.footPlacementPosition = lerpedPosition;
        }
        else {
            // carry the velocity
            let newPosition = add(this.footPlacementPosition, multiply(this.footVelocity, deltaTime));
            // dampen the velocity
            this.footVelocity = multiply(this.footVelocity, 0.5);  
            this.footPlacementPosition = newPosition;
        }

        if (this.footPositionMarkerEntity != null) {
            this.footPositionMarkerEntity.getTransform().position = this.footPlacementPosition;
        }

        this.time += deltaTime;
        let offset = Math.sin(this.time * this.speed) * 0.5 + 0.5;
        let upperLegRotation = new Quaternion().setFromAxisAngle(1, 0, 0, offset * 90);
        this.upperLegEntity.getTransform().rotation = upperLegRotation;
        let lowerLegRotation = new Quaternion().setFromAxisAngle(1, 0, 0, -offset * 90);
        this.lowerLegEntity.getTransform().rotation = lowerLegRotation;
    }

    calculateIdealFootPlacementPosition() {
        // representation of the foot placement position
        let upperLegWorldPosition = this.upperLegEntity.node.transform.getWorldPosition();
        upperLegWorldPosition.printMe();
        let idealPosition = new Vector3(
            [
                upperLegWorldPosition.elements[0],
                this.groundY,
                upperLegWorldPosition.elements[2],
            ]
        );

        return idealPosition;
    }

}