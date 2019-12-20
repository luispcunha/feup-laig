var DEGREE_TO_RAD = Math.PI / 180;

// Order of the groups in the XML document.
var SCENE_INDEX = 0;
var VIEWS_INDEX = 1;
var GLOBALS_INDEX = 2;
var LIGHTS_INDEX = 3;
var TEXTURES_INDEX = 4;
var MATERIALS_INDEX = 5;
var TRANSFORMATIONS_INDEX = 6;
var ANIMATIONS_INDEX = 7;
var PRIMITIVES_INDEX = 8;
var COMPONENTS_INDEX = 9;

var TRANSLATE_INDEX = 0;
var ROTATE_INDEX = 1;
var SCALE_INDEX = 2;

/**
* MySceneGraph class, representing the scene graph.
*/
class MySceneGraph {
    /**
    * @constructor
    */
    constructor(filename, scene) {
        this.loadedOk = null;

        // Establish bidirectional references between scene and graph.
        this.scene = scene;
        scene.graph = this;

        this.nodes = [];

        this.idRoot = null;                    // The id of the root element.

        this.axisCoords = {
            x: [1, 0, 0],
            y: [0, 1, 0],
            z: [0, 0, 1]
        };

        // File reading
        this.reader = new CGFXMLreader();

        /*
        * Read the contents of the xml file, and refer to this class for loading and error handlers.
        * After the file is read, the reader calls onXMLReady on this object.
        * If any error occurs, the reader calls onXMLError on this object, with an error message
        */
        this.reader.open('scenes/' + filename, this);
    }

    /*
    * Callback to be executed after successful reading
    */
    onXMLReady() {
        this.log("XML Loading finished.");
        const rootElement = this.reader.xmlDoc.documentElement;

        // Here should go the calls for different functions to parse the various blocks
        const error = this.parseXMLFile(rootElement);

        if (error !== null) {
            this.onXMLError(error);
            return;
        }

        this.loadedOk = true;

        // As the graph loaded ok, signal the scene so that any additional initialization depending on the graph can take place
        this.scene.onGraphLoaded();
    }

    /**
    * Parses the XML file, processing each block.
    * @param {XML root element} rootElement
    */
    parseXMLFile(rootElement) {
        if (rootElement.nodeName != "lxs")
            return "Root tag <lxs> missing.";

        const nodes = rootElement.children;

        // Reads the names of the nodes to an auxiliary buffer.
        const nodeNames = Array.from(nodes).map(node => node.nodeName);

        let error;
        let index;

        // Processes each node, verifying errors.

        // <scene>
        if ((index = nodeNames.indexOf("scene")) == -1)
            return this.errMissingNode("scene");
        else {
            if (index != SCENE_INDEX)
                this.onXMLMinorError(this.errOutOfOrder("scene", SCENE_INDEX, index));

            //Parse scene block
            if ((error = this.parseScene(nodes[index])) != null)
                return error;
        }

        // <views>
        if ((index = nodeNames.indexOf("views")) == -1)
            return this.errMissingNode("views");
        else {
            if (index != VIEWS_INDEX)
                this.onXMLMinorError(this.errOutOfOrder("views", VIEWS_INDEX, index));

            //Parse views block
            if ((error = this.parseView(nodes[index])) != null)
                return error;
        }

        // <gloabls>
        if ((index = nodeNames.indexOf("globals")) == -1)
            return this.errMissingNode("globals");
        else {
            if (index != GLOBALS_INDEX)
                this.onXMLMinorError(this.errOutOfOrder("globals", GLOBALS_INDEX, index));

            //Parse ambient block
            if ((error = this.parseGlobals(nodes[index])) != null)
                return error;
        }

        // <lights>
        if ((index = nodeNames.indexOf("lights")) == -1)
            return this.errMissingNode("lights");
        else {
            if (index != LIGHTS_INDEX)
                this.onXMLMinorError(this.errOutOfOrder("lights", LIGHTS_INDEX, index));

            //Parse lights block
            if ((error = this.parseLights(nodes[index])) != null)
                return error;
        }
        // <textures>
        if ((index = nodeNames.indexOf("textures")) == -1)
            return this.errMissingNode("textures");
        else {
            if (index != TEXTURES_INDEX)
                this.onXMLMinorError(this.errOutOfOrder("textures", TEXTURES_INDEX, index));

            //Parse textures block
            if ((error = this.parseTextures(nodes[index])) != null)
                return error;
        }

        // <materials>
        if ((index = nodeNames.indexOf("materials")) == -1)
            return this.errMissingNode("materials");
        else {
            if (index != MATERIALS_INDEX)
                this.onXMLMinorError(this.errOutOfOrder("materials", MATERIALS_INDEX, index));

            //Parse materials block
            if ((error = this.parseMaterials(nodes[index])) != null)
                return error;
        }

        // <transformations>
        if ((index = nodeNames.indexOf("transformations")) == -1)
            return this.errMissingNode("transformations");
        else {
            if (index != TRANSFORMATIONS_INDEX)
                this.onXMLMinorError(this.errOutOfOrder("transformations", TRANSFORMATIONS_INDEX, index));

            //Parse transformations block
            if ((error = this.parseTransformations(nodes[index])) != null)
                return error;
        }

        // <animations>
        if ((index = nodeNames.indexOf("animations")) == -1)
            return this.errMissingNode("animations");
        else {
            if (index != ANIMATIONS_INDEX)
                this.onXMLMinorError(this.errOutOfOrder("animations", ANIMATIONS_INDEX, index));

            //Parse animations block
            if ((error = this.parseAnimations(nodes[index])) != null)
                return error;
        }

        // <primitives>
        if ((index = nodeNames.indexOf("primitives")) == -1)
            return this.errMissingNode("primitives");
        else {
            if (index != PRIMITIVES_INDEX)
                this.onXMLMinorError(this.errOutOfOrder("primitives", PRIMITIVES_INDEX, index));

            //Parse primitives block
            if ((error = this.parsePrimitives(nodes[index])) != null)
                return error;
        }

        // <components>
        if ((index = nodeNames.indexOf("components")) == -1)
            return this.errMissingNode("components");
        else {
            if (index != COMPONENTS_INDEX)
                this.onXMLMinorError(this.errOutOfOrder("components", COMPONENTS_INDEX, index));

            //Parse components block
            if ((error = this.parseComponents(nodes[index])) != null)
                return error;
        }

        if (this.components.hasOwnProperty(this.idRoot))
            this.root = this.components[this.idRoot];
        else
            return "There is no component with the root ID " + this.idRoot + ".";

        this.log("All parsed.");
        return null;
    }

