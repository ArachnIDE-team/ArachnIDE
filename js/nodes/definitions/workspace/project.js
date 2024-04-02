
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
        if (!configuration.saved) {// Create ModuleNode
            super({...configuration, title: "Project: " + configuration.name, ...WindowedNode.getNaturalScaleParameters()});
            this.followingMouse = 1;
        } else {// Restore ModuleNode
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
