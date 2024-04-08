

class ModuleNodeHTML {
    static DEFAULT_CONFIGURATION = {
        name: "",
        sources: {
            files : [],
            dir: "",
            includes: [],
            excludes: [],
        },
        fsTree: {
            selection: true,
            multiple: false,
            selectFiles: true,
            selectFolders: false
        }
    }

    constructor(configuration = ModuleNodeHTML.DEFAULT_CONFIGURATION) {
        configuration = {...ModuleNodeHTML.DEFAULT_CONFIGURATION, ...configuration}
        this.sources = {...ModuleNodeHTML.DEFAULT_CONFIGURATION.sources, ...configuration.sources}
        this.moduleType = "";
        this.index = generateUUID();
        // Create the section container
        this.container = document.createElement('div')
        this.container.className = 'header-content-footer';
        // Create a div element to show the root directory name
        this.headerContainer = document.createElement('div');
        this.headerContainer.className = "content-sticky-header"
        // Create a div element to host the filesystem tree
        this.moduleContainer = document.createElement('div');
        this.moduleContainer.id = `moduleContainer-${this.index}`;
        this.moduleContainer.style.height = "100%";
        // Creates a div element for the footer
        this.footerContainer = document.createElement('div');
        this.footerContainer.className = "content-sticky-footer"
        this.container.append(this.headerContainer,  this.moduleContainer, this.footerContainer)

        let footerContainerLeftContainer = document.createElement("div");
        footerContainerLeftContainer.className = "footer-left-container";
        let footerContainerRightContainer = document.createElement("div");
        footerContainerRightContainer.className = "footer-right-container";

        let saveFileSelectionButton = document.createElement("button");
        saveFileSelectionButton.innerText = "→ SAVE";
        saveFileSelectionButton.className = "footer-button";
        saveFileSelectionButton.disabled = true;
        // saveFileSelectionButton.onclick = this.onSaveFile.bind(this);
        let loadFileSelectionButton = document.createElement("button");
        loadFileSelectionButton.innerText = "LOAD →";
        loadFileSelectionButton.className = "footer-button";
        loadFileSelectionButton.disabled = true;
        // loadFileSelectionButton.onclick = this.onLoadFile.bind(this);/

        footerContainerLeftContainer.appendChild(saveFileSelectionButton);
        footerContainerRightContainer.appendChild(loadFileSelectionButton);
        this.footerContainer.appendChild(footerContainerLeftContainer);
        this.footerContainer.appendChild(footerContainerRightContainer);
        WindowedNode.makeContentScrollable(this.moduleContainer, true)

    }

    reloadModule(callback, forceFSTree=null, configuration=ModuleNodeHTML.DEFAULT_CONFIGURATION.fsTree) {
        configuration = {...ModuleNodeHTML.DEFAULT_CONFIGURATION.fsTree, ...configuration}
        const elementID = `moduleContainer-${this.index}`
        createModuleFSTree(elementID, this.sources.dir, this.sources.includes, this.sources.excludes, forceFSTree, configuration, () => {
        }).then((result) => {
            this.fileSystemTree = result.fileSystemTree;
            let fsTree = result.fsTree;
            this.sources.files = this.getFilesFromFSTree(fsTree);
            // console.log("Set source files for module: ", this, " Files: ",  this.sources.files )
            this.fileSystemTree.addValueListener((selected, newSelection) => {

            })
            this.afterReload(callback);
        })
    }

    afterReload(callback) {
        this.headerContainer.innerText = "Module " + this.sources.dir + " (" + this.sources.files.length + " files)";
        let metadataContainer = document.createElement("div");
        metadataContainer.className = "metadata-container"

        let metadataGLOGContainer = document.createElement("div");
        metadataGLOGContainer.innerText = "Includes:\n\t" + this.sources.includes.join("\n\t") + "\nExcludes:\n\t" +
            this.sources.excludes.join("\n\t") + "\nType: " + this.moduleType;
        metadataGLOGContainer.className = "code";


        let metadataButtonContainer = document.createElement("div");
        metadataButtonContainer.className = "metadata-button-container"
        let reloadButton = document.createElement("button")
        reloadButton.innerHTML = "RELOAD"
        reloadButton.className = "footer-button";

        reloadButton.onclick = this.reloadModule.bind(this)

        metadataButtonContainer.append(reloadButton)
        metadataContainer.append(metadataGLOGContainer, metadataButtonContainer)

        WindowedNode.makeContentScrollable(metadataContainer)
        this.moduleContainer.prepend(metadataContainer)
        if(typeof callback === 'function') callback();
    }

    getFilesFromFSTree(fsTree, relative=""){
        let basePath = path.join(this.sources.dir, relative);
        if(typeof fsTree === "string") return [basePath]
        let array = []
        for(let dirOrFile of Object.keys(fsTree)){
            array.push(...this.getFilesFromFSTree(fsTree[dirOrFile], path.join(relative, dirOrFile)))
        }
        return array;
    }

    setModuleType(moduleType){
        this.moduleType = moduleType;
    }
}

class ModulePanel extends HTMLNode {
    static DEFAULT_CONFIGURATION = {
        name: "",
        sources: {
            files : [],
            dir: "",
            includes: [],
            excludes: [],
        }
    }