    errMissingNode(node) {
        return "The <" + node + "> node is missing.";
    }

    errOutOfOrder(node, expected, actual) {
        return "The <" + node + "> is out of order. Expected " + expected + ", got " + actual + ".";
    }

    /**
    * Parses the <scene> block.
    * @param {scene block element} sceneNode
    */
    parseScene(sceneNode) {

        // Get root of the scene.
        var root = this.reader.getString(sceneNode, 'root')
        if (root == null)
            return "no root defined for scene";

        this.idRoot = root;

        // Get axis length
        var axis_length = this.reader.getFloat(sceneNode, 'axis_length');
        if (axis_length == null)
            this.onXMLMinorError("no axis_length defined for scene; assuming 'length = 1'");

        this.referenceLength = axis_length || 1;

        this.log("Parsed scene.");

        return null;
    }

    /**
    * Parses the <views> block.
    * @param {view block element} viewsNode
    */
    //
    parseView(viewsNode) {
        // get default view
        this.defaultView = this.reader.getString(viewsNode, "default");
        if (this.defaultView == null)
            return "default view id missing";

        this.views = {};
        var numViews = 0;

        // any number of views
        for (const child of viewsNode.children) {

            //Check type of view
            if (child.nodeName != "perspective" && child.nodeName != "ortho") {
                this.onXMLMinorError("unknown tag <" + child.nodeName + ">");
                continue;
            }

            const viewID = this.reader.getString(child, 'id');
            if (viewID == null)
                return "no ID defined for view";

            // Checks for repeated IDs.
            if (this.views[viewID])
                return "ID must be unique for each view (conflict: ID = " + viewID + ")";

            const near = this.reader.getFloat(child, 'near');
            if (!near)
                return "invalid near value for ID " + viewID;

            const far = this.reader.getFloat(child, 'far');
            if (!far)
                return "invalid far value for ID " + viewID;

            let angle, left, right, top, bottom;

            if (child.nodeName == "perspective") {
                // get perspective specific properties
                angle = this.reader.getFloat(child, 'angle');
                if (angle < 0)
                    return "invalid angle value for ID " + viewID;
            }
            else {
                // get ortho specific properties
                left = this.reader.getFloat(child, 'left');
                if (!left)
                    return "invalid left value for ID " + viewID;

                right = this.reader.getFloat(child, 'right');
                if (!right)
                    return "invalid right value for ID " + viewID;

                top = this.reader.getFloat(child, 'top');
                if (!top)
                    return "invalid top value for ID " + viewID;

                bottom = this.reader.getFloat(child, 'bottom');
                if (!bottom)
                    return "invalid bottom value for ID " + viewID;
            }

            const grandChildren = Array.from(child.children);
            const nodeNames = grandChildren.map(node => node.nodeName);

            const fromIndex = nodeNames.indexOf('from');
            if (fromIndex == -1)
                return "from values missing (view ID = " + viewID + ")";
            const toIndex = nodeNames.indexOf('to');
            if (toIndex == -1)
                return "to values missing (view ID = " + viewID + ")";

            const from = this.parseCoordinates3D(grandChildren[fromIndex], 'from values (view ID = ' + viewID + ")");
            if (!Array.isArray(from))
                return from;

            const to = this.parseCoordinates3D(grandChildren[toIndex], 'to values (view ID = ' + viewID + ")");
            if (!Array.isArray(to))
                return to;

            if (child.nodeName == "perspective")
                this.views[viewID] = new CGFcamera(angle, near, far, from, to);
            else {
                let up;
                const upIndex = nodeNames.indexOf('up');
                if (upIndex == -1) {
                    this.onXMLMinorError("used up default values (view ID = " + viewID + ")");
                    up = [0, 1, 0];
                }
                else {
                    up = this.parseCoordinates3D(grandChildren[upIndex], 'up values (view ID = ' + viewID + ")");
                    if (!Array.isArray(up))
                        return up;
                }

                this.views[viewID] = new CGFcameraOrtho(left, right, bottom, top, near, far, from, to, up);
            }

            numViews++;
        }

        if (numViews <= 0)
            return "at least one view must be defined";

        if (!this.views[this.defaultView])
            return "invalid default view";

        this.log("Parsed views.");

        return null;
    }

    /**
    * Parses the <globals> node.
    * @param {globals block element} globalsNode
    */
    parseGlobals(globalsNode) {
        const children = Array.from(globalsNode.children);
        const nodeNames = children.map(node => node.nodeName);

        this.ambient = [];
        this.background = [];

        const ambientIndex = nodeNames.indexOf("ambient");
        const backgroundIndex = nodeNames.indexOf("background");

        let color = this.parseColor(children[ambientIndex], "ambient");
        if (!Array.isArray(color))
            return color;
        else
            this.ambient = color;

        color = this.parseColor(children[backgroundIndex], "background");
        if (!Array.isArray(color))
            return color;
        else
            this.background = color;

        this.log("Parsed globals.");

        return null;
    }

