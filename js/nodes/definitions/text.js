
class TextNode extends WindowedNode {
    static DEFAULT_CONFIGURATION = {
        name: "",
        text: "",
        sx: undefined,
        sy: undefined,
        x: undefined,
        y: undefined,
        addCodeButton: false,
        saved: undefined,
        saveData: undefined,
    }

    static SAVE_PROPERTIES = ['text', 'addCodeButton', 'isTextNode'];

    static OBSERVERS = { 'text': {
            'add': function (callback) { this.contentEditableDiv.addEventListener("input", callback) },
            'remove': function (callback) { this.contentEditableDiv.removeEventListener("input", callback) }
        }
    }

    static INTERFACE_CONFIGURATION = {
        insertable: true,
        iconID: "note-icon-symbol",
        name: "Raw Text Node (Shift + Double Click)",
        defaultFavourite: 1
    }

    constructor(configuration = TextNode.DEFAULT_CONFIGURATION){
        configuration = {...TextNode.DEFAULT_CONFIGURATION, ...configuration}
        configuration.content = [TextNode._getContentElement()];
        if(!configuration.saved) {// Create TextNode
            super({...configuration, title: configuration.name, ...WindowedNode.getNaturalScaleParameters()});
        } else {// Restore TextNode
            configuration.addCodeButton = configuration.saveData.json.addCodeButton;
            super({...configuration, title: configuration.name, scale: true});
        }
        this.diagram.addNode(this);
        this._initialize(textarea, configuration.sx, configuration.sy, configuration.x, configuration.y, configuration.addCodeButton)
        if(configuration.text) this.text = configuration.text;
    }

    get text() {
        return this.contentEditableDiv.innerText;
    }

    set text(v) {
        if(v instanceof Blob) {
            var reader = new FileReader();
            reader.onload = (event) => {
                this.text = event.target.result // Recursive call
            }
            reader.readAsText(v);
            return; // Wait for the reader to complete
        }
        if(this.initialized){
            this.contentEditableDiv.innerText = v;
        } else {
            this.addAfterInitCallback(() => {
                this.contentEditableDiv.innerText = v;
            })
        }
    }

    static _getContentElement(){
        let textarea = document.createElement("textarea");
        textarea.classList.add('custom-scrollbar', 'node-textarea');
        textarea.onmousedown = cancel;
        textarea.setAttribute("type", "text");
        textarea.setAttribute("size", "11");
        textarea.style.position = "absolute";
        return textarea;
    }

    setMainContentFile(filePath, fileName){
        this.files.push({ key: "text", path: filePath, name: fileName, autoLoad: false, autoSave: false})
    }

    _initialize(textarea, sx, sy, x, y, addCodeButton){
        this.setMinSize(480,270);
        // this.onResize(480,270);
        let windowDiv = this.windowDiv;  // Find the .content div
        let editableDiv = createContentEditableDiv();  // Define editableDiv here

        let htmlView = document.createElement("iframe");
        htmlView.id = 'html-iframe';
        htmlView.classList.add('html-iframe', 'hidden'); // Add hidden class

        let pythonView = document.createElement("div");
        pythonView.id = 'python-frame';
        pythonView.classList.add('python-frame', 'hidden'); // Add hidden class


        let footerContainer = document.createElement("div");
        footerContainer.classList.add('content-sticky-footer')

        let runButton = document.createElement("button");
        runButton.innerHTML = "Run Code";
        runButton.classList.add("code-button");

        // Initially hide the button
        runButton.style.display = "none";

        if (addCodeButton) {
            runButton.style.display = "block";
        }

        let typeConvertDropdown = document.createElement("select");
        typeConvertDropdown.classList.add('inline-container', 'transform-select');
        // typeConvertDropdown.style.backgroundColor = "#222226";
        // typeConvertDropdown.style.border = "none";
        globalThis.textNodeClasses.forEach((nodeClass, index) => {
            if(nodeClass !== this.constructor)
                typeConvertDropdown.add(new Option(nodeClass.name, nodeClass.name, false, index === 0), index);

        })
        let conversionButton = document.createElement("button");
        conversionButton.classList.add("transform-button");
        // conversionButton.innerText = "To JavascriptNode";
        conversionButton.onclick = () => {
            this.convertNode(typeConvertDropdown.value);
        };
        typeConvertDropdown.addEventListener("change", () => {
            conversionButton.innerText = "To " + typeConvertDropdown.value;
        })
        typeConvertDropdown.dispatchEvent(new Event("change"))

        windowDiv.appendChild(htmlView);
        windowDiv.appendChild(pythonView);
        windowDiv.appendChild(editableDiv);  // Append the contentEditable div to .content div
        footerContainer.appendChild(runButton);
        footerContainer.append(typeConvertDropdown);
        footerContainer.appendChild(conversionButton);
        windowDiv.appendChild(footerContainer);
        this.addCodeButton = addCodeButton;

        if (sx !== undefined) {
            x = (new vec2(sx, sy)).cmult(this.diagram.background.zoom).plus(this.diagram.background.pan);
            y = x.y;
            x = x.x;
        }

        if (x !== undefined) {
            this.pos.x = x;
        }

        if (y !== undefined) {
            this.pos.y = y;
        }

        this.isTextNode = true;

        this.afterInit()
    }

