

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

    static INTERFACE_CONFIGURATION = {
        insertable: false,
        iconID: "module-icon-symbol",
        name: "Module Node",
        defaultFavourite: -1
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
        let initLoaderContainer = document.createElement("div");
        initLoaderContainer.className = "loader-container";
        let initLoader = document.createElement("div");
        initLoader.className = "loader";
        initLoaderContainer.append(initLoader);
        document.getElementById(elementID).append(initLoaderContainer);
        createModuleFSTree(elementID, this.sources.dir, this.sources.includes, this.sources.excludes, forceFSTree, configuration, () => {

        }).then((result) => {
            initLoaderContainer.remove()
            this.fileSystemTree = result.fileSystemTree;
            let fsTree = result.fsTree;
            this.sources.files = this.getFilesFromFSTree(fsTree);
            // console.log("Set source files for module: ", this, " Files: ",  this.sources.files )
            this.fileSystemTree.addPropertyListener("value", (selected, newSelection) => {

            })
            this.afterReload(callback);
        })
    }

    afterReload(callback) {
        this.headerContainer.innerText = "Module " + this.sources.dir + " (" + this.sources.files.length + " files)";
        let metadataContainer = document.createElement("div");
        metadataContainer.className = "metadata-container"

        let metadataGLOGContainer = document.createElement("div");
        metadataGLOGContainer.innerText = ModuleNodeHTML.getMetadataGLOGText(this.sources.includes, this.sources.excludes, this.moduleType)
            // "Includes:\n\t" + this.sources.includes.join("\n\t") + "\nExcludes:\n\t" +
            // this.sources.excludes.join("\n\t") + "\nType: " + this.moduleType;
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

    static getMetadataGLOGText(includes, excludes, moduleType){
        return "Includes:\n\t" + includes.join("\n\t") + "\nExcludes:\n\t" +
        excludes.join("\n\t") + "\nType: " + moduleType;
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
function createModuleNode(name, files, dir, includes, excludes) {
    return new ModuleNode({name, sources: {files, dir, includes, excludes}})
}
