class ModuleNode extends WindowedNode {
    static DEFAULT_CONFIGURATION = {
        name: "",
        sources: {
            files : [],
            dir: "",
            includes: [],
            excludes: [],
        },
        saved: undefined,
        saveData: undefined,
    }

    static SAVE_PROPERTIES = ['sources', 'index'];

    static OBSERVERS = {}

    // constructor(name = '', content = undefined, text = '', sx = undefined, sy = undefined, x = undefined, y = undefined, addCodeButton = false){

    constructor(configuration = ModuleNode.DEFAULT_CONFIGURATION) {
        configuration = {...ModuleNode.DEFAULT_CONFIGURATION, ...configuration}
        configuration.sources = {...ModuleNode.DEFAULT_CONFIGURATION.sources, ...configuration.sources}
        configuration.index = configuration.saved ? configuration.saveData.json.index : generateUUID();
        configuration.content = ModuleNode._getContentElement(configuration.index);
        if (!configuration.saved) {// Create ModuleNode
            super({...configuration, title: configuration.name, ...WindowedNode.getNaturalScaleParameters()});
            this.followingMouse = 1;
        } else {// Restore ModuleNode
            super({...configuration, title: configuration.name, scale: true});
        }
        this.diagram.addNode(this);
        this._initialize(configuration.sources, configuration.index, configuration.saved)
    }

    static _getContentElement(index){
        // Create the section container
        let sectionContainer = document.createElement('div')
        sectionContainer.className = 'header-content-footer';
        // Create a div element to show the root directory name
        const rootContainer = document.createElement('div');
        rootContainer.className = "content-sticky-header"
        // Create a div element to host the filesystem tree
        const treeContainer = document.createElement('div');
        treeContainer.id = `moduleContainer-${index}`;
        // Creates a div element for the footer
        const footerContainer = document.createElement('div');
        footerContainer.className = "content-sticky-footer"
        sectionContainer.append(rootContainer, treeContainer, footerContainer)
        return [sectionContainer];
    }

    _initialize(sources, index, saved){
        this.anchorForce = 1;
        this.toggleWindowAnchored(true);

        this.draw();
        if(!saved){
            this.sources = sources;
            this.index = index;
        }

        this.setMinSize(420)
        this.headerContainer =  this.innerContent.querySelector(".content-sticky-header");
        this.footerContainer = this.innerContent.querySelector(".content-sticky-footer");

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


        this.mouseAnchor = this.diagram.background.toDZ(new vec2(0, -this.content.offsetHeight / 2 + 6));
        const elementID = `moduleContainer-${this.index}`
        this.moduleContainer = document.getElementById(elementID);
        WindowedNode.makeContentScrollable(this.moduleContainer, true)
        this.moduleContainer.style.height = "100%";
        this.innerContent.style.width = "100%";
        this.innerContent.style.height = "100%";

        createModuleFSTree(elementID, this.sources.dir, this.sources.includes, this.sources.excludes, function makeTreeScrollable(){
            for (let liElement of Object.values(this.liElementsById)) {
                WindowedNode.makeContentScrollable(liElement);
                let ulElement = liElement.querySelector("ul.treejs-nodes");
                if(ulElement) WindowedNode.makeContentScrollable(ulElement);
            }
        }).then((result) => {
            this.fileSystemTree = result.fileSystemTree;
            let fsTree = result.fsTree;
            this.sources.files = this.getFilesFromFSTree(fsTree);
            this.fileSystemTree.addValueListener((selected, newSelection) => {
                console.log("Selected: ", selected, " newSelection: ", newSelection)
                if(selected.length === 0){
                    saveFileSelectionButton.disabled = true;
                    loadFileSelectionButton.disabled = true;
                    this.selectedFile = "";
                } else {
                    saveFileSelectionButton.disabled = false;
                    loadFileSelectionButton.disabled = false;
                    this.selectedFile = selected[0];
                }
            })
            this.afterInit();
        })
    }

    afterInit() {
        this.headerContainer.innerText = "Module " + this.sources.dir + " (" + this.sources.files.length + " files)";
        let metadataContainer = document.createElement("div");
        metadataContainer.innerText = "Includes:\n\t" + this.sources.includes.join("\n\t") + "\nExcludes:\n\t" + this.sources.excludes.join("\n\t")
        + "\nType: " + this.constructor.name;
        metadataContainer.className = "metadata-container"
        WindowedNode.makeContentScrollable(metadataContainer)
        this.moduleContainer.prepend(metadataContainer)
        super.afterInit();
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

}



function createModuleNode(name, files, dir, includes, excludes) {
    return new ModuleNode({name, sources: {files, dir, includes, excludes}})
}
