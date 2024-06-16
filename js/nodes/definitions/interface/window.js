
class WindowedUI extends WindowedNode {
    static DEFAULT_CONFIGURATION = {
        title: "",
        content: undefined,
        scaleProportions: undefined,
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
        this._initializeUI(configuration.scaleProportions)
    }

    _initializeUI(scaleProportions){
        this.anchorForce = 1;
        this.toggleWindowAnchored(true);
        // this.windowDiv.style.maxWidth = window.innerWidth * scaleProportions.x + "px";
        // this.windowDiv.style.width = window.innerWidth * scaleProportions.x + "px";
        // this.windowDiv.style.maxHeight = window.innerHeight * scaleProportions.y + "px";
        // this.windowDiv.style.height = window.innerHeight * scaleProportions.y + "px";
        this.setMinSize(420)
        this.windowDiv.classList.add("window-ui")
        this.afterInit();
    }
    // TO-DO: disable panning while WindowedUI is open. Also avoid moving out of screen
    // draw() {
    //     if(this.pos.x < 0) this.pos.x = 0;
    //     if(this.pos.y < 0) this.pos.y = 0;
    //     super.draw();
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
