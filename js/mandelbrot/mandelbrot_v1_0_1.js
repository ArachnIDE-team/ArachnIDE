

document.body.style.overflow = 'hidden';
var svg = document.getElementById("svg_bg");
// let svg_bg = svg.getElementById("bg");
// let svg_viewmat = svg.getElementById("viewmatrix");
// let svg_mousePath = svg.getElementById("mousePath");
// var svg_viewbox_size = 65536;

// let time = () => (current_time === undefined) ? 0 : current_time;

class vec2 {
    constructor(x, y) {
        if (typeof x === "object") {
            y = x.y;
            x = x.x;
        }
        this.x = x;
        this.y = y;
    }
    plus(o) {
        return new vec2(this.x + o.x, this.y + o.y);
    }
    minus(o) {
        return new vec2(this.x - o.x, this.y - o.y);
    }
    times(o) {
        return new vec2(this.x * o.x, this.y * o.y);
    }
    div(o) {
        return new vec2(this.x / o.x, this.y / o.y);
    }
    dot(o) {
        return this.x * o.x + this.y * o.y
    }
    rot(a) {
        let c = Math.cos(a);
        let s = Math.sin(a);
        return new vec2(this.x * c - this.y * s, this.x * s + this.y * c);
    }
    rot90() {
        return new vec2(this.y, -this.x);
    }
    unrot90() {
        return new vec2(-this.y, this.x);
    }
    cross(o) {
        return this.x * o.y - this.y * o.x
    }
    scale(s) {
        return new vec2(this.x * s, this.y * s);
    }
    unscale(s) {
        return new vec2(this.x / s, this.y / s);
    }
    normed(s = 1) {
        return this.scale(s / this.mag());
    }
    mag2() {
        return this.dot(this);
    }
    mag() {
        return Math.hypot(this.x, this.y);
    }
    ang() {
        return Math.atan2(this.y, this.x);
    }
    pang() {
        if (this.x == 0 && this.y == 0) {
            return 0;
        }
        let p = this.x / (Math.abs(this.x) + Math.abs(this.y));
        return this.y < 0 ? p - 1 : 1 - p;
    }
    map(f) {
        return new vec2(f(this.x), f(this.y));
    }

    cadd(o) {
        return this.plus(o);
    }
    csub(o) {
        return this.minus(o);
    }
    cneg(o) {
        return new vec2(-this.x, -this.y);
    }
    cmult(o) {
        return new vec2(this.x * o.x - this.y * o.y, this.y * o.x + this.x * o.y);
    }
    caamult(o) {
        //angle averaging multiply?
        let s = this.plus(o);
        return s.scale(this.cmult(o).mag() / s.mag());
    }
    cconj() {
        return new vec2(this.x, -this.y);
    }
    crecip() {
        // 1/(a+bi) = (a-bi)/mag2
        return this.cconj().unscale(this.mag2());
    }
    cdiv(o) {
        return this.cmult(o.crecip());
    }
    cpow(o) {
        let l = this.clog();
        if (typeof o === "number") {
            l = l.scale(o);
        } else {
            l = l.cmult(o);
        }
        if (l.hasNaN()) {
            return new vec2(0, 0);
        }
        return l.cexp();
    }
    ipow(n) {
        if (n < 0) {
            return this.crecip().ipow(-n);
        }
        if (n == 0) {
            return new vec2(1, 0);
        }
        if (n == 1) {
            return this;
        }
        let c = this.ipow(n >> 1);
        c = c.cmult(c);
        if (n & 1) {
            return c.cmult(this);
        }
        return c;
    }
    hasNaN() {
        return isNaN(this.x) || isNaN(this.y);
    }
    isFinite() {
        return isFinite(this.x) && isFinite(this.y);
    }
    cexp() {
        let m = Math.exp(this.x);
        let i = Math.sin(this.y);
        let r = Math.cos(this.y);
        return new vec2(m * r, m * i);
    }
    clog() {
        let r = Math.log(this.mag2()) / 2; //no sqrt because log rules
        let i = Math.atan2(this.y, this.x);
        return new vec2(r, i);
    }

    str() {
        return this.x + "," + this.y;
    }
    sqrt() {
        //https://www.johndcook.com/blog/2020/06/09/complex-square-root/
        let l = this.mag();
        let u = Math.sqrt((l + this.x) / 2);
        let v = Math.sign(this.y) * Math.sqrt((l - this.x) / 2);
        return new vec2(u, v);
    }
    lerpto(o, t) {
        return new vec2(lerp(this.x, o.x, t), lerp(this.y, o.y, t));
    }
    ctostring() {
        return ("" + this.y).startsWith("-") ? this.x + "-i" + (-this.y) : this.x + "+i" + this.y;
    }
}

// var mousePos = new vec2(0, 0);
// var mousePath = "";
// var zoom = new vec2(1.5, 0); //bigger is further out
// var pan = new vec2(-0.3, 0);

// Z format -> complex (pan is complex)
// UV format -> screen proportion
// C format -> pixel position
// DZ format -> complex distance from pan
// S format -> complex scaled with zoom

