

document.body.style.overflow = 'hidden';
var svg = document.getElementById("svg_bg");

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
        container: undefined
    }
    constructor(configuration=Background.DEFAULT_CONFIGURATION) {
        configuration = {...Background.DEFAULT_CONFIGURATION, ...configuration}
        this.svg = configuration.svg_element;
        this.svg_bg = configuration.svg_bg_element;
        this.svg_viewmat = configuration.svg_viewmat_element;
        this.svg_mousePath = configuration.svg_mousePath_element;
        this.svg_viewbox_size = configuration.svg_viewbox_size;
        this.SVGzoom = 8192;
        this.SVGpan = new vec2(0, 0);
        this.mousePos = new vec2(0, 0);
        this.zoom = configuration.zoom;//bigger is further out
        this.pan = configuration.pan;

        this.isPanning = false;

        if(configuration.diagram === null) {
            this.diagram = rootDiagram;
        } else {
            this.diagram = configuration.diagram;
        }
        this.container = configuration.container;
        this.backgroundColorPicker = document.getElementById("colorPicker");

        this.selectionRectangle = null;

        this.initEventListeners();
        this.attachBackgroundColorInput()
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

    toSVG(coords) {
        return coords.minus(this.SVGpan).scale(this.SVGzoom);
    }


    windowScaleAndOffset() {
        let svgBoundingBox = this.svg.getBoundingClientRect();
        let scale = Math.min(svgBoundingBox.width, svgBoundingBox.height); //Math.hypot(window.innerHeight,window.innerWidth)/2**.5;
        let difference = svgBoundingBox.width < svgBoundingBox.height ? svgBoundingBox.width: svgBoundingBox.height;
        let offset = new vec2(-(difference - svgBoundingBox.width) / 2, -(difference - svgBoundingBox.height) / 2);
        return {
            scale,
            offset
        }
    }

    initEventListeners(){
        this.container.addEventListener("mousedown", this.onMouseDown.bind(this), false);
        this.container.addEventListener("mousemove",  this.onMouseMove.bind(this), false);
        this.container.addEventListener("mouseup",  this.onMouseUp.bind(this), false);
        this.container.addEventListener("mouseleave",  this.onMouseLeave.bind(this), false);
        this.svg.addEventListener("contextmenu", e => e.preventDefault());

    }

    attachBackgroundColorInput(){
        this.backgroundColorPicker.addEventListener("input", this.onBackgroundColorChange.bind(this), false);
        this.backgroundColorPicker.dispatchEvent(new Event("input"));
    }
    onBackgroundColorChange(){
        this.container.style.backgroundColor = this.backgroundColorPicker.value;
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

    drawSelectionRectangle(point1, point2) {
        // Calculate rectangle coordinates in SVG space
        const svgPoint1 = this.toSVG(point1);
        const svgPoint2 = this.toSVG(point2);

        const x = Math.min(svgPoint1.x, svgPoint2.x);
        const y = Math.min(svgPoint1.y, svgPoint2.y);
        const width = Math.abs(svgPoint1.x - svgPoint2.x);
        const height = Math.abs(svgPoint1.y - svgPoint2.y);


        if(this.diagram.diagram !== null) console.log("x:", x, "y:", y)
        // if(this.diagram.diagram !== null) console.log("p1:", point1, "p2:", point2, "x:", x, "y:", y, "width:", width, "height:", height)
        // Create and style the rectangle (same as before)
        const svgns = "http://www.w3.org/2000/svg";
        const rect = document.createElementNS(svgns, "rect");
        rect.setAttribute("x", x);
        rect.setAttribute("y", y);
        rect.setAttribute("width", width);
        rect.setAttribute("height", height);
        rect.setAttribute("stroke", "white");
        rect.setAttribute("stroke-dasharray", "3,2");
        rect.setAttribute("fill", "rgba(255, 255, 255, 0.1)");
        rect.setAttribute("stroke-width", "1");
        rect.setAttribute("vector-effect", "non-scaling-stroke")
        rect.id = this.diagram.uuid + "-selection";
        this.clearSelectionRectangle();
        this.selectionRectangle = rect;

        // Append to the svg_bg element
        this.svg.appendChild(this.selectionRectangle);
    }
    clearSelectionRectangle(){
        if(this.selectionRectangle) {
            this.selectionRectangle.remove()
        }
    }
}
