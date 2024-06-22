
class WorkspaceExplorerNode extends WindowedNode {
    static DEFAULT_CONFIGURATION = {
        name: "",
        sx: undefined,
        sy: undefined,
        x: undefined,
        y: undefined,
        saved: undefined,
        saveData: undefined
    }
    static SAVE_PROPERTIES = ['index', 'selectedFile'];
    // constructor(name = '', content = undefined, imageSrc = '', sx = undefined, sy = undefined, x = undefined, y = undefined, isUrl = false){

    static INTERFACE_CONFIGURATION = {
        insertable: true,
        iconID: "explorer-icon-symbol",
        name: "Workspace Explorer Node",
        defaultFavourite: -1
    }


    constructor(configuration = WorkspaceExplorerNode.DEFAULT_CONFIGURATION){
        configuration = {...WorkspaceExplorerNode.DEFAULT_CONFIGURATION, ...configuration}
        if(!selectedWorkspacePath) throw new Error("Please load a workspace before creating a WorkspaceExplorerNode")
        configuration.index = configuration.saved ? configuration.saveData.json.index : generateUUID();
            configuration.content = WorkspaceExplorerNode._getContentElement(selectedWorkspacePath, configuration.index);
        if (!configuration.saved) {// Create WorkspaceExplorerNode
            super({...configuration,  title: configuration.name, addFileButton:false, ...WindowedNode.getNaturalScaleParameters() });
            this.followingMouse = 1;
        } else {// Restore WorkspaceExplorerNode
            super({...configuration,  title: configuration.name, addFileButton:false, scale: true})
        }

        this.diagram.addNode(this);
        this._initialize(configuration.index, configuration.saved);
    }


    static _getContentElement(root, index){
        // Create the section container
        let sectionContainer = document.createElement('div')
        sectionContainer.className = 'header-content-footer';
        // Create a div element to show the root directory name
        const rootContainer = document.createElement('div');
        rootContainer.innerText = selectedWorkspacePath;
        rootContainer.className = "content-sticky-header"
        // Create a div element to host the filesystem tree
        const treeContainer = document.createElement('div');
        treeContainer.id = `workspaceExplorerContainer-${index}`;
        // Creates a div element for the footer
        const footerContainer = document.createElement('div');
        footerContainer.className = "content-sticky-footer"
        sectionContainer.append(rootContainer, treeContainer, footerContainer)
        return [sectionContainer];
    }

    _initialize(index, saved){
        this.anchorForce = 1;
        this.toggleWindowAnchored(true);
        // this.windowDiv.style.maxHeight =  "600px";

        this.draw();
        if(!saved){
            this.index = index;
            this.selectedFile = "";
        }
        this.setMinSize(420)
        // this.innerContent.style.minWidth = "400px"
        // this.innerContent.style.minHeight = "600px"
        // // this.windowDiv.style.height =  "600px";

        const footerContainer = this.innerContent.querySelector(".content-sticky-footer");

        let footerContainerLeftContainer = document.createElement("div");
        footerContainerLeftContainer.className = "footer-left-container";
        let footerContainerRightContainer = document.createElement("div");
        footerContainerRightContainer.className = "footer-right-container";

        let saveFileSelectionButton = document.createElement("button");
        saveFileSelectionButton.innerText = "→ SAVE";
        saveFileSelectionButton.className = "footer-button";
        saveFileSelectionButton.disabled = true;
        saveFileSelectionButton.onclick = this.onSaveFile.bind(this);
        let loadFileSelectionButton = document.createElement("button");
        loadFileSelectionButton.innerText = "LOAD →";
        loadFileSelectionButton.className = "footer-button";
        loadFileSelectionButton.disabled = true;
        loadFileSelectionButton.onclick = this.onLoadFile.bind(this);

        footerContainerLeftContainer.appendChild(saveFileSelectionButton);
        footerContainerRightContainer.appendChild(loadFileSelectionButton);
        footerContainer.appendChild(footerContainerLeftContainer);
        footerContainer.appendChild(footerContainerRightContainer);


        this.mouseAnchor = this.diagram.background.toDZ(new vec2(0, -this.content.offsetHeight / 2 + 6));
        const elementID = `workspaceExplorerContainer-${this.index}`
        let treeContainer = document.getElementById(elementID);
        WindowedNode.makeContentScrollable(treeContainer, true)
        treeContainer.style.height = "100%";
        this.innerContent.style.width = "100%";
        this.innerContent.style.height = "100%";

        createWorkspaceFSTree(elementID, function makeTreeScrollable(){
            for (let liElement of Object.values(this.liElementsById)) {
                WindowedNode.makeContentScrollable(liElement);
                let ulElement = liElement.querySelector("ul.treejs-nodes");
                if(ulElement) WindowedNode.makeContentScrollable(ulElement);
            }
        }).then((fileSystemTree) => {
            this.fileSystemTree = fileSystemTree;
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

    async readFileAndCreateTextNode(filePath, fileName){
        let file = await FileManagerAPI.loadBinary(filePath);
        createNodesFromFiles([file], (node) => {
            node.setMainContentFile(filePath, fileName);
            // node.files.push({ key: "text", path: filePath, binary: false, name: fileName, autoLoad: false, autoSave: false});
        })

        // let file = await FileManagerAPI.loadFile(filePath);
        // let textNode = createNodeFromWindow('', file.content, true)
        // textNode.files.push({ key: "text", path: filePath, binary: false, name: fileName, autoLoad: false, autoSave: false});
    }

    onLoadFile(){
        if(this.selectedFile !== ""){
            let fileName = this.fileSystemTree.content.nodesById[this.selectedFile].text
            this.readFileAndCreateTextNode(this.selectedFile, fileName).then(() => {});
        }
    }

    onSaveFile(){

    }

    afterInit() {
        super.afterInit();
    }

    static ondrop() {
        if(!selectedWorkspacePath){
            new BoolInput({title: "Cannot create node", message: "Please load a workspace before creating a WorkspaceExplorerNode", cancelButtons: {}})
            return;
        }
        let node = createWorkspaceExplorerNode();
        node.followingMouse = 1;
        node.draw();
        // Set the dragging point on the header bar
        node.mouseAnchor = node.diagram.background.toDZ(new vec2(0, -node.content.offsetHeight / 2 + 6));
        console.log('Handle drop for the Workspace Explorer icon');
    }
}

function createWorkspaceExplorerNode() {
    return new WorkspaceExplorerNode({ })
}
