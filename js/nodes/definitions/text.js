
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
        }}

    // constructor(name = '', content = undefined, text = '', sx = undefined, sy = undefined, x = undefined, y = undefined, addCodeButton = false){

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
        //textarea.setAttribute("style", "background-color: #222226; color: #bbb; overflow-y: scroll; resize: both; width: 259px; line-height: 1.4; display: none;");
        textarea.style.position = "absolute";
        // var jsEditor = CodeMirror(document.getElementById('jsEditor'), {
        //    mode: 'javascript', theme: 'dracula', lineNumbers: true, lineWrapping: false, scrollbarStyle: 'simple'
        // });
        // jsEditor.display.wrapper.style.clipPath = 'inset(0px)';
        // jsEditor.display.wrapper.style.backgroundColor = 'rgb(34, 34, 38)';
        // jsEditor.display.wrapper.style.borderStyle = 'inset';
        // jsEditor.display.wrapper.style.borderColor = 'rgba(136, 136, 136, 0.133)';
        // jsEditor.display.wrapper.style.fontSize = '15px';
        // jsEditor.display.wrapper.style.resize = 'vertical';
        // jsEditor.display.wrapper.style.userSelect = 'none';
        return textarea;
    }

    setMainContentFile(filePath, fileName){
        this.files.push({ key: "text", path: filePath, name: fileName, autoLoad: false, autoSave: false})
    }

    _initialize(textarea, sx, sy, x, y, addCodeButton){
        let windowDiv = this.windowDiv;  // Find the .content div
        let editableDiv = createContentEditableDiv();  // Define editableDiv here

        let htmlView = document.createElement("iframe");
        htmlView.id = 'html-iframe';
        htmlView.classList.add('html-iframe', 'hidden'); // Add hidden class

        let pythonView = document.createElement("div");
        pythonView.id = 'python-frame';
        pythonView.classList.add('python-frame', 'hidden'); // Add hidden class

        let runButton = document.createElement("button");
        runButton.innerHTML = "Run Code";
        runButton.classList.add("code-button");

        // Initially hide the button
        runButton.style.display = "none";

        if (addCodeButton) {
            runButton.style.display = "block";
        }

        let toJavascriptButton = document.createElement("button");
        toJavascriptButton.classList.add("transform-button");
        toJavascriptButton.innerText = "To JavascriptNode";
        toJavascriptButton.onclick = this.toJavascriptNode.bind(this);

        windowDiv.appendChild(htmlView);
        windowDiv.appendChild(pythonView);
        windowDiv.appendChild(editableDiv);  // Append the contentEditable div to .content div
        windowDiv.appendChild(runButton);
        windowDiv.appendChild(toJavascriptButton);

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

    toJavascriptNode(){
        let code = this.text;
        let title = this.title;
        if(code.trim().startsWith("```")) {
            code = code.substring(code.indexOf("```"));
            code = code.substring(code.indexOf("\n"));
        }
        if(code.trim().endsWith("```")) {
            code = code.substring(0, code.indexOf("```"));

        }
        let metaNode = createJavascriptNode(title, code)
        metaNode.pos.x = this.pos.x
        metaNode.pos.y = this.pos.y
        metaNode.width = this.width;
        metaNode.height = this.height;
        metaNode.scale = this.scale;
        this.onDelete();
    }

    afterInit() {
        this.contentEditableDiv = this.content.querySelector('.editable-div');
        this.codeButton = this.content.querySelector('.code-button');
        this.textarea = this.content.querySelector('textarea');
        this.htmlView = this.content.querySelector('#html-iframe');
        this.pythonView = this.content.querySelector('#python-frame')
        this._addEventListeners();
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

    onResize(newWidth, newHeight) {
        super.onResize(newWidth, newHeight);
        const contentEditable = this.contentEditableDiv;
        if (contentEditable) {
            if (newHeight > 300) {
                contentEditable.style.maxHeight = `${newHeight}px`;
            } else {
                contentEditable.style.maxHeight = `300px`;
            }
            contentEditable.style.maxWidth = `${newWidth}px`
        }

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