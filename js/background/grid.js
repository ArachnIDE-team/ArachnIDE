
// Z format -> complex (pan is complex)
// UV format -> screen proportion
// C format -> pixel position
// DZ format -> complex distance from pan
// S format -> complex scaled with zoom


class GridBG extends Background {

    static RECENTER_THRESHOLD = 0.01;
    static REZOOM_THRESHOLD = 0.1;
    static REZOOM_FACTOR = 8192;

    static DEFAULT_CONFIGURATION = {
        rSlider: null,
        cSlider: null,
        sSlider: null,
        colorPickerR: null,
        colorPickerG: null,
        colorPickerB: null,
        gridSize: 0.1,
        gridColor: "#CCCCCC",
        gridStrokeWidth: 1,
    }

    constructor(configuration=GridBG.DEFAULT_CONFIGURATION) {
        configuration = {...GridBG.DEFAULT_CONFIGURATION, ...configuration}
        super(configuration);
        this.rSlider = configuration.rSlider;
        this.cSlider = configuration.cSlider;
        this.sSlider = configuration.sSlider;
        this.colorPickerR = configuration.colorPickerR;
        this.colorPickerG = configuration.colorPickerG;
        this.colorPickerB = configuration.colorPickerB;
        this.mousePath = "";
        this.old_rotation = 0;
        // Imported/moved from Diagram (as it's background resp. to keep track of those values)
        this.mousePathPos = undefined;
        this.regenDebt = 0;
        this.regenAmount = 0;

        this.gridSize = configuration.gridSize;
        this.gridColor = configuration.gridColor;
        this.gridStrokeWidth = configuration.gridStrokeWidth;

        this.svg_bg.setAttribute("stroke-width", "1px")
        this.svg_bg.setAttribute("vector-effect", "non-scaling-stroke")
    }

    updateViewbox() {
        let zm = this.zoom.mag();
        let lc = this.toSVG(new vec2(-zm, -zm).plus(this.pan));
        let d = zm * 2 * this.SVGzoom;
        let r = this.zoom.ang();
        let oldSVGzoom = this.SVGzoom;
        let oldSVGpan = this.SVGpan;

        let recalc = false;
        if (d < Math.abs(GridBG.RECENTER_THRESHOLD * lc.x) || d < Math.abs(GridBG.RECENTER_THRESHOLD * lc.y)) {
            this.SVGpan = this.pan.scale(1);
            lc = this.toSVG(this.toZ(new vec2(0, 0)));
            //console.log("recentering...");
            recalc = true;
        }
        if (d < GridBG.REZOOM_THRESHOLD || d > GridBG.REZOOM_FACTOR / GridBG.REZOOM_THRESHOLD) {
            this.SVGzoom *= GridBG.REZOOM_FACTOR / d;
            //console.log("rezooming...");
            recalc = true;
        }

        let c = this.toSVG(this.pan); //center of rotation
        //where it ends up if you do the rotation about SVGpan
        let rc = c.cmult(this.zoom.unscale(zm).cconj());
        //
        lc = lc.plus(rc.minus(c));

        this.svg.setAttribute("viewBox", lc.x + " " + lc.y + " " + d + " " + d);
        this.viewbox = {...lc, width: d, height: d};

        if (r !== this.old_rotation) {
            this.old_rotation = r;
            this.svg_viewmat.setAttribute("transform", "rotate(" + (-r * 180 / Math.PI) + ")");
            //svg_viewmat.setAttribute("transform","rotate("+(-r*180/Math.PI)+" "+c.x+" "+c.y+")");
        }


        return

        // the below has the issue of low-res svg when changing the matrix in firefox
        this.svg.setAttribute("viewBox", (-this.svg_viewbox_size / 2) + " " + (-this.svg_viewbox_size / 2) + " " + this.svg_viewbox_size + " " + this.svg_viewbox_size);
        let t = this.zoom.crecip().scale(this.svg_viewbox_size / this.SVGzoom / 2);
        let p = this.pan.minus(this.SVGpan).scale(-this.svg_viewbox_size / 2).cdiv(this.zoom);

        this.svg_viewmat.setAttribute("transform", "matrix(" + t.x + " " + (t.y) + " " + (-t.y) + " " + (t.x) + " " + (p.x) + " " + (p.y) + ")");

    }