// function lerp(a, b, t) {
//     return a * (1 - t) + b * t;
// }

//settings object moved to dropdown.js

// function windowScaleAndOffset() {
//     let svgbb = svg.getBoundingClientRect();
//     let s = Math.min(svgbb.width, svgbb.height); //Math.hypot(window.innerHeight,window.innerWidth)/2**.5;
//     let off = svgbb.width < svgbb.height ? svgbb.right : svgbb.bottom;
//     return {
//         s: s,
//         o: new vec2(-(off - svgbb.right) / 2, -(off - svgbb.bottom) / 2)
//     }
// }
//
// function toZ(c) {
//     let {
//         s,
//         o
//     } = windowScaleAndOffset();
//     return c.minus(o).unscale(s).minus(new vec2(.5, .5)).scale(2).cmult(background.zoom).cadd(background.pan);
// }
//
// function toS(c) {
//     let {
//         s,
//         o
//     } = windowScaleAndOffset();
//     return c.unscale(s).scale(2);
// }
//
// function toDZ(c) {
//     let {
//         s,
//         o
//     } = windowScaleAndOffset();
//     return c.unscale(s).scale(2).cmult(background.zoom);
// }
//
// function fromZ(z) {
//     let {
//         s,
//         o
//     } = windowScaleAndOffset();
//     return z.csub(background.pan).cdiv(background.zoom).unscale(2).plus(new vec2(.5, .5)).scale(s).plus(o);
// }
//
// function fromZtoUV(z) {
//     return z.csub(background.pan).cdiv(background.zoom).unscale(2).plus(new vec2(.5, .5));
// }
// var SVGzoom = 8192;
// var SVGpan = new vec2(0, 0);
// let recenterThreshold = 0.01;
// let rezoomThreshold = 0.1;
// let rezoomFactor = 8192;
// let old_rotation = 0;

// function updateViewbox() {
//     //let lc = toSVG(toZ(new vec2(0,0)));
//     let zm = background.zoom.mag();
//     let lc = toSVG(new vec2(-zm, -zm).plus(background.pan));
//     let d = zm * 2 * background.SVGzoom;
//     let r = background.zoom.ang();
//     //let rotCenter = fromZ(pan);// = {let s = window.innerWidth; return new vec2(.5*s,.5*s);}
//     let oldSVGzoom = background.SVGzoom;
//     let oldSVGpan = background.SVGpan;
//
//     let recalc = false;
//     if (d < Math.abs(MandelbrotBG.RECENTER_THRESHOLD * lc.x) || d < Math.abs(MandelbrotBG.RECENTER_THRESHOLD * lc.y)) {
//         background.SVGpan = background.pan.scale(1);
//         lc = toSVG(background.toZ(new vec2(0, 0)));
//         //console.log("recentering...");
//         recalc = true;
//     }
//     if (d < MandelbrotBG.REZOOM_THRESHOLD || d > MandelbrotBG.REZOOM_FACTOR / MandelbrotBG.REZOOM_THRESHOLD) {
//         background.SVGzoom *= MandelbrotBG.REZOOM_FACTOR / d;
//         //console.log("rezooming...");
//         recalc = true;
//     }
//     if (recalc) {
//         _recalc_svg(oldSVGpan,oldSVGzoom);
//     }
//
//     let c = toSVG(background.pan); //center of rotation
//     //where it ends up if you do the rotation about SVGpan
//     let rc = c.cmult(background.zoom.unscale(zm).cconj());
//     //
//     lc = lc.plus(rc.minus(c));
//
//     background.svg.setAttribute("viewBox", lc.x + " " + lc.y + " " + d + " " + d);
//
//
//     if (r !== background.old_rotation) {
//         background.old_rotation = r;
//         background.svg_viewmat.setAttribute("transform", "rotate(" + (-r * 180 / Math.PI) + ")");
//         //svg_viewmat.setAttribute("transform","rotate("+(-r*180/Math.PI)+" "+c.x+" "+c.y+")");
//     }
//
//
//     return
//
//     // the below has the issue of low-res svg when changing the matrix in firefox
//     background.svg.setAttribute("viewBox", (-background.svg_viewbox_size / 2) + " " + (-background.svg_viewbox_size / 2) + " " + background.svg_viewbox_size + " " + background.svg_viewbox_size);
//     // z = bal(uv)*zoom+pan
//     // svg = (z-svgpan)*svgzoom
//     // want matrix to go svg -> bal(uv)*65536
//     // bal(uv)*65536 = 65536*(z-pan)/zoom = 65536*(svg/svgzoom-svgpan-pan)/zoom
//     // d/dsvg = 65536/svgzoom/zoom
//     // f(0) = -65536*(svgpan+pan)/zoom
//     let t = background.zoom.crecip().scale(background.svg_viewbox_size / background.SVGzoom / 2);
//     let p = background.pan.minus(background.SVGpan).scale(-background.svg_viewbox_size / 2).cdiv(background.zoom);
//
//     background.svg_viewmat.setAttribute("transform", "matrix(" + t.x + " " + (t.y) + " " + (-t.y) + " " + (t.x) + " " + (p.x) + " " + (p.y) + ")");
//     //svg_bg.setAttribute("transform","matrix("+z.x+" "+(-z.y)+" "+(z.y)+" "+(z.x)+" "+SVGpan.x+" "+SVGpan.y+")");
//
// }
//
// function toSVG(coords) {
//     return coords.minus(background.SVGpan).scale(background.SVGzoom);
// }
//
// function recalc_svg(oldSVGpan,oldSVGzoom) {
//     let node = background.svg_bg;
//     for (let c of node.children){
//         let path = c.getAttribute("d");
//         let parts = path.split(/[, ]+/g);
//         let coord = 0;
//         let r = [];
//         for (let p of parts){
//             if (p.length && !isNaN(Number(p))){
//                 let c = coord?'y':'x';
//                 p = Number(p)/oldSVGzoom + oldSVGpan[c];
//                 p = (p-background.SVGpan[c])*background.SVGzoom;
//                 coord = 1-coord;
//             }
//             r.push(p);
//         }
//         c.setAttribute("d",r.join(" "));
//         c.setAttribute("stroke-width",c.getAttribute("stroke-width")*background.SVGzoom/oldSVGzoom);
//     }
// }
//
//
// document.getElementById("body").addEventListener("mousedown", (event) => {
//     isPanning = true;
//     deselectCoordinate();
//     document.body.style.userSelect = "none"; // Disable text selection
// }, false);
//
// document.getElementById("body").addEventListener("mousemove", (event) => {
//     background.mousePos.x = event.pageX;
//     background.mousePos.y = event.pageY;
//     background.mousePath = "";
// }, false);
//
// document.getElementById("body").addEventListener("mouseup", (event) => {
//     if (isPanning) {
//         isPanning = false;
//         document.body.style.userSelect = "auto"; // Re-enable text selection
//     }
// }, false);
// document.getElementById("body").addEventListener("mouseleave", (event) => {
//     if (isPanning) {
//         isPanning = false;
//         document.body.style.userSelect = "auto"; // Re-enable text selection
//     }
// }, false);

