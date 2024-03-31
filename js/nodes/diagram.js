
// Utility escape method for RegExp
//https://github.com/tc39/proposal-regex-escaping/blob/main/specInJs.js
// this is a direct translation to code of the spec
if (!RegExp.escape) {
    RegExp.escape = (S) => {
        // 1. let str be ToString(S).
        // 2. ReturnIfAbrupt(str).
        let str = String(S);
        // 3. Let cpList be a List containing in order the code
        // points as defined in 6.1.4 of str, starting at the first element of str.
        let cpList = Array.from(str[Symbol.iterator]());
        // 4. let cuList be a new List
        let cuList = [];
        // 5. For each code point c in cpList in List order, do:
        for (let c of cpList) {
            // i. If c is a SyntaxCharacter then do:
            if ("^$\\.*+?()[]{}|".indexOf(c) !== -1) {
                // a. Append "\" to cuList.
                cuList.push("\\");
            }
            // Append c to cpList.
            cuList.push(c);
        }
        //6. Let L be a String whose elements are, in order, the elements of cuList.
        let L = cuList.join("");
        // 7. Return L.
        return L;
    };
}

class Diagram extends Node {
    static DEFAULT_CONFIGURATION = {
        diagramContainer: window.body,
        nodeContainer: undefined,
        edgeContainer: undefined,
        panInput: undefined,
        zoomInput: undefined,
        coordsLive: true,
        coordinateContainer: undefined,
        diagram: null,
        background: {
            svg_element: undefined,
            svg_bg_element: undefined,
            svg_viewmat_element: undefined,
            svg_mousePath_element: undefined,
        }
    }

    constructor(configuration= Diagram.DEFAULT_CONFIGURATION) {
        configuration = {...Diagram.DEFAULT_CONFIGURATION, ...configuration}
        configuration.background = {...Diagram.DEFAULT_CONFIGURATION.background, ...configuration.background}
        // if(configuration.diagram === null) {
        //     configuration.diagramContainer.dataset.init = "window";
        //     configuration.diagramContainer.classList.add("window");
        //     configuration.diagramContainer.classList.add("content");
        // }
        // TO-DO: review
        super({...configuration, content: configuration.diagramContainer, saved: true, saveData: {json: { uuid: "d" + configuration.id}}});
        this.diagramContainer = configuration.diagramContainer;
        // htmlnodes_parent.appendChild(this.content);
        // registernode(this);
        // interface_v2.js
        this.disableForces = true; // previously DISABLE_FORCE
        this.autopilot = {} // previously globalThis
        this.autopilot.zoomTo = new vec2(4, 0); // previously zoomTo
        this.autopilot.panTo = new vec2(0, 0); // previously panTo
        this.autopilot.referenceFrame = undefined; // previously autopilotReferenceFrame
        this.autopilot.speed = 0; // previously autopilotSpeed
        this.prevNodeToConnect = undefined;
        this.selectedNodeUUIDs = new Set();// Global or scoped array for selected UUIDs
        this.edgeDirectionalityMap = new Map();
        // this.background = new GridBG({
        this.background = new MandelbrotBG({
            svg_element: configuration.background.svg_element,
            svg_bg_element: configuration.background.svg_bg_element,
            svg_viewmat_element: configuration.background.svg_viewmat_element,
            svg_mousePath_element: configuration.background.svg_mousePath_element,
            rSlider: document.getElementById("rSlider"),
            cSlider: document.getElementById("cSlider"),
            sSlider: document.getElementById("sSlider"),
            colorPickerR: document.getElementById("rColor"),
            colorPickerG: document.getElementById("gColor"),
            colorPickerB: document.getElementById("bColor"),
            diagram: this,
            container: this.diagramContainer
        })
        this.gen = this.background.iter();
        this.panInput = configuration.panInput;
        if(this.panInput) {
            this.panInput.addEventListener("input", this.onPanInput.bind(this))
            for (const k of ["paste", "mousemove", "mousedown", "dblclick", "click"]) {
                this.panInput.addEventListener(k, (e) => { cancel(e); })
            }
        }
        this.zoomInput = configuration.zoomInput;
        if(this.zoomInput) {
            this.zoomInput.addEventListener("input", this.onZoomInput.bind(this))
            for (const k of ["paste", "mousemove", "mousedown", "dblclick", "click"]) {
                this.zoomInput.addEventListener(k, (e) => { cancel(e); })
            }
        }
        this.coordsLive = configuration.coordsLive;
        this.coordinateContainer = configuration.coordinateContainer; // previously coords (probably unused tho)
        // this.mousePathPos = undefined; // Moved to Mandelbrot
        this.currentTime = undefined;// previously current_time
        // this.regenAmount = 0; // Moved to Mandelbrot
        // this.regenDebt = 0; // Moved to Mandelbrot
        this.avgFPS = 0; // previously avgfps
        this.autopilot.panToI = new vec2(0, 0); // previously panToI
        this.autopilot.panToI_prev = undefined; // previously panToI_prev
        this.autopilot.prevNodeScale = 1; // previously prevNodeScale
        this.diagramContainer.addEventListener('wheel', this.onWheel.bind(this));
        this.mouseDown = false;
        this.mouseDownPos = new vec2(0, 0);
        this.diagramContainer.addEventListener("mousedown", this.onMouseDown.bind(this));
        this.diagramContainer.addEventListener("mouseup", this.onMouseUp.bind(this));
        this.diagramContainer.addEventListener("mousemove", this.onMouseMove.bind(this));
        this.touches = new Map();
        this.diagramContainer.addEventListener("touchstart", this.onTouchStart.bind(this), false);
        this.diagramContainer.addEventListener("touchcancel", this.onTouchCancel.bind(this), false);
        this.diagramContainer.addEventListener("touchend", this.onTouchEnd.bind(this), false);
        this.diagramContainer.addEventListener("touchmove", this.onTouchMove.bind(this), false);
        this.gestureStartParams = {
            rotation: 0,
            x: 0,
            y: 0,
            scale: 0,
            zoom: new vec2(),
            pan: new vec2()
        };
        this.diagramContainer.addEventListener("gesturestart", this.onGestureStart.bind(this));
        this.diagramContainer.addEventListener("gesturechange", this.onGestureChange.bind(this));
        this.diagramContainer.addEventListener("gestureend", this.onGestureEnd.bind(this));
        // globals.js
        this.nodes = [];
        this.edges = [];

        this.movingNode = undefined;
        this.NodeUUID = 0;
        this.nodeMap = {};

        this.htmlnodes_parent = configuration.nodeContainer;


        if(configuration.diagram === null){ // Root Diagram
            // savenet.js (moved from top-level to function)
            reloadDiagram(this)
            // this.diagram = window;

        } else {
            this.diagram = configuration.diagram;
            this.parentNode = null;// host parentNode set by WindowedDiagram
            // this.diagram.addNode(this)
        }
        // this.diagramContainer = configuration.diagramContainer;
        this.nodeStep();
    }

