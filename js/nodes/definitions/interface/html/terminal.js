
class TerminalHTML {
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
        // onLoad: undefined
    }

    constructor(configuration=TerminalHTML.DEFAULT_CONFIGURATION) {
        configuration = {...TerminalHTML.DEFAULT_CONFIGURATION, ...configuration}
        this.settings = {...TerminalHTML.DEFAULT_CONFIGURATION.settings, ...configuration.settings}
        this.editorWrapper = TerminalHTML._getContentElement();
    }

    resizeToContents(iframe=null){
        if(iframe === null) {
            let iframeElements = this.editorWrapper.querySelectorAll("iframe");
            iframeElements.forEach((iframeElement) => {
                this.resizeToContents(iframeElement)
            });
        } else if (Array.isArray(iframe)) {
            for(let iframeElement of iframe) {
                this.resizeToContents(iframeElement)
            }
        } else if(iframe.contentDocument.body) {
            let height = iframe.contentDocument.body.querySelector(".CodeMirror-code").getBoundingClientRect().height;
            let editorWrapper = iframe.contentDocument.body.querySelector("#editor-wrapper");
            // console.log("Adjusting height for iframe in terminal node console: ", height +"px");
            iframe.style.height = (height + 6) + "px";
            editorWrapper.style.height = (height + 6) + "px";
        }
    }

    addCodeLine(code) {
        let iframeElement = TerminalHTML.getCodeLine(this.settings);
        iframeElement.onload = () => {
            setTimeout(() => {
                iframeElement.contentWindow.codeEditor.setValue(code)
                setTimeout(() => {
                    this.resizeToContents(iframeElement);
                }, IFRAME_LOAD_TIMEOUT);
            }, IFRAME_LOAD_TIMEOUT);

        }
        this.editorWrapper.appendChild(iframeElement);
        let codeObject = {text: code, type: "code", element: iframeElement}
        this.settings.lines.push(codeObject);
        return iframeElement;
    }

    addResultLine(result) {
        let resultElement = TerminalHTML.getResultLine(this.settings);
        this.editorWrapper.appendChild(resultElement);
        resultElement.innerText = result;
        let resultObject = {text: result, type: "result", element: resultElement}
        this.settings.lines.push(resultObject);
        return resultElement;
    }

    addErrorLine(result) {
        let errorElement = TerminalHTML.getErrorLine(this.settings);
        this.editorWrapper.appendChild(errorElement);
        errorElement.innerText = result;
        let errorObject = {text: result, type: "error", element: errorElement}
        this.settings.lines.push(errorObject);
        return errorElement;
    }

    static getCodeLine(settings, readOnly=true) {
        let iframeElement = TerminalHTML._getContentFrame()
        let htmlContent = TerminalHTML._createEditorInterface(settings, readOnly);
        iframeElement.src = `data:text/html;charset=utf-8,${encodeURIComponent(htmlContent)}`;
        iframeElement.srcdoc = htmlContent;
        return iframeElement;
    }

    static getResultLine(settings) {
        let resultLine = document.createElement("div");
        resultLine.className = "result-line";
        return resultLine;
    }

    static getErrorLine(settings) {
        let resultLine = document.createElement("div");
        resultLine.className = "error-line";
        return resultLine;
    }

    static _getContentFrame(){
        // Create the iframe element with a data URI as the src attribute
        let iframeElement = document.createElement('iframe');
        iframeElement.style.overflow = `none`;
        iframeElement.style.height = 'auto';
        iframeElement.style.minHeight = 'auto';
        iframeElement.style.border = '0';
        iframeElement.style.background = 'transparent';
        iframeElement.sandbox = 'allow-same-origin allow-scripts';
        return iframeElement;
    }

    static _getContentElement(){
        // Create the wrapper div
        let editorWrapperDiv = document.createElement('div');
        editorWrapperDiv.className = 'editorWrapperDiv';
        editorWrapperDiv.style.width = '800px'; // Set width of the wrapper
        editorWrapperDiv.style.height = '400px'; // Set height of the wrapper
        editorWrapperDiv.style.overflow = 'none';
        editorWrapperDiv.style.position = 'relative';

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
        return editorWrapperDiv;
    }

    static _createEditorInterface(settings, readOnly=true) {
        let showHintFunction = settings.showHint ? settings.showHintFunction : "";
        let constructor = settings.showHint ? `var codeEditor = CodeMirror(document.getElementById('codeEditor'), {
                mode: '${settings.language}', theme: 'dracula', lineNumbers: false, lineWrapping: true, scrollbarStyle: 'null',  extraKeys: {"Ctrl-Space": "autocomplete"}, readOnly: ${readOnly}
            });` : `var codeEditor = CodeMirror(document.getElementById('codeEditor'), {
                mode: '${settings.language}', theme: 'dracula', lineNumbers: false, lineWrapping: true, scrollbarStyle: 'null', readOnly: ${readOnly}
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
            /* height: 95vh; */
            width: 100%; /* 10px margin on left and right side */
            /* max-width: 100%; */
            /*margin-top: 10px;*/
            margin-left: 10px; /* Left margin */
            overflow: hidden; /* Contains the children */
            /* resize: none; */
            min-height: calc(1em + 10px);
            /*max-width: calc(100% - 30px) ;*/
        }

        .cm-s-dracula.CodeMirror, .cm-s-dracula .CodeMirror-gutters {
            background-color: transparent !important;          
            border-top: 1px solid #bbb;  
            /*border-bottom: 1px solid #bbb;  */
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
            /* height: calc(100% - 32px); Adjusted for label height */
            width: 100%;
            position: absolute; /* Take full height of parent */
            /* bottom: 0; Align to the bottom of the container */
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
                <!-- <div class="editor-label">${settings.extension}</div> -->
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

class TerminalPanel extends HTMLNode {
    static DEFAULT_CONFIGURATION = {
        name: "",
        container: undefined,
        settings: {
            language : "",
            lines: [],
            libURL: "",
            showHint: false,
            showHintFunction: "",
            version: ""
        },
        // onLoad: undefined
    }

    constructor(configuration= TerminalPanel.DEFAULT_CONFIGURATION) {
        configuration = {...TerminalPanel.DEFAULT_CONFIGURATION, ...configuration}
        configuration.settings = {...TerminalPanel.DEFAULT_CONFIGURATION.settings, ...configuration.settings}
        let content = new TerminalHTML(configuration);
        let container = document.querySelector(configuration.container)
        container.append(content.editorWrapper);
        super({content, container})
    }
}
