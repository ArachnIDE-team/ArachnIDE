import CONFIGURATION from './fileDeclarationUsages.json'

class FileDeclarationUsages extends ToolNode {
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
        // console.log("Connection changed. Populate dropdown: ",inputNodes.length === 1 && (inputNodes[0] instanceof JavascriptFrontendModuleNode) )
        let fillDropdown = function () {
            this.fileDropdown.innerHTML = "";
            let options = []
            for (let filePath of  inputNodes[0].sources.files) {
                options.push()
            }
            inputNodes[0].sources.files.forEach((option, index) => {
                this.fileDropdown.add(new Option(option, option, false, index === 0), index);
            });
        }.bind(this);
        if(inputNodes.length === 1 && (inputNodes[0] instanceof JavascriptFrontendModuleNode)) {
            if(inputNodes[0].initialized) {
                fillDropdown();
            } else {
                inputNodes[0].addAfterInitCallback(fillDropdown)
            }
        }else {
            this.fileDropdown.innerHTML = "";
        }
    }

    _addCustomInterface(){
        this.fileDropdown = document.createElement("select");
        this.fileDropdown.classList.add('inline-container');
        this.fileDropdown.style.backgroundColor = "#222226";
        this.fileDropdown.style.border = "none";
        this.innerContent.append(this.fileDropdown)
    }

    getScopeUsage(scopeFile, otherFiles){
        let scopeCode = parseJs(scopeFile);
        let functionDeclarations = jsParser.language.query(`
                (program
                  (function_declaration
                    name: (identifier) @function-name))
              `).matches(scopeCode).map((match) => match.captures[0].node.text);
        let variableDeclarations = jsParser.language.query(`
                (program
                  (variable_declaration
                    (variable_declarator
                      name: (identifier) @variable-name)))
              `).matches(scopeCode).map((match) => match.captures[0].node.text);

        // console.log("Searching for function: ", functionDeclarations, " and variables", variableDeclarations, "in " + otherFiles.length + " files");
        let usages = {};
        let functions = {};
        let variables = {};
        // Iterate through each file in otherFiles
        for (let fileName in otherFiles) {
            let fileCode = otherFiles[fileName]
            let ast = parseJs(fileCode);

            // Querying variable and function usages in the current file
            let variableUsages = jsParser.language.query(`
                      (identifier) @variable-usage
                    `).matches(ast).map((match) => match.captures[0].node.text);

            let functionUsages = jsParser.language.query(`
                      (call_expression
                        function: (identifier) @function-usage)
                    `).matches(ast).map((match) => match.captures[0].node.text);

            //console.log("File:", fileCode);

            // Check if variable usages match variable declarations
            for (let usage of variableUsages) {
                if (variableDeclarations.includes(usage)) {
                    if(!usages.hasOwnProperty(fileName)) usages[fileName] = {}
                    if(!usages[fileName].hasOwnProperty("variables")) usages[fileName].variables = {};
                    if(!usages[fileName].variables.hasOwnProperty(usage)) usages[fileName].variables[usage] = 0;
                    usages[fileName].variables[usage]++;
                    if(!variables.hasOwnProperty(usage)) variables[usage] = {}
                    if(!variables[usage].hasOwnProperty(fileName)) variables[usage][fileName] = 0;
                    variables[usage][fileName]++;
                    // console.log("Variable Usage:", usage, " in file:", fileName);
                }
            }

            // Check if function usages match function declarations
            for (let usage of functionUsages) {
                if (functionDeclarations.includes(usage)) {
                    if(!usages.hasOwnProperty(fileName)) usages[fileName] = {}
                    if(!usages[fileName].hasOwnProperty("functions")) usages[fileName].functions = {};
                    if(!usages[fileName].functions.hasOwnProperty(usage)) usages[fileName].functions[usage] = 0;
                    usages[fileName].functions[usage]++;
                    if(!functions.hasOwnProperty(usage)) functions[usage] = {}
                    if(!functions[usage].hasOwnProperty(fileName)) functions[usage][fileName] = 0;
                    functions[usage][fileName]++;
                    // console.log("Function Usage:", usage, " in file:", fileName);
                }
            }
        }
        return {files: usages, variables, functions};
    }

    async getFilesContent(fileList) {

        let fileObject = {};
        for(let fileName of fileList){
            fileObject[fileName] =  (await FileManagerAPI.loadFile(fileName)).content
        }
        return fileObject
    }
    perform() {
        let inputNodes = this.getInputNodes();
        if(inputNodes.length === 0) return this.error("Connect a node", "This tool takes one input node.\nPlease connect it to a JavascriptFrontendModule node.")
        if(inputNodes.length > 1) return this.error("Too many input nodes", "This tool takes only one input node")
        if(!(inputNodes[0] instanceof JavascriptFrontendModuleNode)) return this.error("Wrong input node type", "This tool takes only one input node of type JavascriptFrontendModule.")
        console.log(this.fileDropdown.value)
        let selectedFile = this.fileDropdown.value;
        this.getFilesContent(inputNodes[0].sources.files).then((fileObject) => {
            // console.log(fileObject)
            let selectedCode = fileObject[selectedFile];
            delete fileObject[selectedFile];
            let fileScopeUsage = this.getScopeUsage(selectedCode, fileObject);
            let selectedFileNode = createJavascriptNode(selectedFile, selectedCode);
            let distance = selectedFileNode.pos.minus(this.pos).scale(2);
            selectedFileNode.pos = selectedFileNode.pos.minus(distance)
            connectDistance(selectedFileNode, this)
            // for(let fileName of Object.keys(fileScopeUsage.files)) {
            let usageFiles = Array.from(Object.keys(fileScopeUsage.files));
            usageFiles.forEach((fileName, index) => {
                let otherFileNode = createJavascriptNode(fileName, fileObject[fileName]);
                connectDistance(selectedFileNode, otherFileNode)
                let circularDisplacement = new vec2(2 * Math.cos(2 * Math.PI * (index/usageFiles.length)), 2 * Math.sin(2 * Math.PI * (index/usageFiles.length)))
                distance = otherFileNode.pos.minus(this.pos).scale(2).minus(circularDisplacement);
                otherFileNode.pos = otherFileNode.pos.minus(distance)
            });
            console.log(fileScopeUsage)
        })

    }
}

export default FileDeclarationUsages;