class NodePanel {
    constructor() {
        this.container = document.getElementById("nodePanel");
        this.favouriteNodesContainer = this.container.querySelector(".icon-row");
        this.otherNodesContainer = this.container.querySelector(".toggle-panel-inner-container");
        this.nodeIconTemplate = this.container.querySelector(".icon-content.hidden");
        // .toggle-panel-inner-container

        document.addEventListener('DOMContentLoaded', this.getTopLevelNodeClassDeclarations.bind(this));
    }


    onMenuButtonClick(event) {
        this.container.classList.toggle("open");
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

        let arachnIDESourceDirectory = "H:/projects/ArachnIDE/js";
        getFSTree(arachnIDESourceDirectory,["**/**.js"],[] ).then((arachnIDEJSSourceTree) => {
            let fileList = getFilesFromFSTree(arachnIDEJSSourceTree.fsTree, arachnIDESourceDirectory)
            this.getFilesContent(fileList).then((fileObject) => {
                let classDeclarations = [];

                // console.log(fileObject)
                for (let fileName of Object.keys(fileObject)) {
                    let topLevelClassDeclartions = this.getTopLevelClassDeclarations(fileObject[fileName]);
                    classDeclarations.push(...topLevelClassDeclartions)
                    // console.log("Scanning: ", fileName, "Found: ", topLevelClassDeclartions)
                }
                // console.log(classDeclarations)
                let nodeExtendingClasses = [];
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
                        if (hierarchy.includes("Node")) nodeExtendingClasses.push(clazz)
                    } catch (e) {
                        // pass, no problem
                    }
                }
                // console.log("NODE PANEL LOADED: ", nodeExtendingClasses)

                this.addNodeIconsToPanel(nodeExtendingClasses);

            });
        })
    }

    addNodeIconsToPanel(nodeExtendingClasses){
        for(let nodeClass of nodeExtendingClasses) {
            if(!nodeClass.INTERFACE_CONFIGURATION) {
                console.error("Node Class: ", nodeClass.name, "has no interface configuration")
                continue;
            }
            if(nodeClass.INTERFACE_CONFIGURATION.insertable){
                // console.log("Adding: ", nodeClass.INTERFACE_CONFIGURATION);
                let icon = this.nodeIconTemplate.cloneNode(true)
                let panel = icon.querySelector(".panel-icon");
                panel.setAttribute("title", nodeClass.INTERFACE_CONFIGURATION.name)

                let svg = icon.querySelector("svg");
                svg.innerHTML = ""
                const svgns = "http://www.w3.org/2000/svg";
                var  xlinkns = "http://www.w3.org/1999/xlink";
                let use = document.createElementNS(svgns, "use")
                use.setAttributeNS(xlinkns, "href", "#" + nodeClass.INTERFACE_CONFIGURATION.iconID);

                svg.append(use);
                icon.classList.remove("hidden")
                if(nodeClass.ondrop) icon.setAttribute("data-ondrop", nodeClass.name + ".ondrop")
                // if(nodeClass.INTERFACE_CONFIGURATION.defaultFavourite > 0){
                //     this.favouriteNodesContainer.append(icon)
                // } else{
                this.otherNodesContainer.append(icon)
                if(this.otherNodesContainer.querySelectorAll(".icon-content").length % 5 === 0){
                    let lineBreak = document.createElement("div");
                    lineBreak.style.width = "100%";
                    this.otherNodesContainer.append(lineBreak)
                }
                // }
                // height: auto;margin-top: 15px;
            }
        }
        const icons = document.querySelectorAll('.panel-icon.add-node-icon');
        icons.forEach(icon => {
            makeIconDraggable(icon); // from handledrop.js
        });

    }
}