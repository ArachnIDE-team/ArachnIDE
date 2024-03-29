
class WindowedNode extends Node {
    static DEFAULT_CONFIGURATION = {
        title: "",
        content: undefined,
        pos: undefined,
        scale: undefined,
        intrinsicScale: undefined,
        link: undefined, // probably useless
        addCloseButton: true,
        addFullScreenButton: true,
        addCollapseButton: true,
        addSettingsButton: true,
        addFileButton: true,
        saved: undefined,
        saveData: undefined
    }
    static SAVE_PROPERTIES = ['title', 'addCloseButton', 'addFullScreenButton', 'addCollapseButton', 'addSettingsButton', 'addFileButton', 'width', 'height'];
    // constructor(title, content, pos, scale, iscale, link) {
    constructor(configuration= WindowedNode.DEFAULT_CONFIGURATION) {
        configuration = {...WindowedNode.DEFAULT_CONFIGURATION, ...configuration}

        // if (!Array.isArray(content)) {
        //     content = [content];
        // }
        // const windowElement = configuration.content?.dataset?.init === "window" ? configuration.content : WindowedNode._createWindow(configuration.title, configuration.content);
        const windowElement = configuration.saved ?
                                configuration.content?.dataset?.init === "window" ?
                                    configuration.content :
                                    WindowedNode._createWindow(configuration.saveData.json.title || configuration.title, configuration.content) :
                                WindowedNode._createWindow(configuration.title, configuration.content);
        super({pos: configuration.pos, content: windowElement, scale: configuration.scale, intrinsicScale: configuration.intrinsicScale || new vec2(1, 1), saved: configuration.saved, saveData: configuration.saveData});
        this.title = configuration.title;
        this.addCloseButton = configuration.addCloseButton;
        this.addFullScreenButton = configuration.addFullScreenButton;
        this.addCollapseButton = configuration.addCollapseButton;
        this.addSettingsButton = configuration.addSettingsButton;
        this.addFileButton = configuration.addFileButton;
        this.rewindowify();
    }
    static makeContentScrollable(content, addScrollbar=false){
        if(addScrollbar){
            content.style.overflowY = "scroll";
            content.classList.add("custom-scrollbar");
        } else {
            content.classList.add("scrollable-content");
        }
    }

    static getNaturalScaleParameters(scale = 1, nscale_mult = 1){
        return {
            pos: background.toZ(background.mousePos),
            scale: nscale_mult * (background.zoom.mag2() ** settings.zoomContentExp),
            intrinsicScale: scale
        };
    }
    // static getNaturalScaleParameters(scale = 1, nscale_mult = 1){
    //     return [toZ(mousePos), nscale_mult * (zoom.mag2() ** settings.zoomContentExp), scale]
    // }


    get width() {
        return this.getWindowSize()[0];
    }

    set width(v) {
        if(this.initialized){
            this.windowDiv.style.maxWidth = `${v}px`;
            this.windowDiv.style.width = `${v}px`;
        } else {
            this.addAfterInitCallback(() => {
                this.windowDiv.style.maxWidth = `${v}px`;
                this.windowDiv.style.width = `${v}px`;
            })
        }
    }
    get height() {
        return this.getWindowSize()[1];
    }

    set height(v) {
        if(this.initialized){
            this.windowDiv.style.height = `${v}px`;
        } else {
            this.addAfterInitCallback(() => {
                this.windowDiv.style.height = `${v}px`;
            })
        }
    }



    static _createWindow(title, content) {
        let odiv = document.createElement('div');
        let div = document.createElement('div');
        let buttons = document.getElementById("elements").children[0];
        let dropdown = document.querySelector('.dropdown');
        let w = buttons.cloneNode(true);
        // w.className = 'button-container';
        w.setAttribute('class', 'button-container');

        // Create a header container for buttons and title input
        let headerContainer = document.createElement('div');
        headerContainer.className = 'header-container';
        headerContainer.appendChild(w);

        div.appendChild(headerContainer);
        odiv.appendChild(div);

        let innerContent = document.createElement('div');
        innerContent.className = 'content';
        for (let c of content) {
            innerContent.appendChild(c);
        }
        div.appendChild(innerContent);

        odiv.setAttribute("data-init", "window");
        div.setAttribute("class", "window");

        // Add the title input to the header container
        let titleInput = document.createElement('input');
        titleInput.setAttribute('type', 'text');
        titleInput.setAttribute('value', title);
        titleInput.className = 'title-input';
        headerContainer.appendChild(titleInput);

        // Add resize container and handle
        let resizeContainer = document.createElement('div');
        resizeContainer.className = 'resize-container';
        div.appendChild(resizeContainer);

        let resizeHandle = document.createElement('div');
        resizeHandle.className = 'resize-handle';
        resizeContainer.appendChild(resizeHandle);

        return odiv;
    }

