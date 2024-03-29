//https://github.com/tc39/proposal-regex-escaping/blob/main/specInJs.js
// this is a direct translation to code of the spec

// const DISABLE_FORCE = true;


// if (!RegExp.escape) {
//     RegExp.escape = (S) => {
//         // 1. let str be ToString(S).
//         // 2. ReturnIfAbrupt(str).
//         let str = String(S);
//         // 3. Let cpList be a List containing in order the code
//         // points as defined in 6.1.4 of str, starting at the first element of str.
//         let cpList = Array.from(str[Symbol.iterator]());
//         // 4. let cuList be a new List
//         let cuList = [];
//         // 5. For each code point c in cpList in List order, do:
//         for (let c of cpList) {
//             // i. If c is a SyntaxCharacter then do:
//             if ("^$\\.*+?()[]{}|".indexOf(c) !== -1) {
//                 // a. Append "\" to cuList.
//                 cuList.push("\\");
//             }
//             // Append c to cpList.
//             cuList.push(c);
//         }
//         //6. Let L be a String whose elements are, in order, the elements of cuList.
//         let L = cuList.join("");
//         // 7. Return L.
//         return L;
//     };
// }

// var zoomTo = new vec2(4, 0);
// var panTo = new vec2(0, 0);
// var autopilotReferenceFrame = undefined;
// var autopilotSpeed = 0;

// function skipAutopilot() {
//     background.zoom = rootDiagram.autopilot.zoomTo
//     background.pan = rootDiagram.autopilot.referenceFrame ? rootDiagram.autopilot.referenceFrame.pos.plus(rootDiagram.autopilot.panTo) : rootDiagram.autopilot.panTo;
// }


// let prevNodeToConnect = undefined;


// function nextUUID() {
//     while (nodeMap[NodeUUID] !== undefined) {
//         NodeUUID++;
//     }
//     return NodeUUID;
// }

// Here was the Node class declaration

// Global or scoped array for selected UUIDs
// let selectedNodeUUIDs = new Set();