    /**
    * Parses the <light> node.
    * @param {lights block element} lightsNode
    */
    parseLights(lightsNode) {
        const children = lightsNode.children;

        this.lights = [];
        var numLights = 0;

        // Any number of lights.
        for (const child of children) {

            // Storing light information
            var global = [];
            var attributeNames = [];
            var attributeTypes = [];

            //Check type of light
            if (child.nodeName != "omni" && child.nodeName != "spot") {
                this.onXMLMinorError("unknown tag <" + child.nodeName + ">");
                continue;
            }
            else {
                attributeNames.push(...["location", "ambient", "diffuse", "specular", "attenuation"]);
                attributeTypes.push(...["position", "color", "color", "color", "floatArray"]);
            }

            // Get id of the current light.
            const lightId = this.reader.getString(child, 'id');
            if (lightId == null)
                return "no ID defined for light";

            // Checks for repeated IDs.
            if (this.lights[lightId] != null)
                return "ID must be unique for each light (conflict: ID = " + lightId + ")";

            // Light enable/disable
            var enableLight = true;
            var aux = this.reader.getBoolean(child, 'enabled');
            if (!(aux != null && !isNaN(aux) && (aux == true || aux == false)))
                this.onXMLMinorError("unable to parse value component of the 'enable light' field for ID = " + lightId + "; assuming 'value = 1'");

            enableLight = aux;

            //Add enabled boolean and type name to light info
            global.push(enableLight);
            global.push(child.nodeName);

            const grandChildren = Array.from(child.children);
            // Specifications for the current light.

            const nodeNames = grandChildren.map(grandchild => grandchild.nodeName);

            for (var j = 0; j < attributeNames.length; j++) {
                var attributeIndex = nodeNames.indexOf(attributeNames[j]);

                if (attributeIndex != -1) {
                    const type = attributeTypes[j];
                    let aux;
                    if (type == "position")
                        aux = this.parseCoordinates4D(grandChildren[attributeIndex], "light position for ID" + lightId);
                    else if (type == "color")
                        aux = this.parseColor(grandChildren[attributeIndex], attributeNames[j] + " illumination for ID" + lightId);
                    else
                        aux = this.parseAttenuationArray(grandChildren[attributeIndex], attributeNames[j] + " attenuation for ID " + lightId);
                    if (!Array.isArray(aux))
                        return aux;

                    global.push(aux);
                }
                else
                    return "light " + attributeNames[j] + " undefined for ID = " + lightId;
            }

            // Gets the additional attributes of the spot light
            if (child.nodeName == "spot") {
                var angle = this.reader.getFloat(child, 'angle');
                if (!(angle != null && !isNaN(angle)))
                    return "unable to parse angle of the light for ID = " + lightId;

                var exponent = this.reader.getFloat(child, 'exponent');
                if (!(exponent != null && !isNaN(exponent)))
                    return "unable to parse exponent of the light for ID = " + lightId;

                var targetIndex = nodeNames.indexOf("target");

                // Retrieves the light target.
                var targetLight = [];
                if (targetIndex != -1) {
                    var aux = this.parseCoordinates3D(grandChildren[targetIndex], "target light for ID " + lightId);
                    if (!Array.isArray(aux))
                        return aux;

                    targetLight = aux;
                }
                else
                    return "light target undefined for ID = " + lightId;

                global.push(...[angle, exponent, targetLight])
            }

            this.lights[lightId] = global;
            numLights++;
        }

        if (numLights == 0)
            return "at least one light must be defined";
        else if (numLights > 8)
            this.onXMLMinorError("too many lights defined; WebGL imposes a limit of 8 lights");

        this.log("Parsed lights.");
        return null;
    }

    /**
     * Parses light attenuation
     * @param {*} node
     * @param {*} messageError
     */
    parseAttenuationArray(node, messageError) {
        const array = [
            this.reader.getFloat(node, "constant"),
            this.reader.getFloat(node, "linear"),
            this.reader.getFloat(node, "quadratic")
        ];
        for (const element of array) {
            if (element === null || isNaN(element) || element < 0 || element > 1)
                return messageError + ": error parsing values";
        }
        return array;
    }

    /**
    * Parses the <textures> block.
    * @param {textures block element} texturesNode
    */
    parseTextures(texturesNode) {

        //For each texture in textures block, check ID and file URL

        var children = texturesNode.children;

        this.textures = [];
        // texture with id "inherit", used when a component inherits its parent's texture
        this.textures["inherit"] = "inherit";
        // texture with id "none", used when a component doesn't apply any texture
        this.textures["none"] = "none";

        for (const child of children) {

            if (child.nodeName != "texture") {
                this.onXMLMinorError("unknow tag <" + child.nodeName + ">");
                continue;
            }

            // get ID of the current texture
            var texID = this.reader.getString(child, 'id');
            if (texID == null)
                return "no ID defined for texture";

            // check if texture ID is unique
            if (this.textures[texID] != null)
                return "ID must be unique for each texture (conflict: ID = " + texID + ")";

            // get file URL
            var fileURL = this.reader.getString(child, 'file');
            if (fileURL == null)
                return "no file defined for texture (ID = " + texID + ")";

            // check if image file has valid extension
            if (fileURL.length < 4 || (fileURL.substr(-4).toLowerCase() != ".jpg" && fileURL.substr(-4).toLowerCase() != ".png" && fileURL.substr(-5).toLowerCase() != ".jpeg"))
                return "file extension should be .jpg or .png (ID = " + texID + ")";

            // add texture
            this.textures[texID] = new CGFtexture(this.scene, fileURL);
        }

        this.log("Parsed textures.")
        return null;
    }

    /**
    * Parses the <materials> node.
    * @param {materials block element} materialsNode
    */
    parseMaterials(materialsNode) {
        var children = materialsNode.children;

        this.materials = [];
        // material with id = "inherit" for when a component inherits its parent's material
        this.materials["inherit"] = "inherit";

        var grandChildren = [];
        var nodeNames = [];
        var emission, ambient, diffuse, specular;
        var numMaterials = 0;

        // Any number of materials.
        for (const child of children) {

            if (child.nodeName != "material") {
                this.onXMLMinorError("unknown tag <" + child.nodeName + ">");
                continue;
            }

            // Get id of the current material.
            var materialID = this.reader.getString(child, 'id');
            if (materialID == null)
                return "no ID defined for material";

            // Checks for repeated IDs.
            if (this.materials[materialID] != null)
                return "ID must be unique for each material (conflict: ID = " + materialID + ")";


            // get shininess and check if it's a valid float
            var shininess = this.reader.getFloat(child, 'shininess');
            if (!(shininess != null && !isNaN(shininess)))
                return "invalid shininess value (material ID = " + materialID + ")";

            // get children nodes of the current material
            grandChildren = child.children;

            // get names of the children nodes and see if all required nodes exist
            for (const grandchild of grandChildren)
                nodeNames.push(grandchild.nodeName);

            var emissionIndex = nodeNames.indexOf("emission");
            if (emissionIndex == -1)
                return "emission values missing (material ID = " + materialID + ")";

            var ambientIndex = nodeNames.indexOf("ambient");
            if (ambientIndex == -1)
                return "ambient values missing (material ID = " + materialID + ")";

            var diffuseIndex = nodeNames.indexOf("diffuse");
            if (diffuseIndex == -1)
                return "diffuse values missing (material ID = " + materialID + ")";

            var specularIndex = nodeNames.indexOf("specular");
            if (specularIndex == -1)
                return "specular values missing (material ID = " + materialID + ")";

            // parse emission
            var color = this.parseColor(grandChildren[emissionIndex], "emission");
            if (!Array.isArray(color))
                return color;
            else
                emission = color;

            // parse ambient
            color = this.parseColor(grandChildren[ambientIndex], "ambient");
            if (!Array.isArray(color))
                return color;
            else
                ambient = color;

            // parse diffuse
            color = this.parseColor(grandChildren[diffuseIndex], "diffuse");
            if (!Array.isArray(color))
                return color;
            else
                diffuse = color;

            // parse specular
            color = this.parseColor(grandChildren[specularIndex], "specular");
            if (!Array.isArray(color))
                return color;
            else
                specular = color;

            // create CGFappearance and set it up with desired values
            var appearance = new CGFappearance(this.scene);
            appearance.setAmbient(...ambient);
            appearance.setEmission(...emission);
            appearance.setDiffuse(...diffuse);
            appearance.setSpecular(...specular);
            appearance.setShininess(shininess);

            this.materials[materialID] = appearance;
            numMaterials++;
        }

        if (numMaterials <= 0)
            return "one or more materials expected";

        this.log("Parsed materials.");
        return null;
    }