    rewindowify() {

        // Initialize window properties
        this._initWindow();


        let w = this.content;

        let buttonPosition = new vec2(1, 1);
        const buttonDistance = new vec2(20, 0);

        let deleteButton = w.querySelector("#button-delete");
        if(this.addCloseButton || this.addCloseButton === undefined){ // retro-compatibility for saves
            deleteButton.classList.add('windowbutton');
            deleteButton.setAttribute("transform", "scale(0.125 0.125) translate(" + buttonPosition.x + " " + buttonPosition.y + ")");
            buttonPosition = buttonPosition.cadd(buttonDistance)
        } else {
            if(deleteButton) deleteButton.remove()
        }

        let fullScreenButton = w.querySelector("#button-fullscreen");
        if(this.addFullScreenButton || this.addFullScreenButton === undefined){ // retro-compatibility for saves
            fullScreenButton.classList.add('windowbutton');
            fullScreenButton.setAttribute("transform", "scale(0.125 0.125) translate(" + buttonPosition.x + " " + buttonPosition.y + ")");
            buttonPosition = buttonPosition.cadd(buttonDistance)
        } else {
            if(fullScreenButton) fullScreenButton.remove()
        }

        let collapseButton = w.querySelector("#button-collapse");
        if(this.addCollapseButton || this.addCollapseButton === undefined){ // retro-compatibility for saves
            collapseButton.classList.add('windowbutton');
            collapseButton.setAttribute("transform", "scale(0.125 0.125) translate(" + buttonPosition.x + " " + buttonPosition.y + ")");
            buttonPosition = buttonPosition.cadd(buttonDistance)
        } else {
            if(collapseButton) collapseButton.remove()
        }

        let settingsButton = w.querySelector("#button-settings");
        if(this.addSettingsButton || this.addSettingsButton === undefined){ // retro-compatibility for saves
            settingsButton.classList.add('windowbutton');
            settingsButton.setAttribute("transform", "scale(0.125 0.125) translate(" + buttonPosition.x + " " + buttonPosition.y + ")");
            buttonPosition = buttonPosition.cadd(buttonDistance)
        } else {
            if(settingsButton) settingsButton.remove()
        }

        let fileButton = w.querySelector("#button-file");
        if(this.addFileButton || this.addFileButton === undefined){ // retro-compatibility for saves
            fileButton.classList.add('windowbutton');
            fileButton.setAttribute("transform", "scale(0.125 0.125) translate(" + buttonPosition.x + " " + buttonPosition.y + ")");
        } else {
            if(fileButton) fileButton.remove()
        }

        let numberOfButtons = (this.addCloseButton || this.addCloseButton === undefined) +
            (this.addFullScreenButton || this.addFullScreenButton === undefined) +
            (this.addCollapseButton || this.addCollapseButton === undefined) +
            (this.addSettingsButton || this.addSettingsButton === undefined) +
            (this.addFileButton || this.addFileButton === undefined);


        let buttonContainer = this.windowDiv.querySelector(".header-container > svg.button-container");
        if(buttonContainer) buttonContainer.setAttribute("viewBox" , "0 0 " + (numberOfButtons * 2.5 + 1) + " 2.125")
        let titleInput = this.titleInput;

        function setWindowButtonAttributes(buttonElement, key, attribute = "fill") {
            buttonElement.children[0].setAttribute("fill", settings.buttonGraphics[key][0]);
            buttonElement.children[1].setAttribute(attribute, settings.buttonGraphics[key][1]);
        }

        function initializeWindowButton(buttonElement, onclick = (() => { }), attribute = "fill") {
            buttonElement.onmouseenter = (event) => {
                setWindowButtonAttributes(buttonElement, "hover", attribute);
            };
            buttonElement.onmouseleave = (event) => {
                // Check if title input is focused and set the state accordingly
                if (titleInput.matches(':focus')) {
                    setWindowButtonAttributes(buttonElement, "focus", attribute);  // Use the "focus" state when title input is focused
                } else {
                    setWindowButtonAttributes(buttonElement, "initial", attribute); // Otherwise, use the "initial" state
                }
                buttonElement.ready = false;
            };
            buttonElement.onmousedown = (event) => {
                setWindowButtonAttributes(buttonElement, "click", attribute);
                buttonElement.ready = true;
                cancel(event);
            }
            buttonElement.onmouseup = (event) => {
                setWindowButtonAttributes(buttonElement, "initial", attribute);
                cancel(event);
                if (buttonElement.ready) {
                    onclick(event);
                }
            }
            buttonElement.onmouseleave();
        }

        if(this.addCloseButton) initializeWindowButton(deleteButton, this.onDelete.bind(this));
        if(this.addFullScreenButton) initializeWindowButton(fullScreenButton, this.onFullScreen.bind(this));
        if(this.addCollapseButton) initializeWindowButton(collapseButton, this.onCollapse.bind(this), "stroke");
        if(this.addSettingsButton) initializeWindowButton(settingsButton,this.onSettings.bind(this));
        if(this.addFileButton) initializeWindowButton(fileButton,this.onFiles.bind(this));

        // Add the "mouseup" event listener to the document
        document.addEventListener('mouseup', () => {
            if (this.followingMouse) {
                this.stopFollowingMouse();
            }
        });




        // Add focus and blur event listeners to the title input
        if (titleInput) {
            titleInput.addEventListener('focus', () => {
                this._updateSvgStrokeColor(true);
            });

            titleInput.addEventListener('blur', () => {
                this._updateSvgStrokeColor(false);
            });
        }


        return this;
    }