    constructor(configuration = ModulePanel.DEFAULT_CONFIGURATION) {
        configuration = {...ModulePanel.DEFAULT_CONFIGURATION, ...configuration}
        configuration.sources = {...ModulePanel.DEFAULT_CONFIGURATION.sources, ...configuration.sources}
        let content = new ModuleNodeHTML(configuration);
        let container = content.container
        super({content, container})
    }

    get sources() {
        return this.content.sources;
    }

    set sources(v) {
        if(this.initialized){
            this.content.sources = v;
        } else {
            this.addAfterInitCallback(() => {
                this.content.sources = v;
            })
        }

    }
}

class ModuleNode extends WindowedNode {
    static DEFAULT_CONFIGURATION = {
        name: "",
        sources: {
            files : [],
            dir: "",
            includes: [],
            excludes: [],
        },
        fsTree: undefined,
        saved: undefined,
        saveData: undefined,
    }

    static SAVE_PROPERTIES = ['name', 'sources'];

    static OBSERVERS = {}

    // constructor(name = '', content = undefined, text = '', sx = undefined, sy = undefined, x = undefined, y = undefined, addCodeButton = false){

    constructor(configuration = ModuleNode.DEFAULT_CONFIGURATION) {
        configuration = {...ModuleNode.DEFAULT_CONFIGURATION, ...configuration}
        configuration.sources = {...ModuleNode.DEFAULT_CONFIGURATION.sources, ...configuration.sources}
        let content = ModuleNode._getContentElement(configuration);
        configuration.content = [content.container];
        if (!configuration.saved) {// Create ModuleNode
            super({...configuration, title: configuration.name, ...WindowedNode.getNaturalScaleParameters()});
            this.followingMouse = 1;
        } else {// Restore ModuleNode
            super({...configuration, title: configuration.name, scale: true});
        }
        this.diagram.addNode(this);
        this.moduleNode = content;
        this.moduleNode.setModuleType(this.constructor.name)
        this._initialize(configuration.name, configuration.sources, configuration.fsTree, configuration.saved)
    }

    get sources() {
        return this.moduleNode.sources;
    }

    set sources(v) {
        if(this.initialized){
            this.moduleNode.sources = v;
        } else {
            this.addAfterInitCallback(() => {
                this.moduleNode.sources = v;
            })
        }

    }

    static _getContentElement(configuration){
        // Create the section container
        return new ModulePanel(configuration);
    }

    _initialize(name, sources, fsTree, saved){
        this.anchorForce = 1;
        this.toggleWindowAnchored(true);

        this.draw();
        if(!saved){
            // this.sources = sources;
            this.name = name;
        }

        this.setMinSize(420)
        this.innerContent.style.width = "100%";
        this.innerContent.style.height = "100%";
        if(fsTree) {
            this.moduleNode.reloadModule(this.afterInit.bind(this), fsTree);
        }else{
            this.moduleNode.reloadModule(this.afterInit.bind(this));
        }

    }

    afterInit() {
        super.afterInit();
    }

}

// ModuleNode [WindowedNode] -> moduleNode [ModulePanel > HTMLNode] -> content [ModuleNodeHTML]
// Maybe:
// WindowedModuleDiagram [WindowedDiagram] -> moduleDiagram [ModuleDiagram ] -> content [ModuleDiagramHTML]