// Function to toggle node selection
// function toggleNodeSelection(node) {
//     if (selectedNodeUUIDs.has(node.uuid)) {
//         node.windowDiv.classList.toggle('selected');
//         selectedNodeUUIDs.delete(node.uuid); // Deselect
//         //console.log(`deselected`);
//     } else {
//         node.windowDiv.classList.toggle('selected');
//         selectedNodeUUIDs.add(node.uuid); // Select
//         //console.log(`selected`);
//     }
// }
//
// function clearNodeSelection() {
//     selectedNodeUUIDs.forEach(uuid => {
//         const node = rootDiagram.findNodeByUUID(uuid); // Implement this function based on how your nodes are stored
//         if (node) {
//             node.windowDiv.classList.remove('selected');
//         }
//     });
//     selectedNodeUUIDs.clear(); // Clear the set of selected UUIDs
// }
//
// function findNodeByUUID(uuid) {
//     return nodes.find(node => node.uuid === uuid);
// }
//
// function getSelectedNodes() {
//     // Return an array of node objects based on the selected UUIDs
//     return Array.from(selectedNodeUUIDs).map(uuid => nodeMap[uuid]);
// }
//
// function getNodeByTitle(title) {
//     const lowerCaseTitle = title.toLowerCase();
//     let matchingNodes = [];
//
//     for (let n of nodes) {
//         let nodeTitle = n.getTitle();
//
//         if (nodeTitle !== null && nodeTitle.toLowerCase() === lowerCaseTitle) {
//             matchingNodes.push(n);
//         }
//     }
//
//     // Debugging: Show all matching nodes and their count
//     //console.log(`Found ${matchingNodes.length} matching nodes for title ${title}.`);
//     //console.log("Matching nodes:", matchingNodes);
//
//     return matchingNodes.length > 0 ? matchingNodes[0] : null;
// }
//
// function getTextareaContentForNode(node) {
//     if (!node || !node.content) {
//        // console.warn('Node or node.content is not available');
//         return null;
//     }
//
//     if (!node.isTextNode) {
//        // console.warn('Node is not a text node. Skipping text area and editable div logic.');
//         return null;
//     }
//
//     const editableDiv = node.contentEditableDiv;
//     const hiddenTextarea = node.textarea;
//     //console.log(editableDiv, hiddenTextarea);
//     if (!editableDiv || !hiddenTextarea) {
//         console.warn('Either editableDiv or hiddenTextarea is not found.');
//         return null;
//     }
//
//     // Explicitly sync the content
//     syncTextareaWithContentEditable(hiddenTextarea, editableDiv);
//
//     hiddenTextarea.dispatchEvent(new Event('input'));
//     // Now get the textarea content
//     if (hiddenTextarea) {
//         return hiddenTextarea.value;
//     } else {
//         console.warn('Textarea not found in node');
//         return null;
//     }
// }
//
// function testNodeText(title) {
//     const node = rootDiagram.getNodeByTitle(title);
//     if (node) {
//         console.log(`Fetching text for node with title: ${title}`);
//         const text = Diagram.getTextareaContentForNode(node);
//         console.log(`Text fetched: ${text}`);
//         return text;
//     } else {
//         console.warn(`Node with title ${title} not found`);
//         return null;
//     }
// }
//
// function getNodeText() {
//     const nodes = [];
//     for (const child of htmlnodes_parent.children) {
//         if (child.firstChild && child.firstChild.win) {
//             const node = child.firstChild.win;
//
//             const titleInput = node.content.querySelector("input.title-input");
//             //console.log(`Title Input for ${titleInput ? titleInput.value : 'Unnamed Node'}:`, titleInput); // Debugging line
//
//             const contentText = Diagram.getTextareaContentForNode(node);
//             //console.log(`Content Text for ${titleInput ? titleInput.value : 'Unnamed Node'}:`, contentText); // Debugging line
//
//             nodes.push({
//                 ...node,
//                 titleInput: titleInput ? titleInput.value : '',
//                 contentText: contentText ? contentText : ''
//             });
//         } else {
//             console.warn('Node or child.firstChild.win not found'); // Debugging line
//         }
//     }
//     return nodes;
// }
//
// function edgeFromJSON(o, nodeMap) {
//     let pts = o.p.map((k) => nodeMap[k]);
//
//     if (pts.includes(undefined)) {
//         console.warn("missing keys", o, nodeMap);
//     }
//
//     // Check if edge already exists
//     for (let e of edges) {
//         let e_pts = e.pts.map(n => n.uuid).sort();
//         let o_pts = o.p.sort();
//         if (JSON.stringify(e_pts) === JSON.stringify(o_pts)) {
//             // Edge already exists, return without creating new edge
//             return;
//         }
//     }
//
//     let e = new Edge(pts, o.l, o.scale, o.g);
//
//     for (let pt of pts) {
//         pt.addEdge(e); // add edge to all points
//     }
//
//     edges.push(e);
//     return e;
// }
//
// function updateNodeEdgesLength(node) {
//     node.edges.forEach(edge => {
//         const currentLength = edge.currentLength;
//         if (currentLength) {
//             edge.length = currentLength;
//         }
//     });
// }

// Global map to store directionality states of edges
// const edgeDirectionalityMap = new Map();

// Here was Edge class declaration


// var gen = background.iter();
//
//
// function frame() {
//     gen.next();
//     setTimeout(frame, 100);
// }

// const panInput = document.getElementById("pan");
// const zoomInput = document.getElementById("zoom");
//
// let coordsLive = true;
// const coords = document.getElementById("coordinates");

// panInput.addEventListener("input", (e) => {
//     const r = /([+-]?(([0-9]*\.[0-9]*)|([0-9]+))([eE][+-]?[0-9]+)?)\scale*,?\scale*([+-]?i?(([0-9]*\.[0-9]*)|([0-9]+))([eE][+-]?[0-9]+)?)/;
//     const m = panInput.value.match(r);
//     coordsLive = false;
//     if (m === null) return;
//     background.pan = new vec2(parseFloat(m[0]), parseFloat(m[6].replace(/[iI]/, "")));
// });
// zoomInput.addEventListener("input", (e) => {
//     const r = /([+-]?(([0-9]*\.[0-9]*)|([0-9]+))([eE][+-]?[0-9]+)?)/;
//     const m = zoomInput.value.match(r);
//     coordsLive = false;
//     if (m === null) return;
//     const z = parseFloat(m);
//     if (z !== 0) {
//         background.zoom = background.zoom.scale(z / background.zoom.mag());
//     }
// });
// for (const k of ["paste", "mousemove", "mousedown", "dblclick", "click"]) {
//     panInput.addEventListener(k, (e) => {
//         cancel(e);
//     })
//     zoomInput.addEventListener(k, (e) => {
//         cancel(e);
//     })
// }

