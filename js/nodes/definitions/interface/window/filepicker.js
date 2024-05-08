
class FilePicker extends WindowedUI {
    static DEFAULT_CONFIGURATION = {
        title: "",
        home: "",
        onSelect:() => {},
        onCancel:() => {},
        multiple: false,
        selectFiles: true,
        selectFolders: true
    }
    constructor(configuration= FilePicker.DEFAULT_CONFIGURATION) {
        configuration = {...FilePicker.DEFAULT_CONFIGURATION, ...configuration};
        const title = configuration.title ? configuration.title : "Pick a " + configuration.pickFolders ? "folder" : "file";
        configuration.index = generateUUID();
        const content = FilePicker._getContentElement(configuration.home, configuration.index);
        super({title: title, content,scaleProportions:  new vec2(0.8,0.8)});
        this.innerContent.style.width = "100%";
        this.multiple = configuration.multiple;
        this.selectFolders = configuration.selectFolders;
        this.selectFiles = configuration.selectFiles;
        this.onSelect = configuration.onSelect;
        this.onCancel = configuration.onCancel;
        this._initialize(configuration.home, configuration.index);

    }

    onDelete(){
        this.onCancel();
        super.onDelete();
    }

    static _getContentElement(root, index){
        // Create the section container
        let sectionContainer = document.createElement('div')
        sectionContainer.className = 'header-content-footer';
        // Create a div element to show the root directory name
        const rootContainer = document.createElement('div');
        rootContainer.innerText = root;
        rootContainer.className = "content-sticky-header"
        // Create a div element to host the filesystem tree
        const treeContainer = document.createElement('div');
        treeContainer.id = `workspaceExplorerContainer-${index}`;
        treeContainer.style.height = "100%";
        // Creates a div element for the footer
        const footerContainer = document.createElement('div');
        footerContainer.className = "content-sticky-footer"
        sectionContainer.append(rootContainer, treeContainer, footerContainer)
        return sectionContainer;
    }

    _initialize(home, index){
        this.anchorForce = 1;
        this.toggleWindowAnchored(true);
        // this.windowDiv.style.maxHeight =  "600px";

        this.draw();
        this.index = index;
        // this.setMinSize(420);
        // this.innerContent.style.minWidth = "400px"
        // this.innerContent.style.minHeight = "600px"
        // // this.windowDiv.style.height =  "600px";

        const footerContainer = this.innerContent.querySelector(".content-sticky-footer");

        let footerContainerLeftContainer = document.createElement("div");
        footerContainerLeftContainer.className = "footer-left-container";
        let footerContainerRightContainer = document.createElement("div");
        footerContainerRightContainer.className = "footer-right-container";

        let confirmFileSelectionButton = document.createElement("button");
        confirmFileSelectionButton.innerText = "SELECT";
        confirmFileSelectionButton.className = "footer-button";
        confirmFileSelectionButton.disabled = true;
        confirmFileSelectionButton.onclick = () => {
            this.onSelect(this.fileSystemTree.content.values);
            super.onDelete();
        }

        let cancelFileSelectionButton = document.createElement("button");
        cancelFileSelectionButton.innerText = "CANCEL";
        cancelFileSelectionButton.className = "footer-button";
        cancelFileSelectionButton.onclick = this.onDelete.bind(this);

        footerContainerLeftContainer.appendChild(cancelFileSelectionButton);
        footerContainerRightContainer.appendChild(confirmFileSelectionButton);
        footerContainer.appendChild(footerContainerLeftContainer);
        footerContainer.appendChild(footerContainerRightContainer);


        this.mouseAnchor = this.diagram.background.toDZ(new vec2(0, -this.content.offsetHeight / 2 + 6));
        const elementID = `workspaceExplorerContainer-${this.index}`
        let treeContainer = document.getElementById(elementID);
        WindowedNode.makeContentScrollable(treeContainer, true)
        this.innerContent.style.width = "100%";
        this.innerContent.style.height = "100%";

        createFilePickerFSTree(elementID, home, this.multiple, this.selectFiles, this.selectFolders, function makeTreeScrollable(){
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
                    confirmFileSelectionButton.disabled = true;
                    confirmFileSelectionButton.innerText = "SELECT"
                } else {
                    confirmFileSelectionButton.disabled = false;
                    if(selected.length === 1) {
                        if(selected[0].includes("/")){
                            confirmFileSelectionButton.innerText = "SELECT " + selected[0].substring(selected[0].lastIndexOf("/") + 1)
                        } else {
                            confirmFileSelectionButton.innerText = "SELECT " + selected[0];
                        }
                    } else {
                        confirmFileSelectionButton.innerText = "SELECT (" + selected.length + ")";
                    }
                }
            })
            // WindowedNode.makeContentScrollable(this.innerContent, true)
            // WindowedNode.makeContentScrollable(treeContainer, true)
            // this.innerContent.className.add("header-content-footer");
            this.afterInit();
        })
    }

    afterInit() {
        super.afterInit();
    }
}