    convertNode(type){
        let code = this.text;
        let title = this.title;
        if(code.trim().startsWith("```")) {
            code = code.substring(code.indexOf("```"));
            code = code.substring(code.indexOf("\n"));
        }
        if(code.trim().endsWith("```")) {
            code = code.substring(0, code.indexOf("```"));
        }
        let codeNodeClass = eval(type);
        let codeNode = new codeNodeClass({name: title, code})
        codeNode.pos.x = this.pos.x
        codeNode.pos.y = this.pos.y
        codeNode.width = this.width;
        codeNode.height = this.height;
        codeNode.scale = this.scale;
        this.onDelete();
        codeNode.addAfterInitCallback(() => {
            // this.contentEditableDiv.innerText = v;
            restoreZettelkastenEvent = true;
            addNodeTagToZettelkasten(codeNodeClass.DEFAULT_CONFIGURATION.settings.language, title, code)
        })


    }

    afterInit() {
        this.contentEditableDiv = this.content.querySelector('.editable-div');
        this.codeButton = this.content.querySelector('.code-button');
        this.textarea = this.content.querySelector('textarea');
        this.htmlView = this.content.querySelector('#html-iframe');
        this.pythonView = this.content.querySelector('#python-frame')
        this._addEventListeners();
        this.addAfterInitCallback(() => {
            if (!nodeTitles.includes(this.title)) {
                restoreZettelkastenEvent = true;
                addNodeTagToZettelkasten(null, this.title, this.textarea.value)
                restoreZettelkastenEvent = false;
            }
        })
        super.afterInit();
    }

    _addEventListeners() {
        let button = this.codeButton;
        let textarea = this.textarea;
        let contentEditableDiv = this.contentEditableDiv
        let htmlView = this.htmlView
        let pythonView = this.pythonView;

        // Setup for the code checkbox listener
        TextNode._setupCodeCheckboxListener(button, this.addCodeButton);

        // Attach events for contentEditable and textarea
        addEventsToContentEditable(contentEditableDiv, textarea, this);
        watchTextareaAndSyncWithContentEditable(textarea, contentEditableDiv);

        // Reattach the handleCodeButton callback
        if (button && textarea) {
            // Assuming handleCodeButton sets up the button event listener
            handleCodeButton(button, textarea, htmlView, pythonView, this);
        }
    }

    setMinSize(minWidth, minHeight) {
        if(!minHeight) minHeight = Math.ceil(minWidth * 1.618); // Defaults to the golden ratio
        super.setMinSize(minWidth, minHeight)
        this.innerContent.style.minHeight = ''; // Reset after resize
        this.innerContent.style.minWidth = ''; // Reset after resize
    }

    onResize(newWidth, newHeight) {
        super.onResize(newWidth, newHeight);
        const htmlView = this.htmlView;
        if (htmlView) {
            htmlView.style.width = '100%';
            htmlView.style.height = '100%';
        }
    }

    static _setupCodeCheckboxListener(button, addCodeButton) {
        if (document.getElementById('code-checkbox')) {
            document.getElementById('code-checkbox').addEventListener('change', (event) => {
                if (addCodeButton) {
                    button.style.display = "block";
                    return;
                }
                //console.log(button, `button`);
                button.style.display = event.target.checked ? "block" : "none";
            });

            if (document.getElementById('code-checkbox').checked) {
                button.style.display = "block";
            }
        }
    }

    static ondrop() {
        let node = createNodeFromWindow(null, ``, ``, true); // The last parameter sets followMouse to true
        console.log('Handle drop for the note icon');
        return node;
    }

}

function createTextNode(name = '', text = '', sx = undefined, sy = undefined, x = undefined, y = undefined, addCodeButton = false) {
    return new TextNode({
        name: name,
        text: text,
        sx: sx,
        sy: sy,
        x: x,
        y: y,
        addCodeButton: addCodeButton
    });
    // return new TextNode(name, undefined, text, sx, sy, x, y, addCodeButton);
}