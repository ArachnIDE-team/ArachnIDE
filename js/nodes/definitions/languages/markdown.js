

class MarkdownNode extends CodeNode {
    static DEFAULT_CONFIGURATION = {
        name: "",
        code: "",
        settings: {
            language: "markdown",
            libURL: "https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.62.3/mode/markdown/markdown.min.js",
            extension: "md",
            showHint: true,
            versions: ["MD renderer"],
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
        iconID: "markdown-icon-symbol",
        name: "Markdown Code Node",
        defaultFavourite: -1
    }

    constructor(configuration = MarkdownNode.DEFAULT_CONFIGURATION){
        configuration = {...MarkdownNode.DEFAULT_CONFIGURATION, ...configuration}
        configuration.settings =  {...MarkdownNode.DEFAULT_CONFIGURATION.settings, ...configuration.settings}
        super(configuration);
    }

    afterInit() {
        this.markdownView = document.createElement("div");
        this.markdownView.className = "hidden"
        this.markdownView.style.overflowX = "hidden"
        this.markdownView.style.paddingLeft = "5px";
        WindowedNode.makeContentScrollable(this.markdownView, true)
        WindowedNode.makeContentScrollable(this.markdownView)
        this.innerContent.prepend(this.markdownView)
        super.afterInit();
    }

    onClickRun(){
        this.eval(this.code);
    }

    onClickReset(){
        this.editorWrapperDiv.classList.remove("hidden")
        this.markdownView.classList.add('hidden');
        this.versionDropdown.removeAttribute("disabled")
        this.codeButton.innerText = "Run Code"
        this.codeButton.removeEventListener("click", this.onClickReset.bind(this))
        this.codeButton.addEventListener("click", this.onClickRun.bind(this))
    }

    eval(markdown){
        this.editorWrapperDiv.classList.add("hidden");
        this.markdownView.classList.remove('hidden');
        this.versionDropdown.setAttribute("disabled","")
        this.codeButton.setAttribute("disabled","")
        const nestedMarkdownRenderer = {
            code(code, infostring, escaped){
                const lang = (infostring || '').match(/^\S*/)?.[0];
                const escapeTest = /[&<>"']/;
                const escapeReplace = new RegExp(escapeTest.source, 'g');
                const escapeTestNoEncode = /[<>"']|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/;
                const escapeReplaceNoEncode = new RegExp(escapeTestNoEncode.source, 'g');
                const escapeReplacements = {
                    '&': '&amp;',
                    '<': '&lt;',
                    '>': '&gt;',
                    '"': '&quot;',
                    "'": '&#39;'
                };
                const getEscapeReplacement = (ch) => escapeReplacements[ch];

                function escape(html, encode) {
                    if (encode) {
                        if (escapeTest.test(html)) {
                            return html.replace(escapeReplace, getEscapeReplacement);
                        }
                    } else {
                        if (escapeTestNoEncode.test(html)) {
                            return html.replace(escapeReplaceNoEncode, getEscapeReplacement);
                        }
                    }

                    return html;
                }

                code = code.replace(/\n$/, '') + '\n';

                if (!lang) {
                    return '<pre><code>'
                        + (escaped ? code : escape(code, true))
                        + '</code></pre>\n';
                }
                console.log("CODE: ", lang)
                let language = lang.split(' ')[0];
                if(language === "md" || language === "markdown") {
                    code = code.replace(/\\`/g, '`');
                    return '<div class="language-md">' + marked.parse(code, {mangle: false, headerIds: false}) + '</div>';
                }
                return '<pre><code class="language-'
                    + escape(lang)
                    + '">'
                    + (escaped ? code : escape(code, true))
                    + '</code></pre>\n';
            }
        };
        marked.use({ renderer: nestedMarkdownRenderer });
        this.markdownView.innerHTML = marked.parse(markdown, {mangle: false, headerIds: false});;
        this.codeButton.removeAttribute("disabled")
        this.codeButton.addEventListener("click", this.onClickReset.bind(this))
    }

    onResize(newWidth, newHeight) {
        super.onResize(newWidth, newHeight);
        if (this.markdownView) {
            // Set the new dimensions for the editor wrapper div
            this.markdownView.style.width = `${newWidth}px`;
            this.markdownView.style.height = `${newHeight - 55}px`;
        }
    }

    static ondrop() {
        let node = createMarkdownNode();
        node.followingMouse = 1;
        node.draw();
        // Set the dragging point on the header bar
        node.mouseAnchor = node.diagram.background.toDZ(new vec2(0, -node.content.offsetHeight / 2 + 6));
        console.log('Handle drop for the MarkDown Editor icon');

        return node;
    }
}


function createMarkdownNode(name = '', code = '', settings=undefined) {
    return new MarkdownNode({
        name,
        code,
        settings
    });
}