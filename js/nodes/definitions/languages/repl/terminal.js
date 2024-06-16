class TerminalNode extends WindowedNode {
    static DEFAULT_CONFIGURATION = {
        name: "",
        settings: {
            language : "",
            lines: [],
            libURL: "",
            showHint: false,
            showHintFunction: "",
            version: ""
        },
        saved: undefined,
        saveData: undefined
    }

    static SAVE_PROPERTIES = ['settings'];

    static INTERFACE_CONFIGURATION = {
        insertable: false,
        iconID: "terminal-icon-symbol",
        name: "Terminal Node",
        defaultFavourite: -1
    }

    constructor(configuration = TerminalNode.DEFAULT_CONFIGURATION){
        configuration = {...TerminalNode.DEFAULT_CONFIGURATION, ...configuration}
        configuration.index = configuration.saved ? configuration.saveData.json.index : generateUUID();
        configuration.content = TerminalNode._getContentElement(selectedWorkspacePath, configuration.index);
        if (!configuration.saved) {// Create TerminalNode
            super({...configuration,  title: configuration.name, addFileButton:false, ...WindowedNode.getNaturalScaleParameters() });
            this.followingMouse = 1;
        } else {// Restore TerminalNode
            super({...configuration,  title: configuration.name, addFileButton:false, scale: true})
        }
        this.diagram.addNode(this);
        this._initialize(configuration);
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
        const mainContainer = document.createElement('div');
        mainContainer.id = `terminalContainer-${index}`;
        mainContainer.style.height = "100%";
        // Creates a div element for the footer
        const footerContainer = document.createElement('div');
        footerContainer.className = "content-sticky-footer"
        // footerContainer.style.height = "fit-content"
        // footerContainer.style.height = "100%"
        sectionContainer.append(rootContainer, mainContainer, footerContainer)
        return [sectionContainer];
    }

    _initialize(configuration){
        this.anchorForce = 1;
        this.toggleWindowAnchored(true);

        this.draw();
        if(!configuration.saved){
            this.index = configuration.index;
            this.settings = configuration.settings;
            this.selectedFile = "";
        }
        this.setMinSize(630, 300)

        this.footerContainer = this.innerContent.querySelector(".content-sticky-footer");


        this.headerContainer = this.innerContent.querySelector(".content-sticky-header");
        if(!this.settings) {
            this.addAfterInitCallback(() => {
                this.headerContainer.innerText = "Language: " + this.settings.language + " (" + this.settings.version + ")";
            })
        }else{
            this.headerContainer.innerText = "Language: " + this.settings.language + " (" + this.settings.version + ")";
        }
        let footerContainerLeftContainer = document.createElement("div");
        footerContainerLeftContainer.className = "footer-left-container";
        footerContainerLeftContainer.style.marginLeft = "0"
        footerContainerLeftContainer.style.marginRight = "20px";

        let footerContainerRightContainer = document.createElement("div");
        footerContainerRightContainer.className = "footer-right-container";
        footerContainerRightContainer.style.right = "0"
        footerContainerRightContainer.style.marginRight = "20px";


        let instructionPrefix = document.createElement("span")
        instructionPrefix.innerText = "> ";
        instructionPrefix.style.paddingLeft = "5px";

        this.runButton = document.createElement("button");
        this.runButton.innerHTML = "RUN ᐅ";
        this.runButton.className = "footer-button";
        this.runButton.disabled = true;
        this.runButton.onclick = this.onSendInput.bind(this);


        footerContainerLeftContainer.appendChild(instructionPrefix);
        // footerContainerLeftContainer.appendChild(instructionInput);
        footerContainerRightContainer.appendChild(this.runButton);
        this.footerContainer.appendChild(footerContainerLeftContainer);
        this.footerContainer.appendChild(footerContainerRightContainer);


        this.mouseAnchor = this.diagram.background.toDZ(new vec2(0, -this.content.offsetHeight / 2 + 6));
        const elementID = `terminalContainer-${this.index}`
        let terminalContainer = document.getElementById(elementID);
        WindowedNode.makeContentScrollable(terminalContainer, true)


        this.innerContent.style.width = "100%";
        this.terminalPanel = new TerminalPanel({ container: "#" + elementID, ...configuration })
        // Better here as TerminalPanel might get reused for WindowedUI
        WindowedNode.makeContentScrollable(this.terminalPanel.content.editorWrapper)

        this.inputCodeLine = TerminalHTML.getCodeLine(this.terminalPanel.content.settings, false);
        // this.inputCodeLine.style.background = "#ffffff14";
        this.inputCodeLine.onload = () => {
            this.terminalPanel.content.resizeToContents(this.inputCodeLine)

            // this.innerContent.style.display = "flex";
            // this.innerContent.style.flexDirection = "column";
            this.innerContent.style.height = "100%";
            this.headerContainer.style.float = "inline-start";
            this.headerContainer.style.display = "inline-flex";
            this.headerContainer.style.minHeight = "30px";
            this.terminalPanel.container.style.flexGrow = "1";
            this.terminalPanel.container.style.display = "inline-block";
            this.footerContainer.style.float = "inline-end";
            this.footerContainer.style.display = "inline-flex";


            // this.inputCodeLine.contentWindow.codeEditor.doc.on("change", () => {
            // this.inputCodeLine.contentWindow.codeEditor.on("change", (e) => {
            this.inputCodeLine.contentWindow.codeEditor.on("change", () => {
                // console.log("Code editor change: ", e)
                // this.onResizeInput();
                setTimeout( this.onResizeInput.bind(this), IFRAME_LOAD_TIMEOUT)
                setTimeout( super.afterInit.bind(this), IFRAME_LOAD_TIMEOUT)
            })
            this.inputCodeLine.contentWindow.codeEditor.options.extraKeys["Ctrl-Enter"] = () => {
                // console.log("Code editor CTRL-Enter")
                this.onSendInput();
            }
            this.onResizeInput();
        }

        footerContainerLeftContainer.appendChild(this.inputCodeLine);
    }

    onSendInput(){
        let code = this.inputCodeLine.contentWindow.codeEditor.getValue().trim();
        if(code !== "") {
            this.inputCodeLine.contentWindow.codeEditor.setValue("");
            this.terminalPanel.content.addCodeLine(code)
            this.onEvaluate(code)
        }
        this.runButton.setAttribute("disabled", "true")

    }

    onEvaluate(code) {
        // override
    }


    onResizeInput(){
        this.terminalPanel.content.resizeToContents(this.inputCodeLine);
        if(this.inputCodeLine.contentWindow.codeEditor.getValue().trim() !== "") {
            this.runButton.removeAttribute("disabled")
        } else {
            this.runButton.setAttribute("disabled", "true")
        }
        // console.log("Resized to: " + this.inputCodeLine.style.height)
        let newHeight = Number.parseFloat(this.windowDiv.style.height)
        let newWidth = Number.parseFloat(this.windowDiv.style.width)
        this.onResize(newWidth, newHeight)
    }


    onResize(newWidth, newHeight) {
        super.onResize(newWidth, newHeight);

        const terminalContainer = this.windowDiv.querySelector(`#terminalContainer-${this.index}`);
        let iframeHeight = Number.parseFloat(this.inputCodeLine.style.height);
        let footerHeight = Math.max(30, iframeHeight)
        if (terminalContainer) {
            // Set the new dimensions for the editor wrapper div
            terminalContainer.style.width = `${newWidth}px`;
            // terminalContainer.style.height = `${newHeight - (footerHeight + 35)}px`;
            // this.footerContainer.style.height = `${footerHeight + 35}px`;
            this.footerContainer.style.minHeight = `${footerHeight + 6}px`;

            let inputDocument = this.inputCodeLine.contentDocument;
            let codeEditor = inputDocument.querySelector("#codeEditor");

            inputDocument.querySelector("#editor-wrapper").style.height = `${footerHeight}px`;
            codeEditor.style.height = `${footerHeight}px`;
            if(codeEditor.children[0]) codeEditor.children[0].style.height = `${footerHeight}px`;

            const editorWrappers = terminalContainer.querySelectorAll(".editorWrapperDiv")
            editorWrappers.forEach((wrapper) => {
                wrapper.style.width = `${newWidth - 15}px`
            });
        }
        // console.log("ON RESIZE", newWidth, newHeight, " footer height: " + footerHeight)

        // Resizes all inner code iFrames (probably useless)
        this.terminalPanel.content.resizeToContents();
    }

}

function createTerminalNode(name = '', settings=undefined) {
    return new TerminalNode({
        name,
        settings
    });
}