// function mand_step(z, c) {
//     return z.cmult(z).cadd(c);
// }
/*

function mand_step(z, c) {
    // Randomly alter 'c' to introduce perturbations
    if (Math.random() < 0.1) { // 10% chance to alter
        c = c.plus(new vec2(Math.random() * 0.01 - 0.005, Math.random() * 0.01 - 0.005));
    }
    return z.cmult(z).cadd(c);
}
//Not yet functioning well.
function mand_step(z, c, iteration) {
    if (iteration > 50) { // After 50 iterations, alter the pattern
        return z.cmult(z).cadd(c.scale(Math.sin(iteration * 0.1)));
    }
    return z.cmult(z).cadd(c);
} */
//function mand_step(z,c){return z.cpow(new vec2(time()/8/120/10+1,0)).cadd(c);}
//function mand_step(z,c){return z.cmult(z).cadd(z.x==0&&z.y==0?c:c.cdiv(z));}
//function mand_step(z,c){return z.cmult(z).cadd(c).map(Math.abs);}

// Not imported to class: unused
// function mand_unstep(z, c) {
//     return z.csub(c).sqrt();
// }

// function mand_i(z, iters = 16) {
//     let c = z;
//     for (let i = 0; i < iters; i++) {
//         if (z.mag2() > 4) {
//             return i;
//         }
//         z = MandelbrotBG.mand_step(z, c);
//     }
//     return (z.mag2() > 4) ? iters : iters + 1;
// }
//
//
//
// function mandelbrott_dist(iters, c, z) {
//     let bailout = 1e8; //large so z^2+c -> z^2
//     if (z === undefined) {
//         z = new vec2(0, 0);
//     }
//     let pz = z;
//     for (let i = 0; i < iters; i++) {
//         if (z.mag2() > bailout) {
//             //pz^2 = z
//             //pz^(2^?) = b
//             //ln(pz)2^?=ln(b)
//             //ln(ln(pz))+ln(2)*?=ln(ln(b))
//             let g = Math.log2(Math.log(bailout));
//             let llz = Math.log2(Math.log2(z.mag2()) / 2);
//             return i - llz;
//         }
//         pz = z;
//         z = MandelbrotBG.mand_step(z, c);
//     }
//     return iters;
// }

// Not imported to class: unused
// function mandelbrott_grad(iters, c, z) {
//     let bailout = 1e8; //large so z^2+c -> z^2
//     if (z === undefined) {
//         z = new vec2(0, 0);
//     }
//     let dz = new vec2(1, 0);
//     for (let i = 0; i < iters; i++) {
//         if (z.mag2() > bailout) {
//             //pz^2 = z
//             //pz^(2^?) = b
//             //ln(pz)2^?=ln(b)
//             //ln(ln(pz))+ln(2)*?=ln(ln(b))
//             return dz;
//             let llz = Math.log2(Math.log2(z.mag2()) / 2);
//             return i - llz;
//         }
//         z = MandelbrotBG.mand_step(z, c);
//         dz = dz.cmult(z.scale(2));
//     }
//     return new vec2(0, 0);
// }

