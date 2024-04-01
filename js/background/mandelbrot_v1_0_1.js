
// Z format -> complex (pan is complex)
// UV format -> screen proportion
// C format -> pixel position
// DZ format -> complex distance from pan
// S format -> complex scaled with zoom

class MandelbrotBG extends Background {

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
    }

    constructor(configuration=MandelbrotBG.DEFAULT_CONFIGURATION) {
        configuration = {...MandelbrotBG.DEFAULT_CONFIGURATION, ...configuration}
        super(configuration);
        this.rSlider = configuration.rSlider;
        this.cSlider = configuration.cSlider;
        this.sSlider = configuration.sSlider;
        this.colorPickerR = configuration.colorPickerR;
        this.colorPickerG = configuration.colorPickerG;
        this.colorPickerB = configuration.colorPickerB;
        this.mousePath = "";
        this.SVGzoom = 8192;
        this.SVGpan = new vec2(0, 0);
        this.old_rotation = 0;
        // Imported/moved from Diagram (as it's background resp. to keep track of those values)
        this.mousePathPos = undefined;
        this.regenDebt = 0;
        this.regenAmount = 0;
    }

    toZ(c) {
        let { scale, offset } = this.windowScaleAndOffset();
        return c.minus(offset).unscale(scale).minus(new vec2(.5, .5)).scale(2).cmult(this.zoom).cadd(this.pan);
    }

    toS(c) {
        let { scale } = this.windowScaleAndOffset();
        return c.unscale(scale).scale(2);
    }

    toDZ(c) {
        let { scale } = this.windowScaleAndOffset();
        return c.unscale(scale).scale(2).cmult(this.zoom);
    }

    fromZ(z) {
        let { scale, offset } = this.windowScaleAndOffset();
        return z.csub(this.pan).cdiv(this.zoom).unscale(2).plus(new vec2(.5, .5)).scale(scale).plus(offset);
    }

    fromZtoUV(z) {
        return z.csub(this.pan).cdiv(this.zoom).unscale(2).plus(new vec2(.5, .5));
    }

    updateViewbox() {
        let zm = this.zoom.mag();
        let lc = this.toSVG(new vec2(-zm, -zm).plus(this.pan));
        let d = zm * 2 * this.SVGzoom;
        let r = this.zoom.ang();
        let oldSVGzoom = this.SVGzoom;
        let oldSVGpan = this.SVGpan;

        let recalc = false;
        if (d < Math.abs(MandelbrotBG.RECENTER_THRESHOLD * lc.x) || d < Math.abs(MandelbrotBG.RECENTER_THRESHOLD * lc.y)) {
            this.SVGpan = this.pan.scale(1);
            lc = this.toSVG(this.toZ(new vec2(0, 0)));
            //console.log("recentering...");
            recalc = true;
        }
        if (d < MandelbrotBG.REZOOM_THRESHOLD || d > MandelbrotBG.REZOOM_FACTOR / MandelbrotBG.REZOOM_THRESHOLD) {
            this.SVGzoom *= MandelbrotBG.REZOOM_FACTOR / d;
            //console.log("rezooming...");
            recalc = true;
        }
        if (recalc) {
            this._recalc_svg(oldSVGpan,oldSVGzoom);
        }

        let c = this.toSVG(this.pan); //center of rotation
        //where it ends up if you do the rotation about SVGpan
        let rc = c.cmult(this.zoom.unscale(zm).cconj());
        //
        lc = lc.plus(rc.minus(c));

        this.svg.setAttribute("viewBox", lc.x + " " + lc.y + " " + d + " " + d);


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

    toSVG(coords) {
        return coords.minus(this.SVGpan).scale(this.SVGzoom);
    }

    _recalc_svg(oldSVGpan, oldSVGzoom) {
        for (let c of this.svg_bg.children){
            let path = c.getAttribute("d");
            let parts = path.split(/[, ]+/g);
            let coord = 0;
            let r = [];
            for (let p of parts){
                if (p.length && !isNaN(Number(p))){
                    let c = coord?'y':'x';
                    p = Number(p)/oldSVGzoom + oldSVGpan[c];
                    p = (p-this.SVGpan[c])*this.SVGzoom;
                    coord = 1-coord;
                }
                r.push(p);
            }
            c.setAttribute("d",r.join(" "));
            c.setAttribute("stroke-width",c.getAttribute("stroke-width")*this.SVGzoom/oldSVGzoom);
        }
    }

    static mand_step(z, c) {
        return z.cmult(z).cadd(c);
    }

    static _mand_i(z, iters = 16) {
        let c = z;
        for (let i = 0; i < iters; i++) {
            if (z.mag2() > 4) {
                return i;
            }
            z = MandelbrotBG.mand_step(z, c);
        }
        return (z.mag2() > 4) ? iters : iters + 1;
    }

    static _mandelbrott_dist(iters, c, z) {
        let bailout = 1e8; //large so z^2+c -> z^2
        if (z === undefined) {
            z = new vec2(0, 0);
        }
        let pz = z;
        for (let i = 0; i < iters; i++) {
            if (z.mag2() > bailout) {
                //pz^2 = z
                //pz^(2^?) = b
                //ln(pz)2^?=ln(b)
                //ln(ln(pz))+ln(2)*?=ln(ln(b))
                let g = Math.log2(Math.log(bailout));
                let llz = Math.log2(Math.log2(z.mag2()) / 2);
                return i - llz;
            }
            pz = z;
            z = MandelbrotBG.mand_step(z, c);
        }
        return iters;
    }

    static mandGrad(maxIters, c, z) {
        //return mandelbrott_grad(maxIters,c,z);
        let e = 1e-10;
        let d = MandelbrotBG._mandelbrott_dist(maxIters, c, z);
        return new vec2(
            MandelbrotBG._mandelbrott_dist(maxIters, c.plus(new vec2(e, 0)), z) - d,
            MandelbrotBG._mandelbrott_dist(maxIters, c.plus(new vec2(0, e)), z) - d
        ).unscale(e);

        //let re = 1.00000001;
        //let e = 1e-100;
        //if (z === undefined) { z = c;}
        //let d = mandelbrott_dist(maxIters,c,z);
        //let f = (v) => (Math.abs(v)<e?v+e:v*re);
        //let fz = new vec2(f(z.x),f(z.y));
        //return new vec2(
        //    mandelbrott_dist(maxIters,c,new vec2(fz.x,z.y))-d,
        //    mandelbrott_dist(maxIters,c,new vec2(z.x,fz.y))-d
        //    ).div(fz.minus(z));
    }

    static _gradzr(f, z, epsilon = 1e-6) {
        let r = f(z);
        return new vec2(f(z.plus(new vec2(epsilon, 0))) - r, f(z.plus(new vec2(0, epsilon))) - r).unscale(epsilon);
    }

    static* _trace_circle(iters, z0, step) {
        if (step === undefined) {
            step = 0.5;
        }
        let level = MandelbrotBG._mandelbrott_dist(iters, z0);
        let z = z0;
        while (true) {
            yield z;
            let vz = MandelbrotBG._mandelbrott_dist(iters, z);
            let gz = MandelbrotBG.mandGrad(iters, z);
            z = z.plus(gz.cmult(new vec2(level - vz, step).unscale(gz.mag2())));
        }
    }

    mcol(iters, z) {
        let i = MandelbrotBG._mandelbrott_dist(iters, z);
        if (i >= iters) {
            i = MandelbrotBG._findInfimum(iters, z);
            //i = findPeriod(z);
            return this.scol(i.i * 123 + 2, (1 - nodeMode_v), 128, 32 + (1 - nodeMode_v) * 48);
        } else {
            return this.scol(i);
        }
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

    * iter() {
        for (let x = 8; x > 0.3; x *= 1 - 1 / 8) {
            let pathn = document.createElementNS("http://www.w3.org/2000/svg", "path");
            //pathn.setAttribute("fill",scol(mandelbrott_dist(1024,new vec2(x,0))));
            pathn.setAttribute("fill", "none");
            pathn.setAttribute("stroke", this.scol(MandelbrotBG._mandelbrott_dist(1024, new vec2(x, 0))));
            pathn.setAttribute("stroke-width", "" + (this.SVGzoom * 0.01));
            pathn.setAttribute("d", "");
            this.svg.children[1].appendChild(pathn);
            let start = new vec2(x, 0);
            let a0 = start.pang();
            let l = (m) => m;
            let path = "M " + this.toSVG(l(start)).str() + "\nL ";
            let pz = start;
            let maxlen = 1 << 12;
            let minD2 = 0.01 / 200 / 200;
            for (let z of MandelbrotBG._trace_circle(1024, start, 0.1)) {

                if (z.pang() <= a0 && pz.pang() > a0) {
                    break;
                }
                maxlen--;
                if (maxlen <= 0) {
                    pathn.setAttribute("d", path + " z");
                    yield;
                    maxlen = 1 << 12;
                }
                if (z.minus(pz).mag2() < minD2) {
                    continue;
                }
                path += this.toSVG(l(z)).str() + " ";
                pz = z;
            }
            pathn.setAttribute("d", path + " z");
            yield;
        }
    }

    _random_screen_pt_z() {
        let svgbb = this.svg.getBoundingClientRect();
        return this.toZ(new vec2(Math.random() * svgbb.width, Math.random() * svgbb.height));
    }

    static _gaussianRandom2() {
        const u = 1 - Math.random(); // Converting [0,1) to (0,1]
        const v = Math.random();
        const m = Math.sqrt( -2.0 * Math.log( u ) )
        return new vec2( m * Math.cos( 2.0 * Math.PI * v ) , m * Math.sin( 2.0 * Math.PI * v ));
    }

    render_hair(n) {
        let iters = settings.iterations;
        let maxLines = getMaxLines();
        let tries = 1;
        let pt;
        if (Math.random() > flashlight_fraction){
            do {
                pt = this._random_screen_pt_z();
                for (let i = (1 - Math.random() ** 2) * (tries * 4); i > 1; i--) {
                    let gz = MandelbrotBG.mandGrad(iters, pt)
                    pt = pt.plus(gz.unscale(gz.mag2() * 10 + 1));
                }
                tries--;
            } while (tries > 0 && MandelbrotBG._mand_i(pt, iters) > iters)
        }else{
            pt = MandelbrotBG._gaussianRandom2().scale(flashlight_stdev).cmult(this.zoom).cadd(this.toZ(this.mousePos));
        }


        let r = "M " + this.toSVG(pt).str() + " " + settings.renderDChar + " ";
        let length = 0;
        let n0 = n;
        let opt = pt;
        let na = 0;
        let opacity = settings.outerOpacity;

        if (MandelbrotBG._mand_i(pt, iters) > iters) {
            let p = MandelbrotBG._findInfimum(iters, pt);
            for (; n > 0; n--) {
                let delta = MandelbrotBG._gradzr(((z) => (MandelbrotBG._mand_iter_n(p.i, z, z).mag2())), pt, 1e-5);
                delta = delta.unscale(delta.mag() + 1e-300).scale(this.zoom.mag() * .1);
                //debugger
                let npt = pt.plus(delta.scale(-settings.renderStepSize));
                if (MandelbrotBG._mand_i(npt, iters) <= iters) {
                    break;
                }
                if (!this.toSVG(npt).isFinite()) break;
                r += this.toSVG(npt).str() + " ";
                na += 1;
                length += npt.minus(pt).mag();
                pt = npt;
            }
            opacity = settings.innerOpacity / 10;

            length /= 4;
        } else {
            if (MandelbrotBG._mandelbrott_dist(iters, pt) < settings.maxDist) return;
            for (let p of MandelbrotBG._trace_circle(iters, pt, Math.random() > 0.5 ? settings.renderStepSize : -settings.renderStepSize)) {
                if (!this.toSVG(p).isFinite()) break;
                r += this.toSVG(p).str() + " ";
                na += 1;
                n -= 1;
                if (n < 0) {
                    break;
                }
                length += p.minus(pt).mag();
                pt = p;
            }
            let color = this.scol(MandelbrotBG._mandelbrott_dist(iters, pt));
        }
        if (na === 0) return;
        let width = Math.min(settings.renderWidthMult * length / n0, 0.1);
        let pathn = document.createElementNS("http://www.w3.org/2000/svg", "path");
        pathn.setAttribute("fill", "none");
        pathn.setAttribute("stroke", this.mcol(iters, opt));
        pathn.setAttribute("stroke-width", "" + width * this.SVGzoom);
        pathn.setAttribute("stroke-opacity", "" + opacity);
        pathn.setAttribute("d", r);
        this.svg_bg.appendChild(pathn);
        while (this.svg_bg.children.length > maxLines) {
            this.svg_bg.removeChild(this.svg_bg.children[0]);
        }
    }

    static _mand_iter_n(n, c, z = new vec2(0, 0)) {
        for (let i = 0; i < n; i++) {
            z = MandelbrotBG.mand_step(z, c);
        }
        return z;
    }

    static _findInfimum(iters, z, c = undefined) {
        if (c === undefined) {
            c = z;
        }
        let besti = 0;
        let bestz = z;
        let bestd = z.mag2();
        for (let i = 1; i <= iters; i++) {
            z = MandelbrotBG.mand_step(z, c);
            let d = z.mag2();
            if (d < bestd) {
                bestd = d;
                besti = i;
                bestz = z;
            }
        }
        return {
            i: besti,
            z: bestz
        };
    }

    static _generateBoundaryPoints(numPoints = 100, methods = ["cardioid", "disk", "spike"]) {
        let points = [];

        if (methods.includes("cardioid")) {
            // Generate points for the main cardioid
            for (let i = 0; i < numPoints; i++) {
                let theta = (i / numPoints) * 2 * Math.PI;
                let r = (1 - Math.cos(theta)) / 2;
                let x = r * Math.cos(theta) + 0.25;
                let y = r * Math.sin(theta);
                points.push({ x, y });
            }
        }

        if (methods.includes("disk")) {
            // Generate points for the period-2 disk
            for (let i = 0; i < numPoints; i++) {
                let theta = (i / numPoints) * 2 * Math.PI;
                let r = 0.25;
                let x = r * Math.cos(theta) - 1;
                let y = r * Math.sin(theta);
                points.push({ x, y });
            }
        }

        if (methods.includes("spike")) {
            // Generate points along the negative real axis spike
            for (let i = 0; i < numPoints; i++) {
                let x = -2 + (2 * i / numPoints); // Range from -2 to 0
                let y = 0; // Imaginary part is close to zero
                points.push({ x, y });
            }
        }

        return points;
    }

    step(nodeMode, nodeMode_v, prevNodeToConnect){
        this.updateViewbox();

        let containerBounds = this.container.getBoundingClientRect()
        let topLeft = new vec2(containerBounds.x, containerBounds.y);
        if (this.mousePath === "" || Number.isNaN(this.mousePathPos.x)) {

            this.mousePathPos = this.toZ(this.mousePos.minus(topLeft));
            // if(this.container !== window.body) console.log("Mouse Path pos: ", this.mousePathPos)
            if(!Number.isNaN(this.mousePathPos.x))this.mousePath = "M " + this.toSVG(this.mousePathPos).str() + " L ";
        }
        for (let i = 0; i < settings.orbitStepRate; i++) {
            //let g = mandGrad(settings.iterations,mousePathPos);
            //mousePathPos = mousePathPos.plus(g.unscale((g.mag()+1e-10)*1000));

            this.mousePathPos = MandelbrotBG.mand_step(this.mousePathPos, this.toZ(this.mousePos.minus(topLeft)));

            //let p = findPeriod(mousePathPos);
            //mousePathPos = mand_iter_n(p,mousePathPos,mousePathPos);
            if (this.toSVG(this.mousePathPos).isFinite() && this.toSVG(this.mousePathPos).mag2() < 1e60 && !Number.isNaN(this.mousePathPos.x))
                this.mousePath += this.toSVG(this.mousePathPos).str() + " ";


        }
        let width = this.zoom.mag() * 0.0005 * this.SVGzoom;

        if (nodeMode && prevNodeToConnect !== undefined) {
            Diagram.clearTextSelection();
            this.svg_mousePath.setAttribute("d", "M " + this.toSVG(prevNodeToConnect.pos).str() + " L " + this.toSVG(this.toZ(this.mousePos)).str());
            width *= 50; // This will increase the width when connecting nodes. Adjust as needed.
        } else {
            this.svg_mousePath.setAttribute("d", this.mousePath);
        }

        // Moved the check to clear prevNodeToConnect outside of the if-else block
        if (!nodeMode && prevNodeToConnect !== undefined) {
            prevNodeToConnect = undefined;

            // Clear the mouse path
            this.mousePath = "";
            this.svg_mousePath.setAttribute("d", "");
            Diagram.clearTextSelection();
        }

        this.svg_mousePath.setAttribute("stroke-width", width + "");

        this.regenDebt = Math.min(16, this.regenDebt + lerp(settings.regenDebtAdjustmentFactor, this.regenAmount, Math.min(1, (nodeMode_v ** 5) * 1.01)));
        for (; this.regenDebt > 0; this.regenDebt--) {
            this.render_hair(Math.random() * settings.renderSteps);
        }
        this.regenAmount = 0;
        return prevNodeToConnect;
    }
}

