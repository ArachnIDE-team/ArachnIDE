

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

    static OBSERVERS = {}

    // constructor(name = '', content = undefined, text = '', sx = undefined, sy = undefined, x = undefined, y = undefined, addCodeButton = false){

    constructor(configuration = JavascriptFrontendModuleNode.DEFAULT_CONFIGURATION) {
        configuration = {...JavascriptFrontendModuleNode.DEFAULT_CONFIGURATION, ...configuration}
        configuration.sources = {...JavascriptFrontendModuleNode.DEFAULT_CONFIGURATION.sources, ...configuration.sources}
        super(configuration);
    }

}


function createJavascriptFrontendModuleNode(name, files, dir, includes, excludes) {
    return new JavascriptFrontendModuleNode({name, sources: {files, dir, includes, excludes}})
}