    // FROM interface_v2

    skipAutopilot() {
        this.background.zoom = this.autopilot.zoomTo
        this.background.pan = this.autopilot.referenceFrame ? this.autopilot.referenceFrame.pos.plus(this.autopilot.panTo) : this.autopilot.panTo;
    }

    nextUUID() {
        while (this.nodeMap[this.NodeUUID] !== undefined) {
            this.NodeUUID++;
        }
        return this.NodeUUID;
    }

    // Function to toggle node selection
    toggleNodeSelection(node) {
        if (this.selectedNodeUUIDs.has(node.uuid)) {
            node.windowDiv.classList.toggle('selected');
            this.selectedNodeUUIDs.delete(node.uuid); // Deselect
            //console.log(`deselected`);
        } else {
            node.windowDiv.classList.toggle('selected');
            this.selectedNodeUUIDs.add(node.uuid); // Select
            //console.log(`selected`);
        }
    }

    clearNodeSelection() {
        this.selectedNodeUUIDs.forEach(uuid => {
            const node = this.findNodeByUUID(uuid); // Implement this function based on how your nodes are stored
            if (node) {
                node.windowDiv.classList.remove('selected');
            }
        });
        this.selectedNodeUUIDs.clear(); // Clear the set of selected UUIDs
    }

    findNodeByUUID(uuid) {
        return this.nodes.find(node => node.uuid === uuid);
    }

    getSelectedNodes() {
        // Return an array of node objects based on the selected UUIDs
        return Array.from(this.selectedNodeUUIDs).map(uuid => this.nodeMap[uuid]);
    }

    getNodeByTitle(title) {
        const lowerCaseTitle = title.toLowerCase();
        let matchingNodes = [];

        for (let n of this.nodes) {
            let nodeTitle = n.getTitle();

            if (nodeTitle !== null && nodeTitle.toLowerCase() === lowerCaseTitle) {
                matchingNodes.push(n);
            }
        }

        // Debugging: Show all matching nodes and their count
        //console.log(`Found ${matchingNodes.length} matching nodes for title ${title}.`);
        //console.log("Matching nodes:", matchingNodes);

        return matchingNodes.length > 0 ? matchingNodes[0] : null;
    }

    // added static
    static getTextareaContentForNode(node) {
        if (!node || !node.content) {
            // console.warn('Node or node.content is not available');
            return null;
        }

        if (!node.isTextNode) {
            // console.warn('Node is not a text node. Skipping text area and editable div logic.');
            return null;
        }

        const editableDiv = node.contentEditableDiv;
        const hiddenTextarea = node.textarea;
        //console.log(editableDiv, hiddenTextarea);
        if (!editableDiv || !hiddenTextarea) {
            console.warn('Either editableDiv or hiddenTextarea is not found.');
            return null;
        }

        // Explicitly sync the content
        syncTextareaWithContentEditable(hiddenTextarea, editableDiv);

        hiddenTextarea.dispatchEvent(new Event('input'));
        // Now get the textarea content
        if (hiddenTextarea) {
            return hiddenTextarea.value;
        } else {
            console.warn('Textarea not found in node');
            return null;
        }
    }

