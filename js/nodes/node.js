
class Node {
    // Default constructor single Object argument
    static DEFAULT_CONFIGURATION = {
        pos: undefined,
        content: undefined,
        diagram: window.rootDiagram,
        scale: 1,
        intrinsicScale: 1,
        createEdges: true,
        files: [],
        saved: false,
        saveData: null
    }
    // An array for properties that need to be restored as vectors
    static VECTOR_PROPERTIES = ['anchor', 'mouseAnchor', 'vel', 'pos', 'force'];
    // The SAVE_PROPERTIES array, for each Node type, defines the properties saved as JSON and restored on load.
    // This happens in the Node constructor that follows, usage of restored properties must follow "super" constructor call.
    static SAVE_PROPERTIES = ['scale', 'intrinsicScale', 'removed', 'createdAt', 'uuid', 'type', 'files'];
    // Interface configuration
    static INTERFACE_CONFIGURATION = {
        insertable: false,// Plain Node objects cannot be inserted in the diagram
        iconID: null,// The id of the HTML element containing the icon for the Node graphic object
        name: "Plain Node", // The name that will be displayed when hovering over the icon
        defaultFavourite: -1// Whenever to add the "insert icon" to the favourite toolbar (-1 not favourite)
    }

    // constructor(pos, content, scale = 1, intrinsicScale = 1, createEdges = true) {
    constructor(configuration=Node.DEFAULT_CONFIGURATION) {
        configuration = {...Node.DEFAULT_CONFIGURATION, ...configuration}
        this.startInitialization();
        this.anchor = new vec2(0, 0);
        this.anchorForce = 0;
        this.mouseAnchor = new vec2(0, 0);
        // this.edges = [];
        // a proxy for our array
        let that = this;
        this.edges = new Proxy([], {
            deleteProperty: function(target, property) {
                delete target[property];
                that.onDisconnect(property)
                return true;
            },
            set: function(target, property, value, receiver) {
                target[property] = value;
                if(property !== 'length') that.onConnect(value)
                return true;
            }
        });
        this.createdAt = new Date().toISOString();
        this.files = [...configuration.files];
        this.init = (nodeMap) => { };
        this.type = this.constructor.name;
        // console.log("Restoring Node: ", configuration.saved)
        // if (configuration.pos === undefined) { // saved node
        if (configuration.saved) {
            let o = configuration.saveData.json;
            for (const k of Node.VECTOR_PROPERTIES) {
                o[k] = new vec2(o[k]);
            }
            for (const k in o) {
                this[k] = o[k];
            }
            // START FILES
            for(let file of this.files){
                if(file.autoSave) {
                    this.autoSaveFile(file);
                    // this.savePropertyToFile(file.key, file.path, file.binary)
                }
                if(file.autoLoad) {
                    this.autoLoadFile(file);
                }
                this.loadPropertyFromFile(file.key, file.path)
            }
            // END FILES
            this.content = configuration.content;
            this.attach();
            this.content.setAttribute("data-uuid", this.uuid);
            if (configuration.saveData.edges !== undefined && configuration.createEdges) {
                let es = configuration.saveData.edges;
                this.init = ((nodeMap) => {
                    for (let e of es) {
                        configuration.diagram.edgeFromJSON(e, nodeMap);
                    }
                }).bind(this);
            }
        } else { // new node
            this.uuid = configuration.diagram ? configuration.diagram.nextUUID() : "d0";
            this.uuid = "" + this.uuid;

            this.pos = configuration.pos;
            this.scale = configuration.scale;
            this.intrinsicScale = configuration.intrinsicScale;

            this.content = configuration.content;

            this.vel = new vec2(0, 0);
            this.force = new vec2(0, 0);
            this.followingMouse = 0;
            this.followingAiCursor = false;
            this.aiCursorAnchor = new vec2(0, 0);

            this.removed = false;

            this.content.setAttribute("data-uuid", this.uuid);
            this.attach();
        }
        this.diagram = configuration.diagram;
    }

