


class WindowedUI extends WindowedNode {
    static DEFAULT_CONFIGURATION = {
        title: "",
        content: undefined,
        scaleProportions: undefined,
    }
    // constructor(title, content, scaleProportions) {
    constructor(configuration = WindowedUI.DEFAULT_CONFIGURATION) {
        configuration = {...WindowedUI.DEFAULT_CONFIGURATION, ...configuration};
        super({title: configuration.title, content: [configuration.content], pos: pan, scale: (zoom.mag2() ** settings.zoomContentExp), intrinsicScale: 1, addFullScreenButton: false, addCollapseButton: false, addSettingsButton: false, addFileButton: false});
        htmlnodes_parent.appendChild(this.content);
        registernode(this);
        // WindowedNode.makeContentScrollable(this.innerContent, true)
        this._initializeUI(configuration.scaleProportions)
    }

    _initializeUI(scaleProportions){
        this.anchorForce = 1;
        this.toggleWindowAnchored(true);
        // this.windowDiv.style.maxWidth = window.innerWidth * scaleProportions.x + "px";
        // this.windowDiv.style.width = window.innerWidth * scaleProportions.x + "px";
        // this.windowDiv.style.maxHeight = window.innerHeight * scaleProportions.y + "px";
        // this.windowDiv.style.height = window.innerHeight * scaleProportions.y + "px";
        this.setMinSize(420)

        this.afterInit();
    }
    // First, remove mandelbrot
    // draw() {
    //     if(this.pos.x < 0) this.pos.x = 0;
    //     if(this.pos.y < 0) this.pos.y = 0;
    //     super.draw();
    // }
    afterInit(){
        this.recenter();
        super.afterInit();
    }
    recenter() {
        this.anchor = pan;
        this.pos = pan;
    }
    save() {
        return null;
    }
}

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
            this.onSelect(this.fileSystemTree.values);
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


        this.mouseAnchor = toDZ(new vec2(0, -this.content.offsetHeight / 2 + 6));
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
            this.fileSystemTree.addEventListener("value", (selected, newSelection) => {
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


    // static _getContentElement(home){
    //     let content = document.createElement("div");
    //     WindowedNode.makeContentScrollable(content);
    //     let pathBarContainer = document.createElement("div");
    //     pathBarContainer.style.display = "flex";
    //
    //     let rootPathInput = document.createElement("input");
    //     rootPathInput.type = "text";
    //     rootPathInput.style.marginBottom = "5px";
    //     rootPathInput.value = home;
    //     rootPathInput.id = "rootPathInput";
    //     pathBarContainer.append(rootPathInput);
    //
    //     let rootPathButton = document.createElement("button");
    //     rootPathButton.style.marginBottom = "5px";
    //     rootPathButton.innerText = "GO";
    //     rootPathButton.className = "linkbuttons";
    //     rootPathButton.id = "rootPathButton";
    //
    //     pathBarContainer.append(rootPathButton);
    //     content.append(pathBarContainer)
    //
    //     let fsNodeContainer = document.createElement("div");
    //     WindowedNode.makeContentScrollable(fsNodeContainer);
    //     fsNodeContainer.id = "fsNodeContainer"
    //     content.append(fsNodeContainer)
    //
    //     return content;
    // }
    // afterInit() {
    //     super.afterInit();
    //     let rootPathButton = this.innerContent.querySelector("#rootPathButton");
    //     rootPathButton.addEventListener("click", this.fetchFSNodes.bind(this))
    //     this.fetchFSNodes();
    // }
    // fetchFSNodes(){
    //     let fsNodeContainer = this.innerContent.querySelector("#fsNodeContainer");
    //     let rootPathInput = this.innerContent.querySelector("#rootPathInput");
    //     this.home = rootPathInput.value.replace(/^[A-Z][:]\/[.][.]$/g, "");
    //     FileManagerAPI.getFSTree(this.home, 1).then((fsTree) => {
    //         let rootKey = Object.keys(fsTree)[0];
    //         rootPathInput.value = rootKey;
    //         this.home = rootKey;
    //         // console.log("FS TREE: ", fsTree, "root key: ", rootKey);
    //         fsNodeContainer.innerHTML = "";
    //         if(this.home !== ""){
    //             fsNodeContainer.append(this.getFSNodeLine("DIR", ".."));
    //             fsNodeContainer.append(this.getFSNodeLine("DIR", "."));
    //         }
    //         for(let node of Object.keys(fsTree[rootKey])){
    //             let nodeElement = this.getFSNodeLine(fsTree[rootKey][node], node);
    //
    //             fsNodeContainer.append(nodeElement)
    //         }
    //     })
    // }
    // getFSNodeLine(type, node){
    //     let nodeElement = document.createElement("div")
    //     if(type === "DIR"){
    //         nodeElement.innerHTML = "&#128193; ";
    //     }else{
    //         nodeElement.innerHTML = "&#128195; "
    //     }
    //     nodeElement.innerHTML += node;
    //     nodeElement.style.margin = "10px"
    //     nodeElement.style.padding = "3px"
    //     WindowedNode.makeContentScrollable(nodeElement)
    //     nodeElement.style.backgroundColor = "rgb(31,31,31)";
    //
    //     let selectButton = document.createElement("button");
    //     selectButton.className = "linkbuttons select-button";
    //     if (this.pickFolders && type !== "DIR") selectButton.disabled = true;
    //     selectButton.style.marginRight = "5px";
    //     selectButton.innerText = "select";
    //     nodeElement.prepend(selectButton)
    //
    //     selectButton.addEventListener("click", (event) => {
    //         this.onSelect(this._getUpdatedPath(node));
    //         this.onDelete();
    //         cancel(event);
    //     });
    //     nodeElement.addEventListener("click", (e) => {
    //         if(e.target.tagName.toLowerCase() !== 'button'){
    //             this.innerContent.querySelector("#rootPathInput").value = this._getUpdatedPath(node);
    //             this.fetchFSNodes();
    //         };
    //     });
    //     return nodeElement
    // }
    //
    // _getUpdatedPath(node) {
    //     return this.innerContent.querySelector("#rootPathInput").value + (this.home.endsWith("/") || this.home === "" ? "" : "/") + node + (this.home === "" ? "/" : "");
    // }
}

class NodeFilesUI extends WindowedUI {
    static DEFAULT_CONFIGURATION = {
        node: undefined,
    }
    constructor(configuration= NodeFilesUI.DEFAULT_CONFIGURATION) {
        configuration = {...NodeFilesUI.DEFAULT_CONFIGURATION, ...configuration};
        if(!configuration.node) throw new Error("Specify a node to edit the related files")
        const title = configuration.node.title +" [" + configuration.node.type + ": #" + configuration.node.uuid + "] - file configuration";
        // configuration.index = generateUUID();
        const content = NodeFilesUI._getContentElement(configuration.node);
        super({title: title, content, scaleProportions:  new vec2(0.2,0.2)});
        this.innerContent.style.width = "100%";
        this._initialize(configuration.node);

    }

    _initialize(node){
        this.anchorForce = 1;
        this.toggleWindowAnchored(true);
        // this.windowDiv.style.maxHeight =  "600px";

        this.draw();
        this.node = node;
        this.setMinSize(210);
        // this.innerContent.style.minWidth = "400px"
        // this.innerContent.style.minHeight = "600px"
        // // this.windowDiv.style.height =  "600px";

        const footerContainer = this.innerContent.querySelector(".content-sticky-footer");

        let footerContainerLeftContainer = document.createElement("div");
        footerContainerLeftContainer.className = "footer-left-container";
        let footerContainerRightContainer = document.createElement("div");
        footerContainerRightContainer.className = "footer-right-container";

        let okButton = document.createElement("button");
        okButton.innerText = "OK";
        okButton.className = "footer-button";
        okButton.onclick = this.onDelete.bind(this);


        footerContainerRightContainer.appendChild(okButton);
        footerContainer.appendChild(footerContainerLeftContainer);
        footerContainer.appendChild(footerContainerRightContainer);

        this.mouseAnchor = toDZ(new vec2(0, -this.content.offsetHeight / 2 + 6));

        let fileMappingConainer = this.windowDiv.querySelector(".file-mapping-container");
        WindowedNode.makeContentScrollable(fileMappingConainer, true)
        this.innerContent.style.width = "100%";
        this.innerContent.style.height = "100%";
        for (let file of this.node.files){
            fileMappingConainer.append(this.getFileContainer(file));
        }
        fileMappingConainer.append(this.getAddFileContainer());
        // fileMappingConainer.innerText = JSON.stringify(this.node, null, 4)
    }

    getFileContainer(fileObject){
        let container = document.createElement('div');
        container.className = "node-file-container";

        let leftContainer = document.createElement('div');
        leftContainer.className = "node-file-left-container";
        let rightContainer = document.createElement('div');
        rightContainer.className = "node-file-right-container";
        let rightInnerContainer = document.createElement('div');
        rightInnerContainer.className = "node-file-right-inner-container";

        let keyLabel = document.createElement('div');
        keyLabel.innerText = fileObject.key;
        keyLabel.className = "node-file-key-container";
        let fileNameLabel = document.createElement('input');
        fileNameLabel.value = fileObject.name;
        fileNameLabel.title = fileObject.path;
        fileNameLabel.type = "text";
        // fileNameLabel.onclick = (event) => {console.log("CLICK")};
        fileNameLabel.setAttribute('readonly', "")
        leftContainer.append(keyLabel, fileNameLabel)

        const refreshIconSVG = document.getElementById("refresh-icon").children[0];

        let saveButtonsContainer = document.createElement('div');
        saveButtonsContainer.className = "node-file-button-container";
        let saveButton = document.createElement('button');
        saveButton.innerText = "SAVE";
        saveButton.className = "node-file-button";
        saveButton.onclick = () => {this.node.savePropertyToFile(fileObject.key, fileObject.path)};
        let saveAutoCheckbox = document.createElement('input');
        saveAutoCheckbox.type = "checkbox";
        saveAutoCheckbox.id = `save-node-${this.node.uuid}-${fileObject.key}-auto`
        saveAutoCheckbox.onchange = () => {
            console.log("SAVE AUTO" , saveAutoCheckbox.checked)
            let file = this.node.getSaveFile(fileObject.key);
            file.autoSave = saveAutoCheckbox.checked;
            if(saveAutoCheckbox.checked) {
                this.node.autoSaveFile(fileObject);
            }else{
                this.node.stopAutoSaveFile(fileObject);
            }
        };
        saveAutoCheckbox.checked = this.node.getSaveFile(fileObject.key).autoSave;
        let saveAutoLabel = document.createElement('label');
        saveAutoLabel.setAttribute('for',  `save-node-${this.node.uuid}-${fileObject.key}-auto`);
        saveAutoLabel.className = "node-file-auto-label"
        let saveAutoLabelSVG = refreshIconSVG.cloneNode(true);// document.createElement('svg');
        saveAutoLabelSVG.setAttribute('width', "16");
        saveAutoLabelSVG.setAttribute('height', "16");
        saveAutoLabelSVG.setAttribute('transform', "translate(-5 4)");
        saveButtonsContainer.append(saveButton, saveAutoCheckbox, saveAutoLabel, saveAutoLabelSVG)

        let loadButtonsContainer = document.createElement('div');
        loadButtonsContainer.className = "node-file-button-container";
        let loadButton = document.createElement('button');
        loadButton.innerText = "LOAD";
        loadButton.className = "node-file-button";
        loadButton.onclick = () => {this.node.loadPropertyFromFile(fileObject.key, fileObject.path)};
        let loadAutoCheckbox = document.createElement('input');
        loadAutoCheckbox.type = "checkbox";
        loadAutoCheckbox.id = `load-node-${this.node.uuid}-${fileObject.key}-auto`
        loadAutoCheckbox.onchange = () => {
            console.log("LOAD AUTO" , loadAutoCheckbox.checked)
            let file = this.node.getSaveFile(fileObject.key);
            file.autoLoad = loadAutoCheckbox.checked;
            if(loadAutoCheckbox.checked) {
                this.node.autoLoadFile(fileObject);
            } else {
                this.node.stopAutoLoadFile(fileObject);
            }
        };
        loadAutoCheckbox.checked = this.node.getSaveFile(fileObject.key).autoLoad;
        let loadAutoLabel = document.createElement('label');
        loadAutoLabel.setAttribute('for', `load-node-${this.node.uuid}-${fileObject.key}-auto`);
        loadAutoLabel.className = "node-file-auto-label"
        let loadAutoLabelSVG = refreshIconSVG.cloneNode(true);
        loadAutoLabelSVG.setAttribute('width', "16");
        loadAutoLabelSVG.setAttribute('height', "16");
        loadAutoLabelSVG.setAttribute('transform', "translate(-5 4)");
        loadButtonsContainer.append(loadButton, loadAutoCheckbox, loadAutoLabel, loadAutoLabelSVG);

        rightInnerContainer.append(saveButtonsContainer, loadButtonsContainer)

        rightContainer.append(rightInnerContainer);
        container.append(leftContainer, rightContainer);
        return container;
    }

    getAddFileContainer(){
        let container = document.createElement('div');
        container.className = "node-file-container";
        let plusButtonContainer = document.createElement('div');
        plusButtonContainer.className = "node-file-plus-container";
        plusButtonContainer.innerText = "+";
        container.append(plusButtonContainer);
        return container;
    }

    afterInit() {
        super.afterInit();
    }

    static _getContentElement(node){
        // Create the section container
        let sectionContainer = document.createElement('div')
        sectionContainer.className = 'header-content-footer';
        // Create a div element to show the root directory name
        const rootContainer = document.createElement('div');
        rootContainer.innerText = "File configuration: " + node.files.length + " files";//JSON.stringify(node.files);
        rootContainer.className = "content-sticky-header"
        // Create a div element to host the filesystem tree
        const fileMappingConainer = document.createElement('div');
        fileMappingConainer.className = `file-mapping-container`;
        fileMappingConainer.style.height = "100%";
        // Creates a div element for the footer
        const footerContainer = document.createElement('div');
        footerContainer.className = "content-sticky-footer"
        sectionContainer.append(rootContainer, fileMappingConainer, footerContainer)
        return sectionContainer;
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


//
// window.onload = () => {
//     let wn1 = new FilePicker({title: "Choose the workspace folder", home: "", selectFiles: false, onSelect: (node) => {console.log("SELECTED", node);}})
//
// }


//
// function testNode(a,b,c) {
//     let content3 = document.createElement("textarea");
//     content3.classList.add('custom-scrollbar', 'node-textarea');
//     content3.setAttribute("type", "text");
//     content3.setAttribute("size", "11");
//     //n.setAttribute("style", "background-color: #222226; color: #bbb; overflow-y: scroll; resize: both; width: 259px; line-height: 1.4; display: none;");
//     content3.style.position = "absolute";
//     let wn3 = new WindowedNode("UI", [content3], pan, 4*(zoom.mag2() ** settings.zoomContentExp), 1);
//     htmlnodes_parent.appendChild(wn3.content);
//     registernode(wn32)
// }
// function testNode(scale) {
//     let content3 = document.createElement("textarea");
//     content3.classList.add('custom-scrollbar', 'node-textarea');
//     content3.setAttribute("type", "text");
//     content3.setAttribute("size", "11");
//     content3.value = "blablabla";
//     //n.setAttribute("style", "background-color: #222226; color: #bbb; overflow-y: scroll; resize: both; width: 259px; line-height: 1.4; display: none;");
//     content3.style.position = "absolute";
//     let wn3 = new WindowedNode("UI", [content3], pan, scale*(zoom.mag2() ** settings.zoomContentExp), 1);
//     htmlnodes_parent.appendChild(wn3.content);
//     registernode(wn3)
//     wn3.anchorForce = 1
//     wn3.content.style.left = window.innerWidth * 0.1 + "px";
//     wn3.content.style.top = window.innerHeight * 0.1 + "px";
//     wn3.windowDiv.style.maxWidth = window.innerWidth * 0.8 + "px";
//     wn3.windowDiv.style.width = window.innerWidth * 0.8 + "px";
//     wn3.windowDiv.style.height = window.innerHeight * 0.8 + "px";
//     return wn3;
// }
// function testNode() {
//     let content3 = document.createElement("textarea");
//     content3.classList.add('custom-scrollbar', 'node-textarea');
//     content3.setAttribute("type", "text");
//     content3.setAttribute("size", "11");
//     content3.value = "blablabla";
//     //n.setAttribute("style", "background-color: #222226; color: #bbb; overflow-y: scroll; resize: both; width: 259px; line-height: 1.4; display: none;");
//     content3.style.position = "absolute";
//     let wn3 = new WindowedUI("UI", content3, new vec2(0.8, 0.8));
//     return wn3;
// }
// let wn1 = new FilePicker("Choose the workspace folder")

// class FileSystemTree extends Tree{
//     constructor(container, fsTree) {
//         const treeData = FileSystemTree._build_tree(fsTree);
//         let configuration = {
//             data: treeData,
//             loaded: function() {
//                 // this.patcher = patcher;
//                 // this.patcher.drawDiff2Html = this.drawDiff2Html.bind(this);
//                 // this.patcher.afterPatchChanged = this.afterPatchChanged.bind(this);
//                 // this.filePatcherUiById = {};
//                 // this.collapseAll();
//                 // this.decorateNodes();
//             }
//         }
//         super(container, configuration);
//
//     }
//     decorateNodes(){
//         let container_div = $(this.container)[0];
//         let root_button_div = document.createElement("div");
//         root_button_div.className = "treejs-root_button_panel";
//         let root_patch_button = document.createElement("button");
//         root_patch_button.className = "patch_button detailvalue_warn"
//         root_patch_button.innerHTML = "&#x1FA79; apply all patches";
//         root_patch_button.style.display = 'none';
//         let patcher = this.patcher
//         root_patch_button.onclick = function(){
//             patcher.apply_patches("/");
//         }
//         root_button_div.append(root_patch_button)
//         container_div.prepend(root_button_div);
//
//         let node_elements = this.liElementsById;
//         let node_ids = Object.keys(node_elements)
//         for(let node_id of node_ids){
//             let is_directory_in_line_patches = this.patcher.is_directory_in_line_patches(node_id);
//             let node_element = node_elements[node_id];
//             let node = this.nodesById[node_id];
//             let label = $(node_element).children(".treejs-label")[0];
//             if(node.attributes.isDeleted) label.className += " treejs-label-deleted"
//             if(node.attributes.isNew) label.className += " treejs-label-new"
//             let button_panel = document.createElement("span");
//
//             let add_to_gitignore_button = document.createElement("button");
//             add_to_gitignore_button.className = "add_to_gitignore_button detailvalue_ignore"
//             add_to_gitignore_button.innerHTML = "&#x21CE;"
//             if(is_directory_in_line_patches) add_to_gitignore_button.style.display = 'none';
//
//             let tooltip = document.createElement("span")
//             tooltip.className = "white_text";
//             tooltip.innerHTML = "add to .gitignore";
//             $(add_to_gitignore_button).tooltip({title:tooltip.outerHTML, html: true})
//             button_panel.append(add_to_gitignore_button);
//             let space_panel = document.createElement("span")
//             space_panel.innerHTML = "&emsp;";
//             let icon = document.createElement("span");
//             icon.className = "treejs-icon";
//             icon.onclick = () => {label.click()};
//             if(node.children.length > 0){
//                 // Directory
//                 icon.innerHTML = " &#x1F4C1; " //open
//                 // icon.innerHTML = " &#x1F4C2; " //close
//
//                 let downgrade_button = document.createElement("button");
//                 downgrade_button.className = "downgrade_button detailvalue_error"
//                 downgrade_button.innerHTML = "&#129088; keep";
//                 let patcher = this.patcher;
//                 downgrade_button.onclick = function () {
//                     patcher.add_directory_patch('keep', node_id, {})
//                 }
//                 if(is_directory_in_line_patches) downgrade_button.style.display = 'none';
//                 button_panel.append(downgrade_button);
//
//                 let update_button = document.createElement("button");
//                 update_button.className = "update_button detailvalue_success"
//                 update_button.innerHTML = "update &#129094;";
//                 update_button.onclick = function () {
//                     patcher.add_directory_patch('update', node_id, {})
//                 }
//                 if(is_directory_in_line_patches) update_button.style.display = 'none';
//                 button_panel.append(update_button);
//
//                 let patch_button = document.createElement("button");
//                 patch_button.className = "patch_button detailvalue_warn"
//                 patch_button.innerHTML = "&#x1FA79; apply patch";
//                 patch_button.onclick = function () {
//                     let patcher = this.patcher
//                     patch_button.onclick = function(){
//                         patcher.apply_patches(node_id);
//                     }
//                 }
//                 if(!is_directory_in_line_patches) patch_button.style.display = 'none';
//                 button_panel.append(patch_button);
//
//             }else{
//                 // file
//                 icon.innerHTML = " &#x1F4CB; "
//             }
//             node_element.insertBefore(icon, label)
//             node_element.insertBefore(button_panel, label.nextSibling)
//             node_element.insertBefore(space_panel, button_panel)
//
//         }
//     }
//     refreshFSTreeButtons(){
//         let container_div = $(this.container)[0];
//         let root_button_div = container_div.getElementsByClassName("treejs-root_button_panel")[0];
//         let root_patch_button = root_button_div.getElementsByClassName("patch_button")[0]
//         if(this.patcher.patches.length > 0){
//             root_patch_button.style.display = 'none';
//         }else{
//             root_patch_button.style.display = '';
//         }
//         let node_elements = this.liElementsById;
//         let node_ids = Object.keys(node_elements)
//         for(let node_id of node_ids){
//             let node_element = node_elements[node_id];
//             let node = this.nodesById[node_id];
//             let label = $(node_element).children(".treejs-label")[0];
//             let add_to_gitignore_button = node_element.getElementsByClassName("add_to_gitignore_button")[0];
//             if(node.children.length > 0){
//                 // Directory
//                 let is_directory_in_line_patches = this.patcher.is_directory_in_line_patches(node_id);
//                 let downgrade_button = node_element.getElementsByClassName("downgrade_button")[0];
//                 let update_button = node_element.getElementsByClassName("update_button")[0];
//                 let patch_button = node_element.getElementsByClassName("patch_button")[0];
//                 if(is_directory_in_line_patches){
//                     add_to_gitignore_button.style.display = 'none';
//                     downgrade_button.style.display = 'none';
//                     update_button.style.display = 'none';
//                     patch_button.style.display = '';
//                     if(!label.className.includes("detailvalue_warn")){
//                         label.className += " detailvalue_warn";
//                     }
//                 } else {
//                     add_to_gitignore_button.style.display = '';
//                     downgrade_button.style.display = '';
//                     update_button.style.display = '';
//                     patch_button.style.display = 'none';
//                     if(label.className.includes("detailvalue_warn")){
//                         label.className = label.className.replace("detailvalue_warn","");
//                     }
//                 }
//
//             }else{
//                 // file
//                 let is_file_in_line_patches = this.patcher.is_file_in_line_patches(node_id);
//                 if(is_file_in_line_patches){
//                     add_to_gitignore_button.style.display = '';
//                 } else {
//                     add_to_gitignore_button.style.display = 'none';
//                 }
//             }
//         }
//     }
//     afterPatchChanged(patched_files){
//         let node_elements = this.liElementsById;
//         for(let patched_file of patched_files){
//             let node_element = node_elements[patched_file];
//             let label = $(node_element).children(".treejs-label")[0];
//             let filePatcherUi = this.filePatcherUiById[patched_file];
//             let icon = $(node_element).children(".treejs-icon")[0];
//             if(filePatcherUi){
//                 // remove keep update buttons
//                 filePatcherUi.refreshFileButtons();
//                 filePatcherUi.refreshLineButtons();
//             }
//             // set yellow background on label
//             if(!label.className.includes("detailvalue_warn")){
//                 label.className += " detailvalue_warn";
//             }
//         }
//         this.refreshFSTreeButtons();
//     }
//     redrawIcon(node_id){
//         let node_elements = this.liElementsById;
//         let node = this.nodesById[node_id];
//         let node_element = node_elements[node_id];
//         let icon = $(node_element).children(".treejs-icon")[0];
//         if(!icon) return;
//         if(node.children.length > 0){
//             // Directory
//             if(node_element.className.includes("treejs-node__close")){
//                 icon.innerHTML = " &#x1F4C2; "
//             }else{
//                 icon.innerHTML = " &#x1F4C1; "
//             }
//         }else{
//             // File
//             let li = this.liElementsById[node_id];
//             if(li.className.includes("treejs-node__checked")){
//                 icon.innerHTML = " &#x274C; "
//             }else{
//                 icon.innerHTML = " &#x1F4CB; "
//             }
//
//         }
//     }
//     idByElement(element){
//         let node_elements = this.liElementsById;
//         let node_ids = Object.keys(node_elements)
//         for(let node_id of node_ids){
//             let node_element = node_elements[node_id];
//             if(node_element === element){
//                 return node_id;
//             }
//         }
//         return null;
//     }
//     drawDiff2Html(node_id){
//         let diff_container = document.createElement("div");
//         let diff_line = document.createElement('li');
//         diff_line.className = "treejs-node treejs-placeholder treejs-diff2html"
//         diff_container.innerHTML = "";
//         const configuration = {
//             drawFileList: false,
//             fileListToggle: false,
//             fileListStartVisible: false,
//             fileContentToggle:false,
//             outputFormat: 'side-by-side',
//             highlight: true,
//             matching: 'lines',
//         };//, highlight: true
//         this.filePatcherUiById[node_id] = new FilePatcherUi(this.patcher, node_id, diff_container, configuration);
//         diff_line.append(diff_container);
//         let node =  this.liElementsById[node_id];
//         let diff2Html = node.nextSibling;
//         if(diff2Html && diff2Html.className.includes("treejs-diff2html")){
//             diff2Html.replaceWith(diff_line)
//         }else{
//             node.after(diff_line)
//         }
//     }
//     hideDiff2Html(node_id){
//         if(this.filePatcherUiById.hasOwnProperty(node_id)){
//             let diff2Html = this.filePatcherUiById[node_id];
//             diff2Html.targetElement.parentElement.outerHTML = "";
//             delete this.filePatcherUiById[node_id]
//         }
//
//     }
//     onItemClick(node_id){
//         // console.log("Clicked on id:", node_id)
//         let node = this.nodesById[node_id];
//         if(node.children.length > 0){
//             // Directory
//             let li = this.liElementsById[node_id];
//             let switcher = $(li).children(".treejs-switcher")[0];
//             this.onSwitcherClick(switcher)
//             // Tree.prototype.onSwitcherClicked.bind(this).call(this, switcher)
//             // this.redrawIcon(node_id);
//         }else{
//             // file
//             Tree.prototype.onItemClick.bind(this).call(this, node_id)
//             let li = this.liElementsById[node_id];
//             if(li.className.includes("treejs-node__checked")){
//                 this.drawDiff2Html(node_id)
//             }else{
//                 this.hideDiff2Html(node_id)
//             }
//             this.redrawIcon(node_id);
//
//         }
//     }
//     getChild(directory_id){
//         let node_elements = this.liElementsById;
//         let node_ids = Object.keys(node_elements);
//         return node_ids.filter(function (node_id) {
//             return node_id.startsWith(directory_id)
//         });
//     }
//     onSwitcherClick(element){
//         // console.log("onSwitcherClick", element);
//         let node_id = this.idByElement(element.parentNode);
//         for(let sub_node_id of this.getChild(node_id)){
//             if(this.filePatcherUiById.hasOwnProperty(sub_node_id)){
//                 // this.hideDiff2Html(sub_node_id);
//                 // this.redrawIcon(sub_node_id);
//                 this.onItemClick(sub_node_id);
//             }
//         }
//         Tree.prototype.onSwitcherClick.bind(this).call(this, element);
//         this.redrawIcon(node_id);
//     }
//     static _split_path(directory){
//         let split = [];
//         let parsed = path.parse(directory);
//         while(parsed.dir !== "/"){
//             split.push(parsed)
//             parsed = path.parse(parsed.dir);
//         }
//         split.push(parsed)
//         split.reverse()
//         return split;
//     }
//     static _build_tree(fsTree){
//         let tree_root = [];
//         let node = tree_root;
//         for(let node of Object.keys(fsTree)){
//             let position = difference.id;
//             node = tree_root;
//             let split_position = FileSystemTree._split_path(position);
//             for(let parsed_position of split_position){
//                 let item = {
//                     id: path.join(parsed_position.dir, parsed_position.base),
//                     text:  parsed_position.base,
//                     attributes: {
//                         isNew: difference.isNew,
//                         isDeleted: difference.isDeleted
//                     },
//                     children: [],
//                 };
//                 let duplicates = node.filter(function(element){
//                     return element.id === item.id;
//                 });
//                 if(duplicates.length > 0){
//                     node = duplicates[0].children;
//                 }else{
//                     node.push(item)
//                     node = item.children;
//                 }
//             }
//         }
//         return tree_root;
//     }
// }