    testNodeText(title) {
        const node = this.getNodeByTitle(title);
        if (node) {
            console.log(`Fetching text for node with title: ${title}`);
            const text = Diagram.getTextareaContentForNode(node);
            console.log(`Text fetched: ${text}`);
            return text;
        } else {
            console.warn(`Node with title ${title} not found`);
            return null;
        }
    }

    getNodeText() {
        const nodes = [];
        for (const child of this.htmlnodes_parent.children) {
            if (child.firstChild && child.firstChild.win) {
                const node = child.firstChild.win;

                const titleInput = node.content.querySelector("input.title-input");
                //console.log(`Title Input for ${titleInput ? titleInput.value : 'Unnamed Node'}:`, titleInput); // Debugging line

                const contentText = Diagram.getTextareaContentForNode(node);
                //console.log(`Content Text for ${titleInput ? titleInput.value : 'Unnamed Node'}:`, contentText); // Debugging line

                nodes.push({
                    ...node,
                    titleInput: titleInput ? titleInput.value : '',
                    contentText: contentText ? contentText : ''
                });
            } else {
                console.warn('Node or child.firstChild.win not found'); // Debugging line
            }
        }
        return nodes;
    }

    edgeFromJSON(edgeList, nodeMap) {
        let pts = edgeList.p.map((k) => nodeMap[k]);

        if (pts.includes(undefined)) {
            console.warn("missing keys", edgeList, nodeMap);
        }

        // Check if edge already exists
        for (let e of this.edges) {
            let e_pts = e.pts.map(n => n.uuid).sort();
            let o_pts = edgeList.p.sort();
            if (JSON.stringify(e_pts) === JSON.stringify(o_pts)) {
                // Edge already exists, return without creating new edge
                return;
            }
        }

        let e = new Edge(pts, edgeList.l, edgeList.s, edgeList.g);

        for (let pt of pts) {
            pt.addEdge(e); // add edge to all points
        }

        this.edges.push(e);
        return e;
    }

    // added static
    static updateNodeEdgesLength(node) {
        node.edges.forEach(edge => {
            const currentLength = edge.currentLength;
            if (currentLength) {
                edge.length = currentLength;
            }
        });
    }

    frame() {
        this.gen.next();
        setTimeout(this.frame.bind(this), 100);
    }

    onPanInput() {
        const r = /([+-]?(([0-9]*\.[0-9]*)|([0-9]+))([eE][+-]?[0-9]+)?)\scale*,?\scale*([+-]?i?(([0-9]*\.[0-9]*)|([0-9]+))([eE][+-]?[0-9]+)?)/;
        const m = this.panInput.value.match(r);
        this.coordsLive = false;
        if (m === null) return;
        this.background.pan = new vec2(parseFloat(m[0]), parseFloat(m[6].replace(/[iI]/, "")));
    }

    onZoomInput(){
        const r = /([+-]?(([0-9]*\.[0-9]*)|([0-9]+))([eE][+-]?[0-9]+)?)/;
        const m = this.zoomInput.value.match(r);
        this.coordsLive = false;
        if (m === null) return;
        const z = parseFloat(m);
        if (z !== 0) {
            this.background.zoom = this.background.zoom.scale(z / this.background.zoom.mag());
        }
    }

    scaleSelectedNodes(scaleFactor, centralPoint) {
        const selectedNodes = this.getSelectedNodes();

        selectedNodes.forEach(node => {
            // Scale the node
            node.scale *= scaleFactor;


            // Adjust position to maintain relative spacing only if the node is not anchored
            if (node.anchorForce !== 1) {
                let directionToCentroid = node.pos.minus(centralPoint);
                node.pos = centralPoint.plus(directionToCentroid.scale(scaleFactor));
            }

            Diagram.updateNodeEdgesLength(node);
        });

        // If needed, scale the user screen (global zoom)
        //zoom = zoom.scale(scaleFactor);
        //pan = centralPoint.scale(1 - scaleFactor).plus(pan.scale(scaleFactor));
    }

    // added static
    static clearTextSelection() {
        if (window.getSelection) {
            if (window.getSelection().empty) {  // Chrome
                window.getSelection().empty();
            } else if (window.getSelection().removeAllRanges) {  // Firefox (not working)
                window.getSelection().removeAllRanges();
            }
        } else if (document.selection) {  // IE?
            document.selection.empty();
        }
    }

    getCentroidOfSelectedNodes() {
        const selectedNodes = this.getSelectedNodes();
        if (selectedNodes.length === 0) return null;

        let sumPos = new vec2(0, 0);
        selectedNodes.forEach(node => {
            sumPos = sumPos.plus(node.pos);
        });
        return sumPos.scale(1 / selectedNodes.length);
    }

