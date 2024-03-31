
class CodeNode extends WindowedNode {
    static DEFAULT_CONFIGURATION = {
        name: "",
        code: "",
        settings: {
            language: "",
            extension: "",
            libURL: "",
            showHint: false,
            showHintFunction: ""
        },
        saved: undefined,
        saveData: undefined,
    }

    static SAVE_PROPERTIES = ['code', 'settings'];

    static OBSERVERS = { 'code': {
            'add': function (callback) { this.addEventListener("change", callback) },
            'remove': function (callback) { this.removeEventListener("change", callback) }
        }}

    constructor(configuration = CodeNode.DEFAULT_CONFIGURATION) {
        configuration = {...CodeNode.DEFAULT_CONFIGURATION, ...configuration}
        configuration.settings =  {...CodeNode.DEFAULT_CONFIGURATION.settings, ...configuration.settings}
        configuration.content = [CodeNode._getContentElement()];
        if (!configuration.saved) {// Create CodeNode
            super({...configuration, title: configuration.name, ...WindowedNode.getNaturalScaleParameters() });
        } else {// Restore CodeNode
            super({...configuration, title: configuration.name, scale: true })
        }
        this._codeListeners = [];
        this.diagram.addNode(this);
        this._initialize(configuration.name, configuration.code, configuration.settings, configuration.saved)
    }

    get code() {
        let iframeElement = document.querySelector(`iframe[identifier='editor-${this.uuid}']`);
        if (iframeElement && iframeElement.contentWindow) {
            try {
                //console.log(`save data`, this.editorSaveData);
                let iframeWindow = iframeElement.contentWindow;
                return iframeWindow.codeEditor.getValue();
            } catch (error) {
                console.error('Error restoring editor content:', error);
                throw new Error('Error restoring editor content:', error)
            }
        } else {
            console.warn('No iframe editor found for node.');
            throw new Error('No iframe editor found for node.')
        }
    }

    set code(v) {
        if(v instanceof Blob) {
            var reader = new FileReader();
            reader.onload = (event) => {
                this.code = event.target.result // Recursive call
            }
            reader.readAsText(v);
            return; // Wait for the reader to complete
        }

        const setCode = (code) => {
            let iframeElement = document.querySelector(`iframe[identifier='editor-${this.uuid}']`);
            if (iframeElement && iframeElement.contentWindow) {
                try {
                    //console.log(`save data`, this.editorSaveData);
                    let iframeWindow = iframeElement.contentWindow;
                    iframeWindow.codeEditor.setValue(code);
                    this.onCodeChange(code)
                } catch (error) {
                    console.error('Error restoring editor content:', error);
                    throw new Error('Error restoring editor content:', error)
                }
            } else {
                console.warn('No iframe editor found for node.');
                throw new Error('No iframe editor found for node.')
            }
        }

        if(this.initialized){
            // this.contentEditableDiv.innerText = v;
            setCode(v);
        } else {
            this.addAfterInitCallback(() => {
                // this.contentEditableDiv.innerText = v;
                setCode(v);
            })
        }
    }
    onCodeChange(code){
        for (let listener of this._codeListeners){
            listener(code);
        }
    }