// function mandGrad(maxIters, c, z) {
//     //return mandelbrott_grad(maxIters,c,z);
//     let e = 1e-10;
//     let d = MandelbrotBG._mandelbrott_dist(maxIters, c, z);
//     return new vec2(
//         MandelbrotBG._mandelbrott_dist(maxIters, c.plus(new vec2(e, 0)), z) - d,
//         MandelbrotBG._mandelbrott_dist(maxIters, c.plus(new vec2(0, e)), z) - d
//     ).unscale(e);
//
//     //let re = 1.00000001;
//     //let e = 1e-100;
//     //if (z === undefined) { z = c;}
//     //let d = mandelbrott_dist(maxIters,c,z);
//     //let f = (v) => (Math.abs(v)<e?v+e:v*re);
//     //let fz = new vec2(f(z.x),f(z.y));
//     //return new vec2(
//     //    mandelbrott_dist(maxIters,c,new vec2(fz.x,z.y))-d,
//     //    mandelbrott_dist(maxIters,c,new vec2(z.x,fz.y))-d
//     //    ).div(fz.minus(z));
// }
//
// function gradzr(f, z, epsilon = 1e-6) {
//     let r = f(z);
//     return new vec2(f(z.plus(new vec2(epsilon, 0))) - r, f(z.plus(new vec2(0, epsilon))) - r).unscale(epsilon);
// }
//
// function* trace_circle(iters, z0, step) {
//     if (step === undefined) {
//         step = 0.5;
//     }
//     let level = MandelbrotBG._mandelbrott_dist(iters, z0);
//     let z = z0;
//     while (true) {
//         yield z;
//         let vz = MandelbrotBG._mandelbrott_dist(iters, z);
//         let gz = MandelbrotBG.mandGrad(iters, z);
//         z = z.plus(gz.cmult(new vec2(level - vz, step).unscale(gz.mag2())));
//     }
// }
//
// function mcol(iters, z) {
//     let i = MandelbrotBG._mandelbrott_dist(iters, z);
//     if (i >= iters) {
//         i = findInfimum(iters, z);
//         //i = findPeriod(z);
//         return scol(i.i * 123 + 2, (1 - nodeMode_v), 128, 32 + (1 - nodeMode_v) * 48);
//     } else {
//         return scol(i);
//     }
// }
//
// let rSlider = document.getElementById("rSlider");
// let cSlider = document.getElementById("cSlider");
// let sSlider = document.getElementById("sSlider");
//
// function hexToRgb(hex) {
//     let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
//     return result ? [
//         parseInt(result[1], 16),
//         parseInt(result[2], 16),
//         parseInt(result[3], 16)
//     ] : null;
// }
//
// let colorPickerR = document.getElementById("rColor");
// let colorPickerG = document.getElementById("gColor");
// let colorPickerB = document.getElementById("bColor");
//
// function col(i, r = rSlider.value, c = cSlider.value, s = sSlider.value) {
//     if (nodeMode) {
//         r = nodeMode_v;
//     }
//
//     let colorR = hexToRgb(colorPickerR.value)[0] / 255; // Normalize to [0, 1]
//     let colorG = hexToRgb(colorPickerG.value)[1] / 255; // Normalize to [0, 1]
//     let colorB = hexToRgb(colorPickerB.value)[2] / 255; // Normalize to [0, 1]
//
//     let rgb = [colorR * (c - s * Math.cos(i / 2 ** .9)), colorG * (c - s * Math.cos(i / 3 ** .9)), colorB * (c - s * Math.cos(i / 5 ** .9))];
//     let y = 0.17697 * rgb[0] + 0.81240 * rgb[1] + 0.01063 * rgb[2];
//     return [lerp(rgb[0], y, r), lerp(rgb[1], y, r), lerp(rgb[2], y, r)];
// }
//
// function scol(i, r = rSlider.value, c = cSlider.value, s = sSlider.value) {
//     c = col(i, r, c, s);
//     return "RGB(" + Math.round(c[0]) + "," + Math.round(c[1]) + "," + Math.round(c[2]) + ")";
// }


//let l = document.getElementById("link");
//l.style.position="absolute";
//l.style.left="100px";
//l.style.top="100px";

// Not imported to class: unused
// function outlineMand(start, step, iters) {
//     iters = iters === undefined ? 256 : iters;
//     step = step === undefined ? 0.1 : step;
//     let a0 = start.pang();
//     let path = "M " + background.toSVG(start).str() + "\nL ";
//     let pz = start;
//     let maxlen = 1 << 15;
//     let minD2 = 0.25 / 200 / 200;
//     for (let z of MandelbrotBG._trace_circle(iters, start, step)) {
//         //if (z.minus(pz).mag2() < minD2){ continue;}
//         if (z.pang() <= a0 && pz.pang() > a0) {
//             break;
//         }
//         maxlen--;
//         if (maxlen <= 0) {
//             break;
//         }
//         path += background.toSVG(z).str() + " ";
//         pz = z;
//     }
//     return path;
// }