    /**
    * Parses the <transformations> block.
    * @param {transformations block element} transformationsNode
    */
    parseTransformations(transformationsNode) {
        var children = transformationsNode.children;

        this.transformations = [];

        var grandChildren = [];
        var numTransformationBlocks = 0;

        // Any number of transformations.
        for (const child of children) {

            if (child.nodeName != "transformation") {
                this.onXMLMinorError("unknown tag <" + child.nodeName + ">");
                continue;
            }

            // Get id of the current transformation.
            var transformationID = this.reader.getString(child, 'id');
            if (transformationID == null)
                return "no ID defined for transformation";

            // Checks for repeated IDs.
            if (this.transformations[transformationID] != null)
                return "ID must be unique for each transformation (conflict: ID = " + transformationID + ")";

            grandChildren = child.children;
            // Specifications for the current transformation.

            // parses all operations and gets corresponding matrix
            var transfMatrix = this.parseTransformationOperations(grandChildren, "ID = " + transformationID, 1);
            if (transfMatrix instanceof String || typeof transfMatrix == 'string')
                return transfMatrix;

            this.transformations[transformationID] = transfMatrix;
            numTransformationBlocks++;
        }

        if (numTransformationBlocks <= 0)
            return "one or more transformation blocks required";

        this.log("Parsed transformations.");
        return null;
    }

    /**
     * Parses set of transformations and returns corresponding matrix
     * @param {*} grandChildren
     * @param {*} errMsg
     * @param {int} required        How many operations are required
     */
    parseTransformationOperations(grandChildren, errMsg, required) {
        var transfMatrix = mat4.create();
        var numTransformations = 0;

        for (const grandchild of grandChildren) {
            switch (grandchild.nodeName) {
                case 'translate':
                    var coordinates = this.parseCoordinates3D(grandchild, "translate transformation for " + errMsg);
                    if (!Array.isArray(coordinates))
                        return coordinates;

                    transfMatrix = mat4.translate(transfMatrix, transfMatrix, coordinates);
                    numTransformations++;
                    break;
                case 'scale':
                    var coordinates = this.parseCoordinates3D(grandchild, "scale transformation for " + errMsg);
                    if (!Array.isArray(coordinates))
                        return coordinates;

                    transfMatrix = mat4.scale(transfMatrix, transfMatrix, coordinates);
                    numTransformations++;
                    break;
                case 'rotate':
                    var angle = this.reader.getFloat(grandchild, "angle");
                    if (!(angle != null && !isNaN(angle)))
                        return "invalid angle in rotate transformation for " + errMsg;

                    // convert degrees to radians
                    angle = angle * DEGREE_TO_RAD;

                    var axis = this.reader.getString(grandchild, "axis");
                    switch (axis) {
                        case 'x':
                            transfMatrix = mat4.rotateX(transfMatrix, transfMatrix, angle);
                            break;
                        case 'y':
                            transfMatrix = mat4.rotateY(transfMatrix, transfMatrix, angle);
                            break;
                        case 'z':
                            transfMatrix = mat4.rotateZ(transfMatrix, transfMatrix, angle);
                            break;
                        default:
                            return "invalid axis in rotate transformation for " + errMsg;
                    }
                    numTransformations++;
                    break;
                default:
                    this.onXMLMinorError("unknown transformation tag <" + grandchild.nodeName + "> (" + errMsg + ")");
                    break;
            }
        }

        if (numTransformations < required)
            return "" + required + " or more transformations required (" + errMsg + ")";

        return transfMatrix;
    }

    /**
    * Parses the <primitives> block.
    * @param {primitives block element} primitivesNode
    */
    parsePrimitives(primitivesNode) {
        var children = primitivesNode.children;

        this.primitives = [];

        var grandChildren = [];

        // Any number of primitives.
        for (const child of children) {

            if (child.nodeName != "primitive") {
                this.onXMLMinorError("unknown tag <" + child.nodeName + ">");
                continue;
            }

            // Get id of the current primitive.
            var primitiveId = this.reader.getString(child, 'id');
            if (primitiveId == null)
                return "no ID defined for primitive";

            // Checks for repeated IDs.
            if (this.primitives[primitiveId] != null)
                return "ID must be unique for each primitive (conflict: ID = " + primitiveId + ")";

            grandChildren = child.children;

            // Validate the primitive type
            if (grandChildren.length != 1 ||
                (grandChildren[0].nodeName != 'rectangle' && grandChildren[0].nodeName != 'triangle' &&
                    grandChildren[0].nodeName != 'cylinder' && grandChildren[0].nodeName != 'sphere' &&
                    grandChildren[0].nodeName != 'torus' && grandChildren[0].nodeName != 'plane' &&
                    grandChildren[0].nodeName != 'patch' && grandChildren[0].nodeName != 'cylinder2' &&
                    grandChildren[0].nodeName != 'regpolygon' && grandChildren[0].nodeName != 'board' &&
                    grandChildren[0].nodeName != 'prism')) {
                return "There must be exactly 1 primitive type (board, prism, regpolygon, rectangle, triangle, cylinder, sphere or torus)"
            }

            // Specifications for the current primitive.
            var primitiveType = grandChildren[0].nodeName;

            // Retrieves the primitive coordinates.
            if (primitiveType == 'rectangle') {
                var rect = this.parseRectangle(grandChildren[0], primitiveId);
                if (rect instanceof String || typeof rect == 'string')
                    return rect;

                this.primitives[primitiveId] = rect;
            }
            else if (primitiveType == 'triangle') {
                var triangle = this.parseTriangle(grandChildren[0], primitiveId);
                if (triangle instanceof String || typeof triangle == 'string')
                    return triangle;

                this.primitives[primitiveId] = triangle;
            }
            else if (primitiveType == 'cylinder') {
                var cylinder = this.parseCylinder(grandChildren[0], primitiveId);
                if (cylinder instanceof String || typeof cylinder == 'string')
                    return cylinder;

                this.primitives[primitiveId] = cylinder;
            }
            else if (primitiveType == 'sphere') {
                var sphere = this.parseSphere(grandChildren[0], primitiveId);
                if (sphere instanceof String || typeof sphere == 'string')
                    return sphere;

                this.primitives[primitiveId] = sphere;
            }
            else if (primitiveType == 'torus') {
                var torus = this.parseTorus(grandChildren[0], primitiveId);
                if (torus instanceof String || typeof torus == 'string')
                    return torus;

                this.primitives[primitiveId] = torus;
            }
            else if (primitiveType == 'plane') {
                var plane = this.parsePlane(grandChildren[0], primitiveId);
                if (plane instanceof String || typeof plane == 'string')
                    return plane;

                this.primitives[primitiveId] = plane;
            }
            else if (primitiveType == 'patch') {
                var patch = this.parsePatch(grandChildren[0], primitiveId);
                if (patch instanceof String || typeof patch == 'string')
                    return patch;

                this.primitives[primitiveId] = patch;
            }
            else if (primitiveType == 'cylinder2') {
                var cylinder2 = this.parseCylinder(grandChildren[0], primitiveId, 2);
                if (cylinder2 instanceof String || typeof cylinder2 == 'string')
                    return cylinder2;

                this.primitives[primitiveId] = cylinder2;
            }
            else if (primitiveType == 'regpolygon') {
                var regpol = this.parseRegPol(grandChildren[0], primitiveId);
                if (regpol instanceof String || typeof regpol == 'string')
                    return regpol;

                this.primitives[primitiveId] = regpol;
            } else if (primitiveType == 'board') {
                var board = this.parseBoard(grandChildren[0], primitiveId);
                if (board instanceof String || typeof board == 'string')
                    return board;

                this.primitives[primitiveId] = board;
                this.scene.board = board;
            }
            else if (primitiveType == 'prism') {
                var prism = this.parsePrism(grandChildren[0], primitiveId);
                if (prism instanceof String || typeof prism == 'string')
                    return prism;

                this.primitives[primitiveId] = prism;
            }
        }

        this.log("Parsed primitives.");
        return null;
    }