// var mousePathPos;
// var current_time = undefined;
// let regenAmount = 0;
// let regenDebt = 0;
// let avgfps = 0;
// let panToI = new vec2(0, 0);
// let panToI_prev = undefined;

// function clearTextSelection() {
//     if (window.getSelection) {
//         if (window.getSelection().empty) {  // Chrome
//             window.getSelection().empty();
//         } else if (window.getSelection().removeAllRanges) {  // Firefox (not working)
//             window.getSelection().removeAllRanges();
//         }
//     } else if (document.selection) {  // IE?
//         document.selection.empty();
//     }
// }
//
// function getCentroidOfSelectedNodes() {
//     const selectedNodes = getSelectedNodes();
//     if (selectedNodes.length === 0) return null;
//
//     let sumPos = new vec2(0, 0);
//     selectedNodes.forEach(node => {
//         sumPos = sumPos.plus(node.pos);
//     });
//     return sumPos.scale(1 / selectedNodes.length);
// }
//
// function scaleSelectedNodes(scaleFactor, centralPoint) {
//     const selectedNodes = getSelectedNodes();
//
//     selectedNodes.forEach(node => {
//         // Scale the node
//         node.scale *= scaleFactor;
//
//
//         // Adjust position to maintain relative spacing only if the node is not anchored
//         if (node.anchorForce !== 1) {
//             let directionToCentroid = node.pos.minus(centralPoint);
//             node.pos = centralPoint.plus(directionToCentroid.scale(scaleFactor));
//         }
//
//         updateNodeEdgesLength(node);
//     });
//
//     // If needed, scale the user screen (global zoom)
//     //zoom = zoom.scale(scaleFactor);
//     //pan = centralPoint.scale(1 - scaleFactor).plus(pan.scale(scaleFactor));
// }
//
// let prevNodeScale = 1;
//
// function nodeStep(time) {
//     const selectedNodes = getSelectedNodes();
//
//     // Determine the combined direction from the key state
//     const combinedDirection = getDirectionFromKeyState();
//
//     // Process scaling keys
//     Object.keys(keyState).forEach(key => {
//         if (keyState[key]) {
//             const action = directionMap[key];
//
//             if (action === 'scaleUp' || action === 'scaleDown') {
//                 const scaleFactor = action === 'scaleUp' ? SCALE_UP_FACTOR : SCALE_DOWN_FACTOR;
//                 const centroid = getCentroidOfSelectedNodes();
//                 if (centroid) {
//                     scaleSelectedNodes(scaleFactor, centroid);
//                 }
//             }
//         }
//     });
//
//     // Handle directional movement
//     if (combinedDirection.length > 0 && selectedNodes.length > 0) {
//         // Find the node with the largest scale
//         let largestScaleNode = selectedNodes.reduce((max, node) => node.scale > max.scale ? node : max, selectedNodes[0]);
//
//         // Apply movement to the node with the largest scale
//         let forceApplied = largestScaleNode.moveNode(combinedDirection);
//
//         // Apply the same force to the remaining nodes
//         selectedNodes.forEach(node => {
//             if (node !== largestScaleNode) {
//                 node.force = node.force.plus(forceApplied);
//             }
//         });
//     }
//
//
//     let autopilot_travelDist = 0;
//     let newPan;
//
//     if (rootDiagram.autopilot.referenceFrame && rootDiagram.autopilot.speed !== 0) {
//         if (panToI_prev === undefined) {
//             panToI_prev = rootDiagram.autopilot.referenceFrame.pos.scale(1);
//             prevNodeScale = rootDiagram.autopilot.referenceFrame.scale; // Initialize prevNodeScale
//         }
//         panToI = panToI.scale(1 - settings.autopilotRF_Iscale).plus(rootDiagram.autopilot.referenceFrame.pos.minus(panToI_prev).scale(settings.autopilotRF_Iscale));
//         newPan = background.pan.scale(1 - rootDiagram.autopilot.speed).plus(rootDiagram.autopilot.referenceFrame.pos.scale(rootDiagram.autopilot.speed).plus(panToI));
//         panToI_prev = rootDiagram.autopilot.referenceFrame.pos.scale(1);
//
//         if (rootDiagram.autopilot.referenceFrame.scale !== prevNodeScale) {
//             let nodeScaleFactor = rootDiagram.autopilot.referenceFrame.scale / prevNodeScale;
//
//             // Adjust zoomTo.scale based on nodeScaleFactor
//             rootDiagram.autopilot.zoomTo = rootDiagram.autopilot.zoomTo.scale(nodeScaleFactor);
//
//             prevNodeScale = rootDiagram.autopilot.referenceFrame.scale; // Update the previous scale
//         }
//     } else {
//         newPan = background.pan.scale(1 - rootDiagram.autopilot.speed).plus(rootDiagram.autopilot.panTo.scale(rootDiagram.autopilot.speed));
//         panToI_prev = undefined;
//     }
//     autopilot_travelDist = background.pan.minus(newPan).mag() / background.zoom.mag();
//     if (autopilot_travelDist > settings.autopilotMaxSpeed) {
//         newPan = background.pan.plus(newPan.minus(background.pan).scale(settings.autopilotMaxSpeed / autopilot_travelDist));
//         const speedCoeff = Math.tanh(Math.log(settings.autopilotMaxSpeed / autopilot_travelDist + 1e-300) / 10) * 2;
//         background.zoom = background.zoom.scale(1 - speedCoeff * rootDiagram.autopilot.speed);
//         //*Math.log(autopilot_travelDist/settings.autopilotMaxSpeed));
//     } else {
//         background.zoom = background.zoom.scale(1 - rootDiagram.autopilot.speed).plus(rootDiagram.autopilot.zoomTo.scale(rootDiagram.autopilot.speed));
//     }
//     background.pan = newPan;
//     //zoom = background.zoom.scale(0.9).plus(zoom_to.scale(0.1));
//     //pan = background.pan.scale(0.9).plus(pan_to.scale(0.1));
//     if (coordsLive) {
//         panInput.value = background.pan.ctostring();
//         zoomInput.value = background.zoom.mag() + "";
//     }
//
//     //const inpColor = scol(Math.log(zoom.mag()),undefined,64,128);
//     //coords.style.color = inpColor;
//
//     if (current_time === undefined) {
//         current_time = time;
//     }
//     let dt = time - current_time;
//     current_time = time;
//     if (dt > 0) {
//         const alpha = Math.exp(-1 * dt / 1000);
//         avgfps = avgfps * alpha + (1 - alpha) * 1000 / dt;
//     }
//     background.updateViewbox();
//
//     if (background.mousePath == "") {
//         mousePathPos = background.toZ(background.mousePos);
//         background.mousePath = "M " + background.toSVG(mousePathPos).str() + " L ";
//     }
//     for (let i = 0; i < settings.orbitStepRate; i++) {
//         //let g = mandGrad(settings.iterations,mousePathPos);
//         //mousePathPos = mousePathPos.plus(g.unscale((g.mag()+1e-10)*1000));
//
//         mousePathPos = MandelbrotBG.mand_step(mousePathPos, background.toZ(background.mousePos));
//
//         //let p = findPeriod(mousePathPos);
//         //mousePathPos = mand_iter_n(p,mousePathPos,mousePathPos);
//         if (background.toSVG(mousePathPos).isFinite() && background.toSVG(mousePathPos).mag2() < 1e60)
//             background.mousePath += background.toSVG(mousePathPos).str() + " ";
//
//
//     }
//     let width = background.zoom.mag() * 0.0005 * background.SVGzoom;
//
//     if (nodeMode && prevNodeToConnect !== undefined) {
//         clearTextSelection();
//         background.svg_mousePath.setAttribute("d", "M " + background.toSVG(prevNodeToConnect.pos).str() + " L " + background.toSVG(background.toZ(background.mousePos)).str());
//         width *= 50; // This will increase the width when connecting nodes. Adjust as needed.
//     } else {
//         background.svg_mousePath.setAttribute("d", background.mousePath);
//     }
//
//     // Moved the check to clear prevNodeToConnect outside of the if-else block
//     if (!nodeMode && prevNodeToConnect !== undefined) {
//         prevNodeToConnect = undefined;
//
//         // Clear the mouse path
//         background.mousePath = "";
//         background.svg_mousePath.setAttribute("d", "");
//         clearTextSelection();
//     }
//
//     background.svg_mousePath.setAttribute("stroke-width", width + "");
//     document.getElementById("debug_layer").children[1].textContent = "fps:" + avgfps;
//     document.getElementById("fps").textContent = Math.round(avgfps).toString() + " fps";
//
//     regenDebt = Math.min(16, regenDebt + lerp(settings.regenDebtAdjustmentFactor, regenAmount, Math.min(1, (nodeMode_v ** 5) * 1.01)));
//     for (; regenDebt > 0; regenDebt--) {
//         background.render_hair(Math.random() * settings.renderSteps);
//     }
//     regenAmount = 0;
//
//     dt *= (1 - nodeMode_v) ** 5;
//     for (let n of nodes) {
//         n.step(dt);
//         let d = background.toZ(background.mousePos).minus(n.pos);
//         //n.force = n.force.plus(d.unscale(-((d.mag2()**2)*500+1e-5)));
//     }
//     for (let e of edges) {
//         e.step(dt); //line 2703
//     }
//     nodeMode_v = lerp(nodeMode_v, nodeMode, 0.125);
//     window.requestAnimationFrame(nodeStep);
// }
// nodeStep();