// class FilePicker extends WindowedUI {
//     static DEFAULT_CONFIGURATION = {
//         title: "",
//         home: "",
//         onSelect:() => {},
//         pickFolders: true,
//     }
//     // constructor(title='', home='', onSelect=() => {}, pickFolders=true) {
//     constructor(configuration= FilePicker.DEFAULT_CONFIGURATION) {
//         super({title: configuration.title ? configuration.title : "Pick a " + configuration.pickFolders ? "folder" : "file", content: FilePicker._getContentElement(configuration.home),scaleProportions:  new vec2(0.8,0.8)});
//         this.innerContent.style.width = "100%";
//         this.pickFolders = configuration.pickFolders;
//         this.onSelect = configuration.onSelect;
//     }
//     static _getContentElement(home){
//         let content = document.createElement("div");
//         WindowedNode.makeContentScrollable(content);
//         let pathBarContainer = document.createElement("div");
//         pathBarContainer.style.display = "flex";
//
//         let rootPathInput = document.createElement("input");
//         rootPathInput.type = "text";
//         rootPathInput.style.marginBottom = "5px";
//         rootPathInput.value = home;
//         rootPathInput.id = "rootPathInput";
//         pathBarContainer.append(rootPathInput);
//
//         let rootPathButton = document.createElement("button");
//         rootPathButton.style.marginBottom = "5px";
//         rootPathButton.innerText = "GO";
//         rootPathButton.className = "linkbuttons";
//         rootPathButton.id = "rootPathButton";
//
//         pathBarContainer.append(rootPathButton);
//         content.append(pathBarContainer)
//
//         let fsNodeContainer = document.createElement("div");
//         WindowedNode.makeContentScrollable(fsNodeContainer);
//         fsNodeContainer.id = "fsNodeContainer"
//         content.append(fsNodeContainer)
//
//         return content;
//     }
//     afterInit() {
//         super.afterInit();
//         let rootPathButton = this.innerContent.querySelector("#rootPathButton");
//         rootPathButton.addEventListener("click", this.fetchFSNodes.bind(this))
//         this.fetchFSNodes();
//     }
//     fetchFSNodes(){
//         let fsNodeContainer = this.innerContent.querySelector("#fsNodeContainer");
//         let rootPathInput = this.innerContent.querySelector("#rootPathInput");
//         this.home = rootPathInput.value.replace(/^[A-Z][:]\/[.][.]$/g, "");
//         FileManagerAPI.getFSTree(this.home, 1).then((fsTree) => {
//             let rootKey = Object.keys(fsTree)[0];
//             rootPathInput.value = rootKey;
//             this.home = rootKey;
//             // console.log("FS TREE: ", fsTree, "root key: ", rootKey);
//             fsNodeContainer.innerHTML = "";
//             if(this.home !== ""){
//                 fsNodeContainer.append(this.getFSNodeLine("DIR", ".."));
//                 fsNodeContainer.append(this.getFSNodeLine("DIR", "."));
//             }
//             for(let node of Object.keys(fsTree[rootKey])){
//                 let nodeElement = this.getFSNodeLine(fsTree[rootKey][node], node);
//
//                 fsNodeContainer.append(nodeElement)
//             }
//         })
//     }
//     getFSNodeLine(type, node){
//         let nodeElement = document.createElement("div")
//         if(type === "DIR"){
//             nodeElement.innerHTML = "&#128193; ";
//         }else{
//             nodeElement.innerHTML = "&#128195; "
//         }
//         nodeElement.innerHTML += node;
//         nodeElement.style.margin = "10px"
//         nodeElement.style.padding = "3px"
//         WindowedNode.makeContentScrollable(nodeElement)
//         nodeElement.style.backgroundColor = "rgb(31,31,31)";
//
//         let selectButton = document.createElement("button");
//         selectButton.className = "linkbuttons select-button";
//         if (this.pickFolders && type !== "DIR") selectButton.disabled = true;
//         selectButton.style.marginRight = "5px";
//         selectButton.innerText = "select";
//         nodeElement.prepend(selectButton)
//
//         selectButton.addEventListener("click", (event) => {
//             this.onSelect(this._getUpdatedPath(node));
//             this.onDelete();
//             cancel(event);
//         });
//         nodeElement.addEventListener("click", (e) => {
//             if(e.target.tagName.toLowerCase() !== 'button'){
//                 this.innerContent.querySelector("#rootPathInput").value = this._getUpdatedPath(node);
//                 this.fetchFSNodes();
//             };
//         });
//         return nodeElement
//     }
//
//     _getUpdatedPath(node) {
//         return this.innerContent.querySelector("#rootPathInput").value + (this.home.endsWith("/") || this.home === "" ? "" : "/") + node + (this.home === "" ? "/" : "");
//     }
// }