    onDisconnect(index){
        // console.log("disconnected node: ", this, " removed edge: ", index)
    }
    onConnect(edge){
        // console.log("connected node: ", this, " new edge: ", edge)
    }

    startInitialization() {
        this.initialized = false;
        this.afterInitCallbackList = [];
    }

    addAfterInitCallback(callback) {
        this.afterInitCallbackList.push(callback)
    }
    // call from extending classes after finished initialization
    afterInit(){
        this.initialized = true;
        for (let callback of this.afterInitCallbackList) {
            callback()
        }
    }

    attach() {
        this.content.onclick = this.onclick.bind(this);
        this.content.ondblclick = this.ondblclick.bind(this);
        this.content.onmousedown = this.onmousedown.bind(this);
        document.onmousemove = this.onmousemove.bind(this);
        document.onmouseup = this.onmouseup.bind(this);
        this.content.onwheel = this.onwheel.bind(this);
    }

    json() {
        let json = {}
        for (let extendedClass of this.getExtendedClasses()) {
            let vectorProperties = extendedClass.hasOwnProperty("VECTOR_PROPERTIES") ? extendedClass.VECTOR_PROPERTIES : [];
            let saveProperties = extendedClass.hasOwnProperty("SAVE_PROPERTIES") ? extendedClass.SAVE_PROPERTIES : [];
            for (let key of vectorProperties.concat(saveProperties)) {
                json[key] = this[key];
            }
        }
        const replacer = (k, v) => {
            if (v instanceof HTMLElement || v instanceof HTMLCollection) { // Exclude windowDiv as well
                return undefined;
            }
            return v;
        };
        return JSON.stringify(json, replacer);
    }

    draw() {
        put(this.content, this.pos, this.intrinsicScale * this.scale * (this.diagram.background.zoom.mag2() ** -settings.zoomContentExp), this.diagram);

        // Before saving, get the current title input value and store it in a data-attribute
        let titleInput = this.content.querySelector('.title-input');
        if (titleInput) {
            // this.content.setAttribute('data-title', titleInput.value);
        }
    }

    step(dt) {
        if (dt === undefined || isNaN(dt)) {
            dt = 0;
        } else {
            if (dt > 1) {
                dt = 1;
            }
        }
        if (!this.followingMouse && (!this.diagram || !this.diagram.disableForces)) {
            this.pos = this.pos.plus(this.vel.scale(dt / 2));
            this.vel = this.vel.plus(this.force.scale(dt));
            this.pos = this.pos.plus(this.vel.scale(dt / 2));
            this.force = this.vel.scale(-Math.min(this.vel.mag() + 0.4 + this.anchorForce, 1 / (dt + 1e-300)));
        } else {
            this.vel = new vec2(0, 0);
            this.force = new vec2(0, 0);
        }
        let g = MandelbrotBG.mandGrad(settings.iterations, this.pos);
        //g.y *= -1; //why?
        this.force = this.force.plus(g.unscale((g.mag2() + 1e-10) * 300));
        this.force = this.force.plus(this.anchor.minus(this.pos).scale(this.anchorForce));
        //let d = toZ(mousePos).minus(this.pos);
        //this.force = this.force.plus(d.scale(this.followingMouse/(d.mag2()+1)));
        if (this.followingMouse) {
            let p = this.diagram.background.toZ(this.diagram.background.mousePos).minus(this.mouseAnchor);
            let velocity = p.minus(this.pos).unscale(nodeMode ? 1 : dt);

            this.vel = velocity;
            this.pos = p;
            this.anchor = this.pos;

            // Update the edges of the current node being dragged
            if (nodeMode === 1) {
                Diagram.updateNodeEdgesLength(this);
            }

            // Check if the current node's UUID is in the selected nodes
            if (this.diagram.selectedNodeUUIDs.has(this.uuid)) {
                const selectedNodes = this.diagram.getSelectedNodes();
                selectedNodes.forEach(node => {
                    if (node.uuid !== this.uuid && node.anchorForce !== 1) { // Skip the current node and any anchored node
                        node.vel = velocity;

                        // Update the edges for each selected node
                        if (nodeMode === 1) {
                            Diagram.updateNodeEdgesLength(node);
                        }
                    }
                });
            }
        }
        //this.force = this.force.plus((new vec2(-.1,-1.3)).minus(this.pos).scale(0.1));
        this.draw();
    }

