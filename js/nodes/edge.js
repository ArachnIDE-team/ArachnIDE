

class Edge {
    constructor(pts, length = 0.6, strength = 0.1, style = {
        stroke: "red",
        "stroke-width": "0.01",
        // fill: "red"
    }) {
        this.pts = pts;
        this.length = length;
        // Additional property to store the current length
        this.currentLength = this.length;

        this.strength = strength;
        this.style = style;
        this.html = document.createElementNS("http://www.w3.org/2000/svg", "path");
        for (const [key, value] of Object.entries(style)) {
            this.html.setAttribute(key, value);
        }
        htmledges.appendChild(this.html);
        this.attach();

        this.directionality = { start: null, end: null };

        this.maxWidth = 0.05;

        // Predefine the arrow SVG and initially set it to not display
        this.arrowSvg = document.createElementNS("http://www.w3.org/2000/svg", "path");
        this.arrowSvg.classList.add('edge-arrow');
        this.arrowSvg.style.display = 'none';

        htmledges.appendChild(this.arrowSvg);  // Assuming 'htmledges' is your SVG container

        // Predefine the border SVG
        this.borderSvg = document.createElementNS("http://www.w3.org/2000/svg", "path");
        this.borderSvg.style.display = 'none';
        this.borderSvg.classList.add('edge-border');
        htmledges.insertBefore(this.borderSvg, this.arrowSvg);


        this.attachEventListenersToArrow();

        this.edgeKey = this.createEdgeKey(pts);
        if (rootDiagram.edgeDirectionalityMap.has(this.edgeKey)) {
            this.directionality = rootDiagram.edgeDirectionalityMap.get(this.edgeKey);
        }
        //console.log("Creating edge with pts:", pts);
        //console.log("Directionality after assignment:", this.directionality);
    }
    createEdgeKey(pts) {
        return pts.map(p => p.uuid).sort().join('-');
    }
    dataObj() {
        let o = {};
        o.l = this.length;
        o.s = this.strength;
        o.g = this.style;
        o.p = this.pts.map((n) => n.uuid);

        // Simplified directionality data using UUIDs
        o.directionality = {
            start: this.directionality.start ? this.directionality.start.uuid : null,
            end: this.directionality.end ? this.directionality.end.uuid : null
        };

        o.edgeKey = this.edgeKey;
        return o;
    }
    attach() {
        this.html.onwheel = this.onwheel.bind(this);
        this.html.onmouseover = this.onmouseover.bind(this);
        this.html.onmouseout = this.onmouseout.bind(this);
        this.html.ondblclick = this.ondblclick.bind(this);
        this.html.onclick = this.onclick.bind(this); // Attach click event handler
    }