    // START RENDERING STEPS

    nodeStep(time) {

        this.controlsStep();

        this.autoPilotStep();


        if (this.coordsLive) {
            this.panInput.value = this.background.pan.ctostring();
            this.zoomInput.value = this.background.zoom.mag() + "";
        }


        let dt = this.timeStep(time);

        this.backgroundStep();

        for (let n of this.nodes) {
            n.step(dt);
        }
        for (let e of this.edges) {
            e.step(dt);
        }
        nodeMode_v = lerp(nodeMode_v, nodeMode, 0.125);
        window.requestAnimationFrame(this.nodeStep.bind(this));
    }

    controlsStep() {
        const selectedNodes = this.getSelectedNodes();


        /* movenodes.js
        *  - getDirectionFromKeyState()
        *  - keyState
        */
        // Determine the combined direction from the key state
        const combinedDirection = getDirectionFromKeyState();

        // Process scaling keys
        Object.keys(keyState).forEach(key => {
            if (keyState[key]) {
                const action = directionMap[key];

                if (action === 'scaleUp' || action === 'scaleDown') {
                    const scaleFactor = action === 'scaleUp' ? SCALE_UP_FACTOR : SCALE_DOWN_FACTOR;
                    const centroid = this.getCentroidOfSelectedNodes();
                    if (centroid) {
                        this.scaleSelectedNodes(scaleFactor, centroid);
                    }
                }
            }
        });

        // Handle directional movement
        if (combinedDirection.length > 0 && selectedNodes.length > 0) {
            // Find the node with the largest scale
            let largestScaleNode = selectedNodes.reduce((max, node) => node.scale > max.scale ? node : max, selectedNodes[0]);

            // Apply movement to the node with the largest scale
            let forceApplied = largestScaleNode.moveNode(combinedDirection);

            // Apply the same force to the remaining nodes
            selectedNodes.forEach(node => {
                if (node !== largestScaleNode) {
                    node.force = node.force.plus(forceApplied);
                }
            });
        }
    }

    timeStep(time) {
        if (this.currentTime === undefined) {
            this.currentTime = time;
        }
        let dt = time - this.currentTime;
        this.currentTime = time;
        if (dt > 0) {
            const alpha = Math.exp(-1 * dt / 1000);
            this.avgFPS = this.avgFPS * alpha + (1 - alpha) * 1000 / dt;
        }

        document.getElementById("debug_layer").children[1].textContent = "fps:" + this.avgFPS;
        document.getElementById("fps").textContent = Math.round(this.avgFPS).toString() + " fps";
        dt *= (1 - nodeMode_v) ** 5;
        return dt;
    }

    backgroundStep() {
        this.prevNodeToConnect = this.background.step(nodeMode, nodeMode_v, this.prevNodeToConnect)
    }

    autoPilotStep() {
        let autopilot_travelDist = 0;
        let newPan;

        if (this.autopilot.referenceFrame && this.autopilot.speed !== 0) {
            if (this.autopilot.panToI_prev === undefined) {
                this.autopilot.panToI_prev = this.autopilot.referenceFrame.pos.scale(1);
                this.autopilot.prevNodeScale = this.autopilot.referenceFrame.scale; // Initialize prevNodeScale
            }
            this.autopilot.panToI = this.autopilot.panToI.scale(1 - settings.autopilotRF_Iscale).plus(this.autopilot.referenceFrame.pos.minus(this.autopilot.panToI_prev).scale(settings.autopilotRF_Iscale));
            newPan = this.background.pan.scale(1 - this.autopilot.speed).plus(this.autopilot.referenceFrame.pos.scale(this.autopilot.speed).plus(this.autopilot.panToI));
            this.autopilot.panToI_prev = this.autopilot.referenceFrame.pos.scale(1);

            if (this.autopilot.referenceFrame.scale !== this.autopilot.prevNodeScale) {
                let nodeScaleFactor = this.autopilot.referenceFrame.scale / this.autopilot.prevNodeScale;

                // Adjust zoomTo.scale based on nodeScaleFactor
                this.autopilot.zoomTo = this.autopilot.zoomTo.scale(nodeScaleFactor);

                this.autopilot.prevNodeScale = this.autopilot.referenceFrame.scale; // Update the previous scale
            }
        } else {
            newPan = this.background.pan.scale(1 - this.autopilot.speed).plus(this.autopilot.panTo.scale(this.autopilot.speed));
            this.autopilot.panToI_prev = undefined;
        }
        autopilot_travelDist = this.background.pan.minus(newPan).mag() / this.background.zoom.mag();
        if (autopilot_travelDist > settings.autopilotMaxSpeed) {
            newPan = this.background.pan.plus(newPan.minus(this.background.pan).scale(settings.autopilotMaxSpeed / autopilot_travelDist));
            const speedCoeff = Math.tanh(Math.log(settings.autopilotMaxSpeed / autopilot_travelDist + 1e-300) / 10) * 2;
            this.background.zoom = this.background.zoom.scale(1 - speedCoeff * this.autopilot.speed);
            //*Math.log(autopilot_travelDist/settings.autopilotMaxSpeed));
        } else {
            this.background.zoom = this.background.zoom.scale(1 - this.autopilot.speed).plus(this.autopilot.zoomTo.scale(this.autopilot.speed));
        }
        this.background.pan = newPan;
    }

