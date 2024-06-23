
class FilePicker extends WindowedUI {
    static DEFAULT_CONFIGURATION = {
        title: "",
        text: "",
        home: "",
        onSelect:() => {},
        onCancel:() => {},
        multiple: false,
        selectFiles: true,
        selectFolders: true
    }

    static INTERFACE_CONFIGURATION = {
        insertable: false,
        iconID: null,
        name: "File Tree Picker Interface window Node",
        defaultFavourite: -1
    }


    constructor(configuration= FilePicker.DEFAULT_CONFIGURATION) {
        configuration = {...FilePicker.DEFAULT_CONFIGURATION, ...configuration};
        const title = configuration.title ? configuration.title : "Pick a " + configuration.selectFolders ? "folder" : "file";
        configuration.index = generateUUID();
        const content = FilePicker._getContentElement(configuration.text, configuration.home, configuration.index);
        super({title, content});
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

    static _getContentElement(text, root, index){
        // Create the section container
        let sectionContainer = document.createElement('div')
        sectionContainer.className = 'header-content-footer';
        // Create a div element to show the root directory name
        const rootContainer = document.createElement('div');
        rootContainer.innerText = root;
        rootContainer.className = "content-sticky-header"
        // Create a div element to host the filesystem tree
        const textContainer = document.createElement('div');
        textContainer.innerText = text;
        textContainer.className = "metadata-container";
        const treeContainer = document.createElement('div');
        treeContainer.id = `filePickerTreeContainer-${index}`;
        const mainContainer = document.createElement('div');
        mainContainer.style.height = "100%";
        mainContainer.id = `filePickerMainContainer-${index}`;
        mainContainer.append(textContainer, treeContainer)
        // Creates a div element for the footer
        const footerContainer = document.createElement('div');
        footerContainer.className = "content-sticky-footer"
        sectionContainer.append(rootContainer, mainContainer, footerContainer)
        return sectionContainer;
    }

    _initialize(home, index){
        this.anchorForce = 1;
        this.toggleWindowAnchored(true);
        // this.windowDiv.style.maxHeight =  "600px";

        this.draw();
        this.index = index;

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
        const treeElementID = `filePickerTreeContainer-${this.index}`
        const containerID = `filePickerMainContainer-${this.index}`
        let treeContainer = document.getElementById(treeElementID);
        let mainContainer = document.getElementById(containerID);
        WindowedNode.makeContentScrollable(mainContainer, true)
        this.innerContent.style.width = "100%";
        this.innerContent.style.height = "100%";

        let initLoaderContainer = document.createElement("div");
        initLoaderContainer.className = "loader-container";
        let initLoader = document.createElement("div");
        initLoader.className = "loader";
        initLoaderContainer.append(initLoader);
        treeContainer.append(initLoaderContainer);

        createFilePickerFSTree(treeElementID, home, this.multiple, this.selectFiles, this.selectFolders, function makeTreeScrollable(){
            for (let liElement of Object.values(this.liElementsById)) {
                WindowedNode.makeContentScrollable(liElement);
                let ulElement = liElement.querySelector("ul.treejs-nodes");
                if(ulElement) WindowedNode.makeContentScrollable(ulElement);
            }
        }).then((fileSystemTree) => {
            initLoaderContainer.remove()
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