    addEventListener(event, listener){
        if(event === "change"){ this._codeListeners.push(listener) }
    }
    removeEventListener(event, listener){
        if(event === "change") { this._codeListeners.indexOf(listener) > -1 ? this._codeListeners.splice(this._codeListeners.indexOf(listener), 1) : "" }
    }
    static _getContentElement(){
        // Create the wrapper div
        let editorWrapperDiv = document.createElement('div');
        editorWrapperDiv.className = 'editorWrapperDiv';
        editorWrapperDiv.style.width = '800px'; // Set width of the wrapper
        editorWrapperDiv.style.height = '400px'; // Set height of the wrapper
        editorWrapperDiv.style.overflow = 'none';
        editorWrapperDiv.style.position = 'relative';

        // Create the iframe element with a data URI as the src attribute
        let iframeElement = document.createElement('iframe');
        iframeElement.style.overflow = `none`;
        iframeElement.style.width = '800px';
        iframeElement.style.height = '390px';
        iframeElement.style.border = '0';
        iframeElement.style.background = 'transparent';
        iframeElement.sandbox = 'allow-same-origin allow-scripts';

        // Append the iframe to the wrapper div
        editorWrapperDiv.appendChild(iframeElement);


        let footerButtonContainer = document.createElement('div');
        footerButtonContainer.classList.add("content-sticky-footer");

        let runButton = document.createElement("button");
        runButton.innerHTML = "Run Code";
        runButton.classList.add("code-button");

        footerButtonContainer.append(runButton);

        // Create the overlay div dynamically
        let overlay = document.createElement('div');
        overlay.id = "editorOverlay";
        overlay.style.position = "absolute";  // Position relative to editorWrapperDiv
        overlay.style.top = "0";
        overlay.style.left = "0";
        overlay.style.width = "100%";  // 100% of editorWrapperDiv
        overlay.style.height = "100%";  // 100% of editorWrapperDiv
        overlay.style.zIndex = "9999";
        overlay.style.backgroundColor = "transparent";
        overlay.style.display = "none";  // Initially hidden

        // Append the overlay to the editorWrapperDiv
        editorWrapperDiv.appendChild(overlay);
        editorWrapperDiv.appendChild(footerButtonContainer);
        return editorWrapperDiv;
    }

    setMainContentFile(filePath, fileName){
        this.files.push({ key: "code", path: filePath, name: fileName, autoLoad: false, autoSave: false})
    }

    _initialize(name, code, settings, saved){
        let iframeElement = this.content.querySelector('iframe')
        iframeElement.setAttribute('identifier', 'editor-' + this.uuid); // Store the identifier
        this.setMinSize(350,250)
        if(!saved){
            this.settings = settings;
            this.code = code;// This will be delayed 500ms after iframeElement loads (see afterInit)
        }
        if(!this.settings.libURL){//retro-compatibility
            this.settings = settings;
        }
        this.codeButton = this.content.querySelector('.code-button');
        this._addEventListeners();
        this.afterInit()
    }

    afterInit() {

        let overlay = this.content.querySelector(`.editorWrapperDiv #editorOverlay`)
        overlays.push(overlay);

        let iframeElement = this.content.querySelector('.editorWrapperDiv iframe');
        this.iframeElement = iframeElement;

        iframeElement.onload = () => {
            iframeElement.contentWindow.addEventListener('click', () => {
                this.followingMouse = 0;
            });
            setTimeout(() =>  super.afterInit(), 500); // Delay restoration
        };

        let htmlContent = CodeNode._createEditorInterface(this.settings);
        iframeElement.src = `data:text/html;charset=utf-8,${encodeURIComponent(htmlContent)}`;
        iframeElement.srcdoc = htmlContent;
        // super.afterInit();
    }

    _addEventListeners() {
        let button = this.codeButton;

        // Reattach the handleCodeButton callback
        if (button) {
            // Assuming handleCodeButton sets up the button event listener
            button.addEventListener('click', this.onClickRun.bind(this))
        }
    }

    onClickRun(){
        // override this method
    }

    // From editor

    onResize(newWidth, newHeight) {
        super.onResize(newWidth, newHeight);

        const editorWrapperDiv = this.windowDiv.querySelector('.editorWrapperDiv');
        const editorIframe = editorWrapperDiv ? editorWrapperDiv.querySelector('iframe') : null;

        if (editorWrapperDiv) {
            // Set the new dimensions for the editor wrapper div
            editorWrapperDiv.style.width = `${newWidth}px`;
            editorWrapperDiv.style.height = `${newHeight - 65}px`;

            // Optional: You might want to update the iframe size here as well
            editorIframe.style.width = `${newWidth}px`;
            editorIframe.style.height = `${newHeight - 55}px`;
        }
    }