    /**
    * Parses regular polygon primitive
    * @param {*} node
    * @param {*} id
    */
    parseRegPol(node, id) {
        const nsides = this.reader.getInteger(node, 'nsides');
        if (!Number.isInteger(nsides))
            return "unable to parse number of sides of the primitive for ID = " + id;

        const apothem = this.reader.getFloat(node, 'apothem');
        if (!(apothem != null && !isNaN(apothem)))
            return "unable to parse apothem of the primitive for ID = " + id;

        return new MyRegPolygon(this.scene, nsides, apothem);
    }

    /**
    * Parses prism primitive
    * @param {*} node
    * @param {*} id
    */
    parsePrism(node, id) {
        const nsides = this.reader.getInteger(node, 'nsides');
        if (!Number.isInteger(nsides))
            return "unable to parse number of sides of the primitive for ID = " + id;


        const apothem = this.reader.getFloat(node, 'apothem');
        if (!(apothem != null && !isNaN(apothem)))
            return "unable to parse apothem of the primitive for ID = " + id;


        const height = this.reader.getFloat(node, 'height');
        if (!(height != null && !isNaN(height)))
            return "unable to parse height of the primitive for ID = " + id;


        return new MyPrism(this.scene, nsides, apothem, height);
    }

    /**
     * Parses plane primitive
     * @param {*} node
     * @param {*} id
     */
    parsePlane(node, id) {
        const npartsU = this.reader.getInteger(node, 'npartsU');
        if (!Number.isInteger(npartsU))
            return "unable to parse slices of the primitive for ID = " + id;

        const npartsV = this.reader.getInteger(node, 'npartsV');
        if (!Number.isInteger(npartsV))
            return "unable to parse loops of the primitive for ID = " + id;

        return new MyPlane(this.scene, npartsU, npartsV);
    }

    parseBoard(node, id) {
        const width = this.reader.getInteger(node, 'height');
        if (!Number.isInteger(width))
            return "unable to parse width of the primitive for ID = " + id;

        const height = this.reader.getInteger(node, 'width');
        if (!Number.isInteger(height))
            return "unable to parse height of the primitive for ID = " + id;

        return new MyBoard(this.scene, width, height);
    }

    /**
     * Parses path primitive
     * @param {*} node
     * @param {*} id
     */
    parsePatch(node, id) {
        var npointsU = this.reader.getInteger(node, 'npointsU');
        if (!(npointsU != null && !isNaN(npointsU) && Number.isInteger(npointsU)))
            return "unable to parse npointsU of the primitive for ID = " + id;

        var npointsV = this.reader.getInteger(node, 'npointsV');
        if (!(npointsV != null && !isNaN(npointsV) && Number.isInteger(npointsV)))
            return "unable to parse npointsV of the primitive for ID = " + id;

        var npartsU = this.reader.getInteger(node, 'npartsU');
        if (!(npartsU != null && !isNaN(npartsU) && Number.isInteger(npartsU)))
            return "unable to parse npartsU of the primitive for ID = " + id;

        var npartsV = this.reader.getInteger(node, 'npartsV');
        if (!(npartsV != null && !isNaN(npartsV) && Number.isInteger(npartsV)))
            return "unable to parse npartsV of the primitive for ID = " + id;

        var controlPoints = this.parseControlPoints(node, npointsU, npointsV, id);

        return new MyPatch(this.scene, npointsU - 1, npointsV - 1, npartsU, npartsV, controlPoints);
    }

    /**
     * Parses control points of patch primitive
     * @param {*} node
     * @param {*} id
     */
    parseControlPoints(node, npointsU, npointsV, id) {
        const children = node.children;
        if (children.length != npointsU * npointsV) {
            return `Wrong number of control points for primitive id = ${id} (is ${children.length}, should be ${npointsU * npointsV})`;
        }

        let ctrlPts = [];

        for (const child of children) {

            if (child.nodeName != 'controlpoint')
                return `Unknown tag in control points for primitive id = ${id}`;

            const coords = this.parseCoordinates3D(child, `Unable to parse coordinates of control point for primitive with id = ${id}`, 'xx', 'yy', 'zz');

            ctrlPts.push(coords);
        }

        return ctrlPts;
    }

    /**
     * Parses rectangle primitive
     * @param {*} node
     * @param {*} id
     */
    parseRectangle(node, id) {
        // x1
        var x1 = this.reader.getFloat(node, 'x1');
        if (!(x1 != null && !isNaN(x1)))
            return "unable to parse x1 of the primitive coordinates for ID = " + id;

        // y1
        var y1 = this.reader.getFloat(node, 'y1');
        if (!(y1 != null && !isNaN(y1)))
            return "unable to parse y1 of the primitive coordinates for ID = " + id;

        // x2
        var x2 = this.reader.getFloat(node, 'x2');
        if (!(x2 != null && !isNaN(x2) && x2 > x1))
            return "unable to parse x2 of the primitive coordinates for ID = " + id;

        // y2
        var y2 = this.reader.getFloat(node, 'y2');
        if (!(y2 != null && !isNaN(y2) && y2 > y1))
            return "unable to parse y2 of the primitive coordinates for ID = " + id;

        return new MyRectangle(this.scene, x1, x2, y1, y2);
    }