    col(i, r = null, c = null, s = null) {
        if (nodeMode) {
            r = nodeMode_v;
        }
        if(r === null) r = this.rSlider.value;
        if(c === null) c = this.cSlider.value;
        if(s === null) s = this.sSlider.value;
        let colorR = hexToRgb(this.colorPickerR.value)[0] / 255; // Normalize to [0, 1]
        let colorG = hexToRgb(this.colorPickerG.value)[1] / 255; // Normalize to [0, 1]
        let colorB = hexToRgb(this.colorPickerB.value)[2] / 255; // Normalize to [0, 1]

        let rgb = [colorR * (c - s * Math.cos(i / 2 ** .9)), colorG * (c - s * Math.cos(i / 3 ** .9)), colorB * (c - s * Math.cos(i / 5 ** .9))];
        let y = 0.17697 * rgb[0] + 0.81240 * rgb[1] + 0.01063 * rgb[2];
        return [lerp(rgb[0], y, r), lerp(rgb[1], y, r), lerp(rgb[2], y, r)];
    }

    scol(i, r = null, c = null, s = null) {
        if(r === null) r = this.rSlider.value;
        if(c === null) c = this.cSlider.value;
        if(s === null) s = this.sSlider.value;
        c = this.col(i, r, c, s);
        return "RGB(" + Math.round(c[0]) + "," + Math.round(c[1]) + "," + Math.round(c[2]) + ")";
    }


    gcol(i, r = null, c = null, s = null) {
        if(r === null) r = this.rSlider.value;
        if(c === null) c = this.cSlider.value;
        if(s === null) s = this.sSlider.value;
        c = this.col(i, r, c, s);
        if(c[0] < 0) c[0] = 0;
        if(c[0] > 255) c[0] = 255;
        if(c[1] < 0) c[1] = 0;
        if(c[1] > 255) c[1] = 255;
        if(c[2] < 0) c[2] = 0;
        if(c[2] > 255) c[2] = 255;
        if(c[0] + c[1] + c[2] < 255) {
            // when the light fades out...
            c[0] = 255 - c[0]
            c[1] = 255 - c[1]
            c[2] = 255 - c[2]
        }
        return "RGB(" + Math.round(c[0]) + "," + Math.round(c[1]) + "," + Math.round(c[2]) + ")";
    }

    * iter() {
        yield
    }


    static _gaussianRandom2() {
        const u = 1 - Math.random(); // Converting [0,1) to (0,1]
        const v = Math.random();
        const m = Math.sqrt( -2.0 * Math.log( u ) )
        return new vec2( m * Math.cos( 2.0 * Math.PI * v ) , m * Math.sin( 2.0 * Math.PI * v ));
    }



    step(nodeMode, nodeMode_v, prevNodeToConnect){
        this.updateViewbox();
        this.regenDebt = Math.min(16, this.regenDebt + lerp(settings.regenDebtAdjustmentFactor, this.regenAmount, Math.min(1, (nodeMode_v ** 5) * 1.01)));
        for (; this.regenDebt > 0; this.regenDebt--) {
            this.renderGrid(Math.random() * settings.renderSteps);
        }
        this.regenAmount = 0;
        return prevNodeToConnect;

    }

