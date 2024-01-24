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
    constructor(movementAxisSet = AxisSets.WASD_KEYS_KEYS, movementSpeed = 1, rotationSpeed = 1, leanAmount = 10, originalRotation = new Quaternion()) {
        super();
        this.movementAxisSet = movementAxisSet;
        this.movementSpeed = movementSpeed;
        this.rotationSpeed = rotationSpeed;
        this.originalRotation = originalRotation;
        this.previousTheta = 0;
        this.leanAmount = leanAmount;
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

        // rotates towards the movement direction on the y axis
        let theta = Math.atan2(axis.elements[0], -axis.elements[2]);
        theta = theta * 180 / Math.PI;

        if (axis.elements[0] == 0 && axis.elements[2] == 0) {
            theta = this.previousTheta;
        }
        this.previousTheta = theta;

        let leanAmount = this.leanAmount;
        if (axis.elements[0] == 0 && axis.elements[2] == 0) {
            leanAmount = 0;
        }

        // first, get the rotation that would make the robot face the direction of movement
        let yRotation = new Quaternion().setFromAxisAngle(0, 1, 0, theta);
        yRotation = yRotation.multiplySelf(this.originalRotation);
        // create a rotation that leans towards the new rotation
        // meaning that the back of the robot is higher than the front
        // this is done by lerping between the current rotation and the new rotation
        let iKLean = new Quaternion().setFromAxisAngle(0, 0, 1, leanAmount).multiplySelf(this.originalRotation);
        iKLean = new Quaternion().multiply(this.originalRotation, iKLean);
        yRotation = new Quaternion().multiply(yRotation, iKLean);
        let output = new Quaternion();
        Quaternion.slerp(this.transform.rotation, yRotation, output, this.rotationSpeed * deltaTime);
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
        let difference = entityPosition.sub(this.transform.position).add(this.offset);

        if (difference.length() < this.deadZone) {
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
            this.cameraVelocity.mulSelf(0.9);
            return;
        }

        // idk why doing vector3.add doesn't work here
        let newPosition = new Vector3(
            [
                entityPosition.elements[0] + this.offset.elements[0],
                entityPosition.elements[1] + this.offset.elements[1],
                entityPosition.elements[2] + this.offset.elements[2],
            ]
        )

        // samething with vector3.lerp
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

        this.cameraVelocity = lerpedPosition.sub(this.transform.position).mul(1 / deltaTime);

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
    constructor(upperLegEntityID, lowerLegEntityID, groundY, speed = 1, idealMarkerEntityID = null, actualMarkerEntityID = null) {
        super();
        this.upperLegEntityID = upperLegEntityID;
        this.lowerLegEntityID = lowerLegEntityID;
        this.idealMarkerEntityID = idealMarkerEntityID;
        this.actualMarkerEntityID = actualMarkerEntityID;
        this.groundY = groundY;
        this.speed = speed;
        this.time = 0;
        this.upperLegEntity = null;
        this.lowerLegEntity = null;

        this.stepDistance = 1;
    }

    // Start is called before the first frame update
    start() {
        this.upperLegEntity = g_ecs.getEntity(this.upperLegEntityID);
        this.lowerLegEntity = g_ecs.getEntity(this.lowerLegEntityID);
        this.idealMarkerEntity = g_ecs.getEntity(this.idealMarkerEntityID);
        this.actualMarkerEntity = g_ecs.getEntity(this.actualMarkerEntityID);
        this.idealPosition = this.calculateIdealFootPlacementPosition();
        this.actualPosition = this.idealPosition;

        this.moving = false;
        this.movementProgress = 0;
        this.startingFootRaisePosition = this.actualPosition;
        this.endingFootRaisePosition = this.actualPosition;
    }

    // Updates the component
    // deltaTime : the time since the last frame
    update(deltaTime) {
        // update the foot placement position
        let idealFootPosition = this.calculateIdealFootPlacementPosition();
        this.idealPosition = idealFootPosition;

        // slowly move the end position to the ideal position
        this.endingFootRaisePosition = this.endingFootRaisePosition.lerp(idealFootPosition, deltaTime * 0.1);

        let idealDistance = idealFootPosition.distanceTo(this.actualPosition);
        let nextStepDistance = this.endingFootRaisePosition.distanceTo(this.actualPosition);
        console.log("Distance: " + idealDistance);
        console.log("Next step distance: " + nextStepDistance);

        // start a step if we are far enough away
        if (idealDistance > this.stepDistance && this.moving == false) {
            // snap to the ideal position
            this.moving = true;
            this.movementProgress = 0;
            this.startingFootRaisePosition = this.actualPosition;
            this.endingFootRaisePosition = idealFootPosition;
            return;
        }

        // stop moving if we are close enough
        if (nextStepDistance < this.stepDistance && this.moving == true) {
            // snap to the step position
            this.actualPosition = this.endingFootRaisePosition;
            this.moving = false;
            this.movementProgress = 0;
            this.startingFootRaisePosition = this.actualPosition;
            this.endingFootRaisePosition = this.actualPosition;
        }

        // move the foot
        if (this.moving == true) {
            // lerp between the current position and the ideal position
            this.movementProgress += deltaTime * 0.1;
            console.log("Movement progress: " + this.movementProgress);
            this.actualPosition = this.parabolicLerp(this.startingFootRaisePosition, this.endingFootRaisePosition, 1, 1);
        }
    

        this.updateGizmos();
    }

    // Lerps between two points using a parabolic curve
    // this parabolic curve moves the y value up, then down
    // a : the first point
    // b : the second point
    // h : the arch height of the parabola
    // t : the time
    parabolicLerp(a, b, h, t) {
        let linear = a.lerp(b, t);
        return linear;
    }

    updateGizmos()
    {
        if (this.idealMarkerEntity != null) {
            this.idealMarkerEntity.getTransform().position = this.idealPosition;
        }
        if (this.actualMarkerEntity != null) {
            this.actualMarkerEntity.getTransform().position = this.actualPosition;
        }
    }

    calculateIdealFootPlacementPosition() {
        // representation of the foot placement position
        let upperLegWorldPosition = this.upperLegEntity.node.transform.getWorldPosition();
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