    attachEventListenersToArrow() {
        // Define a helper function to add the same event listeners to both SVGs
        const addEventListeners = (svgElement) => {
            svgElement.addEventListener('wheel', this.onwheel.bind(this));
            svgElement.addEventListener('mouseover', this.onmouseover.bind(this));
            svgElement.addEventListener('mouseout', this.onmouseout.bind(this));
            svgElement.addEventListener('dblclick', this.ondblclick.bind(this));
            svgElement.addEventListener('click', this.onclick.bind(this));
        };

        // Attach event listeners to both arrow and border SVGs
        addEventListeners(this.arrowSvg);
        addEventListeners(this.borderSvg);
    }
    toggleDirection() {
        //console.log(`Current directionality: start=${this.directionality.start ? this.directionality.start.getTitle() : 'null'}, end=${this.directionality.end ? this.directionality.end.getTitle() : 'null'}`);

        // Determine the current state and transition to the next
        if (this.directionality.start === null) {
            this.directionality.start = this.pts[0];
            this.directionality.end = this.pts[1];
        } else if (this.directionality.start === this.pts[0]) {
            this.directionality.start = this.pts[1];
            this.directionality.end = this.pts[0];
        } else if (this.directionality.start === this.pts[1]) {
            // Bidirectional
            this.directionality.start = null;
            this.directionality.end = null;
        }

        // Check if both nodes are text nodes
        if (this.pts[0].isTextNode && this.pts[1].isTextNode) {
            // Get node titles
            const startTitle = this.pts[0].getTitle();
            const endTitle = this.pts[1].getTitle();

            // Update edge references based on the new state
            if (this.directionality.start === this.pts[0]) {
                // Direction is from start to end
                addEdgeToZettelkasten(startTitle, endTitle, myCodeMirror);
                removeEdgeFromZettelkasten(endTitle, startTitle, true);
            } else if (this.directionality.start === this.pts[1]) {
                // Direction is from end to start
                addEdgeToZettelkasten(endTitle, startTitle, myCodeMirror);
                removeEdgeFromZettelkasten(startTitle, endTitle, true);
            } else {
                // Bidirectional
                addEdgeToZettelkasten(startTitle, endTitle, myCodeMirror);
                addEdgeToZettelkasten(endTitle, startTitle, myCodeMirror);
            }
        }


        rootDiagram.edgeDirectionalityMap.set(this.edgeKey, this.directionality);

        //console.log(`Directionality relative to ${startTitle}: ${this.getDirectionRelativeTo(this.pts[0])}`);
        //console.log(`Directionality relative to ${endTitle}: ${this.getDirectionRelativeTo(this.pts[1])}`);
        //console.log(`New directionality: start=${this.directionality.start ? this.directionality.start.getTitle() : 'null'}, end=${this.directionality.end ? this.directionality.end.getTitle() : 'null'}`);
    }


    // Method to check directionality relative to a given node
    getDirectionRelativeTo(node) {
        if (this.directionality.start === node) {
            return "outgoing";
        } else if (this.directionality.end === node) {
            return "incoming";
        }
        return "none";
    }
    center() {
        return this.pts.reduce((t, n, i, a) => {
            return t.plus(n.pos);
        }, new vec2(0, 0)).unscale(this.pts.length);
    }