// Not imported to class: unused
// function addPath(path, stroke, fill) {
//     if (stroke === undefined) {
//         stroke = "red"
//     }
//     if (fill === undefined) {
//         stroke = "none"
//     }
//     let pathn = document.createElementNS("http://www.w3.org/2000/svg", "path");
//     pathn.setAttribute("fill", fill);
//     pathn.setAttribute("stroke", stroke);
//     pathn.setAttribute("d", path);
//     background.svg.appendChild(pathn);
//     return pathn;
// }

// function* iter() {
//     for (let x = 8; x > 0.3; x *= 1 - 1 / 8) {
//         let pathn = document.createElementNS("http://www.w3.org/2000/svg", "path");
//         //pathn.setAttribute("fill",scol(mandelbrott_dist(1024,new vec2(x,0))));
//         pathn.setAttribute("fill", "none");
//         pathn.setAttribute("stroke", background.scol(MandelbrotBG._mandelbrott_dist(1024, new vec2(x, 0))));
//         pathn.setAttribute("stroke-width", "" + (background.SVGzoom * 0.01));
//         pathn.setAttribute("d", "");
//         background.svg.children[1].appendChild(pathn);
//         let start = new vec2(x, 0);
//         let a0 = start.pang();
//         let l = (m) => m;
//         let path = "M " + background.toSVG(l(start)).str() + "\nL ";
//         let pz = start;
//         let maxlen = 1 << 12;
//         let minD2 = 0.01 / 200 / 200;
//         for (let z of MandelbrotBG._trace_circle(1024, start, 0.1)) {
//
//             if (z.pang() <= a0 && pz.pang() > a0) {
//                 break;
//             }
//             maxlen--;
//             if (maxlen <= 0) {
//                 pathn.setAttribute("d", path + " z");
//                 yield;
//                 maxlen = 1 << 12;
//             }
//             if (z.minus(pz).mag2() < minD2) {
//                 continue;
//             }
//             path += background.toSVG(l(z)).str() + " ";
//             pz = z;
//         }
//         pathn.setAttribute("d", path + " z");
//         yield;
//     }
// }
//
// function random_screen_pt_z() {
//     let svgbb = background.svg.getBoundingClientRect();
//     return background.toZ(new vec2(Math.random() * svgbb.width, Math.random() * svgbb.height));
// }


// https://stackoverflow.com/questions/25582882/javascript-math-random-normal-distribution-gaussian-bell-curve
// Standard Normal variate using Box-Muller transform.
// function gaussianRandom2() {
//     const u = 1 - Math.random(); // Converting [0,1) to (0,1]
//     const v = Math.random();
//     const m = Math.sqrt( -2.0 * Math.log( u ) )
//     return new vec2( m * Math.cos( 2.0 * Math.PI * v ) , m * Math.sin( 2.0 * Math.PI * v ));
// }