    // END RENDERING STEPS

    // OVERRIDE Node default handlers
    onclick(event) {
        if(this.diagram !== null) super.onclick(event)
    }
    ondblclick(event) {
        if(this.diagram !== null) super.ondblclick(event)
    }
    onmousedown(event) {
        if(this.diagram !== null) super.onmousedown(event)
    }
    onmouseup(event) {
        if(this.diagram !== null) super.onmouseup(event)
    }
    onmousemove(event) {
        if(this.diagram !== null) super.onmousemove(event)
    }
    onwheel(event) {
        if(this.diagram !== null) super.onwheel(event)
    }
    // End OVERRIDE

    // Diagram handlers
    onWheel(event){

        // Get the element that the user is scrolling on
        let targetElement = event.target;

        while (targetElement) {
            // Check if the target is a textarea or contenteditable
            if (targetElement.tagName.toLowerCase() === 'textarea' ||
                targetElement.contentEditable === 'true' ||
                (targetElement.classList.contains("scrollable-content") &&
                !targetElement.classList.contains("diagram-window"))) {
                return;
            }
            targetElement = targetElement.parentElement;
        }

        // console.log("Diagram.onWheel: uuid:", this.uuid, "nodeMode: ", nodeMode)
        if (nodeMode !== 1 && event.getModifierState(settings.rotateModifier)) {
            this.autopilot.speed = 0;
            this.coordsLive = true;
            let amount = event.wheelDelta * settings.rotateModifierSpeed;
            let p = this.background.toZ(new vec2(event.pageX, event.pageY));
            let zc = p.minus(this.background.pan);
            // p = zoom*center+pan = zoom'*center+pan'
            // zoom' = zoom*rot
            // pan' = pan + (zoom*center-zoom*rot*center)
            //      = pan + (1-rot) * zoom*center
            let r = new vec2(Math.cos(amount), Math.sin(amount));
            this.background.zoom = this.background.zoom.cmult(r);
            this.background.pan = this.background.pan.plus(zc.cmult(new vec2(1, 0).minus(r)));
            cancel(event);
            return;
        }
        if (settings.scroll === "zoom") {
            this.autopilot.speed = 0;
            deselectCoordinate();

            this.coordsLive = true;
            let containerBounds = this.diagramContainer.getBoundingClientRect()
            let topLeft = new vec2(containerBounds.x, containerBounds.y);
            // if(this.diagram !== null) {
            //     topLeft = this.diagram.background.toS(topLeft)
            // }
            let destPoint = this.background.mousePos.minus(topLeft);
            let dest = this.background.toZ(destPoint);
            // console.log("Zoom destination: ", dest, " mouse position: ", destPoint)
            this.background.regenAmount += Math.abs(event.wheelDelta);
            let amount = Math.exp(event.wheelDelta * settings.zoomSpeed);
            this.background.zoom = this.background.zoom.scale(amount);
            this.background.pan = dest.scale(1 - amount).plus(this.background.pan.scale(amount));
            cancel(event);
        } else if (settings.scroll === "pan") {
            this.autopilot.speed = 0;
            this.coordsLive = true;
            let dest = this.background.toZ(this.background.mousePos);
            let dp;
            let amount;
            if (event.ctrlKey) {
                dp = new vec2(0, 0);
                amount = event.deltaY * settings.zoomSpeed;
            } else {
                dp = this.background.toDZ(new vec2(event.deltaX, event.deltaY).scale(settings.panSpeed));
                amount = event.deltaZ * settings.zoomSpeed;
            }
            this.background.regenAmount += Math.hypot(event.deltaX, event.deltaY, event.deltaZ);
            amount = Math.exp(amount)
            this.background.zoom = this.background.zoom.scale(amount);
            this.background.pan = dest.scale(1 - amount).plus(this.background.pan.scale(amount)).plus(dp);
            cancel(event);
            event.preventDefault();
        }
    }

    onMouseDown(event){
        this.autopilot.speed = 0;
        this.mouseDownPos = this.background.mousePos.scale(1);
        this.mouseDown = true;
        cancel(event);
    }

    onMouseUp(event) {
        this.mouseDown = false;
        if (this.movingNode !== undefined) {
            this.movingNode.onmouseup(event);
        }
        isDraggingIcon = false; // Reset the flag
    }