// document.addEventListener('wheel', (event) => {
//     // Get the element that the user is scrolling on
//     let targetElement = event.target;
//
//     while (targetElement) {
//         // Check if the target is a textarea or contenteditable
//         if (targetElement.tagName.toLowerCase() === 'textarea' ||
//             targetElement.contentEditable === 'true' || targetElement.classList.contains("scrollable-content")) {
//             return;
//         }
//         targetElement = targetElement.parentElement;
//     }
//     if (nodeMode !== 1 && event.getModifierState(settings.rotateModifier)) {
//         rootDiagram.autopilot.speed = 0;
//         coordsLive = true;
//         let amount = event.wheelDelta * settings.rotateModifierSpeed;
//         let p = background.toZ(new vec2(event.pageX, event.pageY));
//         let zc = p.minus(background.pan);
//         // p = zoom*center+pan = zoom'*center+pan'
//         // zoom' = zoom*rot
//         // pan' = pan + (zoom*center-zoom*rot*center)
//         //      = pan + (1-rot) * zoom*center
//         let r = new vec2(Math.cos(amount), Math.sin(amount));
//         background.zoom = background.zoom.cmult(r);
//         background.pan = background.pan.plus(zc.cmult(new vec2(1, 0).minus(r)));
//         cancel(event);
//         return;
//     }
//     if (settings.scroll === "zoom") {
//         rootDiagram.autopilot.speed = 0;
//         deselectCoordinate();
//
//         coordsLive = true;
//         let dest = background.toZ(background.mousePos);
//         regenAmount += Math.abs(event.wheelDelta);
//         let amount = Math.exp(event.wheelDelta * settings.zoomSpeed);
//         background.zoom = background.zoom.scale(amount);
//         background.pan = dest.scale(1 - amount).plus(background.pan.scale(amount));
//         cancel(event);
//     } else if (settings.scroll === "pan") {
//         rootDiagram.autopilot.speed = 0;
//         coordsLive = true;
//         let dest = background.toZ(background.mousePos);
//         let dp;
//         let amount;
//         if (event.ctrlKey) {
//             dp = new vec2(0, 0);
//             amount = event.deltaY * settings.zoomSpeed;
//         } else {
//             dp = background.toDZ(new vec2(event.deltaX, event.deltaY).scale(settings.panSpeed));
//             amount = event.deltaZ * settings.zoomSpeed;
//         }
//         regenAmount += Math.hypot(event.deltaX, event.deltaY, event.deltaZ);
//         amount = Math.exp(amount)
//         background.zoom = background.zoom.scale(amount);
//         background.pan = dest.scale(1 - amount).plus(background.pan.scale(amount)).plus(dp);
//         cancel(event);
//         event.preventDefault();
//     }
// });