// function render_hair(n) {
//     let iters = settings.iterations;
//     let maxLines = getMaxLines();
//     let tries = 1;
//     let pt;
//     if (Math.random() > flashlight_fraction){
//         do {
//             pt = background._random_screen_pt_z();
//             for (let i = (1 - Math.random() ** 2) * (tries * 4); i > 1; i--) {
//                 let gz = MandelbrotBG.mandGrad(iters, pt)
//                 pt = pt.plus(gz.unscale(gz.mag2() * 10 + 1));
//                 //if (mand_i(pt,iters) > iters){
//                 //    pt = (new vec2(Math.random()*2-1,Math.random()*2-1)).cmult(zoom).cadd(pan);
//                 //}
//             }
//             tries--;
//         } while (tries > 0 && MandelbrotBG._mand_i(pt, iters) > iters)
//         /*if (mand_i(pt,iters) > iters || pt.mag2()>8){
//           return;
//           }*/
//     }else{
//         pt = MandelbrotBG._gaussianRandom2().scale(flashlight_stdev).cmult(background.zoom).cadd(background.toZ(background.mousePos));
//     }
//
//     //let level = mandelbrott_dist(256,pt);
//     //let width = 1/(level+5)**2;
//     //let width = 1/(mandGrad(256,pt).mag()**1.5+1);
//
//
//     let r = "M " + background.toSVG(pt).str() + " " + settings.renderDChar + " ";
//     let length = 0;
//     let n0 = n;
//     let opt = pt;
//     let na = 0;
//     let opacity = settings.outerOpacity;
//
//     if (MandelbrotBG._mand_i(pt, iters) > iters) {
//         //interior coloring
//         /*let p = findPeriod(pt,pt,1e-12,iters);
//         for (; n > 0; n--){
//             let npt = mand_iter_n(p,pt,pt);
//             let delta = npt.minus(pt);
//             delta = delta.cpow(new vec2(0.5,0));
//             npt = pt.plus(delta.scale(0.1));
//             if (mand_i(npt,iters)<=iters){
//                 break;
//             }
//             r += toSVG(npt).str()+" ";
//             length += npt.minus(pt).mag();
//             pt = npt;
//         }*/
//         let p = findInfimum(iters, pt);
//         for (; n > 0; n--) {
//             let delta = MandelbrotBG._gradzr(((z) => (mand_iter_n(p.i, z, z).mag2())), pt, 1e-5);
//             delta = delta.unscale(delta.mag() + 1e-300).scale(background.zoom.mag() * .1);
//             //debugger
//             npt = pt.plus(delta.scale(-settings.renderStepSize));
//             if (MandelbrotBG._mand_i(npt, iters) <= iters) {
//                 break;
//             }
//             if (!background.toSVG(npt).isFinite()) break;
//             r += background.toSVG(npt).str() + " ";
//             na += 1;
//             length += npt.minus(pt).mag();
//             pt = npt;
//         }
//         opacity = settings.innerOpacity / 10;
//
//         length /= 4;
//     } else {
//         if (MandelbrotBG._mandelbrott_dist(iters, pt) < settings.maxDist) return;
//         for (let p of MandelbrotBG._trace_circle(iters, pt, Math.random() > 0.5 ? settings.renderStepSize : -settings.renderStepSize)) {
//             //console.log(p);
//             //if ((n&3) == 0)
//             if (!background.toSVG(p).isFinite()) break;
//             r += background.toSVG(p).str() + " ";
//             na += 1;
//             n -= 1;
//             if (n < 0) {
//                 break;
//             }
//             length += p.minus(pt).mag();
//             pt = p;
//         }
//         color = background.scol(MandelbrotBG._mandelbrott_dist(iters, pt));
//     }
//     if (na === 0) return;
//     let width = Math.min(settings.renderWidthMult * length / n0, 0.1);
//     let pathn = document.createElementNS("http://www.w3.org/2000/svg", "path");
//     pathn.setAttribute("fill", "none");
//     pathn.setAttribute("stroke", background.mcol(iters, opt));
//     pathn.setAttribute("stroke-width", "" + width * background.SVGzoom);
//     pathn.setAttribute("stroke-opacity", "" + opacity);
//     pathn.setAttribute("d", r);
//     background.svg_bg.appendChild(pathn);
//     while (background.svg_bg.children.length > maxLines) {
//         background.svg_bg.removeChild(background.svg_bg.children[0]);
//     }
// }

// Not imported to class: unused
// function gcd(a, b) {
//     if (b === 0) {
//         return a;
//     }
//     return gcd(b, a % b);
// }
// Not imported to class: unused
// function findPeriod(c, z = new vec2(0, 0), epsilon2 = 1e-7, maxiters = 256) {
//     let zf = MandelbrotBG.mand_step(z, c);
//     let i = 1;
//     let p = 0;
//     for (; i < maxiters; i++) {
//         if (zf.minus(z).mag2() <= epsilon2) {
//             p = i;
//             break
//         }
//         zf = MandelbrotBG.mand_step(zf, c);
//         zf = MandelbrotBG.mand_step(zf, c);
//         z = MandelbrotBG.mand_step(z, c);
//     }
//     for (; i < maxiters; i++) {
//         if (zf.minus(z).mag2() <= epsilon2) {
//             p = gcd(p, i);
//         }
//         zf = MandelbrotBG.mand_step(zf, c);
//         zf = MandelbrotBG.mand_step(zf, c);
//         z = MandelbrotBG.mand_step(z, c);
//     }
//     return p;
// }

// function mand_iter_n(n, c, z = new vec2(0, 0)) {
//     for (let i = 0; i < n; i++) {
//         z = MandelbrotBG.mand_step(z, c);
//     }
//     return z;
// }
//
// function findInfimum(iters, z, c = undefined) {
//     if (c === undefined) {
//         c = z;
//     }
//     let besti = 0;
//     let bestz = z;
//     let bestd = z.mag2();
//     for (let i = 1; i <= iters; i++) {
//         z = MandelbrotBG.mand_step(z, c);
//         let d = z.mag2();
//         if (d < bestd) {
//             bestd = d;
//             besti = i;
//             bestz = z;
//         }
//     }
//     return {
//         i: besti,
//         z: bestz
//     };
// }
//
// function generateBoundaryPoints(numPoints = 100, methods = ["cardioid", "disk", "spike"]) {
//     let points = [];
//
//     if (methods.includes("cardioid")) {
//         // Generate points for the main cardioid
//         for (let i = 0; i < numPoints; i++) {
//             let theta = (i / numPoints) * 2 * Math.PI;
//             let r = (1 - Math.cos(theta)) / 2;
//             let x = r * Math.cos(theta) + 0.25;
//             let y = r * Math.sin(theta);
//             points.push({ x, y });
//         }
//     }
//
//     if (methods.includes("disk")) {
//         // Generate points for the period-2 disk
//         for (let i = 0; i < numPoints; i++) {
//             let theta = (i / numPoints) * 2 * Math.PI;
//             let r = 0.25;
//             let x = r * Math.cos(theta) - 1;
//             let y = r * Math.sin(theta);
//             points.push({ x, y });
//         }
//     }
//
//     if (methods.includes("spike")) {
//         // Generate points along the negative real axis spike
//         for (let i = 0; i < numPoints; i++) {
//             let x = -2 + (2 * i / numPoints); // Range from -2 to 0
//             let y = 0; // Imaginary part is close to zero
//             points.push({ x, y });
//         }
//     }
//
//     return points;
// }