    onMouseMove(event) {
        if (this.mouseDown) {
            this.autopilot.speed = 0;
            this.coordsLive = true;
            let delta = this.background.mousePos.minus(this.mouseDownPos);
            this.background.pan = this.background.pan.minus(this.background.toDZ(delta));
            this.background.regenAmount += delta.mag() * 0.25;
            this.mouseDownPos = this.background.mousePos.scale(1);
        }
    }

    onTouchStart(ev){
        for (let i = 0; i < ev.changedTouches.length; i++) {
            const touch = ev.changedTouches.item(i);
            this.touches.set(touch.identifier, {
                prev: touch,
                now: touch
            });
        }
    }

    onTouchCancel(ev){
        for (let i = 0; i < ev.changedTouches.length; i++) {
            const touch = ev.changedTouches.item(i);
            this.touches.delete(touch.identifier);
        }
    }

    onTouchEnd(ev) {
        //pan = pan.plus(new vec2(0,-1))
        switch (this.touches.size) {
            case 2: //tap to zoom
                if (ev.changedTouches.length == 1) {
                    const id = ev.changedTouches.item(0).identifier;
                    const t = this.touches.get(id);
                    if (t && t.prev == t.now) { //hasn't moved
                        const ts = [...this.touches.keys()];
                        const other = this.touches.get(ts[0] === id ? ts[1] : ts[0])
                        const {scale} = this.background.windowScaleAndOffset();
                        const amount = Math.exp(-(other.now.clientY - t.now.clientY) / scale);
                        const dest = this.background.toZ(new vec2(other.now.clientX, other.now.clientY));
                        this.background.zoom = this.background.zoom.scale(amount);
                        this.background.pan = dest.scale(1 - amount).plus(this.background.pan.scale(amount));
                    }
                }
                break;

        }
        for (let i = 0; i < ev.changedTouches.length; i++) {
            const touch = ev.changedTouches.item(i);
            this.touches.delete(touch.identifier);
        }
    };

    onTouchMove(ev) {
        for (let i = 0; i < ev.changedTouches.length; i++) {
            const touch = ev.changedTouches.item(i);
            this.touches.set(touch.identifier, {
                prev: this.touches.get(touch.identifier)?.now,
                now: touch
            });
        }
        switch (this.touches.size) {
            case 1:
                this.autopilot.speed = 0;
                this.coordsLive = true;
                const t = [...this.touches.values()][0];
                this.background.pan = this.background.pan.plus(this.background.toDZ(new vec2(t.prev.clientX, t.prev.clientY).minus(new vec2(t.now.clientX, t.now.clientY))));
                cancel(ev);
                break;
            case 2:
            /*
            const pts = [...touches.values()];
            const p1p = toS(new vec2(pts[0].prev.clientX,pts[0].prev.clientY));
            const p2p = toS(new vec2(pts[1].prev.clientX,pts[1].prev.clientY));
            const p1n = toS(new vec2(pts[0].now.clientX,pts[0].now.clientY));
            const p2n = toS(new vec2(pts[1].now.clientX,pts[1].now.clientY));
            //want to find new zoom,pan such that
            // old toZ(p1p) = new toZ(p1n)
            // old toZ(p2p) = new toZ(p2n)
            //
            //  toZ(x) ≈ x*zoom + pan
            //
            // so, we want zoom' pan' scale.t.
            //  p1p*zoom + pan = p1n*zoom' + pan'
            //  p2p*zoom + pan = p2n*zoom' + pan'
            //
            //  (p2p-p1p) * zoom = (p2n-p1n) * zoom'
            //  (p1p+p2p)*zoom + 2pan = (p1p+p2p)*zoom' + 2pan'
            //
            //  zoom' = zoom * (p2p-p1p)/(p2n-p1n)
            //  pan' = pan + (p1p+p2p)*zoom/2 - (p1p+p2p)*zoom'/2
            //       = pan + (p1p+p2p)*(zoom - zoom')/2
            const nzoom = zoom.cmult( p2p.minus(p1p).cdiv( p2n.minus(p1n)));
            pan = pan.plus(p2p.plus(p1p).cmult(zoom.minus(nzoom)).scale(0.5));
            zoom = nzoom;


            ev.preventDefault();
            cancel(ev);
            break;
            */
            default:
                break;
        }
    }

    onGestureStart(e) {
        e.preventDefault();
        //console.log(e);
        this.gestureStartParams.rotation = e.rotation;
        this.gestureStartParams.scale = e.scale;
        this.gestureStartParams.x = e.pageX;
        this.gestureStartParams.y = e.pageY;
        this.gestureStartParams.zoom = this.background.zoom;
        this.gestureStartParams.pan = this.background.pan;
    }

