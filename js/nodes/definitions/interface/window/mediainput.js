
class MediaInput extends WindowedUI {
    static DEFAULT_CONFIGURATION = {
        title: "",
        message: "",
        image: true,
        audio: true,
        video: true,
        onConfirm:() => {},
        onCancel:() => {},
    }

    static INTERFACE_CONFIGURATION = {
        insertable: false,
        iconID: null,
        name: "Text input Interface window Node",
        defaultFavourite: -1
    }


    constructor(configuration= MediaInput.DEFAULT_CONFIGURATION) {
        configuration = {...MediaInput.DEFAULT_CONFIGURATION, ...configuration};
        const title = configuration.title ? configuration.title : "Insert media";
        configuration.index = generateUUID();
        const content = MediaInput._getContentElement(configuration.message, configuration.index);
        super({title, content});
        this.innerContent.style.width = "100%";
        this.onConfirm = configuration.onConfirm;
        this.onCancel = configuration.onCancel;
        this._initialize(configuration.index, configuration.image,configuration.audio,configuration.video, );

    }

    onDelete(){
        this.onCancel();
        super.onDelete();
    }

    static _getContentElement(message, index ){
        // Create the section container
        let sectionContainer = document.createElement('div')
        sectionContainer.className = 'header-content-footer';
        // Create a div element to show the root directory name
        const rootContainer = document.createElement('div');
        rootContainer.innerText = message;
        rootContainer.className = "content-sticky-header"

        // Create a div element to host the filesystem tree
        const bodyContainer = document.createElement('div');
        bodyContainer.className = "content-container media-input-body-container"
        let filePathMessageContainer = document.createElement('div');
        filePathMessageContainer.innerText = "Write media path:"
        let input = document.createElement('input')
        input.type = "text"
        input.id = `mediaPathInput-${index}`;
        input.style.width = "100%";
        let fileDropContainer =  document.createElement('div');
        fileDropContainer.innerText = "Drag the file here"
        fileDropContainer.className = "media-input-drop-panel"
        fileDropContainer.id = `mediaDropInput-${index}`;
        bodyContainer.append(filePathMessageContainer, input, fileDropContainer)
        // Creates a div element for the footer
        const footerContainer = document.createElement('div');
        footerContainer.className = "content-sticky-footer"
        sectionContainer.append(rootContainer, bodyContainer, footerContainer)
        return sectionContainer;
    }

    _initialize(index, image, audio, video, ){
        this.anchorForce = 1;
        this.toggleWindowAnchored(true);
        this.setMinSize(420, 260);
        this.index = index;

        const footerContainer = this.innerContent.querySelector(".content-sticky-footer");

        let footerContainerLeftContainer = document.createElement("div");
        footerContainerLeftContainer.className = "footer-left-container";
        let footerContainerRightContainer = document.createElement("div");
        footerContainerRightContainer.className = "footer-right-container";

        let confirmMediaInputButton = document.createElement("button");
        confirmMediaInputButton.innerText = "OK";
        confirmMediaInputButton.className = "footer-button";
        confirmMediaInputButton.disabled = true;

        let cancelMediaInputButton = document.createElement("button");
        cancelMediaInputButton.innerText = "CANCEL";
        cancelMediaInputButton.className = "footer-button";
        cancelMediaInputButton.onclick = this.onDelete.bind(this);

        footerContainerLeftContainer.appendChild(cancelMediaInputButton);
        footerContainerRightContainer.appendChild(confirmMediaInputButton);
        footerContainer.appendChild(footerContainerLeftContainer);
        footerContainer.appendChild(footerContainerRightContainer);


        this.mouseAnchor = this.diagram.background.toDZ(new vec2(0, -this.content.offsetHeight / 2 + 6));
        const inputID = `mediaPathInput-${this.index}`
        let input = document.getElementById(inputID);
        input.addEventListener("input", () => {
            confirmMediaInputButton.disabled = input.value.length <= 0;
        })
        let dropperID = `mediaDropInput-${this.index}`
        let dropper = document.getElementById(dropperID);
        dropper.addEventListener("dragover", (ev) => {
            ev.preventDefault();
            if(((ev.dataTransfer.items && Array.from(ev.dataTransfer.items).find((item) => item.kind === "file")) || ev.dataTransfer.files.length === 1) && !isDraggingIcon) {
                dropper.innerText = "DROP the file here";
            }
        })
        dropper.addEventListener("dragleave", (ev) => {
            dropper.innerText = "Drag the file here";
        })
        dropper.addEventListener("drop", (ev) => {
            dropper.innerText = "Drag the file here";
            if(((ev.dataTransfer.items && Array.from(ev.dataTransfer.items).find((item) => item.kind === "file")) || ev.dataTransfer.files.length === 1) && !isDraggingIcon) {
                // From handledrop.js
                let files = getDroppedFiles(ev);
                if (files.length === 1){
                    console.log("SELECTED FILE: ", files[0])
                    let selectedFile = files[0];
                    let reader = new FileReader();
                    // From handledrop.js
                    let baseType = getFileBaseType(selectedFile);
                    let url = URL.createObjectURL(selectedFile);
                    console.log("loading " + baseType);
                    switch (baseType) {
                        case "image":
                            if(image) {
                                input.value = url;
                                confirmMediaInputButton.disabled = false;
                            }
                            break;
                        case "audio":
                            if(audio) {
                                input.value = url;
                                confirmMediaInputButton.disabled = false;
                            }
                            break;
                        case "video":
                            if(video) {
                                input.value = url;
                                confirmMediaInputButton.disabled = false;
                            }
                            break;
                    }
                }
            }
            ev.preventDefault();
        })
        confirmMediaInputButton.onclick = () => {
            this.onConfirm(input.value);
            super.onDelete();
        }

        this.innerContent.style.width = "100%";
        this.innerContent.style.height = "100%";
        this.afterInit();
    }

    afterInit() {
        super.afterInit();
    }
}
