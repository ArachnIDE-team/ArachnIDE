
class JavascriptNode extends CodeNode {
    static DEFAULT_CONFIGURATION = {
        name: "",
        code: "",
        settings: {
            language: "javascript",
            libURL: "https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.62.3/mode/javascript/javascript.min.js",
            extension: "js",
            showHint: true,
            versions: ["ES6", "Node.js"],
            showHintFunction: `var WORD = /[\\w$]+/, RANGE = 500;
            CodeMirror.registerHelper("hint", "anyword", function(editor, options) {
                var word = options && options.word || WORD;
                var range = options && options.range || RANGE;
                var cur = editor.getCursor(), curLine = editor.getLine(cur.line);
                var end = cur.ch, start = end;
                while (start && word.test(curLine.charAt(start - 1))) --start;
                var curWord = start !== end && curLine.slice(start, end);

                var list = options && options.list || [], seen = {};
                var re = new RegExp(word.source, "g");
                for (var dir = -1; dir <= 1; dir += 2) {
                    var line = cur.line, endLine = Math.min(Math.max(line + dir * range, editor.firstLine()), editor.lastLine()) + dir;
                    for (; line !== endLine; line += dir) {
                        var text = editor.getLine(line), m;
                        while (m = re.exec(text)) {
                            if (line === cur.line && m[0] === curWord) continue;
                            if ((!curWord || m[0].lastIndexOf(curWord, 0) === 0) && !Object.prototype.hasOwnProperty.call(seen, m[0])) {
                                seen[m[0]] = true;
                                list.push(m[0]);
                            }
                        }
                    }
                }
                return {list: list, from: CodeMirror.Pos(cur.line, start), to: CodeMirror.Pos(cur.line, end)};
            });
            CodeMirror.commands.autocomplete = function(cm) {
                cm.showHint({hint: CodeMirror.hint.anyword});
            }`
        },
        saved: undefined,
        saveData: undefined,
    }

    static SAVE_PROPERTIES = [];

    static INTERFACE_CONFIGURATION = {
        insertable: true,
        iconID: "js-icon-symbol",
        name: "JavaScript Code Node",
        defaultFavourite: -1
    }

    constructor(configuration = JavascriptNode.DEFAULT_CONFIGURATION){
        configuration = {...JavascriptNode.DEFAULT_CONFIGURATION, ...configuration}
        configuration.settings =  {...JavascriptNode.DEFAULT_CONFIGURATION.settings, ...configuration.settings}
        super(configuration);
    }

    afterInit() {
        this.javascriptView = document.createElement("div");
        this.javascriptView.id = "evaluation-" + generateUUID();
        this.javascriptView.className = "hidden"
        WindowedNode.makeContentScrollable(this.javascriptView, true)
        WindowedNode.makeContentScrollable(this.innerContent, true)
        WindowedNode.makeContentScrollable(this.javascriptView)
        this.innerContent.prepend(this.javascriptView)
        super.afterInit();

        // this.innerContent.
        //     overflow-y: scroll;
        this.innerContent.style.height = "100%";
        this.innerContent.style.display = "flex";
        this.innerContent.style.flexDirection = "column";

        this.javascriptView.style.flexGrow = "1";
        this.javascriptView.style.height = "100%";

        const editorWrapperDiv = this.windowDiv.querySelector('.editorWrapperDiv');
        editorWrapperDiv.style.display = "flex";
        editorWrapperDiv.style.flexDirection = "column";
        editorWrapperDiv.style.height = "100%";
        editorWrapperDiv.style.flexGrow = "1";

        const editorIframe = this.iframeElement;
        editorIframe.style.flexGrow = "1";
        editorIframe.style.overflowY = "scroll";
        editorIframe.style.display = "inline-block";

        const footerButtonContainer = this.windowDiv.querySelector('.content-sticky-footer');
        // footerButtonContainer.style.textOverflow = "ellipsis";
        footerButtonContainer.style.overflow = "hidden";
        footerButtonContainer.style.whiteSpace = "nowrap";
        footerButtonContainer.style.display = "inline-flex";
        footerButtonContainer.style.float = "inline-end";

    }