    onCollapse(event) {
        toggleNodeState(this, myCodeMirror, event);
    }

    onFullScreen() {
            this.zoom_to_fit();
        rootDiagram.autopilot.zoomTo = rootDiagram.autopilot.zoomTo.scale(1.0625);
        rootDiagram.autopilot.speed = settings.autopilotSpeed;
            scrollToTitle(this.getTitle(), noteInput); // Use the getTitle method
    }

    onDelete() {
        const title = this.getTitle();
        if (rootDiagram.prevNodeToConnect === this) {
            rootDiagram.prevNodeToConnect = undefined;
            background.mousePath = "";
            background.svg_mousePath.setAttribute("d", "");
        }
        this.remove();
        // Delete the this from CodeMirror
        deleteNodeByTitle(title);
    }

    onSettings(){

    }

    onFiles(){
        new NodeFilesUI({node: this})
    }

    setMinSize(minWidth, minHeight) {
        if(!minHeight) minHeight = Math.ceil(minWidth * 1.618); // Defaults to the golden ratio
        this.innerContent.style.minWidth = minWidth + "px"
        this.innerContent.style.minHeight = (minHeight - 35) + "px"
        this.windowDiv.style.height = minHeight + "px";
        this.windowDiv.style.width = minWidth + "px";
    }

    _initWindow() {
        // Initialize window properties
        this.headerContainer = this.content.querySelector('.header-container');
        this.windowDiv = this.content.querySelector(".window");
        this.innerContent = this.windowDiv.querySelector('.content');
        this.dropdown = document.querySelector('.dropdown');
        this.wrapperDivs = document.getElementsByClassName('wrapperDiv');
        this.titleInput = this.content.querySelector('.title-input');
        // Setup event listeners
        this._setupEventListeners();
    }

    _setupEventListeners() {
        // Add event listeners for window interactions
        this._setupResizeHandleListeners();
        this._setupHeaderContainerListeners();
        this._setupWindowDivListeners();
        this._setupTitleInputListeners();
        this.observeContentResize(this.innerContent, this.windowDiv);
    }

    _setupResizeHandleListeners() {
        this._setResizeEventListeners(this.content.querySelector('.resize-handle'));
        this._setResizeEventListeners(this.windowDiv.querySelector('.resize-handle'));
    }