    renderGrid(n) {

        let maxLines = dropdown.editTab.getMaxLines();
        let svgBounds = this.getBoundingBox();
        if(svgBounds.width === 0 || svgBounds.height === 0) return;
        let complexBotRight = this.toDZ(new vec2(svgBounds.width, svgBounds.height))
        let complexBounds = {...this.toDZ(new vec2(0,0)), width: complexBotRight.x, height: complexBotRight.y }

        complexBounds.x = this.pan.x - complexBounds.width * 1.5;
        complexBounds.y = this.pan.y - complexBounds.height * 1.5;

        let magnitude = Math.floor(Math.log10(complexBounds.width)) - 1 + Math.floor(GridBG._gaussianRandom2().x);
        let gridSize = Math.pow(10 , magnitude);
        // let strokeSize =  magnitude > 3 ? 1 : Math.pow(10 , magnitude * 0.5);// can't get under 10^-7 for svg stroke size limitations
        // if(this.svg.id === "svg_bg-3") console.log("Magnitude:", magnitude, "gridSize: ", gridSize,  "n: ", n)// "strokeSize: ", strokeSize,
        let numHorizontalLines = Math.ceil(3 * complexBounds.width / gridSize);
        let numVerticalLines = Math.ceil(3 * complexBounds.height / gridSize);

        let path = "";
        // let meanpoint = null;
        if(Math.random() <= 0.5){
            let i = Math.floor(Math.random() * numHorizontalLines);
            let x = i * gridSize + complexBounds.x - (complexBounds.x % gridSize);
            let p1 = this.toSVG(new vec2(x, complexBounds.y));
            let p2 = this.toSVG(new vec2(x, complexBounds.y + complexBounds.height * 3));
            // meanpoint = p1.minus(p2).scale(0.5)
            path += `M ${p1.x},${p1.y} L ${p2.x},${p2.y} `;
        }else{
            let i = Math.floor(Math.random() * numVerticalLines);
            let y = i * gridSize + complexBounds.y - (complexBounds.y % gridSize);
            let p1 = this.toSVG(new vec2(complexBounds.x, y));
            let p2 = this.toSVG(new vec2(complexBounds.x + complexBounds.width * 3, y));
            // meanpoint = p1.minus(p2).scale(0.5)
            path += `M ${p1.x},${p1.y} L ${p2.x},${p2.y} `;
        }

        let pathn = document.createElementNS("http://www.w3.org/2000/svg", "path");
        pathn.setAttribute("fill", "none");

        // pathn.setAttribute("stroke", this.gridColor);
        // cute
        // let iters = settings.iterations;
        // pathn.setAttribute("stroke", this.mcol(iters, meanpoint));
        // let color = this.scol(magnitude);
        // let color = this.scol( magnitude*1.5 + 1);
        // let color = this.scol(2 / (magnitude + 0.1));
        // let color = this.gcol(2 / (magnitude + 0.1));
        let color = this.gcol(2 * Math.cos(magnitude + 0.1));
        // console.log("Magnitude:", 2 * Math.cos(magnitude + 0.1), "color: ", color)
        pathn.setAttribute("stroke", color);//, (1 - nodeMode_v), 128, 32 + (1 - nodeMode_v) * 48));

        pathn.setAttribute("d", path);
        // pathn.setAttribute("stroke-width", "" + this.gridStrokeWidth * strokeSize );
        pathn.setAttribute("stroke-width",  (settings.renderWidthMult)+ "")
        pathn.setAttribute("vector-effect", "non-scaling-stroke")
        // this.svg_bg.setAttribute("vector-effect", "non-scaling-stroke")
        // this.svg_bg.setAttributeNS("http://www.w3.org/2000/svg", "vector-effect", "non-scaling-stroke")
        this.svg_bg.appendChild(pathn);
        while (this.svg_bg.children.length > maxLines) {
            this.svg_bg.removeChild(this.svg_bg.children[0]);
        }
    }
}



// let background = new GridBG({
//     svg_element: svg,
//     svg_bg_element: svg.getElementById("bg"),
//     svg_viewmat_element: svg.getElementById("viewmatrix"),
//     svg_mousePath_element: svg.getElementById("mousePath"),
//     rSlider: document.getElementById("rSlider"),
//     cSlider: document.getElementById("cSlider"),
//     sSlider: document.getElementById("sSlider"),
//     colorPickerR: document.getElementById("rColor"),
//     colorPickerG: document.getElementById("gColor"),
//     colorPickerB: document.getElementById("bColor")
// })