    /**
     * Parses triangle primitive
     * @param {*} node
     * @param {*} id
     */
    parseTriangle(node, id) {
        // x1
        var x1 = this.reader.getFloat(node, 'x1');
        if (!(x1 != null && !isNaN(x1)))
            return "unable to parse x1 of the primitive coordinates for ID = " + id;

        // y1
        var y1 = this.reader.getFloat(node, 'y1');
        if (!(y1 != null && !isNaN(y1)))
            return "unable to parse y1 of the primitive coordinates for ID = " + id;

        // z1
        var z1 = this.reader.getFloat(node, 'z1');
        if (!(z1 != null && !isNaN(z1)))
            return "unable to parse z1 of the primitive coordinates for ID = " + id;

        // x2
        var x2 = this.reader.getFloat(node, 'x2');
        if (!(x2 != null && !isNaN(x2)))
            return "unable to parse x2 of the primitive coordinates for ID = " + id;

        // y2
        var y2 = this.reader.getFloat(node, 'y2');
        if (!(y2 != null && !isNaN(y2)))
            return "unable to parse y2 of the primitive coordinates for ID = " + id;

        // z2
        var z2 = this.reader.getFloat(node, 'z2');
        if (!(z2 != null && !isNaN(z2)))
            return "unable to parse z2 of the primitive coordinates for ID = " + id;

        // x3
        var x3 = this.reader.getFloat(node, 'x3');
        if (!(x3 != null && !isNaN(x3)))
            return "unable to parse x3 of the primitive coordinates for ID = " + id;

        // y3
        var y3 = this.reader.getFloat(node, 'y3');
        if (!(y3 != null && !isNaN(y3)))
            return "unable to parse y3 of the primitive coordinates for ID = " + id;

        // z3
        var z3 = this.reader.getFloat(node, 'z3');
        if (!(z3 != null && !isNaN(z3)))
            return "unable to parse z3 of the primitive coordinates for ID = " + id;

        return new MyTriangle(this.scene, x1, y1, z1, x2, y2, z2, x3, y3, z3, 1, 1);
    }


    /**
     * Parses cylinder primitive
     * @param {*} node
     * @param {*} id
     */
    parseCylinder(node, id, type) {
        // base
        var base = this.reader.getFloat(node, 'base');
        if (!(base != null && !isNaN(base)))
            return "unable to parse base of the primitive for ID = " + id;

        // top
        var top = this.reader.getFloat(node, 'top');
        if (!(top != null && !isNaN(top)))
            return "unable to parse top of the primitive for ID = " + id;

        // height
        var height = this.reader.getFloat(node, 'height');
        if (!(height != null && !isNaN(height)))
            return "unable to parse height of the primitive for ID = " + id;

        // slices
        var slices = this.reader.getInteger(node, 'slices');
        if (!(slices != null && !isNaN(slices) && Number.isInteger(slices)))
            return "unable to parse slices of the primitive for ID = " + id;

        // stacks
        var stacks = this.reader.getInteger(node, 'stacks');
        if (!(stacks != null && !isNaN(stacks) && Number.isInteger(stacks)))
            return "unable to parse stacks of the primitive for ID = " + id;

        if (type == 2)
            return new MyCylinder2(this.scene, stacks, slices, base, top, height);

        return new MyCylinder(this.scene, stacks, slices, base, top, height);
    }

    /**
     * Parses sphere primitive
     * @param {*} node
     * @param {*} id
     */
    parseSphere(node, id) {
        // radius
        var radius = this.reader.getFloat(node, 'radius');
        if (!(radius != null && !isNaN(radius)))
            return "unable to parse radius of the primitive for ID = " + id;

        // slices
        var slices = this.reader.getInteger(node, 'slices');
        if (!(slices != null && !isNaN(slices) && Number.isInteger(slices)))
            return "unable to parse slices of the primitive for ID = " + id;

        // stacks
        var stacks = this.reader.getInteger(node, 'stacks');
        if (!(stacks != null && !isNaN(stacks) && Number.isInteger(stacks)))
            return "unable to parse stacks of the primitive for ID = " + id;

        return new MySphere(this.scene, stacks, slices, radius);
    }

    /**
     * Parses torus primitive
     * @param {*} node
     * @param {*} id
     */
    parseTorus(node, id) {
        // inner
        var inner = this.reader.getFloat(node, 'inner');
        if (!(inner != null && !isNaN(inner)))
            return "unable to parse inner of the primitive for ID = " + id;

        // outer
        var outer = this.reader.getFloat(node, 'outer');
        if (!(outer != null && !isNaN(outer)))
            return "unable to parse outer of the primitive for ID = " + id;

        // slices
        var slices = this.reader.getInteger(node, 'slices');
        if (!(slices != null && !isNaN(slices) && Number.isInteger(slices)))
            return "unable to parse slices of the primitive for ID = " + id;

        // loops
        var loops = this.reader.getInteger(node, 'loops');
        if (!(loops != null && !isNaN(loops) && Number.isInteger(loops)))
            return "unable to parse loops of the primitive for ID = " + id;

        return new MyTorus(this.scene, inner, outer, slices, loops);
    }

