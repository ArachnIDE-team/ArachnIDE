

class NodeJSModuleNode extends ModuleNode {
    static DEFAULT_CONFIGURATION = {
        name: "",
        sources: {
            files : [],
            dir: "",
            includes: ["**/**.js", "**/package.json"],
            excludes: [],
        },
        saved: undefined,
        saveData: undefined,
    }

    static SAVE_PROPERTIES = [];

    static OBSERVERS = {};

    static INTERFACE_CONFIGURATION = {
        insertable: true,
        iconID: "nodejs-icon-symbol",
        name: "NodeJS Module Node",
        defaultFavourite: -1
    }

    // constructor(name = '', content = undefined, text = '', sx = undefined, sy = undefined, x = undefined, y = undefined, addCodeButton = false){

    constructor(configuration = NodeJSModuleNode.DEFAULT_CONFIGURATION) {
        configuration = {...NodeJSModuleNode.DEFAULT_CONFIGURATION, ...configuration}
        configuration.sources = {...NodeJSModuleNode.DEFAULT_CONFIGURATION.sources, ...configuration.sources}
        configuration.sources.files =  configuration.sources.files?.length > 0 ? configuration.sources.files : NodeJSModuleNode.DEFAULT_CONFIGURATION.sources.files;
        configuration.sources.dir =  configuration.sources.dir?.length > 0 ? configuration.sources.dir : NodeJSModuleNode.DEFAULT_CONFIGURATION.sources.dir;
        configuration.sources.includes =  configuration.sources.includes?.length > 0 ? configuration.sources.includes : NodeJSModuleNode.DEFAULT_CONFIGURATION.sources.includes;
        configuration.sources.excludes =  configuration.sources.excludes?.length > 0 ? configuration.sources.excludes : NodeJSModuleNode.DEFAULT_CONFIGURATION.sources.excludes;
        super(configuration);
    }


    static ondrop() {
        new FilePicker({
            title: "Choose the module root folder for NodeJS Module",
            text: ModuleNodeHTML.getMetadataGLOGText(NodeJSModuleNode.DEFAULT_CONFIGURATION.sources.includes,
                NodeJSModuleNode.DEFAULT_CONFIGURATION.sources.excludes, NodeJSModuleNode.name),
            home: "",
            multiple: false,
            selectFiles: false,
            selectFolders: true,
            onSelect: (folder) => {
                if(folder.length !== 1) return
                let node = createNodeJSModuleNode("NodeJS Module", undefined, folder[0]);
                node.followingMouse = 1;
                node.draw();
                // Set the dragging point on the header bar
                node.mouseAnchor = node.diagram.background.toDZ(new vec2(0, -node.content.offsetHeight / 2 + 6));
                console.log('Handle drop for the NodeJS module icon');
            }
        });
    }
}


function createNodeJSModuleNode(name, files, dir, includes, excludes) {
    return new NodeJSModuleNode({name, sources: {
            files: files ? files : NodeJSModuleNode.DEFAULT_CONFIGURATION.sources.files,
            dir: dir ? dir : NodeJSModuleNode.DEFAULT_CONFIGURATION.sources.dir,
            includes : includes ? includes : NodeJSModuleNode.DEFAULT_CONFIGURATION.sources.includes,
            excludes: excludes ? excludes : NodeJSModuleNode.DEFAULT_CONFIGURATION.sources.excludes,
        }
    })
}
