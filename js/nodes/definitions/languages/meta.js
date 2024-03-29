

class MetaNode extends WindowedNode {
    static DEFAULT_CONFIGURATION = {
        name: "",
        code: "",
        settings: {language: "javascript"},
        saved: undefined,
        saveData: undefined,
    }

    static SAVE_PROPERTIES = ['code', 'settings'];

    static OBSERVERS = { 'code': {
            'add': function (callback) { this.contentEditableDiv.addEventListener("input", callback) },
            'remove': function (callback) { this.contentEditableDiv.removeEventListener("input", callback) }
        }}

    constructor(configuration = MetaNode.DEFAULT_CONFIGURATION){
        configuration = {...MetaNode.DEFAULT_CONFIGURATION, ...configuration}
        configuration.settings =  {...MetaNode.DEFAULT_CONFIGURATION.settings, ...configuration.settings}
        const textarea = MetaNode._getContentElement();
        if(!configuration.saved) {// Create MetaNode
            super({title: configuration.name, content: [textarea], ...WindowedNode.getNaturalScaleParameters()});
        } else {// Restore MetaNode
            super({title: configuration.name, content:  [textarea], scale: true, saved: true, saveData:  configuration.saveData});
        }
        this.diagram.addNode(this);
        this._initialize(textarea, configuration.settings, configuration.saved)
        if(configuration.code) this.code = configuration.code;
    }

    get code() {
        return this.jsEditor.getValue();
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
        if(this.initialized){
            // this.contentEditableDiv.innerText = v;
            this.jsEditor.setValue(v);
        } else {
            this.addAfterInitCallback(() => {
                // this.contentEditableDiv.innerText = v;
                this.jsEditor.setValue(v);
            })
        }
    }

    static _getContentElement(){
        let textarea = document.createElement("textarea");
        textarea.classList.add('custom-scrollbar', 'node-textarea');
        textarea.onmousedown = cancel;
        textarea.setAttribute("type", "text");
        textarea.setAttribute("size", "11");
        // textarea.setAttribute("style", "background-color: #222226; color: #bbb; overflow-y: scroll; resize: both; width: 259px; line-height: 1.4; display: none;");
        textarea.style.position = "absolute";

        return textarea;
    }

    setMainContentFile(filePath, fileName){
        this.files.push({ key: "code", path: filePath, name: fileName, autoLoad: false, autoSave: false})
    }

    _initialize(textarea, settings, saved){
        let windowDiv = this.windowDiv;  // Find the .content div
        let editorDiv = document.createElement("div");

        editorDiv.style = "width: 100%; height: 100%;"
        let button = document.createElement("button");
        button.innerHTML = "Run Code";
        button.classList.add("code-button");


        var WORD = /[\w$]+/, RANGE = 500;

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
        }
        var jsEditor = CodeMirror(editorDiv, {
            mode: settings.language, lineNumbers: true, lineWrapping: false, scrollbarStyle: 'simple', extraKeys: {"Ctrl-Space": "autocomplete"}
        });


        jsEditor.display.wrapper.style.clipPath = 'inset(0px)';
        jsEditor.display.wrapper.style.backgroundColor = 'rgb(34, 34, 38)';
        jsEditor.display.wrapper.style.borderStyle = 'inset';
        jsEditor.display.wrapper.style.borderColor = 'rgba(136, 136, 136, 0.133)';
        jsEditor.display.wrapper.style.fontSize = '15px';
        jsEditor.display.wrapper.style.resize = 'vertical';
        jsEditor.display.wrapper.style.userSelect = 'none';
        this.jsEditor = jsEditor;

        // Initially hide the button
        windowDiv.appendChild(editorDiv);

        windowDiv.appendChild(button);
        this.setMinSize(300);
        this.innerContent.style.maxWidth = "0";
        this.innerContent.style.minWidth = "0";
        this.innerContent.style.maxHeight = "0";
        this.innerContent.style.minHeight = "0";
        WindowedNode.makeContentScrollable(jsEditor.display.wrapper)
        if(!saved){
            this.settings = settings;
        }

        this.afterInit()
    }

    afterInit() {
        this.codeButton = this.content.querySelector('.code-button');
        this.textarea = this.content.querySelector('textarea');
        this.pythonView = this.content.querySelector('#python-frame')
        this._addEventListeners();
        super.afterInit();
    }

    _addEventListeners() {
        let button = this.codeButton;
        let textarea = this.textarea;


        // Attach events for contentEditable and textarea
        // addEventsToContentEditable(contentEditableDiv, textarea, this);
        // watchTextareaAndSyncWithContentEditable(textarea, contentEditableDiv);

        // Reattach the handleCodeButton callback
        if (button && textarea) {
            // Assuming handleCodeButton sets up the button event listener
            button.addEventListener('click', this.onClickRun.bind(this))
        }
    }

    onResize(newWidth, newHeight) {
        super.onResize(newWidth, newHeight);
        const contentEditor = this.jsEditor.display.wrapper;
        if (contentEditor) {
            contentEditor.style.height = `${newHeight - 60}px`;
            contentEditor.style.width = `${newWidth - 10}px`
        }
        this.jsEditor.refresh()

    }

    onClickRun(){
        this.eval(this.code);
        // if(!this.settings.local) {
        //     eval(this.code);
        // }
    }

    eval(js){
        return async function() {
            return await eval("(async () => {" + js + "})()");
        }.call(this);
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

function createMetaNode(name = '', code = '', settings=undefined) {
    return new MetaNode({
        name,
        code,
        settings
    });
}
