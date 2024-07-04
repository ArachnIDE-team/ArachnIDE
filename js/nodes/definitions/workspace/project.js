
class ProjectNodeHTML {
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
        insertable: true,
        iconID: "project-icon-symbol",
        name: "Project Node",
        defaultFavourite: -1
    }
    constructor(configuration = ProjectNodeHTML.DEFAULT_CONFIGURATION) {
        configuration = {...ProjectNodeHTML.DEFAULT_CONFIGURATION, ...configuration}
        this.sources = {...ProjectNodeHTML.DEFAULT_CONFIGURATION.sources, ...configuration.sources}
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

    reloadModule(callback, forceFSTree=null, configuration=ProjectNodeHTML.DEFAULT_CONFIGURATION.fsTree) {
        configuration = {...ProjectNodeHTML.DEFAULT_CONFIGURATION.fsTree, ...configuration}
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

class ProjectPanel extends HTMLNode {
    static DEFAULT_CONFIGURATION = {
        name: "",
        sources: {
            files : [],
            dir: "",
            includes: [],
            excludes: [],
        }
    }

    constructor(configuration = ProjectPanel.DEFAULT_CONFIGURATION) {
        configuration = {...ProjectPanel.DEFAULT_CONFIGURATION, ...configuration}
        configuration.sources = {...ProjectPanel.DEFAULT_CONFIGURATION.sources, ...configuration.sources}
        let content = new ProjectNodeHTML(configuration);
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

class ProjectNode extends WindowedNode {
    static DEFAULT_CONFIGURATION = {
        name: "",
        path: "",
        modules: [],
        saved: undefined,
        saveData: undefined,
    }

    static SAVE_PROPERTIES = ['modules'];

    static OBSERVERS = {}

    // constructor(name = '', content = undefined, text = '', sx = undefined, sy = undefined, x = undefined, y = undefined, addCodeButton = false){

    constructor(configuration = ProjectNode.DEFAULT_CONFIGURATION) {
        configuration = {...ProjectNode.DEFAULT_CONFIGURATION, ...configuration}
        configuration.content = ProjectNode._getContentElement(configuration.name);
        if (!configuration.saved) {// Create ProjectNode
            super({...configuration, title: "Project: " + configuration.name, ...WindowedNode.getNaturalScaleParameters()});
            this.followingMouse = 1;
        } else {// Restore ProjectNode
            super({...configuration, title: configuration.name, scale: true});
        }
        this.diagram.addNode(this);
        this._initialize(configuration.name, configuration.path, configuration.modules, configuration.saved)
    }

    static _getContentElement(name){
        // Create the section container
        let sectionContainer = document.createElement('div')
        sectionContainer.className = 'header-content-footer';
        // Create a div element to show the project name
        const rootContainer = document.createElement('div');
        rootContainer.innerText = name;
        rootContainer.className = "content-sticky-header"
        // Create a div element to host the filesystem tree
        const treeContainer = document.createElement('div');
        treeContainer.className = `project-node-container`;
        // Creates a div element for the footer
        const footerContainer = document.createElement('div');
        footerContainer.className = "content-sticky-footer"
        sectionContainer.append(rootContainer, treeContainer, footerContainer)
        return [sectionContainer];
    }

    _initialize(name, path, modules, saved){
        this.anchorForce = 1;
        this.toggleWindowAnchored(true);

        this.draw();
        if(!saved){
            this.name = name;
            this.path = path;
            this.modules = modules;
        }

        this.setMinSize(420)

        const footerContainer = this.innerContent.querySelector(".content-sticky-footer");

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
        footerContainer.appendChild(footerContainerLeftContainer);
        footerContainer.appendChild(footerContainerRightContainer);


        this.mouseAnchor = this.diagram.background.toDZ(new vec2(0, -this.content.offsetHeight / 2 + 6));

        let projectContainer = this.innerContent.querySelector(".project-node-container");
        WindowedNode.makeContentScrollable(projectContainer, true)
        projectContainer.style.height = "100%";
        this.innerContent.style.width = "100%";
        this.innerContent.style.height = "100%";

        // createWorkspaceFSTree(elementID, function makeTreeScrollable(){
        //     for (let liElement of Object.values(this.liElementsById)) {
        //         WindowedNode.makeContentScrollable(liElement);
        //         let ulElement = liElement.querySelector("ul.treejs-nodes");
        //         if(ulElement) WindowedNode.makeContentScrollable(ulElement);
        //     }
        // }).then((fileSystemTree) => {
        //     this.fileSystemTree = fileSystemTree;
        //     this.fileSystemTree.addValueListener((selected, newSelection) => {
        //         console.log("Selected: ", selected, " newSelection: ", newSelection)
        //         if(selected.length === 0){
        //             saveFileSelectionButton.disabled = true;
        //             loadFileSelectionButton.disabled = true;
        //             this.selectedFile = "";
        //         } else {
        //             saveFileSelectionButton.disabled = false;
        //             loadFileSelectionButton.disabled = false;
        //             this.selectedFile = selected[0];
        //         }
        //     })
        //     this.afterInit();
        // })
    }
}

function createProjectNode(name, path) {
    return new ProjectNode({name, path })
}