    _setResizeEventListeners(resizeHandle) {
        const inverse2DMatrix = (matrix) => {
            const det = matrix[0] * matrix[3] - matrix[1] * matrix[2];
            if (det === 0) {
                return null;
            }
            const invDet = 1 / det;
            return [
                matrix[3] * invDet,
                -matrix[1] * invDet,
                -matrix[2] * invDet,
                matrix[0] * invDet,
            ];
        };

        const getDivInverseTransformMatrix = (div) => {
            const transform = window.getComputedStyle(div).transform;
            if (transform === 'none') {
                return [1, 0, 0, 1];
            }
            const matrix = transform
                .split('(')[1]
                .split(')')[0]
                .split(',')
                .map(parseFloat)
                .slice(0, 4);
            return inverse2DMatrix(matrix);
        };

        let windowDiv = this.windowDiv;



        let startX;
        let startY;
        let startWidth;
        let startHeight;

        let isMouseMoving = false;

        const handleMouseMove = (event) => {
            if (!event.buttons) {
                handleMouseUp();
                return;
            }
            isMouseMoving = true;

            // Extract scaling factors from the accumulated transform matrix
            const {
                scaleX,
                scaleY
            } = WindowedNode._extractScalingFactors(windowDiv);

            // Calculate the change in position of the mouse considering the scaling factors
            const dx = 2 * (event.pageX - startX) / scaleX;
            const dy = 2 * (event.pageY - startY) / scaleY;
            this.applyResize(startWidth, dx, startHeight, dy);
        };

        const handleMouseUp = () => {
            isMouseMoving = false;
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = 'auto'; // Reset the cursor style
            this.onMouseUp();
        };

        resizeHandle.addEventListener('mousedown', (event) => {
            event.preventDefault();
            event.stopPropagation();
            startX = event.pageX;
            startY = event.pageY;
            [startWidth, startHeight] = this.getWindowSize();
            isMouseMoving = true; // Flag to indicate that a resize operation is in progress
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            this.onMouseDown();
        });
    }

    getWindowSize() {
        let startWidth = parseInt(document.defaultView.getComputedStyle(this.windowDiv).width, 10);
        let startHeight = parseInt(document.defaultView.getComputedStyle(this.windowDiv).height, 10);
        return [startWidth, startHeight];
    }

    applyResize(startWidth, dx, startHeight, dy) {
        const content = this.innerContent;
        const minWidth = content ?
            (content.style.minWidth !== '' ?
                Number.parseInt(content.style.minWidth) :
                Number.parseInt(content.offsetWidth)) :
            100;
        const minHeight = content ?
            (content.style.minHeight !== '' ?
                Number.parseInt(content.style.minHeight) + 35 :
                Number.parseInt(content.offsetHeight)) + 35 :
            100;
        const newWidth = Math.max(startWidth + dx, minWidth);
        const newHeight = Math.max(startHeight + dy, minHeight);
        this.onResize(newWidth, newHeight);
    }

    onMouseDown() {
        // override in WebEditorNode
    }

    onMouseUp() {
        // override in WebEditorNode
    }

    onResize(newWidth, newHeight) {
        this.windowDiv.style.maxWidth = `${newWidth}px`;
        this.windowDiv.style.width = `${newWidth}px`;
        this.windowDiv.style.height = `${newHeight}px`;
    }

    static _extractScalingFactors(element) {
        const rect = element.getBoundingClientRect();
        const style = window.getComputedStyle(element);
        const width = parseFloat(style.width);
        const height = parseFloat(style.height);

        if (width === 0 || height === 0) {
            return {
                scaleX: 1,
                scaleY: 1
            };
        }

        const scaleX = rect.width / width;
        const scaleY = rect.height / height;

        return {
            scaleX,
            scaleY
        };
    }

    _setupHeaderContainerListeners() {
        this.headerContainer.onmousedown = function (event) {
            if (event.altKey) {
                cancel(event); // Prevent dragging if Alt key is pressed
            }
        };
    }

    _setupWindowDivListeners() {
        const windowDiv = this.windowDiv;
        const dropdown = this.dropdown;
        const wrapperDivs = this.wrapperDivs;

        windowDiv.addEventListener('click', (event) => {
            event.stopPropagation();
            if (event.ctrlKey) {
                rootDiagram.toggleNodeSelection(this);
            }
        });

        windowDiv.addEventListener('mousedown', () => {
            rootDiagram.autopilot.speed = 0;
            dropdown.classList.add('no-select');
            Array.from(wrapperDivs).forEach(div => div.classList.add('no-select'));
        });

        windowDiv.addEventListener('mouseup', () => {
            dropdown.classList.remove('no-select');
            Array.from(wrapperDivs).forEach(div => div.classList.remove('no-select'));
        });

        window.addEventListener('mouseup', () => {
            dropdown.classList.remove('no-select');
            Array.from(wrapperDivs).forEach(div => div.classList.remove('no-select'));
        });
    }

    _setupTitleInputListeners() {
        let isDragging = false;
        let isMouseDown = false;

        this.titleInput.addEventListener('paste', (event) => event.stopPropagation());

        this.titleInput.addEventListener('mousedown', () => { isMouseDown = true; });

        this.titleInput.addEventListener('mousemove', (event) => {
            if (isMouseDown) { isDragging = true; }
            if (isDragging && !altHeld) {
                this.titleInput.selectionStart = this.titleInput.selectionEnd; // Reset selection
            }
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
            isMouseDown = false;
        });

        this.titleInput.addEventListener('mouseleave', () => { isDragging = false; });
    }

