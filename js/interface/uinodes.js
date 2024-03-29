


class WindowedUI extends WindowedNode {
    static DEFAULT_CONFIGURATION = {
        title: "",
        content: undefined,
        scaleProportions: undefined,
    }
    // constructor(title, content, scaleProportions) {
    constructor(configuration = WindowedUI.DEFAULT_CONFIGURATION) {
        configuration = {...WindowedUI.DEFAULT_CONFIGURATION, ...configuration};
        super({title: configuration.title, content: [configuration.content], pos: background.pan, scale: (background.zoom.mag2() ** settings.zoomContentExp), intrinsicScale: 1, addFullScreenButton: false, addCollapseButton: false, addSettingsButton: false, addFileButton: false});
        this.diagram.addNode(this);
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
        this.windowDiv.classList.add("window-ui")
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
        this.anchor = background.pan;
        this.pos = background.pan;
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


        this.mouseAnchor = background.toDZ(new vec2(0, -this.content.offsetHeight / 2 + 6));
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
        // this.setMinSize(316);
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

        this.mouseAnchor = background.toDZ(new vec2(0, -this.content.offsetHeight / 2 + 6));

        let fileMappingContainer = this.windowDiv.querySelector(".file-mapping-container");
        WindowedNode.makeContentScrollable(fileMappingContainer, true)
        this.innerContent.style.width = "100%";
        this.innerContent.style.height = "100%";
        let allKeys = this.getAllKeys();
        this.keyContainerMap = {}
        for (let file of this.node.files){
            fileMappingContainer.append(this.getFileContainer(file, allKeys));
        }
        this.addFileButton = this.getAddFileContainer();
        this.addFileButton.onclick = this.onAddFile.bind(this);
        fileMappingContainer.append(this.addFileButton);
        // fileMappingContainer.innerText = JSON.stringify(this.node, null, 4)
    }

    getAllKeys() {
        return this.node.files.map((file) => file.key);
    }

    onDeleteFile(fileObject) {
        let fileIndex = this.node.files.findIndex((file) => file.key === fileObject.key);
        if(fileIndex !== -1) this.node.files.splice(fileIndex, 1);
        this.keyContainerMap[fileObject.key].remove()
        delete this.keyContainerMap[fileObject.key];
        this._updateAllKeyDropdown();
    }

    onAddFile() {
        const allKeys = this.getAllKeys();
        let selectedKey = this._getAvailableProperties(allKeys)[0];
        let file = { key: selectedKey, path: '', name: '', autoLoad: false, autoSave: false };
        this.node.files.push(file);
        this.addFileButton.before(this.getFileContainer(file, allKeys));
        this._updateAllKeyDropdown();
    }

    onKeyChange(oldKey, fileObject){
        console.log("Changed key:", oldKey, " file:: ", fileObject, " all files: ", this.node.files, " map: ", this.keyContainerMap)
        this.keyContainerMap[fileObject.key] = this.keyContainerMap[oldKey];
        delete this.keyContainerMap[oldKey];
        this._updateAllKeyDropdown()
    }

