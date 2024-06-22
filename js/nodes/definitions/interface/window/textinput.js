
class TextInput extends WindowedUI {
    static DEFAULT_CONFIGURATION = {
        title: "",
        message: "",
        multiline: false,
        onConfirm:() => {},
        onCancel:() => {},
    }

    static INTERFACE_CONFIGURATION = {
        insertable: false,
        iconID: null,
        name: "Text input Interface window Node",
        defaultFavourite: -1
    }


    constructor(configuration= TextInput.DEFAULT_CONFIGURATION) {
        configuration = {...TextInput.DEFAULT_CONFIGURATION, ...configuration};
        const title = configuration.title ? configuration.title : "Insert text";
        configuration.index = generateUUID();
        const content = TextInput._getContentElement(configuration.message, configuration.multiline, configuration.index);
        super({title, content});
        this.innerContent.style.width = "100%";
        this.onConfirm = configuration.onConfirm;
        this.onCancel = configuration.onCancel;
        this._initialize(configuration.index);

    }

    onDelete(){
        this.onCancel();
        super.onDelete();
    }

    static _getContentElement(message, multiline, index ){
        // Create the section container
        let sectionContainer = document.createElement('div')
        sectionContainer.className = 'header-content-footer';
        // Create a div element to show the root directory name
        const rootContainer = document.createElement('div');
        rootContainer.innerText = message;
        rootContainer.className = "content-sticky-header"
        // Create a div element to host the filesystem tree
        const bodyContainer = document.createElement('div');
        bodyContainer.style.height = "100%";
        bodyContainer.className = "content-container"

        let input;
        if(multiline) {
            input = document.createElement('textarea')
            input.className = "custom-textarea"
        } else{
            input = document.createElement('input')
            input.type = "text"
        }
        input.id = `textInput-${index}`;
        input.style.width = "100%";
        bodyContainer.append(input)
        // Creates a div element for the footer
        const footerContainer = document.createElement('div');
        footerContainer.className = "content-sticky-footer"
        sectionContainer.append(rootContainer, bodyContainer, footerContainer)
        return sectionContainer;
    }

    _initialize(index){
        this.anchorForce = 1;
        this.toggleWindowAnchored(true);
        this.setMinSize(420, 260);
        this.index = index;

        const footerContainer = this.innerContent.querySelector(".content-sticky-footer");

        let footerContainerLeftContainer = document.createElement("div");
        footerContainerLeftContainer.className = "footer-left-container";
        let footerContainerRightContainer = document.createElement("div");
        footerContainerRightContainer.className = "footer-right-container";

        let confirmTextInputButton = document.createElement("button");
        confirmTextInputButton.innerText = "OK";
        confirmTextInputButton.className = "footer-button";
        confirmTextInputButton.disabled = true;

        let cancelTextInputButton = document.createElement("button");
        cancelTextInputButton.innerText = "CANCEL";
        cancelTextInputButton.className = "footer-button";
        cancelTextInputButton.onclick = this.onDelete.bind(this);

        footerContainerLeftContainer.appendChild(cancelTextInputButton);
        footerContainerRightContainer.appendChild(confirmTextInputButton);
        footerContainer.appendChild(footerContainerLeftContainer);
        footerContainer.appendChild(footerContainerRightContainer);


        this.mouseAnchor = this.diagram.background.toDZ(new vec2(0, -this.content.offsetHeight / 2 + 6));
        const elementID = `textInput-${this.index}`
        let input = document.getElementById(elementID);
        input.addEventListener("input", () => {
            confirmTextInputButton.disabled = input.value.length <= 0;
        })

        confirmTextInputButton.onclick = () => {
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