// let mouseDown = false;
// let mouseDownPos = new vec2(0, 0);
// addEventListener("mousedown", (event) => {
//     rootDiagram.autopilot.speed = 0;
//     mouseDownPos = background.mousePos.scale(1);
//     mouseDown = true;
//     cancel(event);
// });
// addEventListener("mouseup", (event) => {
//     mouseDown = false;
//     if (movingNode !== undefined) {
//         movingNode.onmouseup(event);
//     }
//     isDraggingIcon = false; // Reset the flag
// });
// addEventListener("mousemove", (event) => {
//     if (mouseDown) {
//         rootDiagram.autopilot.speed = 0;
//         coordsLive = true;
//         let delta = background.mousePos.minus(mouseDownPos);
//         background.pan = background.pan.minus(background.toDZ(delta));
//         regenAmount += delta.mag() * 0.25;
//         mouseDownPos = background.mousePos.scale(1);
//     }
// });




//Touchpad controls (WIP)

// let touches = new Map();
//
// addEventListener("touchstart", (ev) => {
//     //pan = pan.plus(new vec2(0,1))
//     for (let i = 0; i < ev.changedTouches.length; i++) {
//         const touch = ev.changedTouches.item(i);
//         touches.set(touch.identifier, {
//             prev: touch,
//             now: touch
//         });
//     }
// }, false);
// addEventListener("touchcancel", (ev) => {
//     for (let i = 0; i < ev.changedTouches.length; i++) {
//         const touch = ev.changedTouches.item(i);
//         touches.delete(touch.identifier);
//     }
// }, false);
// addEventListener("touchend", (ev) => {
//     //pan = pan.plus(new vec2(0,-1))
//     switch (touches.size) {
//         case 2: //tap to zoom
//             if (ev.changedTouches.length == 1) {
//                 const id = ev.changedTouches.item(0).identifier;
//                 const t = touches.get(id);
//                 if (t && t.prev == t.now) { //hasn't moved
//                     const ts = [...touches.keys()];
//                     const other = touches.get(ts[0] === id ? ts[1] : ts[0])
//                     const {scale} = background.windowScaleAndOffset();
//                     const amount = Math.exp(-(other.now.clientY - t.now.clientY) / scale);
//                     const dest = background.toZ(new vec2(other.now.clientX, other.now.clientY));
//                     background.zoom = background.zoom.scale(amount);
//                     background.pan = dest.scale(1 - amount).plus(background.pan.scale(amount));
//                 }
//             }
//             break;
//
//     }
//     for (let i = 0; i < ev.changedTouches.length; i++) {
//         const touch = ev.changedTouches.item(i);
//         touches.delete(touch.identifier);
//     }
// }, false);
// addEventListener("touchmove", (ev) => {
//     for (let i = 0; i < ev.changedTouches.length; i++) {
//         const touch = ev.changedTouches.item(i);
//         touches.set(touch.identifier, {
//             prev: touches.get(touch.identifier)?.now,
//             now: touch
//         });
//     }
//     switch (touches.size) {
//         case 1:
//             rootDiagram.autopilot.speed = 0;
//             coordsLive = true;
//             const t = [...touches.values()][0];
//             background.pan = background.pan.plus(background.toDZ(new vec2(t.prev.clientX, t.prev.clientY).minus(new vec2(t.now.clientX, t.now.clientY))));
//             cancel(ev);
//             break;
//         case 2:
//         /*
//         const pts = [...touches.values()];
//         const p1p = toS(new vec2(pts[0].prev.clientX,pts[0].prev.clientY));
//         const p2p = toS(new vec2(pts[1].prev.clientX,pts[1].prev.clientY));
//         const p1n = toS(new vec2(pts[0].now.clientX,pts[0].now.clientY));
//         const p2n = toS(new vec2(pts[1].now.clientX,pts[1].now.clientY));
//         //want to find new zoom,pan such that
//         // old toZ(p1p) = new toZ(p1n)
//         // old toZ(p2p) = new toZ(p2n)
//         //
//         //  toZ(x) ≈ x*zoom + pan
//         //
//         // so, we want zoom' pan' scale.t.
//         //  p1p*zoom + pan = p1n*zoom' + pan'
//         //  p2p*zoom + pan = p2n*zoom' + pan'
//         //
//         //  (p2p-p1p) * zoom = (p2n-p1n) * zoom'
//         //  (p1p+p2p)*zoom + 2pan = (p1p+p2p)*zoom' + 2pan'
//         //
//         //  zoom' = zoom * (p2p-p1p)/(p2n-p1n)
//         //  pan' = pan + (p1p+p2p)*zoom/2 - (p1p+p2p)*zoom'/2
//         //       = pan + (p1p+p2p)*(zoom - zoom')/2
//         const nzoom = zoom.cmult( p2p.minus(p1p).cdiv( p2n.minus(p1n)));
//         pan = pan.plus(p2p.plus(p1p).cmult(zoom.minus(nzoom)).scale(0.5));
//         zoom = nzoom;
//
//
//         ev.preventDefault();
//         cancel(ev);
//         break;
//         */
//         default:
//             break;
//     }
//
//
// }, false);