    getFileContainer(fileObject, allKeys){
        let container = document.createElement('div');
        container.className = "node-file-container";
        this.keyContainerMap[fileObject.key] = container;
        let leftContainer = document.createElement('div');
        leftContainer.className = "node-file-left-container";
        let rightContainer = document.createElement('div');
        rightContainer.className = "node-file-right-container";
        let rightInnerContainer = document.createElement('div');
        rightInnerContainer.className = "node-file-right-inner-container";

        // let keyLabel = document.createElement('div');
        // keyLabel.innerText = fileObject.key + (fileObject.binary ? " [b]" : "");
        // keyLabel.className = "node-file-key-container";
        let keyLabel = this._createKeyDropdown(fileObject.key, allKeys);
        keyLabel.onchange = () => {
            const oldKey = fileObject.key;
            let file = this.node.getSaveFile(oldKey);
            file.key = keyLabel.value;
            this.onKeyChange(oldKey, file);
        }
        keyLabel.className = "node-file-key-dropdown";


        // let binaryCheckbox = document.createElement('input');
        // binaryCheckbox.type = "checkbox";
        // binaryCheckbox.id = `file-node-${this.node.uuid}-${fileObject.key}-binary`
        // binaryCheckbox.onchange = () => {
        //     console.log("BINARY " , binaryCheckbox.checked);
        //     let file = this.node.getSaveFile(fileObject.key);
        //     file.binary = binaryCheckbox.checked;
        // };
        // binaryCheckbox.checked = fileObject.binary;
        // let binaryCheckboxLabel = document.createElement('label');
        // binaryCheckboxLabel.setAttribute('for',  `file-node-${this.node.uuid}-${fileObject.key}-binary`);
        // binaryCheckboxLabel.innerText = "binary"
        // binaryCheckboxLabel.className = "node-file-auto-label"

        let deleteButton = document.createElement('button')
        deleteButton.innerText = "DEL";
        deleteButton.className = "node-file-button";
        deleteButton.onclick = () => {
            this.onDeleteFile(fileObject)
        }

        let fileNameLabel = document.createElement('input');
        fileNameLabel.value = fileObject.name;
        fileNameLabel.title = fileObject.path;
        fileNameLabel.type = "text";
        fileNameLabel.onclick = (event) => {
            new FilePicker({
                title: "Choose a file for storing " + fileObject.key + " property",
                home: selectedWorkspacePath ? selectedWorkspacePath : "",
                onSelect:(selected) => {
                    fileObject.path = selected[0];
                    fileObject.name = path.basename(fileObject.path);
                    fileNameLabel.value = fileObject.name;
                    fileNameLabel.title = fileObject.path;
                },
                onCancel:() => {},
                multiple: false,
                selectFiles: true,
                selectFolders: false})
        };
        fileNameLabel.setAttribute('readonly', "")
        // leftContainer.append(keyLabel, binaryCheckbox, binaryCheckboxLabel, fileNameLabel)
        leftContainer.append(keyLabel, deleteButton, fileNameLabel)

        const refreshIconSVG = document.getElementById("refresh-icon").children[0];

        let saveButtonsContainer = document.createElement('div');
        saveButtonsContainer.className = "node-file-button-container";
        let saveButton = document.createElement('button');
        saveButton.innerText = "SAVE";
        saveButton.className = "node-file-button";
        saveButton.onclick = () => {this.node.savePropertyToFile(fileObject.key, fileObject.path);};
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

    _updateAllKeyDropdown(){
        let allKeys = this.getAllKeys();
        let availableProperties = this._getAvailableProperties(allKeys);
        this.windowDiv.querySelector("div.content-sticky-header").innerText = "File configuration: " + this.node.files.length + " files";
        if(availableProperties.length === 0 && !this.addFileButton.classList.contains("node-file-container-disabled")) {
            this.addFileButton.classList.replace("node-file-container", "node-file-container-disabled");
            this.addFileButton.onclick = () => {};
        } else if(availableProperties.length > 0 && !this.addFileButton.classList.contains("node-file-container")) {
            this.addFileButton.classList.replace("node-file-container-disabled", "node-file-container");
            this.addFileButton.onclick = this.onAddFile.bind(this);
        }
        for(let key in this.keyContainerMap) {
            this._updateKeyDropdown(key, allKeys, this.keyContainerMap[key].querySelector("select.node-file-key-dropdown"));
        }
    }

    _createKeyDropdown(selectedKey, allKeys) {
        // Create the Local LLM dropdown
        let keyDropdown = document.createElement("select");
        keyDropdown.classList.add('inline-container');
        keyDropdown.style.backgroundColor = "#222226";
        keyDropdown.style.border = "none";
        return this._updateKeyDropdown(selectedKey, allKeys, keyDropdown);
    }

    _updateKeyDropdown(selectedKey, allKeys, keyDropdown) {
        let availableProperties = [selectedKey, ...this._getAvailableProperties(allKeys)];
        let options = []
        for (let saveProperty of availableProperties) {
            options.push(new Option(saveProperty, saveProperty, false, saveProperty === selectedKey))
        }
        // Add options to the select
        keyDropdown.innerHTML = "";
        options.forEach((option, index) => {
            keyDropdown.add(option, index);
        });
        return keyDropdown;
    }

    _getAvailableProperties(allKeys){
        let availableProperties = []
        const extendedClasses = this.node.getExtendedClasses();
        for(let extendedClass of extendedClasses){
            if(extendedClass.hasOwnProperty("SAVE_PROPERTIES")){
                for(let property of extendedClass.SAVE_PROPERTIES){
                    if(property !== "files" && property !== "type" && !allKeys.includes(property))
                        availableProperties.push(property)
                }
            }
        }
        return availableProperties;
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
