
class PythonNode extends CodeNode {
    static DEFAULT_CONFIGURATION = {
        name: "",
        code: "",
        settings: {
            language: "python",
            libURL: "https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.62.3/mode/python/python.min.js",
            extension: "py",
            showHint: true,
            versions: ["pyodide", "backend REPL"],
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
        iconID: "python-icon-symbol",
        name: "Python Code Node",
        defaultFavourite: -1
    }

    constructor(configuration = PythonNode.DEFAULT_CONFIGURATION){
        configuration = {...PythonNode.DEFAULT_CONFIGURATION, ...configuration}
        configuration.settings =  {...PythonNode.DEFAULT_CONFIGURATION.settings, ...configuration.settings}
        super(configuration);
    }

    afterInit() {
        this.pythonView = document.createElement("div");
        this.pythonView.className = "hidden"
        WindowedNode.makeContentScrollable(this.pythonView, true)
        WindowedNode.makeContentScrollable(this.pythonView)
        this.innerContent.prepend(this.pythonView)
        super.afterInit();
    }

    onClickRun(){
        this.eval(this.code);
    }

    onClickReset(){
        this.editorWrapperDiv.classList.remove("hidden")
        this.pythonView.classList.add('hidden');
        this.versionDropdown.removeAttribute("disabled")
        this.codeButton.innerText = "Run Code"
        this.codeButton.removeEventListener("click", this.onClickReset.bind(this))
        this.codeButton.addEventListener("click", this.onClickRun.bind(this))
    }

    eval(python){
        if(this.versionDropdown.value === "pyodide"){
            this.editorWrapperDiv.classList.add("hidden")
            this.pythonView.classList.remove('hidden');
            this.versionDropdown.setAttribute("disabled","")
            this.codeButton.setAttribute("disabled","")
            this.codeButton.innerText = "Code Text"
            this.codeButton.removeEventListener("click", this.onClickRun.bind(this))
            runPythonCode(python, this.pythonView, this.uuid).then(() => {
                this.codeButton.removeAttribute("disabled")
                this.codeButton.addEventListener("click", this.onClickReset.bind(this))
            })
        }
    }

    onResize(newWidth, newHeight) {
        super.onResize(newWidth, newHeight);
        if (this.pythonView) {
            // Set the new dimensions for the editor wrapper div
            this.pythonView.style.width = `${newWidth}px`;
            this.pythonView.style.height = `${newHeight - 55}px`;
        }
    }

    static ondrop() {
        let node = createPythonNode();
        node.followingMouse = 1;
        node.draw();
        // Set the dragging point on the header bar
        node.mouseAnchor = node.diagram.background.toDZ(new vec2(0, -node.content.offsetHeight / 2 + 6));
        console.log('Handle drop for the Python Editor icon');

        return node;
    }
}


function createPythonNode(name = '', code = '', settings=undefined) {
    return new PythonNode({
        name,
        code,
        settings
    });
}