    draw() {
        this.html.setAttribute("stroke", this.mouseIsOver ? "lightskyblue" : this.style.stroke);
        this.html.setAttribute("fill", "none");
        // this.html.setAttribute("stroke", this.mouseIsOver ? "lightskyblue" : this.style.fill);
        // this.html.setAttribute("fill", this.mouseIsOver ? "lightskyblue" : this.style.fill);
        this.html.setAttribute("vector-effect", "non-scaling-stroke")

        const stressValue = Math.max(this.stress(), 0.01);
        let wscale = (this.style['stroke-width'] / 500) / (0.5 + stressValue) * (this.mouseIsOver ? 1.5 : 1.0);
        wscale = Math.min(wscale, this.maxWidth);
        let path = "M ";
        let validPath = true;

        let node1Size = rootDiagram.background.toS(new vec2(this.pts[0].width * this.pts[0].scale / 2, this.pts[0].height * this.pts[0].scale / 2));
        let node2Size = rootDiagram.background.toS(new vec2(this.pts[1].width * this.pts[1].scale / 2, this.pts[1].height * this.pts[1].scale / 2));

        // Constructing the main path
        let node1Left = this.pts[0].pos.minus(new vec2(node1Size.x, 0));
        let node1Right = this.pts[0].pos.plus(new vec2(node1Size.x, 0));
        let node2Right = this.pts[1].pos.plus(new vec2(node2Size.x, 0));
        let node2Left = this.pts[1].pos.minus(new vec2(node2Size.x, 0));

        let leftFirst = node1Left.x - node2Right.x > 0;
        let startingPoint = leftFirst ? node1Left : node1Right;
        let endingPoint =  leftFirst ? node2Right : node2Left;

        let horizontal = (startingPoint.x - endingPoint.x) / 2;
        let vertical = (startingPoint.y - endingPoint.y);
        let curve = 0.2;

        let between = node2Right.x > node1Left.x && node2Left.x < node1Right.x;

        let positiveVertical = vertical > 0;
        if(!between) {
            curve = Math.min(curve, Math.abs(vertical)) / 2;

            // 3-2 path (3 segments, 2 joins)
            let edgePoints = [
                // Segment 1
                startingPoint,
                // Join 1
                startingPoint.minus(new vec2(horizontal, 0).plus(new vec2(horizontal < 0 ? curve : -curve, 0))), // X
                startingPoint.minus(new vec2(horizontal, 0)).minus(new vec2(0, positiveVertical ? curve : -curve)), // Y
                // Segment 2
                // Join 2
                endingPoint.plus(new vec2(horizontal, 0)).plus(new vec2(0, positiveVertical  ? curve : -curve)), // Y
                endingPoint.plus(new vec2(horizontal, 0)).minus(new vec2(horizontal > 0 ? curve : -curve, 0)), // X
                // Segment 3
                endingPoint
            ]
            // Bézier curves control points
            let controlPoints = [
                startingPoint.minus(new vec2(horizontal, 0)),
                endingPoint.plus(new vec2(horizontal, 0))
            ]

            path += rootDiagram.background.toSVG(edgePoints[0]).str().replace(",", " ");
            path += " L ";
            path += rootDiagram.background.toSVG(edgePoints[1]).str().replace(",", " ");
            path += " C ";
            path += rootDiagram.background.toSVG(controlPoints[0]).str().replace(",", " ") + ", ";
            path += rootDiagram.background.toSVG(controlPoints[0]).str().replace(",", " ") + ", ";
            path += rootDiagram.background.toSVG(edgePoints[2]).str().replace(",", " ");
            path += " L ";
            path += rootDiagram.background.toSVG(edgePoints[3]).str().replace(",", " ");
            path += " C ";
            path += rootDiagram.background.toSVG(controlPoints[1]).str().replace(",", " ") + ", ";
            path += rootDiagram.background.toSVG(controlPoints[1]).str().replace(",", " ") + ", ";
            path += rootDiagram.background.toSVG(edgePoints[4]).str().replace(",", " ");
            path += " L ";
            path += rootDiagram.background.toSVG(edgePoints[5]).str().replace(",", " ");
        } else {
            curve = curve /  2;
            // 3-4 path (3 segments, 4 joins)
            let offset = curve * 1.5; // Adjust offset based on curve
            let horizontalCurve = horizontal > 0 ? curve : - curve;
            let verticalCurve = positiveVertical ? curve : - curve;
            let verticalDistance = vertical - node2Size.y - node1Size.y;
            let verticalMidPoint = verticalDistance / 2;
            let segment1Length = !positiveVertical ? verticalMidPoint  :  vertical - verticalMidPoint;
            let segment2Length = !positiveVertical ? vertical - verticalMidPoint : verticalMidPoint;
            segment1Length -=  positiveVertical ? node2Size.y : -node2Size.y;
            segment2Length +=  positiveVertical ? node2Size.y : -node2Size.y;

            let segment1Distance = segment1Length - 2 * verticalCurve;
            let segment2Distance = segment2Length - 2 * verticalCurve;

            let join12HorizontalCurve = Math.abs(segment1Length) - Math.abs(2 * verticalCurve) > 0 ? horizontalCurve : horizontalCurve - Math.abs(segment1Distance / 2);
            let join1VerticalCurve =  Math.abs(segment1Length) - Math.abs(2 * verticalCurve) > 0 ? -verticalCurve: - segment1Distance / 2 - verticalCurve;
            let join2VerticalCurve =  Math.abs(segment1Length) - Math.abs(2 * verticalCurve) > 0 ? verticalCurve: segment1Distance / 2 + verticalCurve;

            let join34HorizontalCurve = Math.abs(segment2Length) - Math.abs(2 * verticalCurve) > 0 ? horizontalCurve : horizontalCurve - Math.abs(segment2Distance / 2);
            let join3VerticalCurve = Math.abs(segment2Length) - Math.abs(2 * verticalCurve) > 0 ? verticalCurve: segment2Distance / 2 + verticalCurve;
            let join4VerticalCurve = Math.abs(segment2Length) - Math.abs(2 * verticalCurve) > 0 ? -verticalCurve: - segment2Distance / 2 - verticalCurve;

            if((join1VerticalCurve > join2VerticalCurve && positiveVertical) || (join4VerticalCurve > join3VerticalCurve && join1VerticalCurve < join2VerticalCurve && !positiveVertical) ) {
                join12HorizontalCurve = -join12HorizontalCurve;
            }
            if((join4VerticalCurve > join3VerticalCurve && positiveVertical) || (join4VerticalCurve < join3VerticalCurve && join1VerticalCurve > join2VerticalCurve && !positiveVertical)) {
                join34HorizontalCurve = -join34HorizontalCurve;
            }

            let edgePoints = [
                // Segment offset (starting point)
                startingPoint,
                startingPoint.plus(new vec2(offset, 0)),
                // Join 1
                startingPoint.plus(new vec2(offset, 0)).plus(new vec2(join12HorizontalCurve, join1VerticalCurve)),
                // Segment 1 |
                // Join 2
                startingPoint.plus(new vec2(offset, 0)).plus(new vec2(join12HorizontalCurve, join2VerticalCurve - segment1Length)),
                // Segment 2 ---
                startingPoint.plus(new vec2(offset, 0)).plus(new vec2(horizontalCurve - curve, -segment1Length)),
                endingPoint.minus(new vec2(offset, 0)).minus(new vec2(horizontalCurve - curve, -segment2Length)),
                // Join 3
                endingPoint.minus(new vec2(offset, 0)).minus(new vec2(join34HorizontalCurve, join3VerticalCurve - segment2Length)),
                // Segment 3 |
                // Join 4
                endingPoint.minus(new vec2(offset, 0)).minus(new vec2(join34HorizontalCurve, join4VerticalCurve)),
                // Segment offset (ending point)
                endingPoint.minus(new vec2(offset, 0)),
                endingPoint
            ];

            // Control points (one for each join segment)
            let controlPoints = [
                startingPoint.plus(new vec2(offset, 0)).plus(new vec2(join12HorizontalCurve, 0)),
                startingPoint.plus(new vec2(offset, 0)).plus(new vec2(join12HorizontalCurve, -segment1Length)),
                endingPoint.minus(new vec2(offset, 0)).minus(new vec2(join34HorizontalCurve, -segment2Length)),
                endingPoint.minus(new vec2(offset, 0)).minus(new vec2(join34HorizontalCurve, 0)),
            ];

            path += rootDiagram.background.toSVG(edgePoints[0]).str().replace(",", " ");
            path += " L ";
            path += rootDiagram.background.toSVG(edgePoints[1]).str().replace(",", " ");
            path += " C ";
            path += rootDiagram.background.toSVG(controlPoints[0]).str().replace(",", " ") + ", ";
            path += rootDiagram.background.toSVG(controlPoints[0]).str().replace(",", " ") + ", ";
            path += rootDiagram.background.toSVG(edgePoints[2]).str().replace(",", " ");
            path += " L ";
            path += rootDiagram.background.toSVG(edgePoints[3]).str().replace(",", " ");
            path += " C ";
            path += rootDiagram.background.toSVG(controlPoints[1]).str().replace(",", " ") + ", ";
            path += rootDiagram.background.toSVG(controlPoints[1]).str().replace(",", " ") + ", ";
            path += rootDiagram.background.toSVG(edgePoints[4]).str().replace(",", " ");
            path += " L ";
            path += rootDiagram.background.toSVG(edgePoints[5]).str().replace(",", " ");
            path += " C ";
            path += rootDiagram.background.toSVG(controlPoints[2]).str().replace(",", " ") + ", ";
            path += rootDiagram.background.toSVG(controlPoints[2]).str().replace(",", " ") + ", ";
            path += rootDiagram.background.toSVG(edgePoints[6]).str().replace(",", " ");
            path += " L ";
            path += rootDiagram.background.toSVG(edgePoints[7]).str().replace(",", " ");
            path += " C ";
            path += rootDiagram.background.toSVG(controlPoints[3]).str().replace(",", " ") + ", ";
            path += rootDiagram.background.toSVG(controlPoints[3]).str().replace(",", " ") + ", ";
            path += rootDiagram.background.toSVG(edgePoints[8]).str().replace(",", " ");
            path += " L ";
            path += rootDiagram.background.toSVG(edgePoints[9]).str().replace(",", " ");

        }

        if (validPath) {
            this.html.setAttribute("d", path);

            if (this.directionality.start && this.directionality.end) {
                let pointLeft = this.directionality.start === this.pts[0];

                let startScale = this.directionality.start.scale;
                let endScale = this.directionality.end.scale;


                let arrowScaleFactor = 1.2;
                let arrowLength = ((startScale + endScale) / 2 * wscale * 5) * arrowScaleFactor;
                let arrowWidth = ((startScale + endScale) / 2 * wscale * 3) * arrowScaleFactor;

                let midPoint = pointLeft ? endingPoint : startingPoint;
                midPoint = !leftFirst ? midPoint.minus(new vec2(arrowLength, 0)) : midPoint.plus((new vec2(arrowLength, 0)));
                // midPoint = pointLeft ? midPoint.minus(new vec2(arrowLength, 0)) : midPoint.plus((new vec2(arrowLength, 0)));
                // midPoint = midPoint.plus((new vec2(arrowLength, 0)));
                console.log("leftFirst", leftFirst, "pointLeft", pointLeft)
                // let direction = !leftFirst ? new vec2(-1, 0):new vec2(1, 0);
                let direction = !(!pointLeft || leftFirst) ? new vec2(-1, 0):new vec2(1, 0);
                let directionNormed = direction.normed(arrowLength);
                let perp = new vec2(-directionNormed.y, directionNormed.x).normed(arrowWidth);

                // Calculate arrow points relative to the midpoint
                let arrowBase1 = midPoint.minus(perp);
                let arrowBase2 = midPoint.plus(perp);
                let arrowTip = midPoint.plus(directionNormed);

                // Adjustable factor for arrow flipping [0, 1]
                let arrowFlipFactor = 0.85; // Adjust this value as needed

                // Calculate the adjusted center of the arrow
                let arrowBaseCenterX = (arrowBase1.x + arrowBase2.x) / 2;
                let arrowBaseCenterY = (arrowBase1.y + arrowBase2.y) / 2;
                let arrowCenterX = arrowBaseCenterX * arrowFlipFactor + arrowTip.x * (1 - arrowFlipFactor);
                let arrowCenterY = arrowBaseCenterY * arrowFlipFactor + arrowTip.y * (1 - arrowFlipFactor);
                let arrowCenter = new vec2(arrowCenterX, arrowCenterY);


                // Function to rotate a point around a center by 180 degrees
                function rotatePoint(point, center) {
                    let dx = point.x - center.x;
                    let dy = point.y - center.y;
                    return new vec2(center.x - dx, center.y - dy);
                }

                // Rotate the arrow points around the adjusted center
                arrowBase1 = rotatePoint(arrowBase1, arrowCenter);
                arrowBase2 = rotatePoint(arrowBase2, arrowCenter);
                arrowTip = rotatePoint(arrowTip, arrowCenter);

                // Arrow path
                let arrowPath = `M ${rootDiagram.background.toSVG(arrowBase1).str()} L ${rootDiagram.background.toSVG(arrowTip).str()} L ${rootDiagram.background.toSVG(arrowBase2).str()} Z`;
                this.arrowSvg.setAttribute("d", arrowPath);
                this.arrowSvg.style.display = '';

                // Calculate the midpoint of the arrow
                let arrowMidX = (arrowBase1.x + arrowBase2.x + arrowTip.x) / 3;
                let arrowMidY = (arrowBase1.y + arrowBase2.y + arrowTip.y) / 3;
                let arrowMidPoint = new vec2(arrowMidX, arrowMidY);

                // Calculate offset for border points
                const offsetScale = 1.4; // Slightly larger than 1 to make the border bigger
                let borderBase1 = arrowMidPoint.plus(arrowBase1.minus(arrowMidPoint).scale(offsetScale));
                let borderBase2 = arrowMidPoint.plus(arrowBase2.minus(arrowMidPoint).scale(offsetScale));
                let borderTip = arrowMidPoint.plus(arrowTip.minus(arrowMidPoint).scale(offsetScale));

                // Border path
                let borderPath = `M ${rootDiagram.background.toSVG(borderBase1).str()} L ${rootDiagram.background.toSVG(borderTip).str()} L ${rootDiagram.background.toSVG(borderBase2).str()} Z`;
                this.borderSvg.setAttribute("d", borderPath);
                this.borderSvg.style.display = '';
            } else {
                this.arrowSvg.style.display = 'none';
                this.borderSvg.style.display = 'none';
            }
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
        let avg = this.center();
        for (let n of this.pts) {
            let d = n.pos.minus(avg);
            let dMag = d.mag();

            // Update the current length of the edge
            this.currentLength = dMag;

            // Apply force to either shorten or lengthen the edge to the desired length
            if (dMag !== this.length) {
                let f = d.scale(1 - this.length / (dMag + 1e-300));
                n.force = n.force.plus(f.scale(-this.strength));
            }
        }
        this.draw();
    }
    stress() {
        let avg = this.center();
        return this.pts.reduce((t, n, i, a) => {
            return t + n.pos.minus(avg).mag() - this.length;
        }, 0) / (this.length + 1);
    }
    scaleEdge(amount) {
        this.length *= amount;
    }
    onwheel = (event) => {
        if (nodeMode) {
            let amount = Math.exp(event.wheelDelta * -settings.zoomSpeed);
            this.length *= amount;
            let avg = this.center();
            for (let n of this.pts) {
                n.pos = n.pos.minus(avg).scale(amount).plus(avg);
            }
            if (this.pts[0] !== undefined) {
                this.pts[0].updateEdgeData();
            }
            cancel(event);
        }
    }
    onclick = (event) => {
        if (!nodeMode) {
            this.toggleDirection();
            this.draw();
        }
    }
    ondblclick = (event) => {
        if (nodeMode) {
            // Capture the titles and textNode flags of the connected nodes for later use
            const connectedNodes = this.pts.map(node => ({ title: node.getTitle(), isTextNode: node.isTextNode }));

            // only if both nodes have the isTextNode flag
            if (connectedNodes[0].isTextNode && connectedNodes[1].isTextNode) {
                removeEdgeFromZettelkasten(connectedNodes[0].title, connectedNodes[1].title);
            } else {
                this.remove();
            }

            // Prevent the event from propagating further
            cancel(event);
        }
    }
    onmouseover = (event) => {
        this.mouseIsOver = true;
        this.arrowSvg.classList.add('edge-arrow-hover');
        this.borderSvg.classList.add('edge-border-hover'); // Class for hovered state of the border
    }

    onmouseout = (event) => {
        this.mouseIsOver = false;
        this.arrowSvg.classList.remove('edge-arrow-hover');
        this.borderSvg.classList.remove('edge-border-hover'); // Class for normal state of the border
    }

    remove() {
        rootDiagram.edgeDirectionalityMap.set(this.edgeKey, this.directionality);

        // Remove the edge from the global edge array
        let index = rootDiagram.edges.indexOf(this);
        if (index !== -1) {
            rootDiagram.edges.splice(index, 1);
        }

        // Remove this edge from both connected nodes' edges arrays
        this.pts.forEach((node) => {
            index = node.edges.indexOf(this);
            if (index !== -1) {
                node.edges.splice(index, 1);
                node.updateEdgeData();
            }
        });

        // Remove SVG elements from the DOM
        if (this.arrowSvg && this.arrowSvg.parentNode) {
            this.arrowSvg.parentNode.removeChild(this.arrowSvg);
        }
        if (this.borderSvg && this.borderSvg.parentNode) {
            this.borderSvg.parentNode.removeChild(this.borderSvg);
        }

        // Remove the main path of the edge
        if (this.html && this.html.parentNode) {
            this.html.parentNode.removeChild(this.html);
        }
    }
}