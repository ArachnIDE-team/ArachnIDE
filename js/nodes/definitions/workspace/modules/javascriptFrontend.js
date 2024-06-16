

class JavascriptFrontendModuleNode extends ModuleNode {
    static DEFAULT_CONFIGURATION = {
        name: "",
        sources: {
            files : [],
            dir: "",
            includes: ["**/**.js", "**/**.html"],
            excludes: [],
        },
        saved: undefined,
        saveData: undefined,
    }

    static SAVE_PROPERTIES = [];

    static OBSERVERS = {};

    static INTERFACE_CONFIGURATION = {
        insertable: true,
        iconID: "js-icon-symbol",
        name: "JS Frontend Module Node",
        defaultFavourite: -1
    }
    // constructor(name = '', content = undefined, text = '', sx = undefined, sy = undefined, x = undefined, y = undefined, addCodeButton = false){

    constructor(configuration = JavascriptFrontendModuleNode.DEFAULT_CONFIGURATION) {
        configuration = {...JavascriptFrontendModuleNode.DEFAULT_CONFIGURATION, ...configuration}
        configuration.sources = {...JavascriptFrontendModuleNode.DEFAULT_CONFIGURATION.sources, ...configuration.sources}
        super(configuration);
    }

    static ondrop() {
        let node = createJavascriptFrontendModuleNode();
        node.followingMouse = 1;
        node.draw();
        // Set the dragging point on the header bar
        node.mouseAnchor = node.diagram.background.toDZ(new vec2(0, -node.content.offsetHeight / 2 + 6));
        console.log('Handle drop for the JS Frontend Module icon');

        return node;
    }
}


function createJavascriptFrontendModuleNode(name, files, dir, includes, excludes) {
    return new JavascriptFrontendModuleNode({name, sources: {files, dir, includes, excludes}})
}
