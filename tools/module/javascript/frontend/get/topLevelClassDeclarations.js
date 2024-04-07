import CONFIGURATION from './TopLevelClassDeclarations.json'

class TopLevelClassDeclarations extends ToolNode {
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

        let fileObject = {};
        for(let fileName of fileList){
            fileObject[fileName] =  (await FileManagerAPI.loadFile(fileName)).content
        }
        return fileObject
    }

    getTopLevelClassDeclartions(scopeFile){
        let scopeCode = parseJs(scopeFile);
        let classDeclarations = jsParser.language.query(`
               (program
                    (class_declaration
                    name: (identifier) @class-name))
              `).matches(scopeCode).map((match) => match.captures[0].node.text);


        return classDeclarations;
    }

    perform() {
        let inputNodes = this.getInputNodes();
        if(inputNodes.length === 0) return this.error("Connect a node", "This tool takes one input node.\nPlease connect it to a JavascriptFrontendModule node.")
        if(inputNodes.length > 1) return this.error("Too many input nodes", "This tool takes only one input node")
        if(!(inputNodes[0] instanceof JavascriptFrontendModuleNode)) return this.error("Wrong input node type", "This tool takes only one input node of type JavascriptFrontendModule.")
        this.getFilesContent(inputNodes[0].sources.files).then((fileObject) => {
            let classDeclarations = [];

            // console.log(fileObject)
            for (let fileName of Object.keys(fileObject)) {
                let topLevelClassDeclartions = this.getTopLevelClassDeclartions(fileObject[fileName]);
                classDeclarations.push(...topLevelClassDeclartions)
                console.log("Scanning: ", fileName, "Found: ", topLevelClassDeclartions)
            }
            console.log(classDeclarations)

        })
    }
}

export default TopLevelClassDeclarations;