    moveNode(direction) {
        const forceMagnitude = 0.01; // Base force intensity
        const adjustedForce = forceMagnitude * this.scale; // Scale the force

        let forceDirection = new vec2(0, 0);

        // Check for diagonal movements
        const isDiagonal = (direction.includes('up') || direction.includes('down')) &&
            (direction.includes('left') || direction.includes('right'));

        const diagonalAdjustment = isDiagonal ? Math.sqrt(2) : 1;

        if (direction.includes('up')) {
            forceDirection.y -= adjustedForce / diagonalAdjustment;
        }
        if (direction.includes('down')) {
            forceDirection.y += adjustedForce / diagonalAdjustment;
        }
        if (direction.includes('left')) {
            forceDirection.x -= adjustedForce / diagonalAdjustment;
        }
        if (direction.includes('right')) {
            forceDirection.x += adjustedForce / diagonalAdjustment;
        }

        // Apply the force to the node
        this.force = this.force.plus(forceDirection);

        return forceDirection; // Return the applied force direction
    }

    zoom_to_fit(margin = 1) {
        let bb = this.content.getBoundingClientRect();
        let svgbb = this.diagram.background.getBoundingBox();
        let aspect = svgbb.width / svgbb.height;
        let scale = bb.height * aspect > bb.width ? svgbb.height / (margin * bb.height) : svgbb.width / (margin * bb.width);
        this.zoom_by(1 / scale);
    }

    zoom_by(s = 1) {
        this.diagram.autopilot.panTo = new vec2(0, 0); //this.pos;
        let gz = ((s) ** (-1 / settings.zoomContentExp));
        this.diagram.autopilot.zoomTo = this.diagram.background.zoom.unscale(gz ** 0.5);
        this.diagram.autopilot.referenceFrame = this;
        this.diagram.autopilot.panToI = new vec2(0, 0);
    }

    zoom_to(s = 1) {
        this.diagram.autopilot.panTo = new vec2(0, 0); //this.pos;
        let gz = this.diagram.background.zoom.mag2() * ((this.scale * s) ** (-1 / settings.zoomContentExp));
        this.diagram.autopilot.zoomTo = this.diagram.background.zoom.unscale(gz ** 0.5);
        this.diagram.autopilot.referenceFrame = this;
        this.diagram.autopilot.panToI = new vec2(0, 0);
    }

    searchStrings() {
        function* search(e) {
            yield e.textContent;
            if (e.value)
                yield e.value;
            for (let c of e.children) {
                yield* search(c);
            }
        }
        return search(this.content);
    }

    onclick(event) {

    }

    ondblclick(event) {
        this.anchor = this.pos;
        this.anchorForce = 1 - this.anchorForce;
        //let connectednodes = getAllConnectedNodesData(this)
        //console.log(connectednodes)
        cancel(event);
    }