// var gestureStartParams = {
//     rotation: 0,
//     x: 0,
//     y: 0,
//     scale: 0,
//     zoom: new vec2(),
//     pan: new vec2()
// };
// addEventListener("gesturestart", (e) => {
//     e.preventDefault();
//     //console.log(e);
//     gestureStartParams.rotation = e.rotation;
//     gestureStartParams.scale = e.scale;
//     gestureStartParams.x = e.pageX;
//     gestureStartParams.y = e.pageY;
//     gestureStartParams.zoom = background.zoom;
//     gestureStartParams.pan = background.pan;
//
// });
// addEventListener("gesturechange", (e) => {
//     e.preventDefault();
//     //console.log(e);
//     let d_theta = e.rotation - gestureStartParams.rotation;
//     let d_scale = e.scale;
//     let r = -e.rotation * settings.gestureRotateSpeed;
//     background.pan = gestureStartParams.pan;
//     background.zoom = gestureStartParams.zoom;
//     let r_center = background.toZ(new vec2(e.pageX, e.pageY));
//     let scale = 0;
//     background.zoom = gestureStartParams.zoom.cmult(new vec2(Math.cos(r), Math.sin(r)));
//     if (e.scale !== 0) {
//         let scale = 1 / e.scale;
//         background.zoom = background.zoom.scale(scale);
//         regenAmount += Math.abs(Math.log(scale)) * settings.maxLines;
//     }
//     let dest = r_center;
//     let amount = scale;
//     let dp = r_center.minus(gestureStartParams.pan);
//     background.pan = gestureStartParams.pan.plus(
//         dp.minus(dp.cmult(background.zoom.cdiv(gestureStartParams.zoom))));
//     //pan = dest.scale(1-amount).plus(gestureStartParams.pan.scale(amount));
//
// });
// addEventListener("gestureend", (e) => {
//     e.preventDefault();
// });


