

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

    static OBSERVERS = {}

    // constructor(name = '', content = undefined, text = '', sx = undefined, sy = undefined, x = undefined, y = undefined, addCodeButton = false){

    constructor(configuration = NodeJSModuleNode.DEFAULT_CONFIGURATION) {
        configuration = {...NodeJSModuleNode.DEFAULT_CONFIGURATION, ...configuration}
        configuration.sources = {...NodeJSModuleNode.DEFAULT_CONFIGURATION.sources, ...configuration.sources}
        super(configuration);
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