    onmousedown(event) {
        this.mouseAnchor = this.diagram.background.toZ(new vec2(event.clientX, event.clientY)).minus(this.pos);
        this.followingMouse = 1;
        // for(let node of this.diagram.getSelectedNodes()){
        //     node.followingMouse = 1;
        // }
        window.draggedNode = this;
        this.diagram.movingNode = this;
        if (nodeMode) {
            if (this.diagram.prevNodeToConnect === undefined) {
                this.diagram.prevNodeToConnect = this;
            } else {
                // Get titles once and store them in variables
                const thisTitle = this.getTitle();
                const prevNodeTitle = this.diagram.prevNodeToConnect.getTitle();

                // Check conditions before calling addEdgeToZettelkasten
                if (thisTitle !== prevNodeTitle && this.isTextNode && this.diagram.prevNodeToConnect.isTextNode) {
                    // Add edge from prevNodeToConnect to this node
                    addEdgeToZettelkasten(prevNodeTitle, thisTitle, myCodeMirror);
                    // Add edge from this node to prevNodeToConnect
                    addEdgeToZettelkasten(thisTitle, prevNodeTitle, myCodeMirror);
                } else {
                    // If conditions are not met, call the original connectDistance
                    connectDistance(this, this.diagram.prevNodeToConnect, this.pos.minus(this.diagram.prevNodeToConnect.pos).mag() / 2, undefined, true);
                }

                // Reset prevNodeToConnect
                this.diagram.prevNodeToConnect = undefined;
            }
        }
        // Add an event listener to window.mouseup that stops the node from following the mouse
        window.addEventListener('mouseup', () => this.stopFollowingMouse());
        cancel(event);
    }

    stopFollowingMouse() {
        this.followingMouse = 0;
        // for(let node of this.diagram.getSelectedNodes()){
        //     node.followingMouse = 0;
        // }
        this.diagram.movingNode = undefined;
        // Remove the event listener to clean up
        window.removeEventListener('mouseup', this.stopFollowingMouse);
    }

    onmouseup(event) {
        if (this === window.draggedNode) {
            this.followingMouse = 0;
            // for(let node of this.diagram.getSelectedNodes()){
            //     node.followingMouse = 0;
            // }
            window.draggedNode = undefined;
        }
    }

    onmousemove(event) {
        if (this === window.draggedNode) {
            this.diagram.prevNodeToConnect = undefined;
        }
        /*if (this.followingMouse){
        this.pos = this.pos.plus(toDZ(new vec2(event.movementX,event.movementY)));
        this.draw()
        //cancel(event);
        }*/
    }

    onwheel(event) {
        if (nodeMode) {
            let amount = Math.exp(event.wheelDelta * -settings.zoomSpeed);

            if (this.diagram.autopilot.speed !== 0 && this.uuid === this.diagram.autopilot.referenceFrame.uuid) {
                this.diagram.autopilot.zoomTo = this.diagram.autopilot.zoomTo.scale(1 / amount);
            } else {
                // Scale selected nodes or individual node
                let targetWindow = event.target.closest('.window');
                if (targetWindow && targetWindow.classList.contains('selected')) {
                    const selectedNodes = this.diagram.getSelectedNodes();
                    selectedNodes.forEach((node) => {
                        node.scale *= amount;

                        // Only update position if the node is not anchored
                        if (node.anchorForce !== 1) {
                            node.pos = node.pos.lerpto(this.diagram.background.toZ(this.diagram.background.mousePos), 1 - amount);
                        }

                        Diagram.updateNodeEdgesLength(node);
                    });
                } else {
                    this.scale *= amount;

                    // Only update position if not anchored
                    if (this.anchorForce !== 1) {
                        this.pos = this.pos.lerpto(this.diagram.background.toZ(this.diagram.background.mousePos), 1 - amount);
                    }
                }
            }
            cancel(event);
        }
    }
    // Refactor to WindowedNode
    getTitle() {
        // return this.content.getAttribute('data-title');
        return this.title;
    }

    getEdgeDirectionalities() {
        return this.edges.map(edge => ({
            edge: edge,
            directionality: edge.getDirectionRelativeTo(this)
        }));
    }

    addEdge(edge) {
        this.edges.push(edge);
        this.updateEdgeData();
    }

    updateEdgeData() {
        let es = JSON.stringify(this.edges.map((e) => e.dataObj()));
        //console.log("Saving edge data:", es); // Debug log
        this.content.setAttribute("data-edges", es);
    }

    removeEdges() {
        for (let i = this.edges.length - 1; i >= 0; i--) {
            this.edges[i].remove();
            this.edges.splice(i, 1);
        }
    }

