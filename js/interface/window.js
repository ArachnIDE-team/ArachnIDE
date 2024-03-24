
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
            pos: toZ(mousePos),
            scale: nscale_mult * (zoom.mag2() ** settings.zoomContentExp),
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
            zoomTo = zoomTo.scale(1.0625);
            autopilotSpeed = settings.autopilotSpeed;
            scrollToTitle(this.getTitle(), noteInput); // Use the getTitle method
    }

    onDelete() {
        const title = this.getTitle();
        if (prevNode === this) {
            prevNode = undefined;
            mousePath = "";
            svg_mousePath.setAttribute("d", "");
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
                toggleNodeSelection(this);
            }
        });

        windowDiv.addEventListener('mousedown', () => {
            autopilotSpeed = 0;
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

    // save(){
    //     let node = super.save();
    //     let element = document.createElement("div")
    //     element.innerHTML = node.html;
    //     element.querySelector('div.header-container').remove()
    //     element.querySelector('div.resize-container').remove()
    //     node.html = element.querySelector('div.window').innerHTML;
    //     return node;
    // }
    save(){
        let saveObj = super.save();
        saveObj.title = this.title;
        return saveObj;
    }
}

// function addNodeAtNaturalScale(title, content, scale = 1, nscale_mult = 1, window_it = true) {
//     let node;
//     if (window_it) {
//         let pos = toZ(mousePos)
//
//         node = new WindowedNode(title, content, pos, nscale_mult * (zoom.mag2() ** settings.zoomContentExp), scale);
//         htmlnodes_parent.appendChild(node.content);
//     } else { // never used, maybe can be useful for constants
//         let div = document.createElement('div');
//         node = new Node(toZ(mousePos), div, nscale_mult * (zoom.mag2() ** settings.zoomContentExp), scale);
//         div.appendChild(content);
//         htmlnodes_parent.appendChild(div);
//     }
//     registernode(node)
//     return node;
// }

// DONE (Used by WindowedNode)
function registernode(node) {
    let id = nodes.length;
    let div = node.content;
    /*div.setAttribute("onclick","(e)=>nodes["+id+"].onclick(e)");
    div.setAttribute("onmousedown","(e)=>nodes["+id+"].onmousedown(e)");
    div.setAttribute("onmouseup","(e)=>nodes["+id+"].onmouseup(e)");
    div.setAttribute("onmousemove","(e)=>nodes["+id+"].onmousemove(e)");*/
    nodes.push(node);
    nodeMap[node.uuid] = node;
}

function posToLeftTop(element, pos, scale){
    let svgbb = svg.getBoundingClientRect();
    pos = fromZtoUV(pos);
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

// function put(e, p, s = 1) {
//     let svgbb = svg.getBoundingClientRect();
//     e.style.position = "absolute";
//     e.style.transform = "scale(" + s + "," + s + ")";
//     p = fromZtoUV(p);
//     if (p.minus(new vec2(0.5, 0.5)).mag2() > 16) {
//         e.style.display = "none";
//     } else {
//         e.style.display = "initial";
//     }
//     let w = Math.min(svgbb.width, svgbb.height);
//     let off = svgbb.width < svgbb.height ? svgbb.right : svgbb.bottom;
//     p.x = w * p.x - (off - svgbb.right) / 2;
//     p.y = w * p.y - (off - svgbb.bottom) / 2;
//     let bb = e.getBoundingClientRect();
//     p = p.minus(new vec2(bb.width, bb.height).scale(0.5 / s));
//     e.style.left = p.x + "px";
//     e.style.top = p.y + "px";
//
//
//     //e.style['margin-top'] = "-"+(e.offsetHeight/2)+"px";//"-50%";
//     //e.style['margin-left'] = "-"+(e.offsetWidth/2)+"px";//"-50%";
//     //e.style['vertical-align']= 'middle';
//     //e.style['text-align']= 'center';
//
// }

// used in interfaces_v2 Node.constructor method
// const NodeExtensions = {
//     "window": (node, a) => {
//         node.rewindowify();
//     },
//     "textarea": (node, o) => {
//         let e = node.content;
//         for (let w of o.p) {
//             e = e.children[w];
//         }
//         let p = o.p;
//         e.value = o.v;
//         node.push_extra_cb((n) => {
//             return {
//                 f: "textarea",
//                 a: {
//                     p: p,
//                     v: e.value
//                 }
//             };
//         });
//     },
// }

// // TODO replace with  "new WindowedNode"
// function windowify(title, content, pos, scale, iscale, link) {
//     let odiv = document.createElement('div');
//     let div = document.createElement('div');
//     let buttons = document.getElementById("elements").children[0];
//     let dropdown = document.querySelector('.dropdown');
//     let w = buttons.cloneNode(true);
//     w.className = 'button-container';
//
//     // Create a header container for buttons and title input
//     let headerContainer = document.createElement('div');
//     headerContainer.className = 'header-container';
//     headerContainer.appendChild(w);
//
//     div.appendChild(headerContainer);
//     odiv.appendChild(div);
//
//     let innerContent = document.createElement('div');
//     innerContent.className = 'content';
//     for (let c of content) {
//         innerContent.appendChild(c);
//     }
//     div.appendChild(innerContent);
//
//
//     odiv.setAttribute("data-init", "window");
//     div.setAttribute("class", "window");
//
//     // Add the title input to the header container
//     let titleInput = document.createElement('input');
//     titleInput.setAttribute('type', 'text');
//     titleInput.setAttribute('value', title);
//     titleInput.className = 'title-input';
//     headerContainer.appendChild(titleInput);
//
//     // Add resize container and handle
//     let resizeContainer = document.createElement('div');
//     resizeContainer.className = 'resize-container';
//     div.appendChild(resizeContainer);
//
//     let resizeHandle = document.createElement('div');
//     resizeHandle.className = 'resize-handle';
//     resizeContainer.appendChild(resizeHandle);
//
//
//     let node = new Node(pos, odiv, scale, iscale || new vec2(1, 1));
//
//     div.win = node;
//     return rewindowify(node);
// }
// // DONE (only called locally)
// function initWindow(node) {
//     let headerContainer = node.content.querySelector('.header-container');
//     node.headerContainer = headerContainer;
//
//     let windowDiv = node.content.querySelector(".window")
//     node.windowDiv = windowDiv;
//
//     let innerContent = node.windowDiv.querySelector('.content');
//     node.innerContent = innerContent;
//
//     const dropdown = document.querySelector('.dropdown');
//     node.dropdown = dropdown;
//
//     const wrapperDivs = document.getElementsByClassName('wrapperDiv');
//     node.wrapperDivs = wrapperDivs;
//
//
//     let resizeHandle = node.content.querySelector('.resize-handle');
//     setResizeEventListeners(resizeHandle, node);
//
//     let titleInput = node.content.querySelector('.title-input');
//     node.titleInput = titleInput;
//
//     addWindowEventListeners(node)
// }
// // DONE (only called locally)
// function addWindowEventListeners(node) {
//     setupHeaderContainerListeners(node.headerContainer);
//     setupWindowDivListeners(node);
//     setupTitleInputListeners(node.titleInput);
//     setupResizeHandleListeners(node);
//     observeContentResize(node.innerContent, node.windowDiv);
// }
// // DONE (only called locally)
// function setupHeaderContainerListeners(headerContainer) {
//     headerContainer.onmousedown = function (event) {
//         if (event.altKey) {
//             cancel(event); // Prevent dragging if Alt key is pressed
//         }
//     };
// }
//
// // DONE (only called locally)
// function setupWindowDivListeners(node) {
//     const windowDiv = node.windowDiv;
//     const dropdown = node.dropdown;
//     const wrapperDivs = node.wrapperDivs;
//
//     windowDiv.addEventListener('click', (event) => {
//         event.stopPropagation();
//         if (event.ctrlKey) {
//             toggleNodeSelection(node)
//         }
//     });
//
//     windowDiv.addEventListener('mousedown', () => {
//         autopilotSpeed = 0;
//         dropdown.classList.add('no-select');
//         Array.from(wrapperDivs).forEach(div => div.classList.add('no-select'));
//     });
//
//     windowDiv.addEventListener('mouseup', () => {
//         dropdown.classList.remove('no-select');
//         Array.from(wrapperDivs).forEach(div => div.classList.remove('no-select'));
//     });
//
//     window.addEventListener('mouseup', () => {
//         dropdown.classList.remove('no-select');
//         Array.from(wrapperDivs).forEach(div => div.classList.remove('no-select'));
//     });
// }
//
// // DONE (only called locally)
// function setupTitleInputListeners(titleInput) {
//     let isDragging = false;
//     let isMouseDown = false;
//
//     titleInput.addEventListener('paste', (event) => event.stopPropagation());
//
//     titleInput.addEventListener('mousedown', () => { isMouseDown = true; });
//
//     titleInput.addEventListener('mousemove', (event) => {
//         if (isMouseDown) { isDragging = true; }
//         if (isDragging && !altHeld) {
//             titleInput.selectionStart = titleInput.selectionEnd; // Reset selection
//         }
//     });
//
//     document.addEventListener('mouseup', () => {
//         isDragging = false;
//         isMouseDown = false;
//     });
//
//     titleInput.addEventListener('mouseleave', () => { isDragging = false; });
// }
//
// // DONE (only called locally)
// function setupResizeHandleListeners(node) {
//     const resizeHandle = node.windowDiv.querySelector('.resize-handle');
//     setResizeEventListeners(resizeHandle, node);
// }
//
// // DONE (only called locally)
// function rewindowify(node) {
//     initWindow(node)
//
//     node.push_extra("window");
//     let w = node.content;
//
//     let del = w.querySelector("#button-delete");
//     del.classList.add('windowbutton');
//
//     let fs = w.querySelector("#button-fullscreen");
//     fs.classList.add('windowbutton');
//
//     let col = w.querySelector("#button-collapse");
//     col.classList.add('windowbutton');
//
//     let titleInput = node.titleInput;
//
//     function set(e, v, s = "fill") {
//         e.children[0].setAttribute("fill", settings.buttonGraphics[v][0]);
//         e.children[1].setAttribute(s, settings.buttonGraphics[v][1]);
//     }
//
//     function ui(e, cb = (() => { }), s = "fill") {
//         e.onmouseenter = (ev) => {
//             set(e, "hover", s);
//         };
//         e.onmouseleave = (ev) => {
//             // Check if title input is focused and set the state accordingly
//             if (titleInput.matches(':focus')) {
//                 set(e, "focus", s);  // Use the "focus" state when title input is focused
//             } else {
//                 set(e, "initial", s); // Otherwise, use the "initial" state
//             }
//             e.ready = false;
//         };
//         e.onmousedown = (ev) => {
//             set(e, "click", s);
//             e.ready = true;
//             cancel(ev);
//         }
//         e.onmouseup = (ev) => {
//             set(e, "initial", s);
//             cancel(ev);
//             if (e.ready) {
//                 cb(ev);
//             }
//         }
//         e.onmouseleave();
//     }
//     ui(del, () => {
//         const title = node.getTitle();
//         if (prevNode === node) {
//             prevNode = undefined;
//             mousePath = "";
//             svg_mousePath.setAttribute("d", "");
//         }
//         node.remove();
//         // Delete the node from CodeMirror
//         deleteNodeByTitle(title);
//     });
//     ui(fs, (() => {
//         node.zoom_to_fit();
//         zoomTo = zoomTo.scale(1.0625);
//         autopilotSpeed = settings.autopilotSpeed;
//         scrollToTitle(node.getTitle(), noteInput); // Use the getTitle method
//     }));
//
//     ui(col, () => toggleNodeState(node, myCodeMirror, event), "stroke");
//
//     // Add the "mouseup" event listener to the document
//     document.addEventListener('mouseup', () => {
//         if (node.followingMouse) {
//             node.stopFollowingMouse();
//         }
//     });
//
//     // Function to update SVG fill or stroke color based on focus
//     function updateSvgStrokeColor(focused) {
//         let fillColor = focused ? settings.buttonGraphics.focus[1] : settings.buttonGraphics.initial[1];
//         let strokeColor = focused ? settings.buttonGraphics.focus[1] : settings.buttonGraphics.initial[1];
//
//         let del = node.content.querySelector("#button-delete");
//         let fs = node.content.querySelector("#button-fullscreen");
//         let col = node.content.querySelector("#button-collapse");
//
//         del.children[1].setAttribute('fill', fillColor);
//         fs.children[1].setAttribute('fill', fillColor);
//         col.children[1].setAttribute('stroke', strokeColor);
//     }
//
//
//     // Add focus and blur event listeners to the title input
//     if (titleInput) {
//         titleInput.addEventListener('focus', function () {
//             updateSvgStrokeColor(true);
//         });
//
//         titleInput.addEventListener('blur', function () {
//             updateSvgStrokeColor(false);
//         });
//     }
//
//
//     return node;
// }
//
//
// // TODO switch to WindowedNode
// // function addNodeAtNaturalScale(title, content, scale = 1, nscale_mult = 1, window_it = true) {
// //     let node;
// //     if (window_it) {
// //         let pos = toZ(mousePos)
// //         if (!Array.isArray(content)) {
// //             content = [content];
// //         }
// //         node = windowify(title, content, pos, nscale_mult * (zoom.mag2() ** settings.zoomContentExp), scale);
// //         htmlnodes_parent.appendChild(node.content);
// //     } else {
// //         let div = document.createElement('div');
// //         node = new Node(toZ(mousePos), div, nscale_mult * (zoom.mag2() ** settings.zoomContentExp), scale);
// //         div.appendChild(content);
// //         htmlnodes_parent.appendChild(div);
// //     }
// //     registernode(node)
// //     return node;
// // }
//
// // DONE (only called locally)
// function extractScalingFactors(element) {
//     const rect = element.getBoundingClientRect();
//     const style = window.getComputedStyle(element);
//     const width = parseFloat(style.width);
//     const height = parseFloat(style.height);
//
//     if (width === 0 || height === 0) {
//         return {
//             scaleX: 1,
//             scaleY: 1
//         };
//     }
//
//     const scaleX = rect.width / width;
//     const scaleY = rect.height / height;
//
//     return {
//         scaleX,
//         scaleY
//     };
// }
//
// // impact on responsiveness?
// //addEventListener("resize", (event) => { });
//
// var isPanning = false;
//
// // DONE (only called locally)
// function setResizeEventListeners(resizeHandle, node) {
//     const inverse2DMatrix = (matrix) => {
//         const det = matrix[0] * matrix[3] - matrix[1] * matrix[2];
//         if (det === 0) {
//             return null;
//         }
//         const invDet = 1 / det;
//         return [
//             matrix[3] * invDet,
//             -matrix[1] * invDet,
//             -matrix[2] * invDet,
//             matrix[0] * invDet,
//         ];
//     };
//
//     const getDivInverseTransformMatrix = (div) => {
//         const transform = window.getComputedStyle(div).transform;
//         if (transform === 'none') {
//             return [1, 0, 0, 1];
//         }
//         const matrix = transform
//             .split('(')[1]
//             .split(')')[0]
//             .split(',')
//             .map(parseFloat)
//             .slice(0, 4);
//         return inverse2DMatrix(matrix);
//     };
//
//     let windowDiv = node.windowDiv;
//     // Find these elements once and store them for later use.
//     const editorWrapperDiv = windowDiv.querySelector('.editorWrapperDiv');
//     const editorIframe = editorWrapperDiv ? editorWrapperDiv.querySelector('iframe') : null;
//
//
//     let startX;
//     let startY;
//     let startWidth;
//     let startHeight;
//
//     let isMouseMoving = false;
//
//     const handleMouseMove = (event) => {
//         if (!event.buttons) {
//             handleMouseUp();
//             return;
//         }
//         isMouseMoving = true;
//
//         // Extract scaling factors from the accumulated transform matrix
//         const {
//             scaleX,
//             scaleY
//         } = extractScalingFactors(windowDiv);
//
//         // Calculate the change in position of the mouse considering the scaling factors
//         const dx = 2 * (event.pageX - startX) / scaleX;
//         const dy = 2 * (event.pageY - startY) / scaleY;
//
//         const content = node.innerContent;
//         const minWidth = content ? content.offsetWidth + 0 : 100;
//         const minHeight = content ? content.offsetHeight + 35 : 100;
//         const newWidth = Math.max(startWidth + dx, minWidth);
//         const newHeight = Math.max(startHeight + dy, minHeight);
//         windowDiv.style.maxWidth = `${newWidth}px`;
//         windowDiv.style.width = `${newWidth}px`;
//         windowDiv.style.height = `${newHeight}px`;
//
//         const contentEditable = node.contentEditableDiv;
//         if (contentEditable) {
//             if (newHeight > 300) {
//                 contentEditable.style.maxHeight = `${newHeight}px`;
//             } else {
//                 contentEditable.style.maxHeight = `300px`;
//             }
//             contentEditable.style.maxWidth = `${newWidth}px`
//         }
//
//         const htmlView = node.htmlView;
//         if (htmlView) {
//             htmlView.style.width = '100%';
//             htmlView.style.height = '100%';
//         }
//
//         // Find the aiNodeWrapperDiv for this specific node. Use a more specific selector if needed.
//         const aiNodeWrapperDiv = node.ainodewrapperDiv;
//
//         // If aiNodeWrapperDiv exists, set its dimensions
//         if (aiNodeWrapperDiv) {
//             aiNodeWrapperDiv.style.width = `${newWidth}px`;
//             aiNodeWrapperDiv.style.height = `${newHeight}px`;
//         }
//
//
//         if (editorWrapperDiv) {
//             const newEditorWidth = Math.max(startWidth + dx, 350);  //350 min width
//             const newEditorHeight = Math.max(startHeight + dy, 200);  //200 min height
//
//             // Set the new dimensions for the editor wrapper div
//             editorWrapperDiv.style.width = `${newEditorWidth}px`;
//             editorWrapperDiv.style.height = `${newEditorHeight}px`;
//
//             // Optional: You might want to update the iframe size here as well
//             editorIframe.style.width = `${newEditorWidth}px`;
//             editorIframe.style.height = `${newEditorHeight - 10}px`;
//         }
//     };
//
//     const handleMouseUp = () => {
//         isMouseMoving = false;
//         document.removeEventListener('mousemove', handleMouseMove);
//         document.removeEventListener('mouseup', handleMouseUp);
//         document.body.style.cursor = 'auto'; // Reset the cursor style
//
//         // Re-enable pointer events on iframe
//         if (editorWrapperDiv) {
//             if (editorIframe) {
//                 editorIframe.style.pointerEvents = 'auto';
//             }
//         }
//     };
//
//     resizeHandle.addEventListener('mousedown', (event) => {
//         event.preventDefault();
//         event.stopPropagation();
//         startX = event.pageX;
//         startY = event.pageY;
//         startWidth = parseInt(document.defaultView.getComputedStyle(windowDiv).width, 10);
//         startHeight = parseInt(document.defaultView.getComputedStyle(windowDiv).height, 10);
//
//         isMouseMoving = true; // Flag to indicate that a resize operation is in progress
//         document.addEventListener('mousemove', handleMouseMove);
//         document.addEventListener('mouseup', handleMouseUp);
//
//         // Disable pointer events on iframe
//         if (editorWrapperDiv) {
//             if (editorIframe) {
//                 editorIframe.style.pointerEvents = 'none';
//             }
//         }
//     });
// }
//
// function resetWindowDivSize(windowDiv) {
//     windowDiv.style.width = 'fit-content';
//     windowDiv.style.height = 'fit-content';
//     windowDiv.style.maxWidth = 'fit-content';
//     windowDiv.style.maxHeight = 'fit-content';
// }
//
// // TODO: DONE, called also by nodedef.js at addEventListenersToLinkNode
// function observeContentResize(windowDiv, iframeWrapper, displayWrapper) {
//     const resizeObserver = new ResizeObserver((entries) => {
//         for (let entry of entries) {
//             const {
//                 width,
//                 height
//             } = entry.contentRect;
//
//             // Find the buttonsWrapper inside windowDiv
//             const buttonsWrapper = windowDiv.querySelector(".buttons-wrapper");
//
//             if (buttonsWrapper) {
//                 // Calculate the available height for the iframes
//                 let buttonsHeight = buttonsWrapper.offsetHeight || 0;
//                 let iframeHeight = Math.max(0, height - buttonsHeight - 50); // Subtract additional margin
//
//                 // Update the width and height of iframeWrapper and displayWrapper
//                 iframeWrapper.style.width = width + "px";
//                 iframeWrapper.style.height = iframeHeight + "px";
//                 displayWrapper.style.width = width + "px";
//                 displayWrapper.style.height = iframeHeight + "px";
//             }
//         }
//     });
//
//     resizeObserver.observe(windowDiv);
// }
//
// /*// Set the textarea's height according to its scrollHeight and maxHeight
// function setTextAreaHeight(textarea, maxHeight) {
//     // Calculate the bottom position of the textarea within the viewport
//     const textareaBottom = textarea.getBoundingClientRect().bottom;
//     const viewportHeight = window.innerHeight;
//
//     // Define a margin from the bottom (e.g., 30 pixels)
//     const bottomMargin = 30;
//
//     // If the bottom of the textarea (including the margin) is beyond the viewport
//     if (textareaBottom + bottomMargin > viewportHeight) {
//         return;
//     }
//
//     textarea.style.height = 'auto';
//     const newHeight = Math.min(textarea.scrollHeight, maxHeight);
//     textarea.style.height = `${Math.max(newHeight, 60)}px`;
//
//     if (newHeight >= maxHeight) {
//         textarea.style.overflowY = 'auto';
//     } else {
//         textarea.style.overflowY = 'hidden';
//     }
// }
//
// /**
//  * Event handlers for mouse down and up to set resizing state
//  */
// /*function attachMouseEvents(node, element) {
//     element.addEventListener('mousedown', () => {
//         node.isResizing = true;
//     });
//
//     element.addEventListener('mouseup', () => {
//         node.isResizing = false;
//         const newMaxHeight = element.clientHeight;
//         element.setAttribute('data-max-height', newMaxHeight);
//     });
// }
//
// /**
//  * Function used for programmatic interaction in zettelkasten.js
//  */
// /*function adjustTextareaHeight(textarea) {
//     const maxHeight = textarea.getAttribute('data-max-height') || 300;
//     const epsilon = 50; // Tolerance in pixels
//
//     requestAnimationFrame(() => {
//         // Record the current scroll position
//         const previousScrollHeight = textarea.scrollHeight;
//         const previousScrollTop = textarea.scrollTop;
//
//         // Adjust textarea height
//         setTextAreaHeight(textarea, maxHeight);
//
//         // Calculate the new scroll position
//         const newScrollHeight = textarea.scrollHeight;
//         const dScroll = newScrollHeight - previousScrollHeight;
//
//         // Update the scrollTop only if we are close to the bottom
//         if (Math.abs(previousScrollTop - (previousScrollHeight - textarea.clientHeight)) < epsilon) {
//             textarea.scrollTop = newScrollHeight - textarea.clientHeight;
//         } else {
//             // Preserve the scrollTop to keep the view stable
//             textarea.scrollTop = previousScrollTop + dScroll;
//         }
//     });
// }
//
//
//  * Function used for user interaction in create text node
//
// function adjustTextareaElement(node, element) {
//     const adjustHeight = () => {
//         if (!node.isResizing) {
//             const maxHeight = element.getAttribute('data-max-height') || 300;
//             setTextAreaHeight(element, maxHeight);
//         }
//     };
//
//     attachMouseEvents(node, element);
//
//     adjustHeight();
//
//     node.isResizing = false;
//
//     node.observer = new ResizeObserver(adjustHeight);
//     node.observer.observe(element);
//
//     const mutationObserver = new MutationObserver(adjustHeight);
//     mutationObserver.observe(element, {
//         childList: true,
//         subtree: true,
//         characterData: true
//     });
// } */
//
// function observeParentResize(parentDiv, iframe, paddingWidth = 50, paddingHeight = 80) {
//     const resizeObserver = new ResizeObserver((entries) => {
//         for (let entry of entries) {
//             const {
//                 width,
//                 height
//             } = entry.contentRect;
//             iframe.style.width = Math.max(0, width - paddingWidth) + "px";
//             iframe.style.height = Math.max(0, height - paddingHeight) + "px";
//         }
//     });
//
//     resizeObserver.observe(parentDiv);
//     return resizeObserver;
// }