    onMouseUp() {
        super.onMouseUp();

        const editorWrapperDiv = this.windowDiv.querySelector('.editorWrapperDiv');
        const editorIframe = editorWrapperDiv ? editorWrapperDiv.querySelector('iframe') : null;

        // Re-enable pointer events on iframe
        if (editorWrapperDiv) {
            if (editorIframe) {
                editorIframe.style.pointerEvents = 'auto';
            }
        }
    }

    onMouseDown() {
        super.onMouseDown();

        const editorWrapperDiv = this.windowDiv.querySelector('.editorWrapperDiv');
        const editorIframe = editorWrapperDiv ? editorWrapperDiv.querySelector('iframe') : null;

        // Disable pointer events on iframe
        if (editorWrapperDiv) {
            if (editorIframe) {
                editorIframe.style.pointerEvents = 'none';
            }
        }
    }

    static _createEditorInterface(settings) {
        let showHintFunction = settings.showHint ? settings.showHintFunction : "";
        let constructor = settings.showHint ? `var codeEditor = CodeMirror(document.getElementById('codeEditor'), {
                mode: '${settings.language}', theme: 'dracula', lineNumbers: true, lineWrapping: true, scrollbarStyle: 'simple',  extraKeys: {"Ctrl-Space": "autocomplete"}
            });` : `var codeEditor = CodeMirror(document.getElementById('codeEditor'), {
                mode: '${settings.language}', theme: 'dracula', lineNumbers: true, lineWrapping: true, scrollbarStyle: 'simple'
            });`;
        let htmlContent = `<!DOCTYPE html>
<html lang="en" class="custom-scrollbar">
<head>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/codemirror@5/lib/codemirror.css">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/codemirror@5/theme/dracula.css">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/codemirror@5/addon/scroll/simplescrollbars.css">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/codemirror@5/addon/hint/show-hint.css">

    <script src="https://cdn.jsdelivr.net/npm/codemirror@5/lib/codemirror.js"></script>

    <script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.62.3/addon/scroll/simplescrollbars.js"></script>

    <script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.62.3/mode/htmlmixed/htmlmixed.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.62.3/mode/xml/xml.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.62.3/mode/css/css.js"></script>
    <script src="${settings.libURL}"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.62.3/addon/hint/show-hint.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.62.3/addon/hint/anyword-hint.js"></script>


    <style type="text/css">
        .editorcontainer {
            box-sizing: border-box;
            width: 100%;
            min-width: 100%;
            margin: auto;
            /* Add any other styles you want for the container here... */
        }

        body {
            background-color: transparent;
            margin: 0;
            padding: 0px;
            display: flex;
            flex-direction: column;
            align-items: center;
            overflow: hidden;
        }

        #editor-wrapper {
            box-sizing: border-box;
            display: flex;
            justify-content: space-between;
            height: 95vh;
            width: 96%; /* 10px margin on left and right side */
            max-width: 100%;
            margin-top: 10px;
            margin-left: 15px; /* Left margin */
            overflow: hidden; /* Contains the children */
            resize:none;
        }


        .editor-container {
            height: 100%; /* Take full height of parent */
            margin: 0px 0px;
            background-color: transparent;
            padding: 0px;
            position: relative; /* Ensuring the child takes this height */
            flex: none; /* Ensure equal space division */
        }

        .editor-label {
            color: #888;
            font-size: 12px;
            padding: 15px;
            background-color: #262737;
            display: inline;
            margin: 0;
            line-height: 30px;
            user-select: none;
        }

        .CodeMirror {
            font-size: 12px;
            height: calc(100% - 32px); /* Adjusted for label height */
            width: 100%;
            position: absolute; /* Take full height of parent */
            bottom: 0; /* Align to the bottom of the container */
            overflow-x: hidden; /* Hide horizontal scrollbar */
        }

        .CodeMirror-simplescroll-horizontal {
            display: none !important; /* Hide horizontal scrollbar */
        }

        .CodeMirror-simplescroll-vertical {
            background: #222226 !important;
        }

            .CodeMirror-simplescroll-vertical div {
                background: #3f3f3f !important;
                border: 1px solid #555555;
                width: 6px !important;
            }

        .CodeMirror-simplescroll-scrollbar div:hover {
            background: #555 !important;
        }

        .CodeMirror-scrollbar-filler, .CodeMirror-gutter-filler {
            background-color: #222226;
        }
        .CodeMirror-hints.dracula {
            background: #222226;
            border: 1px solid #44444a;
        }
        .CodeMirror-hint {
            color: #F3F3F3;
        }
        li.CodeMirror-hint-active {
            background: #3d3d49;
            color: #F3F3F3;
        }
        .no-select {
            user-select: none;
            -webkit-user-select: none;
            -ms-user-select: none;
        }
    </style>
</head>
<body>
    <div id="editor-container-wrapper" class="editorcontainer">
        <div id="editor-wrapper">
            <div class="editor-container">
                <div class="editor-label">${settings.extension}</div>
                <div id="codeEditor"></div>
            </div>
        </div>
    </div>
    <script>
    
            ${showHintFunction}
            
            ${constructor}
            
            function refreshEditors() {
                codeEditor.refresh();
            }

            window.requestAnimationFrame(refreshEditors);

            const editorContainers = document.querySelectorAll('.editor-container');
            const initialEditorWidth = editorContainers[0].parentElement.offsetWidth;

            // Initialize isResized flag to false
            let isResized = false;
    
            // Function to update editor widths
            function updateEditorWidth() {
                const editorWrapperWidth = editorContainers[0].parentElement.offsetWidth;
                //const newDraggableBarWidths = updateDraggableBarWidths(); // Update the widths of draggable bars
                const totalCurrentWidths = Array.from(editorContainers).reduce((total, el) => total + el.offsetWidth, 0);
                const availableWidth = editorWrapperWidth// - newDraggableBarWidths;
    
                if (!isResized) {
                    // First-time call: Initialize all editors to a uniform width
                    const newWidth = availableWidth / 3;
                    editorContainers.forEach(container => container.style.width = newWidth + 'px');
                    isResized = true;  // Set the flag to true after the first invocation
                } else {
                    // Subsequent calls: Proportionally adjust the width of each editor
                    const scalingFactor = availableWidth / totalCurrentWidths;
                    editorContainers.forEach(container => {
                        const newWidth = container.offsetWidth * scalingFactor;
                        container.style.width = newWidth + 'px';
                    });
                }
    
                refreshEditors(); // Refresh the editors
            }
            updateEditorWidth();
            // Event listener to update editor widths on window resize
            window.addEventListener('resize', updateEditorWidth);

            // Initial call to set the size
            updateEditorWidth();
    </script>
</body>
</html>`;

        let iframeScript = `
<script>
    document.addEventListener('keydown', function(event) {
        let nodeMode = 0;
        if(event.altKey && event.shiftKey) {
            nodeMode = 1;
        }
        window.parent.postMessage({ altHeld: event.altKey, shiftHeld: event.shiftKey, nodeMode: nodeMode }, '*');
        if(event.altKey) event.preventDefault();  // Prevent default behavior only for Alt and Alt+Shift
    });

    document.addEventListener('keyup', function(event) {
        window.parent.postMessage({ altHeld: event.altKey, shiftHeld: event.shiftKey, nodeMode: 0 }, '*');
        if(!event.altKey) event.preventDefault();
    });
</script>
`;

        // Combine and return the full HTML content
        return htmlContent + iframeScript;
    }

}


function createCodeNode(name = '', code = '', settings=undefined) {
    return new CodeNode({
        name,
        code,
        settings
    });
}