    onClickReset(){
        this.editorWrapperDiv.classList.remove("hidden")
        this.javascriptView.classList.add('hidden');
        this.versionDropdown.removeAttribute("disabled")
        this.codeButton.innerText = "Run Code"
        this.codeButton.removeEventListener("click", this.onClickReset.bind(this))
        this.codeButton.addEventListener("click", this.onClickRun.bind(this))
    }

    onClickRun(){
        if(this.versionDropdown.value === "ES6") {
            this.codeButton.setAttribute("disabled","")
            this.codeButton.removeEventListener("click", this.onClickRun.bind(this))
            this.eval(this.code).then((result) => {
                this.setResult(result);
            }).catch((error) => {
                this.setResult(error.stack, true);
            });
        } else if(this.versionDropdown.value === "Node.js"){
            this.codeButton.setAttribute("disabled","")
            this.codeButton.removeEventListener("click", this.onClickRun.bind(this))
            nodeREPLWebsocket.createREPLRuntime((createdRuntime) => {
                let runtimeID = createdRuntime.id;
                nodeREPLWebsocket.evalInRuntime(runtimeID, this.code, (result) => {
                    this.setResult(result);
                });
            });
        }
    }

    setResult(result, isError=false){
        this.editorWrapperDiv.classList.add("hidden")
        this.javascriptView.classList.remove('hidden');
        this.versionDropdown.setAttribute("disabled","")
        this.codeButton.innerText = "Code Text"
        this.codeButton.removeAttribute("disabled")
        this.codeButton.addEventListener("click", this.onClickReset.bind(this))
        if(isError) {
            this.javascriptView.innerText = result
            this.javascriptView.classList.add("error-line");
            this.javascriptView.classList.remove("result-line");

        }else{
            this.setJSONResult(result);
            this.javascriptView.classList.add("result-line");
            this.javascriptView.classList.remove("error-line");
        }
    }

    setJSONResult(result) {
        if(typeof result === "function") {
            this.javascriptView.innerText = result.toString()
        } else if (typeof result === "object") {
            let jsonTreeExplorer = new JavascriptObjectUtils(result);
            jsonTreeExplorer.getTree("", 2).then((defaultTree) => {
                let jsonTreePanel = new ObjectTreePanel( {
                    container: "#" + this.javascriptView.id,
                    treeObject: jsonTreeExplorer,
                    defaultTree // For not awaiting in constructor
                })
            });
        } else if (typeof result === "string") {
            this.javascriptView.innerText = JSON.stringify(result);
        } else {
            this.javascriptView.innerText = result;

        }
    }

    eval(js) {
        let array = js.split("\n")
        if (!array[array.length - 1].startsWith("return ")) {
            array[array.length - 1] = "return " + array[array.length - 1];
            js = array.join("\n");
        }
        return async function () {
            try {
                return await eval("(async () => {" + js + "})()");
            } catch (e) {
                throw e;
            }
        }.call(this);
    }

    // onResize(newWidth, newHeight) {
    //     super.onResize(newWidth, newHeight);
    //     const editorWrapperDiv = this.windowDiv.querySelector('.editorWrapperDiv');
    //     editorWrapperDiv.style.height = "100%";
    // }

    // eval(js){
    //     return async function() {
    //         return await eval("(async () => {" + js + "})()");
    //     }.call(this);
    // }

    static ondrop() {
        let node = createJavascriptNode();
        node.followingMouse = 1;
        node.draw();
        // Set the dragging point on the header bar
        node.mouseAnchor = node.diagram.background.toDZ(new vec2(0, -node.content.offsetHeight / 2 + 6));
        console.log('Handle drop for the JavaScript Editor icon');

        return node;
    }
}


function createJavascriptNode(name = '', code = '', settings=undefined) {
    return new JavascriptNode({
        name,
        code,
        settings
    });
}