    /**
    * Parses the <components> block.
    * @param {components block element} componentsNode
    */
    parseComponents(componentsNode) {
        var children = componentsNode.children;

        this.components = [];

        var grandChildren = [];
        var grandgrandChildren = [];
        var nodeNames = [];

        // Any number of components.
        for (const child of children) {

            if (child.nodeName != "component") {
                this.onXMLMinorError("unknown tag <" + child.nodeName + ">");
                continue;
            }

            // Get id of the current component.
            var componentID = this.reader.getString(child, 'id');
            if (componentID == null)
                return "no ID defined for componentID";

            var currentComponent;

            // Checks for repeated IDs.
            if (this.components[componentID] != null) {
                if (this.components[componentID].loaded)
                    return "ID must be unique for each component (conflict: ID = " + componentID + ")";
                else
                    currentComponent = this.components[componentID];
            }
            else {
                currentComponent = new MyComponent(this.scene, componentID);
            }

            grandChildren = child.children;

            nodeNames = [];
            for (const grandchild of grandChildren) {
                nodeNames.push(grandchild.nodeName);
            }

            var transformationIndex = nodeNames.indexOf("transformation");
            if (transformationIndex == -1)
                return "transformations block doesn't exist for component with id = " + componentID;

            var materialsIndex = nodeNames.indexOf("materials");
            if (materialsIndex == -1)
                return "materials block doesn't exist for component with id = " + componentID;

            var textureIndex = nodeNames.indexOf("texture");
            if (textureIndex == -1)
                return "texture doesn't exist for component with id = " + componentID;

            var childrenIndex = nodeNames.indexOf("children");
            if (childrenIndex == -1)
                return "children block doesn't exist for component with id = " + componentID;

            var animationIndex = nodeNames.indexOf("animationref");
            if (animationIndex != -1 && animationIndex != transformationIndex + 1)
                this.onXMLMinorError("animation reference should be immediately after transformations block");


            // Transformations
            grandgrandChildren = grandChildren[transformationIndex].children;

            nodeNames = [];
            for (const grandgrandchild of grandgrandChildren)
                nodeNames.push(grandgrandchild.nodeName);

            var transfMatrix;

            var transfRefIndex = nodeNames.indexOf('transformationref');
            if (transfRefIndex != -1) {
                if (grandgrandChildren.length > 1)
                    return "transformation reference may only be used without explicitly providing transformations";

                var transfRefId = this.reader.getString(grandgrandChildren[transfRefIndex], 'id');
                transfMatrix = this.transformations[transfRefId];
                if (transfMatrix == null)
                    return "invalid transformation reference id";
            }
            else {
                transfMatrix = this.parseTransformationOperations(grandgrandChildren, "component ID = " + componentID, 0);
                if (transfMatrix instanceof String || typeof transfMatrix == 'string')
                    return transfMatrix;
            }

            currentComponent.transformation = transfMatrix;

            // Animations
            if (animationIndex != -1) {
                var animationID = this.reader.getString(grandChildren[animationIndex], 'id');

                if (this.animations[animationID] == null)
                    return "no animation with ID " + animationID + " (component ID = " + componentID + ")";

                currentComponent.animation = this.animations[animationID];
            }


            // Materials
            var numMaterials = 0;
            grandgrandChildren = grandChildren[materialsIndex].children;
            for (const grandgrandchild of grandgrandChildren) {
                if (grandgrandchild.nodeName != 'material')
                    this.onXMLMinorError("unknown tag <" + grandgrandchild.nodeName + "> component ID = " + componentID);
            }

            var mats = [];

            for (const grandgrandchild of grandgrandChildren) {
                var mat = this.reader.getString(grandgrandchild, 'id');
                if (mat == null)
                    return "unable to read material ID for component ID = " + componentID;

                if (this.materials[mat] == null)
                    return "no material with ID " + mat + " (compontent ID = " + componentID + ")";

                mats.push(this.materials[mat]);
                numMaterials++;
            }

            if (numMaterials <= 0)
                return "at least one material should be provided for component ID = " + componentID;

            currentComponent.materials = mats;
            currentComponent.selectedMaterial = 0;

            // Texture
            var textureID = this.reader.getString(grandChildren[textureIndex], 'id');

            if (this.textures[textureID] == null)
                return "no texture with ID " + textureID + " (component ID = " + componentID + ")";

            currentComponent.texture = this.textures[textureID];

            // length_s and length_t only for defined textures that aren't "none" or "inherit"
            if (textureID != "none" && textureID != "inherit") {
                var length_s = this.reader.getFloat(grandChildren[textureIndex], 'length_s');
                if (!(length_s != null && !isNaN(length_s)))
                    return "unable to parse length_s of the texture (component ID = " + componentId + ")";

                var length_t = this.reader.getFloat(grandChildren[textureIndex], 'length_t');
                if (!(length_t != null && !isNaN(length_t)))
                    return "unable to parse length_t of the texture (component ID = " + componentId + ")";

                currentComponent.texLengthS = length_s;
                currentComponent.texLengthT = length_t;
            }

            // Children
            grandgrandChildren = grandChildren[childrenIndex].children;

            var componentChildren = [];
            var primitiveChildren = [];

            for (const grandgrandchild of grandgrandChildren) {
                var nodeName = grandgrandchild.nodeName;

                if (nodeName != 'componentref' && nodeName != 'primitiveref') {
                    this.onXMLMinorError("unknown tag <" + nodeName + "> in children of component ID = " + componentID);
                    continue;
                }

                var id = this.reader.getString(grandgrandchild, 'id');
                if (id == null)
                    return "unable to parse id of children (component ID = " + componentID + ")";

                if (nodeName == 'primitiveref') {
                    if (this.primitives[id] == null)
                        return "primitiveref " + id + " doesn't exist component (ID = " + componentID + ")";

                    primitiveChildren.push(this.primitives[id]);
                }
                else if (nodeName == 'componentref') {
                    // if a component doesn't exist yet, create it (property loaded of create component will be false)
                    if (this.components[id] == null) {
                        this.components[id] = new MyComponent(this.scene, id);
                        componentChildren.push(this.components[id]);
                    }
                    else {
                        componentChildren.push(this.components[id]);
                    }
                }
            }

            currentComponent.primitiveChildren = primitiveChildren;
            currentComponent.componentChildren = componentChildren;
            currentComponent.loaded = true; // mark component as loaded

            switch (componentID) {
                case "octagonTile":
                    this.scene.board.octagonTile = currentComponent;
                    break;
                case "squareTile":
                    this.scene.board.squareTile = currentComponent;
                    break;
                case "octagonPieceP1":
                    this.scene.board.octagonPieceP1 = currentComponent;
                    break;
                case "octagonPieceP2":
                    this.scene.board.octagonPieceP2 = currentComponent;
                    break;
                case "squarePieceP1":
                    this.scene.board.squarePieceP1 = currentComponent;
                    break;
                case "squarePieceP2":
                    this.scene.board.squarePieceP2 = currentComponent;
                    break;
            }

            this.components[componentID] = currentComponent;
        }

        // checks if all components were correctly loaded and issue a error if not
        const componentIDs = Object.keys(this.components);
        for (const id of componentIDs) {
            if (!this.components[id].loaded)
                return "Component with id " + id + " doesn't exist.";
        }

        this.log("Parsed components.");

        return null;
    }


    /**
    * Parse the coordinates from a node with ID = id
    * @param {block element} node
    * @param {message to be displayed in case of error} messageError
    */
    parseCoordinates3D(node, messageError, xString, yString, zString) {
        var position = [];

        if (arguments.length < 5) {
            xString = 'x';
            yString = 'y';
            zString = 'z';
        }

        // x
        var x = this.reader.getFloat(node, xString);
        if (!(x != null && !isNaN(x)))
            return "unable to parse x-coordinate of the " + messageError;

        // y
        var y = this.reader.getFloat(node, yString);
        if (!(y != null && !isNaN(y)))
            return "unable to parse y-coordinate of the " + messageError;

        // z
        var z = this.reader.getFloat(node, zString);
        if (!(z != null && !isNaN(z)))
            return "unable to parse z-coordinate of the " + messageError;

        position.push(...[x, y, z]);

        return position;
    }