// class ModulePanel extends WindowedNode {
//     static DEFAULT_CONFIGURATION = {
//         name: "",
//         sources: {
//             files : [],
//             dir: "",
//             includes: [],
//             excludes: [],
//         },
//         saved: undefined,
//         saveData: undefined,
//     }
//
//     static SAVE_PROPERTIES = ['sources', 'index'];
//
//     static OBSERVERS = {}
//
//     // constructor(name = '', content = undefined, text = '', sx = undefined, sy = undefined, x = undefined, y = undefined, addCodeButton = false){
//
//     constructor(configuration = ModulePanel.DEFAULT_CONFIGURATION) {
//         configuration = {...ModulePanel.DEFAULT_CONFIGURATION, ...configuration}
//         configuration.sources = {...ModulePanel.DEFAULT_CONFIGURATION.sources, ...configuration.sources}
//         configuration.index = configuration.saved ? configuration.saveData.json.index : generateUUID();
//         configuration.content = ModulePanel._getContentElement(configuration.index);
//         if (!configuration.saved) {// Create ModulePanel
//             super({...configuration, title: configuration.name, ...WindowedNode.getNaturalScaleParameters()});
//             this.followingMouse = 1;
//         } else {// Restore ModulePanel
//             super({...configuration, title: configuration.name, scale: true});
//         }
//         this.diagram.addNode(this);
//         this._initialize(configuration.sources, configuration.index, configuration.saved)
//     }
//
//     static _getContentElement(index){
//         // Create the section container
//         let sectionContainer = document.createElement('div')
//         sectionContainer.className = 'header-content-footer';
//         // Create a div element to show the root directory name
//         const rootContainer = document.createElement('div');
//         rootContainer.className = "content-sticky-header"
//         // Create a div element to host the filesystem tree
//         const treeContainer = document.createElement('div');
//         treeContainer.id = `moduleContainer-${index}`;
//         // Creates a div element for the footer
//         const footerContainer = document.createElement('div');
//         footerContainer.className = "content-sticky-footer"
//         sectionContainer.append(rootContainer, treeContainer, footerContainer)
//         return [sectionContainer];
//     }
//
//     _initialize(sources, index, saved){
//         this.anchorForce = 1;
//         this.toggleWindowAnchored(true);
//
//         this.draw();
//         if(!saved){
//             this.sources = sources;
//             this.index = index;
//         }
//
//         this.setMinSize(420)
//         this.headerContainer =  this.innerContent.querySelector(".content-sticky-header");
//         this.footerContainer = this.innerContent.querySelector(".content-sticky-footer");
//
//         let footerContainerLeftContainer = document.createElement("div");
//         footerContainerLeftContainer.className = "footer-left-container";
//         let footerContainerRightContainer = document.createElement("div");
//         footerContainerRightContainer.className = "footer-right-container";
//
//         let saveFileSelectionButton = document.createElement("button");
//         saveFileSelectionButton.innerText = "→ SAVE";
//         saveFileSelectionButton.className = "footer-button";
//         saveFileSelectionButton.disabled = true;
//         // saveFileSelectionButton.onclick = this.onSaveFile.bind(this);
//         let loadFileSelectionButton = document.createElement("button");
//         loadFileSelectionButton.innerText = "LOAD →";
//         loadFileSelectionButton.className = "footer-button";
//         loadFileSelectionButton.disabled = true;
//         // loadFileSelectionButton.onclick = this.onLoadFile.bind(this);/
//
//         footerContainerLeftContainer.appendChild(saveFileSelectionButton);
//         footerContainerRightContainer.appendChild(loadFileSelectionButton);
//         this.footerContainer.appendChild(footerContainerLeftContainer);
//         this.footerContainer.appendChild(footerContainerRightContainer);
//
//
//         this.mouseAnchor = this.diagram.background.toDZ(new vec2(0, -this.content.offsetHeight / 2 + 6));
//         const elementID = `moduleContainer-${this.index}`
//         this.moduleContainer = document.getElementById(elementID);
//         WindowedNode.makeContentScrollable(this.moduleContainer, true)
//         this.moduleContainer.style.height = "100%";
//         this.innerContent.style.width = "100%";
//         this.innerContent.style.height = "100%";
//
//         this.reloadModule();
//     }
//
//     reloadModule() {
//         const elementID = `moduleContainer-${this.index}`
//         createModuleFSTree(elementID, this.sources.dir, this.sources.includes, this.sources.excludes, function makeTreeScrollable() {
//             for (let liElement of Object.values(this.liElementsById)) {
//                 WindowedNode.makeContentScrollable(liElement);
//                 let ulElement = liElement.querySelector("ul.treejs-nodes");
//                 if (ulElement) WindowedNode.makeContentScrollable(ulElement);
//             }
//         }).then((result) => {
//             this.fileSystemTree = result.fileSystemTree;
//             let fsTree = result.fsTree;
//             this.sources.files = this.getFilesFromFSTree(fsTree);
//             this.fileSystemTree.addValueListener((selected, newSelection) => {
//
//             })
//             this.afterInit();
//         })
//     }
//
//     afterInit() {
//         this.headerContainer.innerText = "Module " + this.sources.dir + " (" + this.sources.files.length + " files)";
//         let metadataContainer = document.createElement("div");
//         metadataContainer.className = "metadata-container"
//
//         let metadataGLOGContainer = document.createElement("div");
//         metadataGLOGContainer.innerText = "Includes:\n\t" + this.sources.includes.join("\n\t") + "\nExcludes:\n\t" +
//             this.sources.excludes.join("\n\t") + "\nType: " + this.constructor.name;
//         metadataGLOGContainer.className = "code";
//
//
//         let metadataButtonContainer = document.createElement("div");
//         metadataButtonContainer.className = "metadata-button-container"
//         let reloadButton = document.createElement("button")
//         reloadButton.innerHTML = "RELOAD"
//         reloadButton.className = "footer-button";
//
//         reloadButton.onclick = this.reloadModule.bind(this)
//
//         metadataButtonContainer.append(reloadButton)
//         metadataContainer.append(metadataGLOGContainer, metadataButtonContainer)
//
//         WindowedNode.makeContentScrollable(metadataContainer)
//         this.moduleContainer.prepend(metadataContainer)
//         super.afterInit();
//     }
//
//     getFilesFromFSTree(fsTree, relative=""){
//         let basePath = path.join(this.sources.dir, relative);
//         if(typeof fsTree === "string") return [basePath]
//         let array = []
//         for(let dirOrFile of Object.keys(fsTree)){
//              array.push(...this.getFilesFromFSTree(fsTree[dirOrFile], path.join(relative, dirOrFile)))
//         }
//         return array;
//     }
//
// }

function createModuleNode(name, files, dir, includes, excludes) {
    return new ModuleNode({name, sources: {files, dir, includes, excludes}})
}
