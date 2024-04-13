
class CSSNode extends CodeNode {
    static DEFAULT_CONFIGURATION = {
        name: "",
        code: "",
        settings: {
            language: "css",
            libURL: "", // Already included: https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.62.3/mode/css/css.js
            extension: "css",
            showHint: true,
            versions: ["HTML renderer"],
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


    constructor(configuration = CSSNode.DEFAULT_CONFIGURATION){
        configuration = {...CSSNode.DEFAULT_CONFIGURATION, ...configuration}
        configuration.settings =  {...CSSNode.DEFAULT_CONFIGURATION.settings, ...configuration.settings}
        super(configuration);
    }

    afterInit() {
        this.htmlView = document.createElement("iframe");
        this.htmlView.className = "hidden"
        this.innerContent.prepend(this.htmlView)
        super.afterInit();
    }

    onClickRun(){
        this.eval(this.code);
    }
    onClickReset(){
        this.editorWrapperDiv.classList.remove("hidden")
        this.htmlView.classList.add('hidden');
        this.versionDropdown.removeAttribute("disabled")
        this.codeButton.innerText = "Run Code"
        this.codeButton.style.backgroundColor = '';
        this.codeButton.removeEventListener("click", this.onClickReset.bind(this))
        this.codeButton.addEventListener("click", this.onClickRun.bind(this))
    }

    eval(css){
        this.codeButton.setAttribute("disabled","")
        this.editorWrapperDiv.classList.add("hidden")
        this.htmlView.classList.remove('hidden');
        this.versionDropdown.setAttribute("disabled","")
        this.codeButton.setAttribute("disabled","")
        this.codeButton.innerText = "Code Text"
        let { allWebCode } = collectCodeBlocks("```css\n" + css + "```")
        // const computedStyle = window.getComputedStyle(this.innerContent);
        // const footerComputedStyle = window.getComputedStyle(this.innerContent.querySelector(".content-sticky-footer"))
        // const initialWindowWidth = computedStyle.width;
        // const initialWindowHeight = (Number.parseInt(computedStyle.height.replace("px", "")) - Number.parseInt(footerComputedStyle.height.replace("px", ""))) + "px";
        const computedStyle = window.getComputedStyle(this.editorWrapperDiv);
        const initialWindowWidth = computedStyle.width;
        const initialWindowHeight = computedStyle.height;
        if (allWebCode.length > 0) {
            displayHTMLView(allWebCode, this.htmlView, this, initialWindowWidth, initialWindowHeight);
        } else {
            this.htmlView.classList.add('hidden');
        }
        this.codeButton.innerHTML = 'Code Text';
        this.codeButton.style.backgroundColor = '#717171';
        this.codeButton.removeAttribute("disabled")
        this.codeButton.removeEventListener("click", this.onClickRun.bind(this))
        this.codeButton.addEventListener("click", this.onClickReset.bind(this))
    }
    onResize(newWidth, newHeight) {
        super.onResize(newWidth, newHeight);
        if (this.htmlView) {
            // Set the new dimensions for the editor wrapper div
            this.htmlView.style.width = `${newWidth}px`;
            this.htmlView.style.height = `${newHeight - 60}px`;
        }
    }

}


function createCSSNode(name = '', code = '', settings=undefined) {
    return new CSSNode({
        name,
        code,
        settings
    });
}