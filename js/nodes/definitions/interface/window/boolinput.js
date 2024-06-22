
class BoolInput extends WindowedUI {
    static DEFAULT_CONFIGURATION = {
        title: "",
        message: "",
        confirmButtons: {
            "OK": () => {}
        },
        cancelButtons: {
            "CANCEL": () => {}
        },
    }

    static INTERFACE_CONFIGURATION = {
        insertable: false,
        iconID: null,
        name: "Text input Interface window Node",
        defaultFavourite: -1
    }


    constructor(configuration= BoolInput.DEFAULT_CONFIGURATION) {
        configuration = {...BoolInput.DEFAULT_CONFIGURATION, ...configuration};
        configuration.confirmButtons = Object.keys(configuration).includes("confirmButtons") ?
            configuration.confirmButtons :
            BoolInput.DEFAULT_CONFIGURATION.confirmButtons;
        configuration.cancelButtons = Object.keys(configuration).includes("cancelButtons") ?
            configuration.cancelButtons :
            BoolInput.DEFAULT_CONFIGURATION.cancelButtons;
        const title = configuration.title ? configuration.title : "Insert text";
        const content = BoolInput._getContentElement(configuration.message);
        super({title, content});
        this.innerContent.style.width = "100%";
        this._initialize(configuration.confirmButtons, configuration.cancelButtons);
    }

    // onDelete(){
    //     super.onDelete();
    // }

    static _getContentElement(message) {
        // Create the section container
        let sectionContainer = document.createElement('div')
        sectionContainer.className = 'header-content-footer';
        // Create a div element to show the root directory name
        const rootContainer = document.createElement('div');
        rootContainer.className = "content-sticky-header"
        // Create a div element to host the filesystem tree
        const bodyContainer = document.createElement('div');
        bodyContainer.style.height = "100%";
        bodyContainer.innerText = message;
        bodyContainer.className = "content-container"

        // Creates a div element for the footer
        const footerContainer = document.createElement('div');
        footerContainer.className = "content-sticky-footer"
        sectionContainer.append(rootContainer, bodyContainer, footerContainer)
        return sectionContainer;
    }

    _initialize(confirmHandlers, cancelHanlders){
        this.anchorForce = 1;
        this.toggleWindowAnchored(true);
        this.setMinSize(420, 260);

        const footerContainer = this.innerContent.querySelector(".content-sticky-footer");

        let footerContainerLeftContainer = document.createElement("div");
        footerContainerLeftContainer.className = "footer-left-container";
        let footerContainerRightContainer = document.createElement("div");
        footerContainerRightContainer.className = "footer-right-container";
        let confirmButtons = [];
        for(let confirmText of Object.keys(confirmHandlers)){
            let confirmBoolInputButton = document.createElement("button");
            confirmBoolInputButton.innerText = confirmText;
            confirmBoolInputButton.className = "footer-button";
            confirmBoolInputButton.onclick = () => {
                confirmHandlers[confirmText].call()
                this.onDelete.bind(this).call();
            }
            confirmButtons.push(confirmBoolInputButton);
        }
        let cancelButtons = [];
        for(let cancelText of Object.keys(cancelHanlders)) {
            let cancelBoolInputButton = document.createElement("button");
            cancelBoolInputButton.innerText = cancelText;
            cancelBoolInputButton.className = "footer-button";
            cancelBoolInputButton.onclick = () => {
                cancelHanlders[cancelText].call()
                this.onDelete.bind(this).call();
            }
            cancelButtons.push(cancelBoolInputButton);
        }

        footerContainerLeftContainer.append(...cancelButtons);
        footerContainerRightContainer.append(...confirmButtons);
        footerContainer.appendChild(footerContainerLeftContainer);
        footerContainer.appendChild(footerContainerRightContainer);

        this.mouseAnchor = this.diagram.background.toDZ(new vec2(0, -this.content.offsetHeight / 2 + 6));

        this.innerContent.style.width = "100%";
        this.innerContent.style.height = "100%";
        this.afterInit();
    }

    afterInit() {
        super.afterInit();
    }
}
