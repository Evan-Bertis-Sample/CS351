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
        if (this.node != undefined) {
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
        if (entityName == "") {
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
        else {
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

    start()
    {
        this.startY = this.transform.position.elements[1];
    }

    // Updates the component
    // deltaTime : the time since the last frame
    update(deltaTime) {
        this.time += deltaTime;
        let offset = Math.sin(this.time * this.frequency) * this.amplitude;
        this.transform.position.elements[1] = this.startY + offset;
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


const ACTIVE_LEG_SET = {
    EVEN: 0,
    ODD: 1,
    ALL: 2,
    NONE: 3,
}

class RobotLegOrchestratorComponent extends Component {
    // Constructor
    constructor(legIDs) {
        super();
        this.legIDs = legIDs;
        this.legs = new Array();
        this.legComponents = new Array();
        this.activeLegSet = ACTIVE_LEG_SET.EVEN;
        this.timeSinceLastSwitch = 0;
        this.minSwitchTime = 2;
    }

    // Start is called before the first frame update
    start() {
        for (let i = 0; i < this.legIDs.length; i++) {
            let leg = g_ecs.getEntity(this.legIDs[i]);
            if (leg == null) {
                console.log("Warning: leg is null");
                continue;
            }
            this.legs.push(leg);
            let legComponent = leg.getComponent(RobotLegCompoent);
            if (legComponent == null) {
                console.log("Warning: leg component is null");
                continue;
            }
            this.legComponents.push(legComponent);
        }

        this.activeLegSet = ACTIVE_LEG_SET.EVEN;
        this.setLegStates(this.activeLegSet);
    }

    // Updates the component
    // deltaTime : the time since the last frame
    update(deltaTime) {
        // console.log("Active leg set: " + this.activeLegSet);
        // console.log("Time since last switch: " + this.timeSinceLastSwitch)
        let checkIndex = 0;
        if (this.activeLegSet == ACTIVE_LEG_SET.EVEN || this.activeLegSet == ACTIVE_LEG_SET.ALL) {
            checkIndex = 0;
        }
        else if (this.activeLegSet == ACTIVE_LEG_SET.ODD || this.activeLegSet == ACTIVE_LEG_SET.NONE) {
            checkIndex = 1;
        }

        // check if the legs in the active set is moving
        let isMoving = false;
        for (let i = 0; i < this.legComponents.length; i++) {
            if (i % 2 != checkIndex) {
                continue;
            }

            if (this.legComponents[i].moving == true) {
                isMoving = true;
                break;
            }
        }

        // if (this.timeSinceLastSwitch > this.minSwitchTime) {
        //     this.setLegStates(ACTIVE_LEG_SET.ALL);
        //     this.timeSinceLastSwitch = 0;
        //     return;
        // }

        // now if all the legs are done moving, switch the active leg set
        if (isMoving == false) {
            if (this.activeLegSet == ACTIVE_LEG_SET.EVEN) {
                this.activeLegSet = ACTIVE_LEG_SET.ODD;
            }
            else if (this.activeLegSet == ACTIVE_LEG_SET.ODD) {
                this.activeLegSet = ACTIVE_LEG_SET.EVEN;
            }
            else if (this.activeLegSet == ACTIVE_LEG_SET.ALL) {
                this.activeLegSet = ACTIVE_LEG_SET.EVEN;
            }
            else if (this.activeLegSet == ACTIVE_LEG_SET.NONE) {
                this.activeLegSet = ACTIVE_LEG_SET.ODD;
            }
            this.setLegStates(this.activeLegSet);
            this.timeSinceLastSwitch = 0;
        }
        else {
            this.timeSinceLastSwitch += deltaTime;
        }
    }

    setLegStates(state) {
        const isValidState = (index) => {
            if (state == ACTIVE_LEG_SET.EVEN) {
                return index % 2 == 0;
            }
            else if (state == ACTIVE_LEG_SET.ODD) {
                return index % 2 == 1;
            }
            else if (state == ACTIVE_LEG_SET.ALL) {
                return true;
            }
            else if (state == ACTIVE_LEG_SET.NONE) {
                return false;
            }
        }

        for (let i = 0; i < this.legComponents.length; i++) {
            // console.log("Setting leg " + i + " to " + isValidState(i));
            this.legComponents[i].allowStep = isValidState(i);
        }
    }
}

class RobotLegCompoent extends Component {
    // Constructor
    constructor(upperLegEntityID, lowerLegEntityID, pelvisID, kneeEntityID, // actual entities
        footPosOffset, groundY, speed, upperLegLength, lowerLegLength, // settings
        idealMarkerEntityID = null, actualMarkerEntityID = null, kneeMarkerID = null // used for debugging
    ) {
        super();
        // Entity legIDs
        this.upperLegEntityID = upperLegEntityID;
        this.lowerLegEntityID = lowerLegEntityID;
        this.idealMarkerEntityID = idealMarkerEntityID;
        this.actualMarkerEntityID = actualMarkerEntityID;
        this.kneeEntityID = kneeEntityID;
        this.kneeMarkerID = kneeMarkerID;
        this.pelvisID = pelvisID;

        // Needed for the IK
        this.upperLegEntity = null;
        this.lowerLegEntity = null;
        this.pelvisEntity = null;

        // Settings
        this.groundY = groundY;
        this.speed = speed;
        this.footPosOffset = footPosOffset;
        this.stepDistance = 0.01;
        this.stepSpeed = 10;
        this.upperLegLength = upperLegLength;
        this.lowerLegLength = lowerLegLength;

        // Used for debugging
        this.time = 0;
        this.allowStep = true;
    }

    // Start is called before the first frame update
    start() {
        this.upperLegEntity = g_ecs.getEntity(this.upperLegEntityID);
        this.lowerLegEntity = g_ecs.getEntity(this.lowerLegEntityID);
        this.pelvisEntity = g_ecs.getEntity(this.pelvisID);
        this.kneeEntity = g_ecs.getEntity(this.kneeEntityID);

        // get the marker entities -- used for debugging
        this.footIdealMarkerEntity = g_ecs.getEntity(this.idealMarkerEntityID);
        this.footActualMarkerEntity = g_ecs.getEntity(this.actualMarkerEntityID);
        this.kneeMarkerEntity = g_ecs.getEntity(this.kneeMarkerID);

        this.footIdealPosition = this.calculateIdealFootPlacementPosition();
        this.footActualPosition = this.footIdealPosition;
        this.kneePosition = this.calculateKneePosition();

        this.moving = false;
        this.movementProgress = 0;
        this.startingFootRaisePosition = this.footActualPosition;
        this.endingFootRaisePosition = this.footActualPosition;
        this.previousKneePosition = this.kneePosition;
    }

    // Updates the component
    // deltaTime : the time since the last frame
    update(deltaTime) {
        // update the foot placement position
        let idealFootPosition = this.calculateIdealFootPlacementPosition();
        this.footIdealPosition = idealFootPosition;
        let idealKneePosition = this.calculateKneePosition();

        this.kneePosition = idealKneePosition;
        this.previousKneePosition = this.kneePosition;

        if (this.allowStep == false) {
            // console.log("Not allowing step");
            this.updateGizmos();
            return;
        }

        // slowly move the end position to the ideal position
        // slowly lerp the steps to the ideal position
        // this.startingFootRaisePosition = this.startingFootRaisePosition.lerp(idealFootPosition, deltaTime * 0.1);
        // this.endingFootRaisePosition = this.endingFootRaisePosition.lerp(idealFootPosition, deltaTime * 0.1);

        let idealDistance = idealFootPosition.distanceTo(this.footActualPosition);
        let nextStepDistance = this.endingFootRaisePosition.distanceTo(this.footActualPosition);
        // console.log("Distance: " + idealDistance);
        // console.log("Next step distance: " + nextStepDistance);

        // start a step if we are far enough away
        if (idealDistance > this.stepDistance && this.moving == false) {
            // snap to the ideal position
            this.moving = true;
            this.movementProgress = 0;
            this.startingFootRaisePosition = this.footActualPosition;
            this.endingFootRaisePosition = idealFootPosition;
            return;
        }

        // stop moving if we are close enough
        if (nextStepDistance < this.stepDistance && this.moving == true) {
            // snap to the step position
            // this.actualPosition = this.endingFootRaisePosition;
            this.moving = false;
            this.movementProgress = 0;
            this.startingFootRaisePosition = this.footActualPosition;
            this.endingFootRaisePosition = this.footActualPosition;
        }

        // move the foot
        if (this.moving == true) {
            this.movementProgress += deltaTime * this.stepSpeed;
            // clamp the movement progress
            if (this.movementProgress > 1) {
                this.movementProgress = 1;
            }
            if (this.movementProgress < 0) {
                this.movementProgress = 0;
            }
            // console.log("Movement progress: " + this.movementProgress);
            this.footActualPosition = this.parabolicLerp(this.startingFootRaisePosition, this.endingFootRaisePosition, 1, this.movementProgress);
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
        // add the height of the parabola
        linear.elements[1] += h * Math.sin(t * Math.PI);
        return linear;
    }

    updateGizmos() {
        if (this.footIdealMarkerEntity != null) {
            this.footIdealMarkerEntity.getTransform().position = this.footIdealPosition;
        }
        if (this.footActualMarkerEntity != null) {
            this.footActualMarkerEntity.getTransform().position = this.footActualPosition;
        }
        if (this.kneeMarkerEntity != null) {
            this.kneeMarkerEntity.getTransform().position = this.kneePosition;
        }
    }

    calculateIdealFootPlacementPosition() {
        // return new Vector3();
        // representation of the foot placement position
        let pelvisWorldPosition = this.pelvisEntity.node.transform.getWorldPosition();
        let pelvisModelMatrix = this.pelvisEntity.node.transform.getWorldModelMatrix();

        let offsetVector = new Vector4([this.footPosOffset.elements[0], this.footPosOffset.elements[1], this.footPosOffset.elements[2], 0]);
        let rotatedOffset = pelvisModelMatrix.multiplyVector4(offsetVector);

        let idealPosition = new Vector3(
            [
                pelvisWorldPosition.elements[0] + rotatedOffset.elements[0],
                this.groundY,
                pelvisWorldPosition.elements[2] + rotatedOffset.elements[2],
            ]
        );

        return idealPosition;
    }

    calculateKneePosition() {
        // return new Vector3();
        // representation of the foot placement position
        let pelvisWorldPosition = this.pelvisEntity.node.transform.getWorldPosition();
        let footWorldPosition = this.footActualPosition;
        let kneeTargetWorldPosition = this.kneeEntity.node.transform.getWorldPosition();

        // now find a position to place the knee such that the constraints are met
        // these constraints are:
        // 1. the knee exists on the same plane as the foot, pelvis, and kneeTarget
        // 2. the knee is an upperLegLength away from the pelvis
        // 3. the knee is a lowerLegLength away from the foot
        // 4. the knee should be as close to the kneeTargetWorldPosition as possible

        // if these aren't met, the knee is placed at the halfway point between the pelvis and the foot
        // this is the default position

        // return this.ikSolveApproach(pelvisWorldPosition, footWorldPosition, kneeTargetWorldPosition);
        return this.ikSolve(pelvisWorldPosition, footWorldPosition, kneeTargetWorldPosition, this.upperLegLength, this.lowerLegLength);

    }

    ikSolveDep(pelvisWorldPosition, footWorldPosition, kneeTargetWorldPosition) {
        let footToPelvisDirection = pelvisWorldPosition.sub(footWorldPosition).normalize();
        let idealKneePosition = footWorldPosition.add(footToPelvisDirection.mul(this.lowerLegLength));

        let pelvisToFoot = footWorldPosition.sub(pelvisWorldPosition);
        let pelvisToKneeTarget = kneeTargetWorldPosition.sub(pelvisWorldPosition);
        let projectionLength = pelvisToFoot.dot(pelvisToKneeTarget) / pelvisToFoot.lengthSq();
        let projectedKneeTarget = pelvisWorldPosition.add(pelvisToFoot.mul(projectionLength));

        let kneePosition = new Vector3(projectedKneeTarget.elements);
        let toKneeTarget = kneeTargetWorldPosition.sub(kneePosition);
        let distanceToKneeTarget = toKneeTarget.length();

        // check if the knee is too far away from the knee target
        if (distanceToKneeTarget > this.upperLegLength + this.lowerLegLength) {
            // console.log("Knee too far away");
            // move the knee closer to the knee target
            let toKneeTargetNormalized = toKneeTarget.normalize();
            kneePosition = kneePosition.add(toKneeTargetNormalized.mul(distanceToKneeTarget - (this.upperLegLength + this.lowerLegLength)));
        }

        // check if the knee is too close to the pelvis
        let upperLegLengthSq = this.upperLegLength * this.upperLegLength;
        let lowerLengthSq = this.lowerLegLength * this.lowerLegLength;

        let pelvisToKnee = kneePosition.sub(pelvisWorldPosition);
        let pelvisToKneeLengthSq = pelvisToKnee.lengthSq();

        if (pelvisToKneeLengthSq < upperLegLengthSq || pelvisToKneeLengthSq > upperLegLengthSq + lowerLengthSq) {
            console.log("Knee too close to pelvis");
            // move the knee away from the pelvis
            let toKneeNormalized = pelvisToKnee.normalize();
            kneePosition = pelvisWorldPosition.add(toKneeNormalized.mul(this.upperLegLength));
        }
        else {
            console.log("Knee is in range");
        }

        return kneePosition;
    }

    ikSolve(pelvisPosition, footPosition, kneeTargetPosition, upperLegLength, lowerLegLength) {
        // Convert the positions to Vector3 objects if they aren't already
        let pelvis = new Vector3(pelvisPosition.elements);
        let foot = new Vector3(footPosition.elements);
        let kneeTarget = new Vector3(kneeTargetPosition.elements);

        // Calculate the vector from the pelvis to the foot
        let hipToFootVec = foot.sub(pelvis);

        // Calculate the distance from the hip to the foot
        let hipToFootDistance = hipToFootVec.length();
        // console.log("Hip to foot distance: " + hipToFootDistance);

        // Check if the leg can reach the foot
        if (hipToFootDistance > upperLegLength + lowerLegLength) {
            // console.error("The leg cannot reach the target foot position.");
            // return the midpoint between the pelvis and the foot
            return pelvis.add(hipToFootVec.mul(0.5));
        }

        // Calculate the angle at the knee using the Law of Cosines
        let cosKneeAngle = (upperLegLength * upperLegLength + lowerLegLength * lowerLegLength - hipToFootDistance * hipToFootDistance) / (2 * upperLegLength * lowerLegLength);
        let kneeAngle = Math.acos(cosKneeAngle);

        // Calculate the direction from the hip to the knee
        let hipToKneeDirection = hipToFootVec.normalize();

        // Calculate the position of the knee
        let kneePosition = pelvis.add(hipToKneeDirection.mul(upperLegLength));

        // Adjust the knee position based on the knee target
        // This involves projecting the knee-to-target vector onto the plane perpendicular to the hip-to-foot vector
        let kneeToTargetVec = kneeTarget.sub(kneePosition);
        let kneeToTargetOnPlane = kneeToTargetVec.sub(hipToFootVec.mul(hipToFootVec.dot(kneeToTargetVec) / hipToFootVec.lengthSq()));
        // Adjust the knee position towards the knee target
        let normalizedKneeToTargetOnPlane = kneeToTargetOnPlane.normalize();
        let influence = upperLegLength * Math.cos(kneeAngle);
        let influenceVec = normalizedKneeToTargetOnPlane.mul(influence);
        kneePosition = kneePosition.add(influenceVec);
        return kneePosition;
    }

}