    observeContentResize(windowDiv, iframeWrapper, displayWrapper) {
        const resizeObserver = new ResizeObserver((entries) => {
            for (let entry of entries) {
                const {
                    width,
                    height
                } = entry.contentRect;

                // Find the buttonsWrapper inside windowDiv
                const buttonsWrapper = windowDiv.querySelector(".buttons-wrapper");

                if (buttonsWrapper) {
                    // Calculate the available height for the iframes
                    let buttonsHeight = buttonsWrapper.offsetHeight || 0;
                    let iframeHeight = Math.max(0, height - buttonsHeight - 50); // Subtract additional margin

                    // Update the width and height of iframeWrapper and displayWrapper
                    iframeWrapper.style.width = width + "px";
                    iframeWrapper.style.height = iframeHeight + "px";
                    displayWrapper.style.width = width + "px";
                    displayWrapper.style.height = iframeHeight + "px";
                }
            }
        });

        resizeObserver.observe(windowDiv);
    }

    // Function to update SVG fill or stroke color based on focus
    _updateSvgStrokeColor(focused) {
        let fillColor = focused ? settings.buttonGraphics.focus[1] : settings.buttonGraphics.initial[1];
        let strokeColor = focused ? settings.buttonGraphics.focus[1] : settings.buttonGraphics.initial[1];

        let del = this.content.querySelector("#button-delete");
        let fs = this.content.querySelector("#button-fullscreen");
        let col = this.content.querySelector("#button-collapse");
        let sett = this.content.querySelector("#button-settings");

        if(this.addCloseButton) del.children[1].setAttribute('fill', fillColor);
        if(this.addFullScreenButton) fs.children[1].setAttribute('fill', fillColor);
        if(this.addCollapseButton) col.children[1].setAttribute('stroke', strokeColor);
        if(this.addSettingsButton) sett.children[1].setAttribute('fill', fillColor);
    }


    toggleWindowAnchored(anchored) {
        let windowDiv = this.content.querySelector('.window');
        if (windowDiv && !windowDiv.collapsed) { // Check if not collapsed
            if (anchored) {
                windowDiv.classList.add("window-anchored");
            } else {
                windowDiv.classList.remove("window-anchored");
            }
        }
    }

    ondblclick(event) {
        super.ondblclick(event)
        this.toggleWindowAnchored(this.anchorForce === 1);
    }

    afterInit() {
        super.afterInit();
        let [startWidth, startHeight] = this.getWindowSize();
        this.applyResize(startWidth, 0, startHeight, 0);
    }

    save(){
        let saveObj = super.save();
        saveObj.title = this.title;
        return saveObj;
    }
}

// DONE (Used by WindowedNode)
function registernode(node) {
    let id = rootDiagram.nodes.length;
    let div = node.content;
    /*div.setAttribute("onclick","(e)=>nodes["+id+"].onclick(e)");
    div.setAttribute("onmousedown","(e)=>nodes["+id+"].onmousedown(e)");
    div.setAttribute("onmouseup","(e)=>nodes["+id+"].onmouseup(e)");
    div.setAttribute("onmousemove","(e)=>nodes["+id+"].onmousemove(e)");*/
    rootDiagram.nodes.push(node);
    rootDiagram.nodeMap[node.uuid] = node;
}

function posToLeftTop(element, pos, scale){
    let svgbb = background.svg.getBoundingClientRect();
    pos = background.fromZtoUV(pos);
    let hide = pos.minus(new vec2(0.5, 0.5)).mag2() > 16;
    let w = Math.min(svgbb.width, svgbb.height);
    let off = svgbb.width < svgbb.height ? svgbb.right : svgbb.bottom;
    pos.x = w * pos.x - (off - svgbb.right) / 2;
    pos.y = w * pos.y - (off - svgbb.bottom) / 2;
    let bb = element.getBoundingClientRect();
    pos = pos.minus(new vec2(bb.width, bb.height).scale(0.5 / scale));
    return {pos, hide};
}
// used in interfaces_v2 Node.draw method
function put(element, p, scale = 1) {
    element.style.position = "absolute";
    element.style.transform = "scale(" + scale + "," + scale + ")";
    let {pos, hide} = posToLeftTop(element, p, scale);
    if (hide) {
        element.style.display = "none";
    } else {
        element.style.display = "initial";
    }
    element.style.left = pos.x + "px";
    element.style.top = pos.y + "px";

}
