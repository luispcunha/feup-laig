var DEGREE_TO_RAD = Math.PI / 180;

// Order of the groups in the XML document.
var SCENE_INDEX = 0;
var VIEWS_INDEX = 1;
var GLOBALS_INDEX = 2;
var LIGHTS_INDEX = 3;
var TEXTURES_INDEX = 4;
var MATERIALS_INDEX = 5;
var TRANSFORMATIONS_INDEX = 6;
var PRIMITIVES_INDEX = 7;
var COMPONENTS_INDEX = 8;

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

        this.axisCoords = [];
        this.axisCoords['x'] = [1, 0, 0];
        this.axisCoords['y'] = [0, 1, 0];
        this.axisCoords['z'] = [0, 0, 1];

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
        var rootElement = this.reader.xmlDoc.documentElement;

        // Here should go the calls for different functions to parse the various blocks
        var error = this.parseXMLFile(rootElement);

        if (error != null) {
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
            return "root tag <lxs> missing";

        var nodes = rootElement.children;

        // Reads the names of the nodes to an auxiliary buffer.
        var nodeNames = [];

        for (var i = 0; i < nodes.length; i++) {
            nodeNames.push(nodes[i].nodeName);
        }

        var error;

        // Processes each node, verifying errors.

        // <scene>
        var index;
        if ((index = nodeNames.indexOf("scene")) == -1)
            return "tag <scene> missing";
        else {
            if (index != SCENE_INDEX)
                this.onXMLMinorError("tag <scene> out of order " + index);

            //Parse scene block
            if ((error = this.parseScene(nodes[index])) != null)
                return error;
        }

        // <views>
        if ((index = nodeNames.indexOf("views")) == -1)
            return "tag <views> missing";
        else {
            if (index != VIEWS_INDEX)
                this.onXMLMinorError("tag <views> out of order");

            //Parse views block
            if ((error = this.parseView(nodes[index])) != null)
                return error;
        }

        // <gloabls>
        if ((index = nodeNames.indexOf("globals")) == -1)
            return "tag <globals> missing";
        else {
            if (index != GLOBALS_INDEX)
                this.onXMLMinorError("tag <globals> out of order");

            //Parse ambient block
            if ((error = this.parseGlobals(nodes[index])) != null)
                return error;
        }

        // <lights>
        if ((index = nodeNames.indexOf("lights")) == -1)
            return "tag <lights> missing";
        else {
            if (index != LIGHTS_INDEX)
                this.onXMLMinorError("tag <lights> out of order");

            //Parse lights block
            if ((error = this.parseLights(nodes[index])) != null)
                return error;
        }
        // <textures>
        if ((index = nodeNames.indexOf("textures")) == -1)
            return "tag <textures> missing";
        else {
            if (index != TEXTURES_INDEX)
                this.onXMLMinorError("tag <textures> out of order");

            //Parse textures block
            if ((error = this.parseTextures(nodes[index])) != null)
                return error;
        }

        // <materials>
        if ((index = nodeNames.indexOf("materials")) == -1)
            return "tag <materials> missing";
        else {
            if (index != MATERIALS_INDEX)
                this.onXMLMinorError("tag <materials> out of order");

            //Parse materials block
            if ((error = this.parseMaterials(nodes[index])) != null)
                return error;
        }

        // <transformations>
        if ((index = nodeNames.indexOf("transformations")) == -1)
            return "tag <transformations> missing";
        else {
            if (index != TRANSFORMATIONS_INDEX)
                this.onXMLMinorError("tag <transformations> out of order");

            //Parse transformations block
            if ((error = this.parseTransformations(nodes[index])) != null)
                return error;
        }

        // <primitives>
        if ((index = nodeNames.indexOf("primitives")) == -1)
            return "tag <primitives> missing";
        else {
            if (index != PRIMITIVES_INDEX)
                this.onXMLMinorError("tag <primitives> out of order");

            //Parse primitives block
            if ((error = this.parsePrimitives(nodes[index])) != null)
                return error;
        }

        // <components>
        if ((index = nodeNames.indexOf("components")) == -1)
            return "tag <components> missing";
        else {
            if (index != COMPONENTS_INDEX)
                this.onXMLMinorError("tag <components> out of order");

            //Parse components block
            if ((error = this.parseComponents(nodes[index])) != null)
                return error;
        }

        this.root = this.components[this.idRoot];
        this.log("all parsed");
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

        this.log("Parsed scene");

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
        
        var children = viewsNode.children;
        this.views = [];
        var numViews = 0;

        // any number of views
        for (var i = 0; i < children.length; i++) {
            
            //Check type of view
            if (children[i].nodeName != "perspective" && children[i].nodeName != "ortho") {
                this.onXMLMinorError("unknown tag <" + children[i].nodeName + ">");
                continue;
            }

            var viewID = this.reader.getString(children[i], 'id');
            if (viewID == null)
                return "no ID defined for view";

            // Checks for repeated IDs.
            if (this.views[viewID] != null)
                return "ID must be unique for each view (conflict: ID = " + viewID + ")";

            var near = this.reader.getFloat(children[i], 'near');
            if (!(near != null && !isNaN(near)))
                return "invalid near value for ID " + viewID;
            
            var far = this.reader.getFloat(children[i], 'far');
            if (!(far != null && !isNaN(far)))
                return "invalid far value for ID " + viewID;

            var angle, left, right, top, bottom;

            if (children[i].nodeName == "perspective") {
            // get perspective specific properties
                angle = this.reader.getFloat(children[i], 'angle');
                if (!(angle != null && !isNaN(angle)))
                    return "invalid angle value for ID " + viewID;
            }
            else {
                // get ortho specific properties
                left = this.reader.getFloat(children[i], 'left');
                if (!(left != null && !isNaN(left)))
                    return "invalid left value for ID " + viewID;

                right = this.reader.getFloat(children[i], 'right');
                if (!(right != null && !isNaN(right)))
                    return "invalid right value for ID " + viewID;

                top = this.reader.getFloat(children[i], 'top'); 
                if (!(top != null && !isNaN(top)))
                    return "invalid top value for ID " + viewID;

                bottom = this.reader.getFloat(children[i], 'bottom');
                if (!(bottom != null && !isNaN(bottom)))
                    return "invalid bottom value for ID " + viewID;
            }

            var grandChildren = children[i].children;
            var nodeNames = [];

            for (var j = 0; j < grandChildren.length; j++) 
                nodeNames.push(grandChildren[j].nodeName);

            var fromIndex = nodeNames.indexOf('from');
            if (fromIndex == -1) 
                return "from values missing (view ID = " + viewID + ")"; 
            var toIndex = nodeNames.indexOf('to');
            if (toIndex == -1)
                return "to values missing (view ID = " + viewID + ")";
            
            var from = this.parseCoordinates3D(grandChildren[fromIndex], 'from values (view ID = ' + viewID + ")");
            if (!Array.isArray(from))
                return from;
            
            var to = this.parseCoordinates3D(grandChildren[toIndex], 'to values (view ID = ' + viewID + ")");
            if (!Array.isArray(to))
                return to;
            
            if (children[i].nodeName == "perspective")
                this.views[viewID] = new CGFcamera(angle, near, far, from, to);
            else {
                var up;
                var upIndex = nodeNames.indexOf('up');
                if (upIndex == -1) {
                    this.onXMLMinorError("used up default values (view ID = " + viewID + ")");
                    up = [0, 1, 0];
                }
                else {
                    up = this.parseCoordinates3D(grandChildren[upIndex], 'up values (view ID = ' + viewID + ")");
                    if (!Array.isArray(up))
                        return up;
                }

                this.views[viewID] = new CGFcameraOrtho(left, right, bottom, top, near, from, to, up);
            }

            numViews++;
        }
            
        if (numViews <= 0)
            return "at least one view must be defined";

        if (this.views[this.defaultView] == null)
            return "invalid default view";

        this.log("Parsed views");
        
        return null;
    }

    /**
     * Parses the <ambient> node.
     * @param {ambient block element} ambientsNode
     */
    parseGlobals(globalsNode) {

        var children = globalsNode.children;

        this.ambient = [];
        this.background = [];

        var nodeNames = [];

        for (var i = 0; i < children.length; i++)
            nodeNames.push(children[i].nodeName);

        var ambientIndex = nodeNames.indexOf("ambient");
        var backgroundIndex = nodeNames.indexOf("background");

        var color = this.parseColor(children[ambientIndex], "ambient");
        if (!Array.isArray(color))
            return color;
        else
            this.ambient = color;

        color = this.parseColor(children[backgroundIndex], "background");
        if (!Array.isArray(color)) 
            return color;
        else
            this.background = color;

        this.log("Parsed ambient");

        return null;
    }

    /**
     * Parses the <light> node.
     * @param {lights block element} lightsNode
     */
    parseLights(lightsNode) {
        var children = lightsNode.children;

        this.lights = [];
        var numLights = 0;

        var grandChildren = [];
        var nodeNames = [];

        // Any number of lights.
        for (var i = 0; i < children.length; i++) {

            // Storing light information
            var global = [];
            var attributeNames = [];
            var attributeTypes = [];

            //Check type of light
            if (children[i].nodeName != "omni" && children[i].nodeName != "spot") {
                this.onXMLMinorError("unknown tag <" + children[i].nodeName + ">");
                continue;
            }
            else {
                attributeNames.push(...["location", "ambient", "diffuse", "specular"]);
                attributeTypes.push(...["position", "color", "color", "color"]);
            }

            // Get id of the current light.
            var lightId = this.reader.getString(children[i], 'id');
            if (lightId == null)
                return "no ID defined for light";

            // Checks for repeated IDs.
            if (this.lights[lightId] != null)
                return "ID must be unique for each light (conflict: ID = " + lightId + ")";

            // Light enable/disable
            var enableLight = true;
            var aux = this.reader.getBoolean(children[i], 'enabled');
            if (!(aux != null && !isNaN(aux) && (aux == true || aux == false)))
                this.onXMLMinorError("unable to parse value component of the 'enable light' field for ID = " + lightId + "; assuming 'value = 1'");

            enableLight = aux || 1;

            //Add enabled boolean and type name to light info
            global.push(enableLight);
            global.push(children[i].nodeName);

            grandChildren = children[i].children;
            // Specifications for the current light.

            nodeNames = [];
            for (var j = 0; j < grandChildren.length; j++) {
                nodeNames.push(grandChildren[j].nodeName);
            }

            for (var j = 0; j < attributeNames.length; j++) {
                var attributeIndex = nodeNames.indexOf(attributeNames[j]);

                if (attributeIndex != -1) {
                    if (attributeTypes[j] == "position")
                        var aux = this.parseCoordinates4D(grandChildren[attributeIndex], "light position for ID" + lightId);
                    else
                        var aux = this.parseColor(grandChildren[attributeIndex], attributeNames[j] + " illumination for ID" + lightId);

                    if (!Array.isArray(aux))
                        return aux;

                    global.push(aux);
                }
                else
                    return "light " + attributeNames[i] + " undefined for ID = " + lightId;
            }

            // Gets the additional attributes of the spot light
            if (children[i].nodeName == "spot") {
                var angle = this.reader.getFloat(children[i], 'angle');
                if (!(angle != null && !isNaN(angle)))
                    return "unable to parse angle of the light for ID = " + lightId;

                var exponent = this.reader.getFloat(children[i], 'exponent');
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

        this.log("Parsed lights");
        return null;
    }

    /**
     * Parses the <textures> block. 
     * @param {textures block element} texturesNode
     */
    parseTextures(texturesNode) {

        //For each texture in textures block, check ID and file URL
        
        var children = texturesNode.children;

        this.textures = [];

        for (var i = 0; i < children.length; i++) {

            if (children[i].nodeName != "texture") {
                this.onXMLMinorError("unknow tag <" + children[i].nodeName + ">");
                continue;
            }

            // get ID of the current texture
            var texID = this.reader.getString(children[i], 'id');
            if (texID == null)
                return "no ID defined for texture";

            // check if texture ID is unique
            if (this.textures[texID] != null)
                return "ID must be unique for each texture (conflict: ID = " + texID + ")";

            // get file URL
            var fileURL = this.reader.getString(children[i], 'file');
            if (fileURL == null)
                return "no file defined for texture (ID = " + texID + ")";

            // check if image file has valid extension
            if (fileURL.length < 4 || (fileURL.substr(-4) != ".jpg" && fileURL.substr(-4) != ".png"))
                return "file extension should be .jpg or .png (ID = " + texID + ")"; 
            
            /*
            var image = new Image();
            image.src = fileURL;

            // check if image exists (there's probably a better way to do this)
            if (image.height == 0)
                return "texture file not found (ID = " + texID + ", url = " + fileURL + ")";

            // warn if size isn't power of 2
            if (! ((image.height!=0) && !(image.height & (image.height - 1))))
                this.onXMLMinorError("image height should be power of 2 (ID = " + texID + ")");

            if (! (image.width && !(image.width & (image.width - 1))))
                this.onXMLMinorError("image width should be power of 2 (ID = " + texID + ")");
            */

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

        var grandChildren = [];
        var nodeNames = [];
        var emission, ambient, diffuse, specular; 
        var numMaterials = 0;

        // Any number of materials.
        for (var i = 0; i < children.length; i++) {

            if (children[i].nodeName != "material") {
                this.onXMLMinorError("unknown tag <" + children[i].nodeName + ">");
                continue;
            }

            // Get id of the current material.
            var materialID = this.reader.getString(children[i], 'id');
            if (materialID == null)
                return "no ID defined for material";

            // Checks for repeated IDs.
            if (this.materials[materialID] != null)
                return "ID must be unique for each material (conflict: ID = " + materialID + ")";


            // get shininess and check if it's a valid float
            var shininess = this.reader.getFloat(children[i], 'shininess');
            if (!(shininess != null && !isNaN(shininess)))
                return "invalid shininess value (material ID = " + materialID + ")";

            // get children nodes of the current material
            grandChildren = children[i].children;

            // get names of the children nodes and see if all required nodes exist
            for (var j = 0; j < grandChildren.length; j++)
                nodeNames.push(grandChildren[j].nodeName);
            
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

        this.log("Parsed materials");
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
        for (var i = 0; i < children.length; i++) {

            if (children[i].nodeName != "transformation") {
                this.onXMLMinorError("unknown tag <" + children[i].nodeName + ">");
                continue;
            }

            // Get id of the current transformation.
            var transformationID = this.reader.getString(children[i], 'id');
            if (transformationID == null)
                return "no ID defined for transformation";

            // Checks for repeated IDs.
            if (this.transformations[transformationID] != null)
                return "ID must be unique for each transformation (conflict: ID = " + transformationID + ")";

            grandChildren = children[i].children;
            // Specifications for the current transformation.

            var transfMatrix = this.parseTransformationOperations(grandChildren, "ID = " + transformationID, 1);
            if (transfMatrix instanceof String || typeof transfMatrix == 'string')
                return transfMatrix;

            this.transformations[transformationID] = transfMatrix;
            numTransformationBlocks++;
        }

        if (numTransformationBlocks <= 0) 
            return "one or more transformation blocks required";

        this.log("Parsed transformations");
        return null;
    }

    parseTransformationOperations(grandChildren, errMsg, required) {
        var transfMatrix = mat4.create();
        var numTransformations = 0;

        for (var j = 0; j < grandChildren.length; j++) {
            switch (grandChildren[j].nodeName) {
                case 'translate':
                    var coordinates = this.parseCoordinates3D(grandChildren[j], "translate transformation for " + errMsg);
                    if (!Array.isArray(coordinates))
                        return coordinates;

                    transfMatrix = mat4.translate(transfMatrix, transfMatrix, coordinates);
                    numTransformations++;
                    break;
                case 'scale':                        
                    var coordinates = this.parseCoordinates3D(grandChildren[j], "scale transformation for " + errMsg);
                    if (!Array.isArray(coordinates))
                        return coordinates;

                    transfMatrix = mat4.scale(transfMatrix, transfMatrix, coordinates);
                    numTransformations++;
                    break;
                case 'rotate':
                    var angle = this.reader.getFloat(grandChildren[j], "angle");
                    if (!(angle != null && !isNaN(angle)))
                        return "invalid angle in rotate transformation for " + errMsg;
                    
                    // convert degrees to radians
                    angle = angle * Math.PI / 180;

                    var axis = this.reader.getString(grandChildren[j], "axis");    
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
                    this.onXMLMinorError("unknown transformation tag <" + grandChildren[j].nodeName + "> (" + errMsg + ")");
                    break;
            }
        }

        if (numTransformations <= required)
            return "" + required + " or more transformations required (ID = " + transformationID + ")";
        
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
        for (var i = 0; i < children.length; i++) {

            if (children[i].nodeName != "primitive") {
                this.onXMLMinorError("unknown tag <" + children[i].nodeName + ">");
                continue;
            }

            // Get id of the current primitive.
            var primitiveId = this.reader.getString(children[i], 'id');
            if (primitiveId == null)
                return "no ID defined for primitive";

            // Checks for repeated IDs.
            if (this.primitives[primitiveId] != null)
                return "ID must be unique for each primitive (conflict: ID = " + primitiveId + ")";

            grandChildren = children[i].children;

            // Validate the primitive type
            if (grandChildren.length != 1 ||
                (grandChildren[0].nodeName != 'rectangle' && grandChildren[0].nodeName != 'triangle' &&
                    grandChildren[0].nodeName != 'cylinder' && grandChildren[0].nodeName != 'sphere' &&
                    grandChildren[0].nodeName != 'torus')) {
                return "There must be exactly 1 primitive type (rectangle, triangle, cylinder, sphere or torus)"
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
                var triangle = this.parseTriangle(grandeChildren[0], primitiveId);
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
        }

        this.log("Parsed primitives");
        return null;
    }

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

        return new MyRectangle(this.scene, id, x1, x2, y1, y2);
    }

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

    parseCylinder(node, id) {
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

        return new MyCylinder(this.scene, stacks, slices, base, top, height);
    }

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
        for (var i = 0; i < children.length; i++) {

            if (children[i].nodeName != "component") {
                this.onXMLMinorError("unknown tag <" + children[i].nodeName + ">");
                continue;
            }

            // Get id of the current component.
            var componentID = this.reader.getString(children[i], 'id');
            if (componentID == null)
                return "no ID defined for componentID";

            // Checks for repeated IDs.
            if (this.components[componentID] != null)
                return "ID must be unique for each component (conflict: ID = " + componentID + ")";

            grandChildren = children[i].children;

            nodeNames = [];
            for (var j = 0; j < grandChildren.length; j++) {
                nodeNames.push(grandChildren[j].nodeName);
            }

            var transformationIndex = nodeNames.indexOf("transformation");
            var materialsIndex = nodeNames.indexOf("materials");
            var textureIndex = nodeNames.indexOf("texture");
            var childrenIndex = nodeNames.indexOf("children");

            var currentComponent = new MyComponent(componentID);

            // Transformations
            grandgrandChildren = grandChildren[transformationIndex].children;

            nodeNames = [];
            for (var j = 0; j < grandgrandChildren.length; j++)
                nodeNames.push(grandgrandChildren[j].nodeName);

            var transfMatrix;

            var transfRefIndex = nodeNames.indexOf('transformationref');
            if (transfRefIndex != -1) {
                if (grandgrandChildren.length > 1)
                    return "transformation reference may only be used without explicitly providing transformations";
                
                transfRefId = this.reader.getString(grandgrandChildren[transfRefIndex], 'id');
                transfMatrix = this.transformations[transfRefIndex];
                if (transfMatrix == null)
                    return "invalid transformation reference id";
            }
            else {
                transfMatrix = this.parseTransformationOperations(grandgrandChildren, "component ID = " + componentID, 0);
                if (transfMatrix instanceof String || typeof transfMatrix == 'string')
                    return transfMatrix;
            }

            currentComponent.transformation = transfMatrix;

            // Materials
            var numMaterials = 0;
            grandgrandChildren = grandChildren[materialsIndex].children;
            for (var j = 0; j < grandgrandChildren.length; j++) {
                if (grandgrandChildren[j].nodeName != 'material')
                    this.onXMLMinorError("unknown tag <" + grandgrandChildren[j].nodeName + "> component ID = " + componentID);
            }

            var mats = [];

            for (var i = 0; i < grandgrandChildren.length; i++) {
                var mat = this.reader.getString(grandgrandChildren[i], 'id');
                if (mat == null)
                    return "unable to read material ID for component ID = " + componentID;
                
                if (mat == 'inherit') {
                    currentComponent.inheritMaterial = true;
                    if (i != 0) {
                        this.onXMLMinorError("component with inherit material behaviour with other materials defined for component ID" + componentID);
                    }
                    numMaterials++;
                    break;
                }

                if (this.materials[mat] == null)
                    return "no material with ID " + mat + " (compontent ID = " + componentID + ")";

                mats.push(this.materials[mat]);
                numMaterials++;
            }

            if (numMaterials <= 0) 
                return "at least one material should be provided for component ID = " + componentID;

            currentComponent.materials = mats;
            currentComponent.selectedMaterial = mats[0];

            // Texture
            var textureID = this.reader.getString(grandChildren[textureIndex], 'id');
            if (this.textures[textureID] == null)
                return "no texture with ID " + textureID + " (component ID = " + componentID + ")";

            if (textureID == 'inherit' || textureID == 'none')
                currentComponent.texBehaviour = textureID;
            else {
                currentComponent.texBehaviour = 'own';

                var length_s = this.reader.getFloat(grandChildren[textureIndex], 'length_s');
                if (!(length_s != null && !isNaN(length_s)))
                    return "unable to parse length_s of the texture (component ID = " +  componentId + ")";
                
                var length_t = this.reader.getFloat(grandChildren[textureIndex], 'length_t');
                if (!(length_t != null && !isNaN(length_t)))
                    return "unable to parse length_t of the texture (component ID = " +  componentId + ")";

                currentComponent.texture = this.textures[textureID];
                currentComponent.texLengthS = length_s;
                currentComponent.texLengthT = length_t;
            }

            // Children
            grandgrandChildren = grandChildren[childrenIndex].children;

            var componentChildren = [];
            var primitiveChildren = [];

            for (var j = 0; j < grandgrandChildren.length; j++) {
                var nodeName = grandgrandChildren[j].nodeName;

                if (nodeName != 'componentref' && nodeName != 'primitiveref') {
                    this.onXMLMinorError("unknown tag <" + nodeNames[j] + "> in children of component ID = " + componentID);
                    continue;
                }

                var id = this.reader.getString(grandgrandChildren[j], 'id');
                if (id == null)
                    return "unable to parse id of children (component ID = " + componentID + ")";
                
                if (nodeName == 'primitiveref') {
                    if (this.primitives[id] == null)
                        return "primitiveref " + primitiveref + " doesn't exist component (ID = " + componentID + ")";

                    primitiveChildren.push(this.primitives[id]);
                }
                else if (nodeName == 'componentref') {
                    if (this.components[id] == null) {
                        this.components[id] = new MyComponent(id);
                        componentChildren.push(this.components[id]);
                    }
                    else {
                        componentChildren.push(this.components[id]);    
                    }
                }
            }

            currentComponent.primitiveChildren = primitiveChildren;
            currentComponent.componentChildren = componentChildren;
            currentComponent.loaded = true;
            this.components[componentID] = currentComponent;
        }
        /*
        for (let i = 0; i < this.components.keys(); i++) {
            if (! this.components[this.components.keys()[i]].loaded) {
                return "component with id " + component.id + " doesn't exist";
            }
        }*/
        
        this.log("Parsed components");

        return null;
    }


    /**
     * Parse the coordinates from a node with ID = id
     * @param {block element} node
     * @param {message to be displayed in case of error} messageError
     */
    parseCoordinates3D(node, messageError) {
        var position = [];

        // x
        var x = this.reader.getFloat(node, 'x');
        if (!(x != null && !isNaN(x)))
            return "unable to parse x-coordinate of the " + messageError;

        // y
        var y = this.reader.getFloat(node, 'y');
        if (!(y != null && !isNaN(y)))
            return "unable to parse y-coordinate of the " + messageError;

        // z
        var z = this.reader.getFloat(node, 'z');
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

    processNode(node, transf, mat, text, ls, lt) {

        let childTransfMatrix = mat4.create();
        mat4.multiply(childTransfMatrix, transf, node.transformation);

        for (let child of node.primitiveChildren)
            child.display();

        for (let child of node.componentChildren) {
            this.scene.pushMatrix();
            this.processNode(child, transf);
            this.scene.popMatrix();
        }
    }

    /**
     * Displays the scene, processing each node, starting in the root node.
     */
    displayScene() {
        //TODO: Create display loop for transversing the scene graph
        this.processNode(this.root, this.scene.getMatrix());
    }
}