    onGestureChange(e){
        e.preventDefault();
        //console.log(e);
        let d_theta = e.rotation - this.gestureStartParams.rotation;
        let d_scale = e.scale;
        let r = -e.rotation * settings.gestureRotateSpeed;
        this.background.pan = this.gestureStartParams.pan;
        this.background.zoom = this.gestureStartParams.zoom;
        let r_center = this.background.toZ(new vec2(e.pageX, e.pageY));
        let scale = 0;
        this.background.zoom = this.gestureStartParams.zoom.cmult(new vec2(Math.cos(r), Math.sin(r)));
        if (e.scale !== 0) {
            let scale = 1 / e.scale;
            this.background.zoom = this.background.zoom.scale(scale);
            this.background.regenAmount += Math.abs(Math.log(scale)) * settings.maxLines;
        }
        let dest = r_center;
        let amount = scale;
        let dp = r_center.minus(this.gestureStartParams.pan);
        this.background.pan = this.gestureStartParams.pan.plus(
            dp.minus(dp.cmult(this.background.zoom.cdiv(this.gestureStartParams.zoom))));
        //pan = dest.scale(1-amount).plus(gestureStartParams.pan.scale(amount));
    }

    onGestureEnd(e){
        e.preventDefault();
    }

    // From WindowedNode/window/Specific node

    addNode(node){
        this.htmlnodes_parent.appendChild(node.content);
        this.registerNode(node)
        if(this.parentNode && node instanceof WindowedDiagram) {
            // Nested WindowedDiagram
            let diagram = this;
            while(diagram) {
                diagram.bumpHeight();
                diagram = diagram.diagram;
            }
        }
    }

    bumpHeight(){
        if(this.parentNode) {
            // Nested WindowedDiagram
            this.parentNode.applyResize(this.parentNode.width, 0, this.parentNode.height, 120 )
        }
    }

    registerNode(node) {
        this.nodes.push(node);
        this.nodeMap[node.uuid] = node;
    }

    // Utility for background

    absoluteScaleAndOffset(element, pos, innerScale){
        let diagram = this;
        let {scale, offset} = diagram.background.windowScaleAndOffset();
        pos.x = scale * pos.x + offset.x;
        pos.y = scale * pos.y + offset.y;
        let bb = element.getBoundingClientRect();
        pos = pos.minus(new vec2(bb.width, bb.height).scale(0.5 / innerScale));
        // diagram = diagram.diagram;
        while (diagram !== null) {
            // let {scale, offset} = diagram.background.windowScaleAndOffset();
            // pos.x = scale * pos.x;
            // pos.y = scale * pos.y;// + offset.y;

            if(diagram.parentNode) {
                let scale = diagram.parentNode.intrinsicScale * diagram.parentNode.scale * (diagram.diagram.background.zoom.mag2() ** -settings.zoomContentExp)
                // if(scale !== 1) console.log("Diagram: ", this.uuid,"->", diagram.uuid,  " scale: ", scale)
                pos.x /= scale;
                pos.y /= scale;
            }
            diagram = diagram.diagram;
        }
        // pos.x += offset.x;
        // pos.y += offset.y;
        return pos;
    }
}

window.rootDiagram = null;

function createMainDiagram(){
    window.rootDiagram = new Diagram({
        nodeContainer: document.getElementById("nodes"),
        edgeContainer: document.getElementById("edges"),
        panInput: document.getElementById("pan"),
        zoomInput: document.getElementById("zoom"),
        coordsLive: true,
        coordinateContainer: document.getElementById("coordinates"),
        background: {
            svg_element: svg,
            svg_bg_element: svg.getElementById("bg"),
            svg_viewmat_element: svg.getElementById("viewmatrix"),
            svg_mousePath_element: svg.getElementById("mousePath"),
        },
        id: 0
   })
   Node.DEFAULT_CONFIGURATION.diagram = rootDiagram;
}


class WindowedDiagram extends WindowedNode {
    static DEFAULT_CONFIGURATION = { // just for eg, we cant pass default values
        id: undefined,
        parent: undefined,
    }
    static SAVE_PROPERTIES = [];
    // constructor(title, content, pos, scale, iscale, link) {
    constructor(configuration= WindowedDiagram.DEFAULT_CONFIGURATION) {
        let {diagramContainer, diagram} = WindowedDiagram._getContentElement(configuration.id, configuration.parent);
        super({ content: [diagramContainer],  diagram: configuration.parent,  title: "diagram: " + configuration.id, ...WindowedNode.getNaturalScaleParameters() });
        configuration.parent.addNode(this)
        this.diagramContainer = diagramContainer;
        this.innerDiagram = diagram;
        diagram.parentNode = this;
        super.setMinSize(808, 500);
        this.onResize(808,500)
        WindowedNode.makeContentScrollable(this.content)
        this.windowDiv.parentNode.classList.add("diagram-window")
        this.proxyEventListeners();

    }

