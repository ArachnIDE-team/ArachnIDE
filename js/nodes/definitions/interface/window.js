
class WindowedUI extends WindowedNode {
    static DEFAULT_CONFIGURATION = {
        title: "",
        content: undefined
    }

    static INTERFACE_CONFIGURATION = {
        insertable: false,
        iconID: null,
        name: "User Interface window Node",
        defaultFavourite: -1
    }
    // constructor(title, content, scaleProportions) {
    constructor(configuration = WindowedUI.DEFAULT_CONFIGURATION) {
        configuration = {...WindowedUI.DEFAULT_CONFIGURATION, ...configuration};
        super({title: configuration.title, content: [configuration.content], pos: rootDiagram.background.pan, scale: (rootDiagram.background.zoom.mag2() ** settings.zoomContentExp), intrinsicScale: 1, addFullScreenButton: false, addCollapseButton: false, addSettingsButton: false, addFileButton: false});
        this.diagram.addNode(this);
        // WindowedNode.makeContentScrollable(this.innerContent, true)
        this._initializeUI()
    }

    _initializeUI(){
        this.anchorForce = 1;
        this.toggleWindowAnchored(true);
        this.setMinSize(420);
        this.windowDiv.classList.add("window-ui");
        this.afterInit();
    }

    draw() {
        let size = rootDiagram.background.toS(new vec2(this.width * this.scale / 2, this.height * this.scale / 2));// Complex plane size value
        let topLeft = rootDiagram.background.fromZ(this.pos.minus(size))// pixel plane topLeft coordinates
        let botRight = rootDiagram.background.fromZ(this.pos.plus(size))// pixel plane botRight coordinates
        let bb = rootDiagram.background.getBoundingBox();

        // First check we are not out of scale
        if(botRight.x - topLeft.x > bb.width) {
            this.width += (bb.width - (botRight.x - topLeft.x)) / this.scale;
        }
        if(botRight.y - topLeft.y > bb.height) {
            this.height += (bb.height - (botRight.y - topLeft.y)) / this.scale;
        }
        // Then check we are not out of bounds
        if(topLeft.x < bb.x) {
            topLeft.x = bb.x
            this.pos = rootDiagram.background.toZ(topLeft).plus(size)
            botRight = rootDiagram.background.fromZ(this.pos.plus(size))
        }
        if(topLeft.y < bb.y) {
            topLeft.y = bb.y
            this.pos = rootDiagram.background.toZ(topLeft).plus(size)
            botRight = rootDiagram.background.fromZ(this.pos.plus(size))
        }
        if(botRight.x > bb.x + bb.width) {
            botRight.x = bb.x + bb.width
            this.pos = rootDiagram.background.toZ(botRight).minus(size)
        }
        if(botRight.y > bb.y + bb.height) {
            botRight.y = bb.y + bb.height
            this.pos = rootDiagram.background.toZ(botRight).minus(size)
        }
        super.draw();
    }

    // step(dt) {
    //     if (dt === undefined || isNaN(dt)) {
    //         dt = 0;
    //     } else {
    //         if (dt > 1) {
    //             dt = 1;
    //         }
    //     }
    //     if (this.followingMouse) {
    //         let p = this.diagram.background.toZ(this.diagram.background.mousePos).minus(this.mouseAnchor);
    //         this.vel = p.minus(this.pos).unscale(nodeMode ? 1 : dt);
    //         this.pos = p;
    //         this.anchor = this.pos;
    //
    //     }
    //     this.draw();
    // }


    afterInit(){
        this.recenter();
        super.afterInit();
    }

    recenter() {
        this.anchor = this.diagram.background.pan;
        this.pos = this.diagram.background.pan;
    }

    save() {
        return null;
    }
}
