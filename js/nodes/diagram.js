
// Utility escape method for RegExp
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
        nodeContainer: undefined,
        edgeContainer: undefined,
        panInput: undefined,
        zoomInput: undefined,
        coordsLive: true,
        coordinateContainer: undefined,
        diagram: null
    }

    constructor(configuration= Diagram.DEFAULT_CONFIGURATION) {
        configuration = {...Diagram.DEFAULT_CONFIGURATION, ...configuration}
        // TO-DO: review
        super({...configuration, pos: background.pan, content: configuration.nodeContainer, saved: true, saveData: {json: { uuid: "d0"}}});
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
        this.gen = background.iter();
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
        this.mousePathPos = undefined;
        this.currentTime = undefined;// previously current_time
        this.regenAmount = 0;
        this.regenDebt = 0
        this.avgFPS = 0; // previously avgfps
        this.autopilot.panToI = new vec2(0, 0); // previously panToI
        this.autopilot.panToI_prev = undefined; // previously panToI_prev
        this.autopilot.prevNodeScale = 1; // previously prevNodeScale
        document.addEventListener('wheel', this.onWheel.bind(this));
        this.mouseDown = false;
        this.mouseDownPos = new vec2(0, 0);
        addEventListener("mousedown", this.onMouseDown.bind(this));
        addEventListener("mouseup", this.onMouseUp.bind(this));
        addEventListener("mousemove", this.onMouseMove.bind(this));
        this.touches = new Map();
        addEventListener("touchstart", this.onTouchStart.bind(this), false);
        addEventListener("touchcancel", this.onTouchCancel.bind(this), false);
        addEventListener("touchend", this.onTouchEnd.bind(this), false);
        addEventListener("touchmove", this.onTouchMove.bind(this), false);
        this.gestureStartParams = {
            rotation: 0,
            x: 0,
            y: 0,
            scale: 0,
            zoom: new vec2(),
            pan: new vec2()
        };
        addEventListener("gesturestart", this.onGestureStart.bind(this));
        addEventListener("gesturechange", this.onGestureChange.bind(this));
        addEventListener("gestureend", this.onGestureEnd.bind(this));
        // globals.js
        this.nodes = [];
        this.edges = [];
        this.nodeMode_v = 0;
        this.nodeMode = 0;

        this.movingNode = undefined;
        this.NodeUUID = 0;
        this.nodeMap = {};

        // savenet.js (moved from top-level to function)
        reloadDiagram(this)

        this.nodeStep();
        // htmlnodes_parent is this.content
    }

    // FROM interface_v2

    skipAutopilot() {
        background.zoom = this.autopilot.zoomTo
        background.pan = this.autopilot.referenceFrame ? this.autopilot.referenceFrame.pos.plus(this.autopilot.panTo) : this.autopilot.panTo;
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
        for (const child of this.content.children) {
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
        background.pan = new vec2(parseFloat(m[0]), parseFloat(m[6].replace(/[iI]/, "")));
    }

    onZoomInput(){
        const r = /([+-]?(([0-9]*\.[0-9]*)|([0-9]+))([eE][+-]?[0-9]+)?)/;
        const m = this.zoomInput.value.match(r);
        this.coordsLive = false;
        if (m === null) return;
        const z = parseFloat(m);
        if (z !== 0) {
            background.zoom = background.zoom.scale(z / background.zoom.mag());
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
            this.panInput.value = background.pan.ctostring();
            this.zoomInput.value = background.zoom.mag() + "";
        }


        let dt = this.timeStep(time);

        this.backgroundStep();

        for (let n of this.nodes) {
            n.step(dt);
        }
        for (let e of this.edges) {
            e.step(dt);
        }
        this.nodeMode_v = lerp(this.nodeMode_v, this.nodeMode, 0.125);
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
        dt *= (1 - this.nodeMode_v) ** 5;
        return dt;
    }

    backgroundStep() {
        background.updateViewbox();

        if (background.mousePath == "") {
            this.mousePathPos = background.toZ(background.mousePos);
            background.mousePath = "M " + background.toSVG(this.mousePathPos).str() + " L ";
        }
        for (let i = 0; i < settings.orbitStepRate; i++) {
            //let g = mandGrad(settings.iterations,mousePathPos);
            //mousePathPos = mousePathPos.plus(g.unscale((g.mag()+1e-10)*1000));

            this.mousePathPos = MandelbrotBG.mand_step(this.mousePathPos, background.toZ(background.mousePos));

            //let p = findPeriod(mousePathPos);
            //mousePathPos = mand_iter_n(p,mousePathPos,mousePathPos);
            if (background.toSVG(this.mousePathPos).isFinite() && background.toSVG(this.mousePathPos).mag2() < 1e60)
                background.mousePath += background.toSVG(this.mousePathPos).str() + " ";


        }
        let width = background.zoom.mag() * 0.0005 * background.SVGzoom;

        if (this.nodeMode && this.prevNodeToConnect !== undefined) {
            Diagram.clearTextSelection();
            background.svg_mousePath.setAttribute("d", "M " + background.toSVG(this.prevNodeToConnect.pos).str() + " L " + background.toSVG(background.toZ(background.mousePos)).str());
            width *= 50; // This will increase the width when connecting nodes. Adjust as needed.
        } else {
            background.svg_mousePath.setAttribute("d", background.mousePath);
        }

        // Moved the check to clear prevNodeToConnect outside of the if-else block
        if (!this.nodeMode && this.prevNodeToConnect !== undefined) {
            this.prevNodeToConnect = undefined;

            // Clear the mouse path
            background.mousePath = "";
            background.svg_mousePath.setAttribute("d", "");
            Diagram.clearTextSelection();
        }

        background.svg_mousePath.setAttribute("stroke-width", width + "");

        this.regenDebt = Math.min(16, this.regenDebt + lerp(settings.regenDebtAdjustmentFactor, this.regenAmount, Math.min(1, (this.nodeMode_v ** 5) * 1.01)));
        for (; this.regenDebt > 0; this.regenDebt--) {
            background.render_hair(Math.random() * settings.renderSteps);
        }
        this.regenAmount = 0;
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
            newPan = background.pan.scale(1 - this.autopilot.speed).plus(this.autopilot.referenceFrame.pos.scale(this.autopilot.speed).plus(this.autopilot.panToI));
            this.autopilot.panToI_prev = this.autopilot.referenceFrame.pos.scale(1);

            if (this.autopilot.referenceFrame.scale !== this.autopilot.prevNodeScale) {
                let nodeScaleFactor = this.autopilot.referenceFrame.scale / this.autopilot.prevNodeScale;

                // Adjust zoomTo.scale based on nodeScaleFactor
                this.autopilot.zoomTo = this.autopilot.zoomTo.scale(nodeScaleFactor);

                this.autopilot.prevNodeScale = this.autopilot.referenceFrame.scale; // Update the previous scale
            }
        } else {
            newPan = background.pan.scale(1 - this.autopilot.speed).plus(this.autopilot.panTo.scale(this.autopilot.speed));
            this.autopilot.panToI_prev = undefined;
        }
        autopilot_travelDist = background.pan.minus(newPan).mag() / background.zoom.mag();
        if (autopilot_travelDist > settings.autopilotMaxSpeed) {
            newPan = background.pan.plus(newPan.minus(background.pan).scale(settings.autopilotMaxSpeed / autopilot_travelDist));
            const speedCoeff = Math.tanh(Math.log(settings.autopilotMaxSpeed / autopilot_travelDist + 1e-300) / 10) * 2;
            background.zoom = background.zoom.scale(1 - speedCoeff * this.autopilot.speed);
            //*Math.log(autopilot_travelDist/settings.autopilotMaxSpeed));
        } else {
            background.zoom = background.zoom.scale(1 - this.autopilot.speed).plus(this.autopilot.zoomTo.scale(this.autopilot.speed));
        }
        background.pan = newPan;
    }

    // END RENDERING STEPS

    onWheel(event){

        // Get the element that the user is scrolling on
        let targetElement = event.target;

        while (targetElement) {
            // Check if the target is a textarea or contenteditable
            if (targetElement.tagName.toLowerCase() === 'textarea' ||
                targetElement.contentEditable === 'true' || targetElement.classList.contains("scrollable-content")) {
                return;
            }
            targetElement = targetElement.parentElement;
        }
        if (this.nodeMode !== 1 && event.getModifierState(settings.rotateModifier)) {
            this.autopilot.speed = 0;
            this.coordsLive = true;
            let amount = event.wheelDelta * settings.rotateModifierSpeed;
            let p = background.toZ(new vec2(event.pageX, event.pageY));
            let zc = p.minus(background.pan);
            // p = zoom*center+pan = zoom'*center+pan'
            // zoom' = zoom*rot
            // pan' = pan + (zoom*center-zoom*rot*center)
            //      = pan + (1-rot) * zoom*center
            let r = new vec2(Math.cos(amount), Math.sin(amount));
            background.zoom = background.zoom.cmult(r);
            background.pan = background.pan.plus(zc.cmult(new vec2(1, 0).minus(r)));
            cancel(event);
            return;
        }
        if (settings.scroll === "zoom") {
            this.autopilot.speed = 0;
            deselectCoordinate();

            this.coordsLive = true;
            let dest = background.toZ(background.mousePos);
            this.regenAmount += Math.abs(event.wheelDelta);
            let amount = Math.exp(event.wheelDelta * settings.zoomSpeed);
            background.zoom = background.zoom.scale(amount);
            background.pan = dest.scale(1 - amount).plus(background.pan.scale(amount));
            cancel(event);
        } else if (settings.scroll === "pan") {
            this.autopilot.speed = 0;
            this.coordsLive = true;
            let dest = background.toZ(background.mousePos);
            let dp;
            let amount;
            if (event.ctrlKey) {
                dp = new vec2(0, 0);
                amount = event.deltaY * settings.zoomSpeed;
            } else {
                dp = background.toDZ(new vec2(event.deltaX, event.deltaY).scale(settings.panSpeed));
                amount = event.deltaZ * settings.zoomSpeed;
            }
            this.regenAmount += Math.hypot(event.deltaX, event.deltaY, event.deltaZ);
            amount = Math.exp(amount)
            background.zoom = background.zoom.scale(amount);
            background.pan = dest.scale(1 - amount).plus(background.pan.scale(amount)).plus(dp);
            cancel(event);
            event.preventDefault();
        }
    }

    onMouseDown(event){
        this.autopilot.speed = 0;
        this.mouseDownPos = background.mousePos.scale(1);
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
            let delta = background.mousePos.minus(this.mouseDownPos);
            background.pan = background.pan.minus(background.toDZ(delta));
            this.regenAmount += delta.mag() * 0.25;
            this.mouseDownPos = background.mousePos.scale(1);
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
                        const {scale} = background.windowScaleAndOffset();
                        const amount = Math.exp(-(other.now.clientY - t.now.clientY) / scale);
                        const dest = background.toZ(new vec2(other.now.clientX, other.now.clientY));
                        background.zoom = background.zoom.scale(amount);
                        background.pan = dest.scale(1 - amount).plus(background.pan.scale(amount));
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
                background.pan = background.pan.plus(background.toDZ(new vec2(t.prev.clientX, t.prev.clientY).minus(new vec2(t.now.clientX, t.now.clientY))));
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
        this.gestureStartParams.zoom = background.zoom;
        this.gestureStartParams.pan = background.pan;
    }

    onGestureChange(e){
        e.preventDefault();
        //console.log(e);
        let d_theta = e.rotation - this.gestureStartParams.rotation;
        let d_scale = e.scale;
        let r = -e.rotation * settings.gestureRotateSpeed;
        background.pan = this.gestureStartParams.pan;
        background.zoom = this.gestureStartParams.zoom;
        let r_center = background.toZ(new vec2(e.pageX, e.pageY));
        let scale = 0;
        background.zoom = this.gestureStartParams.zoom.cmult(new vec2(Math.cos(r), Math.sin(r)));
        if (e.scale !== 0) {
            let scale = 1 / e.scale;
            background.zoom = background.zoom.scale(scale);
            this.regenAmount += Math.abs(Math.log(scale)) * settings.maxLines;
        }
        let dest = r_center;
        let amount = scale;
        let dp = r_center.minus(this.gestureStartParams.pan);
        background.pan = this.gestureStartParams.pan.plus(
            dp.minus(dp.cmult(background.zoom.cdiv(this.gestureStartParams.zoom))));
        //pan = dest.scale(1-amount).plus(gestureStartParams.pan.scale(amount));
    }

    onGestureEnd(e){
        e.preventDefault();
    }

    // From WindowedNode/window/Specific node

    addNode(node){
        this.content.appendChild(node.content);
        this.registerNode(node)
    }

    registerNode(node) {
        this.nodes.push(node);
        this.nodeMap[node.uuid] = node;
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
   })
    Node.DEFAULT_CONFIGURATION.diagram = rootDiagram;
}
createMainDiagram();