    static _getContentElement(id, parent) {
        let diagramContainer = document.createElement("div");
        let nodeContainer = document.createElement("a");
        nodeContainer.id = "nodes-" + id;
        let edgeContainer = document.createElementNS("http://www.w3.org/2000/svg","g");
        edgeContainer.id = "edges-" + id;
        let panInput = document.createElement("input")
        panInput.id = "pan-" + id;
        panInput.type = "text";
        panInput.style.background = "none";
        panInput.style.border = "none";
        panInput.size = "28";
        let zoomInput = document.createElement("input")
        zoomInput.id = "zoom-" + id;
        zoomInput.type = "text";
        zoomInput.style.background = "none";
        zoomInput.style.border = "none";
        zoomInput.size = "25";
        let svg_element = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg_element.id = "svg_bg-" + id;
        svg_element.setAttribute("viewBox", "0 0 0 0");
        svg_element.setAttribute("width","100%");
        svg_element.setAttribute("height","100vh");
        svg_element.setAttribute("top","0");
        svg_element.setAttribute("left", "0");
        svg_element.setAttribute("position", "fixed");
        svg_element.style.width = "100%"
        svg_element.style.height = "100%"
        svg_element.style.display = "block"
        let svg_viewmat_element = document.createElementNS("http://www.w3.org/2000/svg", "g");
        svg_viewmat_element.id = "viewmatrix-" + id;
        let svg_bg_element = document.createElementNS("http://www.w3.org/2000/svg", "g");
        svg_bg_element.id = "bg-" + id;
        svg_bg_element.style.width = "100%"
        svg_bg_element.style.height = "100%"
        svg_bg_element.style.display = "block"
        let svg_mousePath_element = document.createElementNS("http://www.w3.org/2000/svg","path");
        svg_mousePath_element.id = "mousePath-" + id;
        svg_mousePath_element.setAttribute("fill", "none");
        svg_mousePath_element.setAttribute("stroke", "rgb(50 51 62 / 80%)");
        svg_mousePath_element.setAttribute("stroke-width","6.144");

        svg_viewmat_element.append(svg_bg_element, svg_mousePath_element, edgeContainer)
        svg_element.append(svg_viewmat_element)
        diagramContainer.append(svg_element, nodeContainer)

        let diagram = new Diagram({
            diagramContainer,
            nodeContainer,
            edgeContainer,
            panInput,
            zoomInput,
            coordsLive: false,
            coordinateContainer: null,
            diagram: parent,
            background: {
                svg_element,
                svg_bg_element,
                svg_viewmat_element,
                svg_mousePath_element
            },
            id,
        });
        return {diagramContainer, diagram};
    }

    proxyEventListeners(){

    }

    onResize(newWidth, newHeight) {
        super.onResize(newWidth, newHeight);
        // Set the new dimensions for the diagram wrapper div
        this.diagramContainer.style.width = `${newWidth}px`;
        this.diagramContainer.style.height = `${newHeight - 65}px`;


    }
}

createMainDiagram();

function createDiagram(id, parent){
    return new WindowedDiagram({id, parent})
}

// function createDiagram(id, parent){
//     let diagramContainer = document.createElement("div");
//     let nodeContainer = document.createElement("a");
//     nodeContainer.id = "nodes-" + id;
//     let edgeContainer = document.createElement("g");
//     edgeContainer.id = "edges-" + id;
//     let panInput = document.createElement("input")
//     panInput.id = "pan-" + id;
//     panInput.type = "text";
//     panInput.style.background = "none";
//     panInput.style.border = "none";
//     panInput.size = "28";
//     let zoomInput = document.createElement("input")
//     zoomInput.id = "zoom-" + id;
//     zoomInput.type = "text";
//     zoomInput.style.background = "none";
//     zoomInput.style.border = "none";
//     zoomInput.size = "25";
//     let svg_element = document.createElement("svg");
//     svg_element.id = "svg_bg-" + id;
//     svg_element.viewBox= "0 0 0 0"
//     svg_element.width = "100%";
//     svg_element.height = "100vh";
//     svg_element.top = "0";
//     svg_element.left = "0";
//     svg_element.position = "fixed";
//     let svg_viewmat_element = document.createElement("g");
//     svg_viewmat_element.id = "viewmatrix-" + id;
//     let svg_bg_element = document.createElement("g");
//     svg_bg_element.id = "bg-" + id;
//     let svg_mousePath_element = document.createElement("path");
//     svg_mousePath_element.id = "mousePath-" + id;
//
//     svg_bg_element.append(svg_mousePath_element)
//     svg_viewmat_element.append(svg_bg_element, edgeContainer)
//     svg_element.append(svg_viewmat_element)
//     diagramContainer.append(svg_element, nodeContainer)
//
//     let diagram = new Diagram({
//         diagramContainer,
//         nodeContainer,
//         edgeContainer,
//         panInput,
//         zoomInput,
//         coordsLive: false,
//         coordinateContainer: null,
//         diagram: parent,
//         background: {
//             svg_element,
//             svg_bg_element,
//             svg_viewmat_element,
//             svg_mousePath_element
//         }
//     });
//     let diagramNode = new WindowedNode({content: [diagramContainer], title: "diagram: " + id, ...WindowedNode.getNaturalScaleParameters() });
//     parent.addNode(diagramNode)
//     // diagram.fo
//     return {diagram, diagramNode};
// }