    /**
    * Parse the coordinates from a node with ID = id
    * @param {block element} node
    * @param {message to be displayed in case of error} messageError
    */
    parseCoordinates4D(node, messageError) {
        var position = [];

        //Get x, y, z
        position = this.parseCoordinates3D(node, messageError);

        if (!Array.isArray(position))
            return position;


        // w
        var w = this.reader.getFloat(node, 'w');
        if (!(w != null && !isNaN(w)))
            return "unable to parse w-coordinate of the " + messageError;

        position.push(w);

        return position;
    }

    /**
    * Parse the color components from a node
    * @param {block element} node
    * @param {message to be displayed in case of error} messageError
    */
    parseColor(node, messageError) {
        var color = [];

        // R
        var r = this.reader.getFloat(node, 'r');
        if (!(r != null && !isNaN(r) && r >= 0 && r <= 1))
            return "unable to parse R component of the " + messageError;

        // G
        var g = this.reader.getFloat(node, 'g');
        if (!(g != null && !isNaN(g) && g >= 0 && g <= 1))
            return "unable to parse G component of the " + messageError;

        // B
        var b = this.reader.getFloat(node, 'b');
        if (!(b != null && !isNaN(b) && b >= 0 && b <= 1))
            return "unable to parse B component of the " + messageError;

        // A
        var a = this.reader.getFloat(node, 'a');
        if (!(a != null && !isNaN(a) && a >= 0 && a <= 1))
            return "unable to parse A component of the " + messageError;

        color.push(...[r, g, b, a]);

        return color;
    }

    /*
    * Callback to be executed on any read error, showing an error on the console.
    * @param {string} message
    */
    onXMLError(message) {
        console.error("XML Loading Error: " + message);
        this.loadedOk = false;
    }

    /**
    * Callback to be executed on any minor error, showing a warning on the console.
    * @param {string} message
    */
    onXMLMinorError(message) {
        console.warn("Warning: " + message);
    }

    /**
    * Callback to be executed on any message.
    * @param {string} message
    */
    log(message) {
        console.log("   " + message);
    }

    /**
    * Displays the scene, processing each node, starting in the root node.
    */
    displayScene() {
        /* calls method responsible for recursively processing all nodes
        and displaying all leaf nodes of the graph on the root component */
        this.root.display();
    }

    /**
    * Parses the <animations> block.
    * @param {animations block element} animationsNode
    */
    parseAnimations(animationsNode) {
        let children = animationsNode.children;

        this.animations = [];
        let grandChildren = [];

        // Any number of transformations.
        for (const child of children) {
            if (child.nodeName != "animation") {
                this.onXMLMinorError("unknown tag <" + child.nodeName + ">");
                continue;
            }

            // Get id of the current transformation.
            var animationID = this.reader.getString(child, 'id');
            if (animationID == null)
                return "no ID defined for animation";

            // Checks for repeated IDs.
            if (this.animations[animationID] != null)
                return "ID must be unique for each animation (conflict: ID = " + animationID + ")";

            grandChildren = child.children;
            const nodeNames = Array.from(grandChildren).map(node => node.nodeName);
            let index = nodeNames.indexOf("keyframe");
            if (index == -1)
                return "keyframe doesn't exist for animation with id = " + animationID;

            let numKeyframes = 0;
            let keyframes = [];

            for (const keyframeNode of grandChildren) {
                if (keyframeNode.nodeName != "keyframe")
                    this.onXMLMinorError("unknown tag <" + name + ">");

                // parse keyframe
                let keyframe = this.parseKeyframe(keyframeNode, animationID);
                if (keyframe instanceof String || typeof keyframe == 'string')
                    return keyframe;

                keyframes.push(keyframe);
                numKeyframes++;
            }

            this.animations[animationID] = new KeyframeAnimation(this.scene, animationID, keyframes);
        }

        this.log("Parsed animations.");
        return null;
    }

    /**
    * Parses set of transformations and returns corresponding matrix
    * @param {*} node
    * @param {*} errMsg
    */
    parseKeyframe(keyframeNode, id) {

        const nodeNames = Array.from(keyframeNode.children).map(node => node.nodeName);

        let index, translate, rotate, scale;
        var instant = this.reader.getFloat(keyframeNode, "instant");

        // <translate>
        if ((index = nodeNames.indexOf("translate")) == -1)
            return "translate in animations block with id = " + id;
        else {
            if (index != TRANSLATE_INDEX)
                this.onXMLMinorError(this.errOutOfOrder("translate in animation with = " + id, TRANSLATE_INDEX, index));

            const x = this.reader.getFloat(keyframeNode.children[index], "x");
            const y = this.reader.getFloat(keyframeNode.children[index], "y");
            const z = this.reader.getFloat(keyframeNode.children[index], "z");
            translate = new KFTransformation(x, y, z);
        }

        // <rotate>
        if ((index = nodeNames.indexOf("rotate")) == -1)
            return "rotate in animations block with id = " + id;
        else {
            if (index != ROTATE_INDEX)
                this.onXMLMinorError(this.errOutOfOrder("rotate in animation with id = " + id, ROTATE_INDEX, index));

            const x = this.reader.getFloat(keyframeNode.children[index], "angle_x");
            const y = this.reader.getFloat(keyframeNode.children[index], "angle_y");
            const z = this.reader.getFloat(keyframeNode.children[index], "angle_z");
            rotate = new KFTransformation(x * DEGREE_TO_RAD, y * DEGREE_TO_RAD, z * DEGREE_TO_RAD);
        }

        // <scale>
        if ((index = nodeNames.indexOf("scale")) == -1)
            return "scale in animations block with id = " + id;
        else {
            if (index != SCALE_INDEX)
                this.onXMLMinorError(this.errOutOfOrder("scale in animation with = " + id, SCALE_INDEX, index));

            const x = this.reader.getFloat(keyframeNode.children[index], "x");
            const y = this.reader.getFloat(keyframeNode.children[index], "y");
            const z = this.reader.getFloat(keyframeNode.children[index], "z");
            scale = new KFTransformation(x, y, z);
        }

        return new Keyframe(instant, scale, rotate, translate);
    }


    cycleMaterials() {
        for (const key in this.components) {
            this.components[key].cycleMaterials();
        }
    }
}