/* This code could be further adapted to create a movement feature that is limited to the perimeter of the Mandelbrot Set.

function calculatePixelSpacing(svg_element) {
// Extract scaling factors based on the current zoom level and SVG dimensions
const scalingFactors = extractScalingFactors(svg_element);

// Base spacing at the default zoom level (no zoom)
const baseSpacing = 10; // This can be adjusted based on the level of detail desired

// Adjust the spacing based on the zoom scale
// Assuming that scalingFactors.scaleX and scaleY are proportional to the zoom level
const adjustedSpacing = baseSpacing / Math.max(scalingFactors.scaleX, scalingFactors.scaleY);

return adjustedSpacing;
}


function isMandelbrotPixel(c, maxIter, escapeRadius) {
let z = new vec2(0, 0);

for (let i = 0; i < maxIter; i++) {
    if (z.mag2() > escapeRadius) {
        return false; // The point escapes, not part of the set
    }
    z = z.cmult(z).plus(c);
}
return true; // The point does not escape, part of the set
}

function isPerimeterPixel(x, y, pixelSpacing, svg_element, iters, escapeRadius) {
let c = toZ(new vec2(x, y));
let isCurrentPixelInSet = isMandelbrotPixel(c, iters, escapeRadius);

// Check neighboring pixels
for (let dx = -pixelSpacing; dx <= pixelSpacing; dx += pixelSpacing) {
    for (let dy = -pixelSpacing; dy <= pixelSpacing; dy += pixelSpacing) {
        if (dx === 0 && dy === 0) continue; // Skip the current pixel

        let neighborC = toZ(new vec2(x + dx, y + dy));
        let isNeighborInSet = isMandelbrotPixel(neighborC, iters, escapeRadius);

        if (isCurrentPixelInSet !== isNeighborInSet) {
            return true; // Boundary found between inside and outside
        }
    }
}
return false;
}

function renderPerimeter(svg_element) {
let iters = settings.iterations;
let escapeRadius = 4;
let pixelSpacing = calculatePixelSpacing(svg_element);

for (let x = 0; x < window.innerWidth; x += pixelSpacing) {
    for (let y = 0; y < window.innerHeight; y += pixelSpacing) {
        let c = toZ(new vec2(x, y));
        if (isPerimeterPixel(x, y, pixelSpacing, svg_element, iters, escapeRadius)) {
            // Convert back to screen coordinates and apply scaling
            let screenCoords = fromZ(c);
            screenCoords = screenCoords.scale(perimeterScaleFactor);

            markBoundaryPoint(screenCoords.x, screenCoords.y, svg_element);
        }
    }
}
}

function markBoundaryPoint(x, y, svg_element) {
let circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
circle.setAttribute("cx", x);
circle.setAttribute("cy", y);
circle.setAttribute("r", 2 * perimeterScaleFactor); // Apply scaling to the radius as well
circle.setAttribute("fill", "red");
circle.classList.add("perimeter-point");
svg_element.appendChild(circle);
}

let svg_element = document.getElementById("svg_bg");
renderPerimeter(svg_element);
*/




// Utility re-imported externalized functions
function hexToRgb(hex) {
    let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16)
    ] : null;
}

function lerp(a, b, t) {
    return a * (1 - t) + b * t;
}

class Background {
    static DEFAULT_CONFIGURATION = {
        svg_element: undefined,
        svg_bg_element: undefined,
        svg_viewmat_element: undefined,
        svg_mousePath_element: undefined,
        svg_viewbox_size: 65536,
        zoom:  new vec2(1.5, 0),
        pan:  new vec2(-0.3, 0),
        diagram: null,
    }
    constructor(configuration=Background.DEFAULT_CONFIGURATION) {
        configuration = {...Background.DEFAULT_CONFIGURATION, ...configuration}
        this.svg = configuration.svg_element;
        this.svg_bg = configuration.svg_bg_element;
        this.svg_viewmat = configuration.svg_viewmat_element;
        this.svg_mousePath = configuration.svg_mousePath_element;
        this.svg_viewbox_size = configuration.svg_viewbox_size;

        this.mousePos = new vec2(0, 0);
        this.zoom = configuration.zoom;//bigger is further out
        this.pan =configuration.pan;

        this.isPanning = false;

        if(configuration.diagram === null) {
            this.diagram = rootDiagram;
        } else {
            this.diagram = configuration.diagram;
        }
        this.initEventListeners()
    }

