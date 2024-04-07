import CONFIGURATION from './mergedCode.json'

class MergedCode extends ToolNode {
    constructor() {
        super(CONFIGURATION);
    }

    onConnect(edge) {
        super.onConnect(edge);
        this.onConnectionChanged();
    }
    onDisconnect(index) {
        super.onDisconnect(index);
        this.onConnectionChanged();
    }

    onConnectionChanged(){
        let inputNodes = this.getInputNodes();
        if(inputNodes.length === 1 && (inputNodes[0] instanceof JavascriptFrontendModuleNode)) {
            this.performButton.removeAttribute("disabled");
        }else {
            this.performButton.setAttribute("disabled","true");
        }
    }

    async getFilesContent(fileList) {

        let contentList = [];
        for(let fileName of fileList){
            if(fileName.endsWith(".js")) contentList.push((await FileManagerAPI.loadFile(fileName)).content)
        }
        return contentList
    }
    perform() {
        let inputNodes = this.getInputNodes();
        if(inputNodes.length === 0) return this.error("Connect a node", "This tool takes one input node.\nPlease connect it to a JavascriptFrontendModule node.")
        if(inputNodes.length > 1) return this.error("Too many input nodes", "This tool takes only one input node")
        if(!(inputNodes[0] instanceof JavascriptFrontendModuleNode)) return this.error("Wrong input node type", "This tool takes only one input node of type JavascriptFrontendModule.")
        this.getFilesContent(inputNodes[0].sources.files).then((fileObject) => {
            createJavascriptNode(inputNodes[0].name + " Merged Code", fileObject.join("\n"))
        })

    }
}

export default MergedCode;