    remove() {
        let dels = [];
        for (let n of this.diagram.nodes) {
            for (let e of n.edges) {
                if (e.pts.includes(this)) {
                    dels.push(e);
                }
            }
        }
        for (let e of dels) {
            e.remove();
        }

        // Remove this node from the edges array of any nodes it was connected to
        for (let n of this.diagram.nodes) {
            n.edges = n.edges.filter(edge => !edge.pts.includes(this));
        }

        // Remove the node from the global nodes array
        let index = this.diagram.nodes.indexOf(this);
        if (index !== -1) {
            this.diagram.nodes.splice(index, 1);
        }

        // Remove the node from the nodeMap if it exists
        if (this.diagram.nodeMap[this.uuid] === this) {
            delete this.diagram.nodeMap[this.uuid];
        }

        // Remove the node UUID from the selectedNodeUUIDs set
        if (this.diagram.selectedNodeUUIDs.has(this.uuid)) {
            this.diagram.selectedNodeUUIDs.delete(this.uuid);
        }

        // Mark the node as removed and remove its content
        this.removed = true;
        this.content.remove();
    }

    save(){
        return {
            json: JSON.parse(this.json()),
            edges:  this.edges.map((e) => e.dataObj()),
        };
    }

    // Files
    autoSaveFile(fileObject) {
        FileManagerAPI.addFileToAutoSave(this, fileObject);
    }

    stopAutoSaveFile(fileObject) {
        FileManagerAPI.removeFileFromAutoSave(this, fileObject);
    }

    autoLoadFile(fileObject) {
        FileManagerAPI.addFileToAutoLoad(this, fileObject);
    }

    stopAutoLoadFile(fileObject) {
        FileManagerAPI.removeFileFromAutoLoad(this, fileObject);
    }

    savePropertyToFile(key, path){
        const onSaved = (response) => {console.log("Saved file. Server response: ", response)};
        // if(binary) {
        FileManagerAPI.saveBinary(path, this[key]).then(onSaved);
        // } else {
        //     FileManagerAPI.saveFile(path, this[key]).then(onSaved);
        // }
    }

    loadPropertyFromFile(key, path){
        const onLoaded = (file) => {
            this[key] = file;
            // this[key] = binary ? file : file.content;
        };
        // if(binary) {
        FileManagerAPI.loadBinary(path).then(onLoaded);
        // } else {
        //     FileManagerAPI.loadFile(path).then(onLoaded);
        // }
    }

    observeProperty(property, callback){
        for (let extendedClass of this.getExtendedClasses()){
            console.log("Searching for property " + property + " in class: " + extendedClass.name)
            if(extendedClass.hasOwnProperty("OBSERVERS") && extendedClass.OBSERVERS.hasOwnProperty(property)){
                console.log("   Found OBSERVER in class: ", extendedClass.name, ": ", extendedClass.OBSERVERS[property])
                extendedClass.OBSERVERS[property].add.bind(this)(callback)
            }
        }
    }

    stopObservingProperty(property, callback) {
        for (let extendedClass of this.getExtendedClasses()){
            console.log("Searching for property " + property + " in class: " + extendedClass.name)
            if(extendedClass.hasOwnProperty("OBSERVERS") && extendedClass.OBSERVERS.hasOwnProperty(property)){
                console.log("   Found OBSERVER in class: ", extendedClass.name, ": ", extendedClass.OBSERVERS[property])
                extendedClass.OBSERVERS[property].remove.bind(this)(callback)
            }
        }
    }

    getExtendedClasses(){
        let extendedClasses = [];
        let extendedClassConstructor = this.constructor;
        let extendedClassPrototype = this.__proto__;
        while (extendedClassConstructor.name !== "Object"){
            extendedClasses.push(extendedClassConstructor);
            extendedClassPrototype = extendedClassPrototype.__proto__;
            extendedClassConstructor = extendedClassPrototype.constructor;
        }
        return extendedClasses;
    }

    getSaveFile(key){
        return this.files.find((file) => file.key === key);
    }

}

globalThis.Node = Node;// override Node
globalThis.ArachnIDE = {Node};// override Node