    windowScaleAndOffset() {
        let svgBoundingBox = this.svg.getBoundingClientRect();
        let scale = Math.min(svgBoundingBox.width, svgBoundingBox.height); //Math.hypot(window.innerHeight,window.innerWidth)/2**.5;
        let offset = svgBoundingBox.width < svgBoundingBox.height ? svgBoundingBox.right : svgBoundingBox.bottom;
        return {
            scale,
            offset: new vec2(-(offset - svgBoundingBox.right) / 2, -(offset - svgBoundingBox.bottom) / 2)
        }
    }
    initEventListeners(){
        document.getElementById("body").addEventListener("mousedown", this.onMouseDown.bind(this), false);
        document.getElementById("body").addEventListener("mousemove",  this.onMouseMove.bind(this), false);
        document.getElementById("body").addEventListener("mouseup",  this.onMouseUp.bind(this), false);
        document.getElementById("body").addEventListener("mouseleave",  this.onMouseLeave.bind(this), false);
    }

    onMouseDown(event){
        this.isPanning = true;
        deselectCoordinate();
        document.body.style.userSelect = "none"; // Disable text selection
    }

    onMouseMove(event){
        this.mousePos.x = event.pageX;
        this.mousePos.y = event.pageY;
        this.mousePath = "";
    }

    onMouseUp(event){
        if (this.isPanning) {
            this.isPanning = false;
            document.body.style.userSelect = "auto"; // Re-enable text selection
        }
    }
    onMouseLeave(event){
        if (this.isPanning) {
            this.isPanning = false;
            document.body.style.userSelect = "auto"; // Re-enable text selection
        }
    }
}

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
        //let lc = toSVG(toZ(new vec2(0,0)));
        let zm = this.zoom.mag();
        let lc = this.toSVG(new vec2(-zm, -zm).plus(this.pan));
        let d = zm * 2 * this.SVGzoom;
        let r = this.zoom.ang();
        //let rotCenter = fromZ(pan);// = {let s = window.innerWidth; return new vec2(.5*s,.5*s);}
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
        // z = bal(uv)*zoom+pan
        // svg = (z-svgpan)*svgzoom
        // want matrix to go svg -> bal(uv)*65536
        // bal(uv)*65536 = 65536*(z-pan)/zoom = 65536*(svg/svgzoom-svgpan-pan)/zoom
        // d/dsvg = 65536/svgzoom/zoom
        // f(0) = -65536*(svgpan+pan)/zoom
        let t = this.zoom.crecip().scale(this.svg_viewbox_size / this.SVGzoom / 2);
        let p = this.pan.minus(this.SVGpan).scale(-this.svg_viewbox_size / 2).cdiv(this.zoom);

        this.svg_viewmat.setAttribute("transform", "matrix(" + t.x + " " + (t.y) + " " + (-t.y) + " " + (t.x) + " " + (p.x) + " " + (p.y) + ")");
        //svg_bg.setAttribute("transform","matrix("+z.x+" "+(-z.y)+" "+(z.y)+" "+(z.x)+" "+SVGpan.x+" "+SVGpan.y+")");

    }

    toSVG(coords) {
        return coords.minus(this.SVGpan).scale(this.SVGzoom);
    }

    _recalc_svg(oldSVGpan, oldSVGzoom) {
        let node = this.svg_bg;
        for (let c of node.children){
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
            return this.scol(i.i * 123 + 2, (1 - this.diagram.nodeMode_v), 128, 32 + (1 - this.diagram.nodeMode_v) * 48);
        } else {
            return this.scol(i);
        }
    }

    col(i, r = null, c = null, s = null) {
        if (this.diagram.nodeMode) {
            r = this.diagram.nodeMode_v;
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
                    //if (mand_i(pt,iters) > iters){
                    //    pt = (new vec2(Math.random()*2-1,Math.random()*2-1)).cmult(zoom).cadd(pan);
                    //}
                }
                tries--;
            } while (tries > 0 && MandelbrotBG._mand_i(pt, iters) > iters)
            /*if (mand_i(pt,iters) > iters || pt.mag2()>8){
              return;
              }*/
        }else{
            pt = MandelbrotBG._gaussianRandom2().scale(flashlight_stdev).cmult(this.zoom).cadd(this.toZ(this.mousePos));
        }

        //let level = mandelbrott_dist(256,pt);
        //let width = 1/(level+5)**2;
        //let width = 1/(mandGrad(256,pt).mag()**1.5+1);


        let r = "M " + this.toSVG(pt).str() + " " + settings.renderDChar + " ";
        let length = 0;
        let n0 = n;
        let opt = pt;
        let na = 0;
        let opacity = settings.outerOpacity;

        if (MandelbrotBG._mand_i(pt, iters) > iters) {
            //interior coloring
            /*let p = findPeriod(pt,pt,1e-12,iters);
            for (; n > 0; n--){
                let npt = mand_iter_n(p,pt,pt);
                let delta = npt.minus(pt);
                delta = delta.cpow(new vec2(0.5,0));
                npt = pt.plus(delta.scale(0.1));
                if (mand_i(npt,iters)<=iters){
                    break;
                }
                r += toSVG(npt).str()+" ";
                length += npt.minus(pt).mag();
                pt = npt;
            }*/
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
                //console.log(p);
                //if ((n&3) == 0)
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
}

// let background = new MandelbrotBG({
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

