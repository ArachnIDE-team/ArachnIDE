

globalThis.nodeClasses = [TextNode, JavascriptNode, JSONNode, MarkdownNode, PythonNode, HTMLEditorNode, CSSNode,
    LinkNode, LLMNode, ImageNode, AudioNode, VideoNode, WolframNode, WorkspaceExplorerNode, WebEditorNode, MetaNode,
    ProjectNode, ModuleNode, JavascriptFrontendModuleNode]

globalThis.textNodeClasses = [TextNode, JavascriptNode, JSONNode, MarkdownNode, PythonNode, HTMLEditorNode, CSSNode];

function restoreNode(saveData) {
    let classIndex = globalThis.nodeClasses.map((classObject) => classObject.name).indexOf(saveData.json.type);
    if(classIndex === -1){
        return new WindowedNode({title: saveData.title, scale: true, saved: true, saveData: saveData});
    }else{
        return new globalThis.nodeClasses[classIndex]({...globalThis.nodeClasses[classIndex].DEFAULT_CONFIGURATION, name: saveData.title, saved: true, saveData: saveData});
        // return new globalThis.nodeClasses[classIndex]({name: saveData.title, content: content, ...saveData});
    }
}
