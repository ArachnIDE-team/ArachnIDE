

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
        configuration.sources.files =  configuration.sources.files?.length > 0 ? configuration.sources.files : JavascriptFrontendModuleNode.DEFAULT_CONFIGURATION.sources.files;
        configuration.sources.dir =  configuration.sources.dir?.length > 0 ? configuration.sources.dir : JavascriptFrontendModuleNode.DEFAULT_CONFIGURATION.sources.dir;
        configuration.sources.includes =  configuration.sources.includes?.length > 0 ? configuration.sources.includes : JavascriptFrontendModuleNode.DEFAULT_CONFIGURATION.sources.includes;
        configuration.sources.excludes =  configuration.sources.excludes?.length > 0 ? configuration.sources.excludes : JavascriptFrontendModuleNode.DEFAULT_CONFIGURATION.sources.excludes;
        super(configuration);
    }

    static ondrop() {

        new FilePicker({
            title: "Choose the module root folder for Javascript Frontend Module",
            text: ModuleNodeHTML.getMetadataGLOGText(JavascriptFrontendModuleNode.DEFAULT_CONFIGURATION.sources.includes,
                    JavascriptFrontendModuleNode.DEFAULT_CONFIGURATION.sources.excludes, JavascriptFrontendModuleNode.name),
            home: "",
            multiple: false,
            selectFiles: false,
            selectFolders: true,
            onSelect: (folder) => {
                if(folder.length !== 1) return
                let node = createJavascriptFrontendModuleNode("Javascript Frontend Module", undefined, folder[0]);
                node.followingMouse = 1;
                node.draw();
                // Set the dragging point on the header bar
                node.mouseAnchor = node.diagram.background.toDZ(new vec2(0, -node.content.offsetHeight / 2 + 6));
                console.log('Handle drop for the JS Frontend Module icon');
            }
        });
    }
}


function createJavascriptFrontendModuleNode(name, files, dir, includes, excludes) {
    return new JavascriptFrontendModuleNode({name, sources: {files, dir, includes, excludes}})
}
