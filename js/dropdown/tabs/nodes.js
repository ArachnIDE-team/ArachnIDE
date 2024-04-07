
class NodesTab {
    constructor() {
        this.nodeTreeContainerId = "node-tree-container";
        this.nodeTreeContainer = document.getElementById(this.nodeTreeContainerId);
        this.constructionContainer = document.createElement("div");
        this.constructionContainer.className = "code"
        document.addEventListener('DOMContentLoaded', this.getTopLevelNodeClassDeclarations.bind(this));
    }

    getTopLevelClassDeclarations(scopeFile){
        let scopeCode = parseJs(scopeFile);
        let classDeclarations = jsParser.language.query(`
               (program
                    (class_declaration
                    name: (identifier) @class-name))
              `).matches(scopeCode).map((match) => match.captures[0].node.text);


        return classDeclarations;
    }

    async getFilesContent(fileList) {

        let fileObject = {};
        for(let fileName of fileList){
            fileObject[fileName] =  (await FileManagerAPI.loadFile(fileName)).content
        }
        return fileObject
    }

    getTopLevelNodeClassDeclarations() {

        let getFSTree = async function(dir, includes, excludes){
            let fsTree = await FileManagerAPI.getFSTreeGLOB(dir, includes, excludes);
            let root = Object.keys(fsTree)[0]
            fsTree = fsTree[root]
            return {fsTree, root};
        }


        let getFilesFromFSTree = function(fsTree, dir, relative=""){
            let basePath = path.join(dir, relative);
            if(typeof fsTree === "string") return [basePath]
            let array = []
            for(let dirOrFile of Object.keys(fsTree)){
                array.push(...getFilesFromFSTree(fsTree[dirOrFile], path.join(relative, dir, dirOrFile)))
            }
            return array;
        }

        getFSTree("H:/projects/ChrysalIDE/js",["**/**.js"],[] ).then((chrysalIDEJSSourceTree) => {
            let fileList = getFilesFromFSTree(chrysalIDEJSSourceTree.fsTree, "H:/projects/ChrysalIDE/js")
            this.getFilesContent(fileList).then((fileObject) => {
                let classDeclarations = [];

                // console.log(fileObject)
                for (let fileName of Object.keys(fileObject)) {
                    let topLevelClassDeclartions = this.getTopLevelClassDeclarations(fileObject[fileName]);
                    classDeclarations.push(...topLevelClassDeclartions)
                    // console.log("Scanning: ", fileName, "Found: ", topLevelClassDeclartions)
                }
                // console.log(classDeclarations)
                let classDeclarationHierarchy = [];
                for (let declaration of classDeclarations) {
                    try {
                        let hierarchy = []
                        let clazz = eval(declaration);
                        let proto = clazz.prototype;
                        while (proto.constructor.name !== 'Object') {
                            // declaration = declaration + " > " + proto.constructor.name;
                            hierarchy.push(proto.constructor.name)
                            proto = proto.__proto__;
                        }
                        if (hierarchy.includes("Node")) classDeclarationHierarchy.push(hierarchy.reverse())
                    } catch (e) {
                        // pass, no problem
                    }
                }
                let classMap = {Node: {}};
                for (let hierarchy of classDeclarationHierarchy) {
                    let cursor = classMap;
                    hierarchy.forEach((clazz, i) => {
                        if (!cursor.hasOwnProperty(clazz)) cursor[clazz] = {};
                        cursor = cursor[clazz]
                    })
                }
                // console.log(classMap)

                this.updateTreeContainer(classMap);
                // let moduleNode = new ModuleNode({
                //     name: "ChrysalIDE Class Declarations",
                //     fsTree: {fsTree: classMap, root: ""}
                // });
            });
        })
    }

    updateTreeContainer(classMap){
        this.moduleNode = new ModulePanel({name: "ChrysalIDE Class Declarations"})
        this.nodeTreeContainer.append(this.moduleNode.container)
        this.moduleNode.reloadModule(() => {
            let length = Object.keys(dropdown.nodesTab.moduleNode.content.fileSystemTree.content.liElementsById).length
            this.moduleNode.content.headerContainer.innerText = "Available nodes: (" + length + ")"
            this.moduleNode.content.moduleContainer.querySelector(".metadata-container").remove();
            this.moduleNode.content.moduleContainer.append(this.constructionContainer);
            this.moduleNode.content.footerContainer.remove();
            this.moduleNode.content.fileSystemTree.addValueListener(this.onNodeSelectionChange.bind(this))
            this.setMaxSize(280,510)
        }, {fsTree: classMap, root: ""}, {selectFolders: true});
    }

    onNodeSelectionChange(selection) {
        if(selection[0]){
            let classNames = selection[0].split("/");
            let trueClassName = classNames[classNames.length - 1];
            let trueClass = eval(trueClassName);
            console.log("Selected class: ", trueClass)
            let configuration = {...trueClass.DEFAULT_CONFIGURATION};
            if(classNames.length === 1 && classNames[0] === "Node") configuration.diagram = "window.rootDiagram"
            this.constructionContainer.innerText = JSON.stringify(configuration, null, 2);
        }else{
            this.constructionContainer.innerText = "";
        }
    }

    setMaxSize(maxWidth, maxHeight) {
        this.moduleNode.content.moduleContainer.style.maxWidth = maxWidth + "px";
        this.moduleNode.content.moduleContainer.style.maxHeight = maxHeight + "px";
    }

}