// Check if a string is valid JSON
function isJSON(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}

// Check if the user'scale message is a URL
const isUrl = (text) => {
    try {
        const url = new URL(text);
        return url.protocol === 'http:' || url.protocol === 'https:';
    } catch (_) {
        return false;
    }
}

const isIframe = (text) => {
    try {
        const doc = new DOMParser().parseFromString(text, "text/html");
        return doc.body.childNodes[0] && doc.body.childNodes[0].nodeName.toLowerCase() === 'iframe';
    } catch (_) {
        return false;
    }
}

function getIframeUrl(iframeContent) {
    // Function to extract URL from the iframe content
    // Using a simple regex to get the 'src' attribute value
    const match = iframeContent.match(/src\scale*=\scale*"([^"]+)"/);
    return match ? match[1] : null; // Return URL or null if not found
}

// WARNING: this was commented without reference
// function nodemousedown(id) {
//     if (id < nodes.length) {
//         nodes[id].mousedown();
//     }
// }
//
// function nodemouseup(id) {
//     if (id < nodes.length) {
//         nodes[id].mouseup();
//     }
// }
//
// function nodemousemove(id) {
//     if (id < nodes.length) {
//         nodes[id].mousemove();
//     }
// }
//
// function nodeclick(id) {
//     if (id < nodes.length) {
//         nodes[id].mouseclick();
//     }
// }


function cancel(event) {
    if (event.stopPropagation) {
        event.stopPropagation(); // W3C model
    } else {
        event.cancelBubble = true; // IE model
    }
}
