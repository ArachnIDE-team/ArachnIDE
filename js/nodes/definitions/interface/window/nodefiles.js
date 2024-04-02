class NodeFilesUI extends WindowedUI {
    static DEFAULT_CONFIGURATION = {
        node: undefined,
    }

    constructor(configuration = NodeFilesUI.DEFAULT_CONFIGURATION) {
        configuration = {...NodeFilesUI.DEFAULT_CONFIGURATION, ...configuration};
        if (!configuration.node) throw new Error("Specify a node to edit the related files")
        const title = configuration.node.title + " [" + configuration.node.type + ": #" + configuration.node.uuid + "] - file configuration";
        // configuration.index = generateUUID();
        const content = NodeFilesUI._getContentElement(configuration.node);
        super({title: title, content, scaleProportions: new vec2(0.2, 0.2)});
        this.innerContent.style.width = "100%";
        this._initialize(configuration.node);

    }

    _initialize(node) {
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

        this.mouseAnchor = this.diagram.background.toDZ(new vec2(0, -this.content.offsetHeight / 2 + 6));

        let fileMappingContainer = this.windowDiv.querySelector(".file-mapping-container");
        WindowedNode.makeContentScrollable(fileMappingContainer, true)
        this.innerContent.style.width = "100%";
        this.innerContent.style.height = "100%";
        let allKeys = this.getAllKeys();
        this.keyContainerMap = {}
        for (let file of this.node.files) {
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
        if (fileIndex !== -1) this.node.files.splice(fileIndex, 1);
        this.keyContainerMap[fileObject.key].remove()
        delete this.keyContainerMap[fileObject.key];
        this._updateAllKeyDropdown();
    }

    onAddFile() {
        const allKeys = this.getAllKeys();
        let selectedKey = this._getAvailableProperties(allKeys)[0];
        let file = {key: selectedKey, path: '', name: '', autoLoad: false, autoSave: false};
        this.node.files.push(file);
        this.addFileButton.before(this.getFileContainer(file, allKeys));
        this._updateAllKeyDropdown();
    }

    onKeyChange(oldKey, fileObject) {
        console.log("Changed key:", oldKey, " file:: ", fileObject, " all files: ", this.node.files, " map: ", this.keyContainerMap)
        this.keyContainerMap[fileObject.key] = this.keyContainerMap[oldKey];
        delete this.keyContainerMap[oldKey];
        this._updateAllKeyDropdown()
    }

    getFileContainer(fileObject, allKeys) {
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
                onSelect: (selected) => {
                    fileObject.path = selected[0];
                    fileObject.name = path.basename(fileObject.path);
                    fileNameLabel.value = fileObject.name;
                    fileNameLabel.title = fileObject.path;
                },
                onCancel: () => {
                },
                multiple: false,
                selectFiles: true,
                selectFolders: false
            })
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
        saveButton.onclick = () => {
            this.node.savePropertyToFile(fileObject.key, fileObject.path);
        };
        let saveAutoCheckbox = document.createElement('input');
        saveAutoCheckbox.type = "checkbox";
        saveAutoCheckbox.id = `save-node-${this.node.uuid}-${fileObject.key}-auto`
        saveAutoCheckbox.onchange = () => {
            console.log("SAVE AUTO", saveAutoCheckbox.checked)
            let file = this.node.getSaveFile(fileObject.key);
            file.autoSave = saveAutoCheckbox.checked;
            if (saveAutoCheckbox.checked) {
                this.node.autoSaveFile(fileObject);
            } else {
                this.node.stopAutoSaveFile(fileObject);
            }
        };
        saveAutoCheckbox.checked = this.node.getSaveFile(fileObject.key).autoSave;
        let saveAutoLabel = document.createElement('label');
        saveAutoLabel.setAttribute('for', `save-node-${this.node.uuid}-${fileObject.key}-auto`);
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
        loadButton.onclick = () => {
            this.node.loadPropertyFromFile(fileObject.key, fileObject.path)
        };
        let loadAutoCheckbox = document.createElement('input');
        loadAutoCheckbox.type = "checkbox";
        loadAutoCheckbox.id = `load-node-${this.node.uuid}-${fileObject.key}-auto`
        loadAutoCheckbox.onchange = () => {
            console.log("LOAD AUTO", loadAutoCheckbox.checked)
            let file = this.node.getSaveFile(fileObject.key);
            file.autoLoad = loadAutoCheckbox.checked;
            if (loadAutoCheckbox.checked) {
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

    getAddFileContainer() {
        let container = document.createElement('div');
        container.className = "node-file-container";
        let plusButtonContainer = document.createElement('div');
        plusButtonContainer.className = "node-file-plus-container";
        plusButtonContainer.innerText = "+";
        container.append(plusButtonContainer);
        return container;
    }

    _updateAllKeyDropdown() {
        let allKeys = this.getAllKeys();
        let availableProperties = this._getAvailableProperties(allKeys);
        this.windowDiv.querySelector("div.content-sticky-header").innerText = "File configuration: " + this.node.files.length + " files";
        if (availableProperties.length === 0 && !this.addFileButton.classList.contains("node-file-container-disabled")) {
            this.addFileButton.classList.replace("node-file-container", "node-file-container-disabled");
            this.addFileButton.onclick = () => {
            };
        } else if (availableProperties.length > 0 && !this.addFileButton.classList.contains("node-file-container")) {
            this.addFileButton.classList.replace("node-file-container-disabled", "node-file-container");
            this.addFileButton.onclick = this.onAddFile.bind(this);
        }
        for (let key in this.keyContainerMap) {
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

    _getAvailableProperties(allKeys) {
        let availableProperties = []
        const extendedClasses = this.node.getExtendedClasses();
        for (let extendedClass of extendedClasses) {
            if (extendedClass.hasOwnProperty("SAVE_PROPERTIES")) {
                for (let property of extendedClass.SAVE_PROPERTIES) {
                    if (property !== "files" && property !== "type" && !allKeys.includes(property))
                        availableProperties.push(property)
                }
            }
        }
        return availableProperties;
    }

    afterInit() {
        super.afterInit();
    }

    static _getContentElement(node) {
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