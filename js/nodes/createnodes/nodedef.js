
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
        const textarea = TextNode._getContentElement();
        if(!configuration.saved) {// Create TextNode
            super({title: configuration.name, content: [textarea], ...WindowedNode.getNaturalScaleParameters()});
        } else {// Restore TextNode
            configuration.addCodeButton = configuration.saveData.json.addCodeButton;
            super({title: configuration.name, content:  [textarea], scale: true, saved: true, saveData:  configuration.saveData});
        }
        htmlnodes_parent.appendChild(this.content);
        registernode(this);
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

        let button = document.createElement("button");
        button.innerHTML = "Run Code";
        button.classList.add("code-button");

        // Initially hide the button
        button.style.display = "none";

        if (addCodeButton) {
            button.style.display = "block";
        }

        windowDiv.appendChild(htmlView);
        windowDiv.appendChild(pythonView);
        windowDiv.appendChild(editableDiv);  // Append the contentEditable div to .content div
        windowDiv.appendChild(button);

        this.addCodeButton = addCodeButton;

        if (sx !== undefined) {
            x = (new vec2(sx, sy)).cmult(zoom).plus(pan);
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

class LinkNode extends WindowedNode {
    static DEFAULT_CONFIGURATION = {
        name: "",
        text: "",
        link: "",
        sx: undefined,
        sy: undefined,
        x: undefined,
        y: undefined,
        saved: undefined,
        saveData: undefined,
    }
    static SAVE_PROPERTIES = ['linkText', 'linkUrl', 'isLink'];
    // constructor(name = '', content = undefined, text = '', link = '', sx = undefined, sy = undefined, x = undefined, y = undefined){

    constructor(configuration = LinkNode.DEFAULT_CONFIGURATION) {
        configuration = {...LinkNode.DEFAULT_CONFIGURATION, ...configuration}
        if (!configuration.saved) {// Create LinkNode
            super({title: configuration.name, content: [], ...WindowedNode.getNaturalScaleParameters()});
        } else {// Restore LinkNode
            configuration.text = configuration.saveData.json.linkText;
            configuration.link = configuration.saveData.json.linkUrl;
            super({title: configuration.name, content: [], scale: true, saved: true, saveData: configuration.saveData});
        }
        let [contentWrapper, linkWrapper] = LinkNode._getContentElement(configuration.name, configuration.text, configuration.link);
        htmlnodes_parent.appendChild(this.content);
        registernode(this);
        this.text = configuration.text;
        this.link = configuration.link;
        this._initialize(contentWrapper, linkWrapper, configuration.sx, configuration.sy, configuration.x, configuration.y)
    }

    static _getContentElement(name, text, link){
        let t = document.createElement("input");
        t.setAttribute("type", "text");
        t.setAttribute("value", name);
        t.setAttribute("style", "background:none; ");
        t.classList.add("title-input");

        let a = document.createElement("a");
        a.id = 'link-element';
        a.setAttribute("href", link);
        a.setAttribute("target", "_blank");
        a.textContent = text;
        a.style.cssText = "display: block; padding: 10px; word-wrap: break-word; white-space: pre-wrap; color: #bbb; transition: color 0.2s ease, background-color 0.2s ease; background-color: #222226; border-radius: 5px";

        let linkWrapper = document.createElement("div");
        linkWrapper.id = 'link-wrapper';
        linkWrapper.style.width = "300px";
        linkWrapper.style.padding = "20px 0"; // Add vertical padding
        linkWrapper.appendChild(a);

        let iframeWrapper = document.createElement("div");
        iframeWrapper.id = 'iframe-wrapper';
        iframeWrapper.style.width = "100%";
        iframeWrapper.style.height = "0";
        iframeWrapper.style.flexGrow = "1";
        iframeWrapper.style.flexShrink = "1";
        iframeWrapper.style.display = "none";
        iframeWrapper.style.boxSizing = "border-box";

        //iframe button
        let button = document.createElement("button");
        button.textContent = "Load as iframe";
        button.classList.add("linkbuttons");
        button.id = 'iframe-button';

        //extract text
        let extractButton = document.createElement("button");
        extractButton.textContent = "Extract Text";
        extractButton.classList.add("linkbuttons");
        extractButton.id = 'extract-button';

        //display through proxy
        let displayWrapper = document.createElement("div");
        displayWrapper.classList.add("display-wrapper");
        displayWrapper.style.width = "100%";
        displayWrapper.style.height = "100%";
        displayWrapper.style.flexGrow = "1";
        displayWrapper.style.flexShrink = "1";
        displayWrapper.style.display = "none";
        displayWrapper.style.boxSizing = "border-box";

        let displayButton = document.createElement("button");
        displayButton.textContent = "Display Webpage";
        displayButton.classList.add("linkbuttons");
        displayButton.id = 'display-button';

        let buttonsWrapper = document.createElement("div");
        buttonsWrapper.classList.add("buttons-wrapper");
        buttonsWrapper.style.order = "1";
        buttonsWrapper.appendChild(button);
        buttonsWrapper.appendChild(displayButton);
        buttonsWrapper.appendChild(extractButton);

        let contentWrapper = document.createElement("div");
        contentWrapper.style.display = "flex";
        contentWrapper.style.flexDirection = "column";
        contentWrapper.style.alignItems = "center";
        contentWrapper.style.height = "100%";

        contentWrapper.appendChild(linkWrapper);
        contentWrapper.appendChild(iframeWrapper);
        contentWrapper.appendChild(displayWrapper);
        contentWrapper.appendChild(buttonsWrapper);
        return [contentWrapper, linkWrapper];
    }

    _initialize(contentWrapper, linkWrapper, sx, sy, x, y){
        let windowDiv = this.windowDiv;
        windowDiv.appendChild(contentWrapper);

        let minWidth = Math.max(linkWrapper.offsetWidth, contentWrapper.offsetWidth) + 5;
        let minHeight = Math.max(linkWrapper.offsetHeight, contentWrapper.offsetHeight) + 35;
        windowDiv.style.width = minWidth + "px";
        windowDiv.style.height = minHeight + "px";

        this.isLink = true;

        this.afterInit();
    }

    afterInit() {
        this.displayWrapper = this.content.querySelector(".display-wrapper");

        this.iframeWrapper = this.content.querySelector("#iframe-wrapper");

        this.iframeButton = this.content.querySelector("#iframe-button");

        this.displayIframe = this.content.querySelector("iframe");

        this.displayButton = this.content.querySelector("#display-button");

        this.link = this.content.querySelector("#link-element");

        this.linkUrl = this.content.querySelector("#link-element") ? this.content.querySelector("#link-element").getAttribute("href") : "";

        this.linkText = this.content.querySelector("#link-element") ? this.content.querySelector("#link-element").textContent : "";

        this.linkWrapper = this.content.querySelector("#link-wrapper");

        this.extractButton = this.content.querySelector("#extract-button");

        this._addEventListeners(this)

        super.afterInit();
    }

    _addEventListeners() {
        let windowDiv = this.windowDiv;
        let iframeWrapper = this.iframeWrapper;
        let displayWrapper = this.displayWrapper;
        // Initialize the resize observer
        this.observeContentResize(windowDiv, iframeWrapper, displayWrapper);
        // observeContentResize(windowDiv, iframeWrapper, displayWrapper);

        this._setupIframeButtonListeners()
        this._setupDisplayButtonListeners();
        this._setupExtractButtonListeners()
        this._setupLinkListeners();
    }

    _setupDisplayButtonListeners() {
        let displayButton = this.displayButton;
        let displayWrapper = this.displayWrapper;
        let linkWrapper = this.linkWrapper;
        let button = this.iframeButton;
        let link = this.link;
        let extractButton = this.extractButton;
        const windowDiv = this.windowDiv;
        const buttonsWrapper = this.content.querySelector(".buttons-wrapper");

        displayButton.addEventListener("click", async function () {
            let displayIframe = displayWrapper.querySelector("iframe");

            if (displayIframe) {
                displayIframe.remove();
                displayButton.textContent = "Display Webpage";
                displayWrapper.style.display = "none";
                linkWrapper.style.display = "block";
            } else {
                // Iframe does not exist, so fetch the webpage content and create it
                try {
                    const response = await fetch('http://localhost:4000/raw-proxy?url=' + encodeURIComponent(link));

                    if (response.ok) {
                        const webpageContent = await response.text();
                        displayIframe = document.createElement("iframe");
                        displayIframe.srcdoc = webpageContent;
                        displayIframe.style.width = "100%";
                        displayIframe.style.height = "100%";
                        displayIframe.style.overflow = "auto";

                        displayWrapper.appendChild(displayIframe);
                        displayButton.textContent = "Close Webpage";
                        displayWrapper.style.display = "block";
                        linkWrapper.style.display = "none";

                        let availableHeight = windowDiv.offsetHeight - buttonsWrapper.offsetHeight;
                        displayWrapper.style.height = availableHeight + 'px';
                    } else {
                        console.error('Failed to fetch webpage content:', response.statusText);
                        alert("An error occurred displaying the webpage through a proxy server. Please ensure that the extract server is running on your localhost.");
                    }
                } catch (error) {
                    console.error('Error fetching webpage content:', error);
                    alert("An error occurred displaying the webpage. Please check your network and try again.");
                }
            }
        });
    }

    _setupExtractButtonListeners() {
        let extractButton = this.extractButton;

        let link = this.linkUrl;

        extractButton.addEventListener("click", async function () {
            let dotCount = 0;

            const dotInterval = setInterval(() => {
                dotCount = (dotCount + 1) % 4;
                extractButton.textContent = "Extracting" + ".".repeat(dotCount);
            }, 500);

            let storageKey = link;
            if (this && this.fileName) {
                storageKey = this.fileName;
            }

            async function processExtraction(text, storageKey) {
                extractButton.textContent = "Storing...";
                await storeTextData(storageKey, text);
                extractButton.textContent = "Extracted";
            }

            try {
                if (link.toLowerCase().endsWith('.pdf') || link.startsWith('blob:')) {
                    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.9.179/build/pdf.worker.min.js';
                    const loadingTask = pdfjsLib.getDocument(link);
                    loadingTask.promise.then(async (pdf) => {
                        let extractedText = '';
                        for (let i = 1; i <= pdf.numPages; i++) {
                            const page = await pdf.getPage(i);
                            const textContent = await page.getTextContent();
                            extractedText += textContent.items.map(item => item.str).join(' ');
                        }
                        await processExtraction(extractedText, storageKey);
                    }).catch(error => {
                        console.error('Error reading PDF:', error);
                        extractButton.textContent = "Extract Failed";
                    });
                } else {
                    await fetchAndStoreWebPageContent(link);
                    extractButton.textContent = "Extracted";
                }
            } catch (error) {
                console.error('Error during extraction:', error);
                extractButton.textContent = "Extract Failed";
                alert("An error occurred during extraction. Please ensure that the extract server is running on your localhost. Localhosts can be found at the Github link in the ? tab.");
            } finally {
                clearInterval(dotInterval);
            }
        });
    }

    _setupLinkListeners() {
        let a = this.link;

        a.addEventListener('mouseover', function () {
            this.style.color = '#888';
            this.style.backgroundColor = '#1a1a1d'; // Change background color on hover
        }, false);

        a.addEventListener('mouseout', function () {
            this.style.color = '#bbb';
            this.style.backgroundColor = '#222226'; // Reset background color when mouse leaves
        }, false);
    }

    _setupIframeButtonListeners() {
        const button = this.iframeButton;
        const iframeWrapper = this.iframeWrapper;
        const linkWrapper = this.linkWrapper;
        const link = this.linkUrl;
        const windowDiv = this.windowDiv;
        const buttonsWrapper = this.content.querySelector(".buttons-wrapper");

        let iframe = iframeWrapper.querySelector("iframe");
        if (!iframe) {
            iframe = document.createElement("iframe");
            iframe.setAttribute("style", "width: 100%; height: 100%; border: none; overflow: auto;");
            iframeWrapper.appendChild(iframe); // Append once and reuse
        }

        button.addEventListener("click", () => {
            if (iframeWrapper.style.display === "none") {
                linkWrapper.style.display = "none";
                iframeWrapper.style.display = "block";
                button.textContent = "Return to link";

                // Set the src attribute of the iframe here
                iframe.setAttribute("src", link);

                let availableHeight = windowDiv.offsetHeight - buttonsWrapper.offsetHeight;
                iframeWrapper.style.height = availableHeight + 'px';
            } else {
                linkWrapper.style.display = "block";
                iframeWrapper.style.display = "none";
                button.textContent = "Load as iframe";
                iframe.setAttribute("src", "");
            }
        });
    }

}

function createLinkNode(name = '', text = '', link = '', sx = undefined, sy = undefined, x = undefined, y = undefined) {
    return new LinkNode({
        name: name,
        text: text,
        link: link,
        sx: sx,
        sy: sy,
        x: x,
        y: y
    });
    // return new LinkNode(name, undefined, text, link, sx, sy, x, y);
}
// To-Do: Find method to refresh saves of link nodes before the save update.

const llmOptions = [
    { id: 'google-search', label: 'Search' },
    { id: 'code', label: 'Code' },
    { id: 'halt-questions', label: 'Halt' },
    { id: 'embed', label: 'Data' },
    { id: 'enable-wolfram-alpha', label: 'Wolfram' },
    { id: 'wiki', label: 'Wiki' }
];

class LLMNode extends WindowedNode {
    static DEFAULT_CONFIGURATION = {
        name: "",
        sx: undefined,
        sy: undefined,
        x: undefined,
        y: undefined,
        saved: undefined,
        saveData: undefined,
    }
    static SAVE_PROPERTIES = ['chat', 'LocalLLMSelectID', 'aiResponding', 'aiResponseHalted', 'codeBlockCount', 'id',
        'index', 'latestUserMessage', 'localAiResponding', 'savedCheckboxStates', 'savedCustomInstructions',
        'savedTemperature', 'savedLocalLLMSelect', 'savedLLMSelection', 'savedMaxContextSize', 'savedMaxTokens', 'savedTextContent',
        'shouldAppendQuestion', 'shouldContinue', 'userHasScrolled', 'isLLM', 'isLLMNode'];

    // constructor(name = '', content = undefined, sx = undefined, sy = undefined, x = undefined, y = undefined){

    constructor(configuration = LLMNode.DEFAULT_CONFIGURATION){
        configuration = {...LLMNode.DEFAULT_CONFIGURATION, ...configuration}
        let [ainodewrapperDiv, aiResponseTextArea] = LLMNode._getContentElement(configuration);
        if (!configuration.saved) {// Create LLMNode
            super({title: configuration.name, content: [], ...WindowedNode.getNaturalScaleParameters()});
        } else {// Restore LLMNode
            super({
                title: configuration.name,
                content: [],
                scale: true,
                saved: true,
                saveData: configuration.saveData
            })
        }
        htmlnodes_parent.appendChild(this.content);
        registernode(this);
        this._initialize(ainodewrapperDiv, aiResponseTextArea, configuration.saved)
    }

    get chat(){
        const responseHandler = nodeResponseHandlers.get(this);
        return responseHandler.saveAiResponseDiv()
    }

    set chat(value){
        const setChat = function(chat) {
            const responseHandler = nodeResponseHandlers.get(this);
            for (let message of chat) {
                if(message.role === 'user') {
                    responseHandler.handleUserPrompt(message.message);
                    this.aiResponding = true
                }
                if(message.role === 'ai' && message.message) {
                    responseHandler.handleMarkdown(message.message);
                    this.aiResponding = false;
                }
                if(message.role === 'ai' && message.code && message.language) {
                    responseHandler.currentLanguage = message.language;
                    responseHandler.renderCodeBlock(message.code);
                    this.aiResponding = false;
                }

            }
        }.bind(this)
        if(this.initialized){
            setChat(value);
        } else {
            this.addAfterInitCallback(() => {
                setChat(value);
            })
        }
    }

    set savedLocalLLMSelect(value) {
        const setSavedModelLLMSelect = function(selection) {
            this.localLLMSelect.value = selection;
            // Force a UI update for select
            const optionsReplacer = this.localLLMSelect.parentNode.querySelector(".options-replacer");
            const selectReplacer = this.localLLMSelect.parentNode.querySelector(".select-replacer");
            optionsReplacer.querySelector(".selected").classList.remove("selected")
            const selectedOption = optionsReplacer.querySelector("[data-value='" + this.localLLMSelect.value + "']");
            selectedOption.classList.add("selected")
            selectReplacer.children[0].innerText = selectedOption.innerText;
        }.bind(this)
        if(this.initialized){
            setSavedModelLLMSelect(value);
        } else {
            this.addAfterInitCallback(() => {
                setSavedModelLLMSelect(value);

            })
        }
    }

    get savedLocalLLMSelect() {
        return this.localLLMSelect.value;
    }

    static _getContentElement(configuration = LLMNode.DEFAULT_CONFIGURATION){

        // Create the AI response textarea
        let aiResponseTextArea = document.createElement("textarea");
        const index = configuration.saved ? configuration.saveData.json.index : llmNodeCount;
        aiResponseTextArea.id = `LLMnoderesponse-${index}`;  // Assign unique id to each aiResponseTextArea
        aiResponseTextArea.style.display = 'none';  // Hide the textarea

        // Create the AI response container
        let aiResponseDiv = document.createElement("div");
        aiResponseDiv.id = `LLMnoderesponseDiv-${index}`;  // Assign unique id to each aiResponseDiv
        aiResponseDiv.classList.add('custom-scrollbar', 'ai-response-div');
        aiResponseDiv.setAttribute("style", "background: linear-gradient(to bottom, rgba(34, 34, 38, 0), #222226); color: inherit; border: none; border-color: #8882; width: 100%; max-height: 80%; height: 80%; overflow-y: auto; overflow-x: hidden; resize: none; word-wrap: break-word; user-select: none; line-height: 1.75;");

        // Create the user prompt textarea
        let promptTextArea = document.createElement("textarea");
        promptTextArea.id = `nodeprompt-${index}`;
        promptTextArea.classList.add('custom-scrollbar', 'custom-textarea'); // Add the class here

        // Create the send button
        let sendButton = document.createElement("button");
        sendButton.type = "submit";
        sendButton.id = `prompt-form-${index}`;
        sendButton.style.cssText = "display: flex; justify-content: center; align-items: center; padding: 3px; z-index: 1; font-size: 14px; cursor: pointer; background-color: #222226; transition: background-color 0.3s; border: inset; border-color: #8882; width: 30px; height: 30px;";

        sendButton.innerHTML = `
    <svg width="24" height="24">
        <use xlink:href="#play-icon"></use>
    </svg>`;

        // Create the regenerate button
        let regenerateButton = document.createElement("button");
        regenerateButton.type = "button";
        regenerateButton.id = "prompt-form";
        regenerateButton.style.cssText = "display: flex; justify-content: center; align-items: center; padding: 3px; z-index: 1; font-size: 14px; cursor: pointer; background-color: #222226; transition: background-color 0.3s; border: inset; border-color: #8882; width: 30px; height: 30px; border-radius: 50%;";
        regenerateButton.innerHTML = `
    <svg width="24" height="24">
        <use xlink:href="#refresh-icon"></use>
    </svg>`;

        // Create settings button
        const aiNodeSettingsButton = document.createElement('button');
        aiNodeSettingsButton.type = "button";
        aiNodeSettingsButton.id = 'aiNodeSettingsButton';
        aiNodeSettingsButton.style.cssText = "display: flex; justify-content: center; align-items: center; padding: 3px; z-index: 1; font-size: 14px; cursor: pointer; background-color: #222226; transition: background-color 0.3s; border: inset; border-color: #8882; width: 30px; height: 30px;";

        // Clone the SVG element
        const settingsIcon = document.getElementById('aiNodeSettingsIcon').cloneNode(true);
        settingsIcon.style.display = 'inline-block';

        // Append the SVG to the button
        aiNodeSettingsButton.appendChild(settingsIcon);

        // Initialize the button's active state as false
        aiNodeSettingsButton.isActive = false;

        // Create the loader and error icons container
        let statusIconsContainer = document.createElement("div");
        statusIconsContainer.className = 'status-icons-container';
        statusIconsContainer.style.cssText = 'position: absolute; top: 40px; right: 80px; width: 20px; height: 20px;';

        // Create the loader icon
        let aiLoadingIcon = document.createElement("div");
        aiLoadingIcon.className = 'loader';
        aiLoadingIcon.id = `aiLoadingIcon-${index}`; // Assign unique id
        aiLoadingIcon.style.display = 'none';

        // Create the error icon
        let aiErrorIcon = document.createElement("div");
        aiErrorIcon.className = 'error-icon-css';
        aiErrorIcon.id = `aiErrorIcon-${index}`; // Assign unique id
        aiErrorIcon.style.display = 'none';

        // Create the 'X' mark inside the error icon
        let xMark = document.createElement("div");
        xMark.className = 'error-x-mark';

        let xMarkLeft = document.createElement("div");
        xMarkLeft.className = 'error-x-mark-left';

        let xMarkRight = document.createElement("div");
        xMarkRight.className = 'error-x-mark-right';

        xMark.appendChild(xMarkLeft);
        xMark.appendChild(xMarkRight);
        aiErrorIcon.appendChild(xMark); // Append the 'X' mark to the error icon

        // Append loader and error icons to container
        statusIconsContainer.appendChild(aiLoadingIcon);
        statusIconsContainer.appendChild(aiErrorIcon);

        // Create a div to wrap prompt textarea and buttons
        let buttonDiv = document.createElement("div");
        buttonDiv.appendChild(sendButton);
        buttonDiv.appendChild(regenerateButton);
        buttonDiv.appendChild(aiNodeSettingsButton);
        buttonDiv.style.cssText = "display: flex; flex-direction: column; align-items: flex-end; margin-bottom: 12px; margin-top: 4px;";

        // Create the promptDiv with relative position
        let promptDiv = document.createElement("div");
        promptDiv.style.cssText = "display: flex; flex-direction: row; justify-content: space-between; align-items: center; position: relative;"; // Added position: relative;

        // Append statusIconsContainer to the promptDiv instead of wrapperDiv
        promptDiv.appendChild(statusIconsContainer);
        promptDiv.appendChild(promptTextArea);
        promptDiv.appendChild(buttonDiv);

        // Wrap elements in a div
        let ainodewrapperDiv = document.createElement("div");
        ainodewrapperDiv.className = 'ainodewrapperDiv';
        ainodewrapperDiv.style.position = 'relative'; // <-- Add this line to make sure the container has a relative position
        ainodewrapperDiv.style.width = "500px";
        ainodewrapperDiv.style.height = "520px";

        ainodewrapperDiv.appendChild(aiResponseTextArea);
        ainodewrapperDiv.appendChild(aiResponseDiv);
        ainodewrapperDiv.appendChild(promptDiv);

        const initialTemperature = document.getElementById('model-temperature').value;
        const initialMaxTokens = document.getElementById('max-tokens-slider').value;
        const initialMaxContextSize = document.getElementById('max-context-size-slider').value;

        // Create and configure the settings
        const LocalLLMSelect = LLMNode._createAndConfigureLocalLLMDropdown(index);

        const temperatureSliderContainer = LLMNode._createSlider(`node-temperature-${index}`, 'Temperature', initialTemperature, 0, 1, 0.1);
        const maxTokensSliderContainer = LLMNode._createSlider(`node-max-tokens-${index}`, 'Max Tokens', initialMaxTokens, 10, 16000, 1);
        const maxContextSizeSliderContainer = LLMNode._createSlider(`node-max-context-${index}`, 'Max Context', initialMaxContextSize, 1, initialMaxTokens, 1);


        // Create settings container
        const aiNodeSettingsContainer = LLMNode._createSettingsContainer();


        // Add the dropdown (LocalLLMSelect) into settings container
        aiNodeSettingsContainer.appendChild(LocalLLMSelect);  // LocalLLMSelect is the existing dropdown
        aiNodeSettingsContainer.appendChild(temperatureSliderContainer);
        aiNodeSettingsContainer.appendChild(maxTokensSliderContainer);
        aiNodeSettingsContainer.appendChild(maxContextSizeSliderContainer);

        const firstSixOptions = llmOptions.slice(0, 6);
        const checkboxArray1 = LLMNode._createCheckboxArray(index, firstSixOptions);
        aiNodeSettingsContainer.appendChild(checkboxArray1);

        const customInstructionsTextarea = LLMNode._createCustomInstructionsTextarea(index);
        aiNodeSettingsContainer.appendChild(customInstructionsTextarea);

        // Add settings container to the ainodewrapperDiv
        ainodewrapperDiv.appendChild(aiNodeSettingsContainer);

        return [ainodewrapperDiv, aiResponseTextArea];
    }

    static _createSettingsContainer() {
        const settingsContainer = document.createElement('div');
        settingsContainer.className = 'ainode-settings-container';
        settingsContainer.style.display = 'none';  // Initially hidden

        return settingsContainer;
    }

    static _createSlider(id, label, initialValue, min, max, step) {
        const sliderDiv = document.createElement('div');
        sliderDiv.classList.add('slider-container');

        const sliderLabel = document.createElement('label');
        sliderLabel.setAttribute('for', id);
        sliderLabel.innerText = `${label}: ${initialValue}`;

        const sliderInput = document.createElement('input');
        sliderInput.type = 'range';
        sliderInput.id = id;

        // First, set the min and max
        sliderInput.min = min;
        sliderInput.max = max;

        // Then, set the step and initial value
        sliderInput.step = step;
        sliderInput.value = initialValue;

        sliderDiv.appendChild(sliderLabel);
        sliderDiv.appendChild(sliderInput);

        return sliderDiv;
    }

    static _createAndConfigureLocalLLMDropdown(index) {
        // Create the Local LLM dropdown
        let LocalLLMSelect = document.createElement("select");
        LocalLLMSelect.id = `dynamicLocalLLMselect-${index}`;
        LocalLLMSelect.classList.add('inline-container');
        LocalLLMSelect.style.backgroundColor = "#222226";
        LocalLLMSelect.style.border = "none";

        let localLLMCheckbox = document.getElementById("localLLM");


        // Create an array to store the options
        let options = [
            new Option('OpenAI', 'OpenAi', false, true),
            new Option('Red Pajama 3B f32', 'RedPajama-INCITE-Chat-3B-v1-q4f32_0', false, false),
            new Option('Vicuna 7B f32', 'vicuna-v1-7b-q4f32_0', false, false),
            new Option('Llama 2 7B f32', 'Llama-2-7b-chat-hf-q4f32_1', false, false),
            //new Option('Llama 2 13B f32', 'Llama-2-13b-chat-hf-q4f32_1', false, false),
            new Option('Llama 2 70B f16', 'Llama-2-70b-chat-hf-q4f16_1', false, false),
            //new Option('WizardCoder 15B f32', '"WizardCoder-15B-V1.0-q4f32_1', false, false),
            new Option('gpt-3.5-turbo', 'gpt-3.5-turbo', false, false),
            //new Option('gpt-3.5-turbo-16k', 'gpt-3.5-turbo-16k', false, false),
            //new Option('gpt-3.5-turbo-0613', 'gpt-3.5-turbo-0613', false, false),
            new Option('gpt-3.5-16k-0613', 'gpt-3.5-turbo-16k-0613', false, false),
            new Option('gpt-4', 'gpt-4', false, false),
            new Option('gpt-4-0613', 'gpt-4-0613', false, false),
            new Option('gpt-4-vision', 'gpt-4-vision-preview', false, false),
            new Option('gpt-3.5-1106', 'gpt-3.5-turbo-1106', false, false),
            new Option('gpt-4-1106', 'gpt-4-1106-preview', false, false)
        ];

        // Add options to the select
        options.forEach((option, index) => {
            LocalLLMSelect.add(option, index);
        });

        // Initial setup based on checkbox state
        options.forEach((option) => {
            if (option.value === 'OpenAi' || option.value.startsWith('gpt-')) {
                option.hidden = false;  // Always show
            } else {
                option.hidden = !localLLMCheckbox.checked;  // Show or hide based on checkbox initial state
            }
        });

        return LocalLLMSelect;
    }

    static _createCheckboxArray(index, subsetOptions) {
        const checkboxArrayDiv = document.createElement('div');
        checkboxArrayDiv.className = 'checkboxarray';

        for (const option of subsetOptions) {
            const checkboxDiv = document.createElement('div');

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = `${option.id}-checkbox-${index}`;
            checkbox.name = `${option.id}-checkbox-${index}`;

            const label = document.createElement('label');
            label.setAttribute('for', checkbox.id);
            label.innerText = option.label;

            checkboxDiv.appendChild(checkbox);
            checkboxDiv.appendChild(label);
            checkboxArrayDiv.appendChild(checkboxDiv);
        }

        return checkboxArrayDiv;
    }

    static _createCustomInstructionsTextarea(index) {
        const textareaDiv = document.createElement('div');
        textareaDiv.className = 'textarea-container';

        const textarea = document.createElement('textarea');
        textarea.id = `custom-instructions-textarea-${index}`;
        textarea.className = 'custom-scrollbar';  // Apply the custom-scrollbar class here
        textarea.placeholder = 'Enter custom instructions here...';

        textareaDiv.appendChild(textarea);

        return textareaDiv;
    }

    _initialize(ainodewrapperDiv, aiResponseTextArea, saved){
        let windowDiv = this.windowDiv;
        windowDiv.style.resize = 'both';
        // Append the ainodewrapperDiv to windowDiv of the node
        windowDiv.appendChild(ainodewrapperDiv);
        if(!saved){
            // Additional configurations
            this.id = aiResponseTextArea.id;  // Store the id in the node object
            this.index = llmNodeCount;
            this.aiResponding = false;
            this.localAiResponding = false;
            this.latestUserMessage = null;
            this.shouldContinue = true;
            this.LocalLLMSelectID = `dynamicLocalLLMselect-${this.index}`;
            this.isLLMNode = true;
            this.shouldAppendQuestion = false;
            this.aiResponseHalted = false;
            this.savedCheckboxStates = {};
            this.savedCustomInstructions = '';
            this.savedLLMSelection = '';
            this.savedTextContent = '';
            this.isLLM = true;
        }
        this.afterInit();
    }

    afterInit() {
        llmNodeCount++;

        this.ainodewrapperDiv = this.content.querySelector('.ainodewrapperDiv');

        this.aiResponseDiv = this.content.querySelector('[id^="LLMnoderesponseDiv-"]');

        this.aiResponseTextArea = this.content.querySelector('[id^="LLMnoderesponse-"]');

        this.promptTextArea = this.content.querySelector('[id^="nodeprompt-"]');

        this.sendButton = this.content.querySelector('[id^="prompt-form-"]');

        this.haltCheckbox = this.content.querySelector('input[id^="halt-questions-checkbox"]');

        this.regenerateButton = this.content.querySelector('#prompt-form');

        this.localLLMSelect = this.content.querySelector(`[id^="dynamicLocalLLMselect-"]`);

        // Setup event listeners
        this._setupAiResponseTextAreaListener();
        this._setupAiNodeResponseDivListeners();
        this._setupAiNodePromptTextAreaListeners();
        this._setupAiNodeSendButtonListeners();
        this._setupAiNodeRegenerateButtonListeners();
        this._setupAiNodeSettingsButtonListeners();
        this._setupAiNodeLocalLLMDropdownListeners();
        this._setupAiNodeSliderListeners()
        this._setupAiNodeCheckBoxArrayListeners()
        this._setupAiNodeCustomInstructionsListeners()

        // Functions

        this.controller = new AbortController();

        //Handles parsing of conversation divs.
        let responseHandler = new ResponseHandler(this);
        nodeResponseHandlers.set(this, responseHandler); // map response handler to this

        this.removeLastResponse = responseHandler.removeLastResponse.bind(responseHandler);
        responseHandler.restoreAiResponseDiv()


        this.haltResponse = () => this._aiNodeHaltResponse();

        super.afterInit();
    }

    _aiNodeHaltResponse() {
        if (this.aiResponding) {
            // AI is responding, so we want to stop it
            this.controller.abort(); // Send the abort signal to the fetch request
            this.aiResponding = false;
            this.shouldContinue = false;
            this.regenerateButton.innerHTML = `
            <svg width="24" height="24" class="icon">
                <use xlink:href="#refresh-icon"></use>
            </svg>`;
            this.promptTextArea.value = this.latestUserMessage; // Add the last user message to the prompt input

            // Access the responseHandler from the nodeResponseHandlers map
            let responseHandler = nodeResponseHandlers.get(this);

            // If currently in a code block
            if (responseHandler && responseHandler.inCodeBlock) {
                // Add closing backticks to the current code block content
                responseHandler.codeBlockContent += '```\n';

                // Render the final code block
                responseHandler.renderCodeBlock(responseHandler.codeBlockContent, true);

                // Reset the code block state
                responseHandler.codeBlockContent = '';
                responseHandler.codeBlockStartIndex = -1;
                responseHandler.inCodeBlock = false;

                // Clear the textarea value to avoid reprocessing
                this.aiResponseTextArea.value = responseHandler.previousContent + responseHandler.codeBlockContent;

                // Update the previous content length
                responseHandler.previousContentLength = this.aiResponseTextArea.value.length;
                this.aiResponseTextArea.dispatchEvent(new Event('input'));
            }
            this.aiResponseHalted = true;
        }

        // Update the halt checkbox to reflect the halted state
        const haltCheckbox = this.haltCheckbox;
        if (haltCheckbox) {
            haltCheckbox.checked = true;
        }
    }

    _setupAiNodeResponseDivListeners() {
        let aiResponseDiv = this.aiResponseDiv;
        let aiResponseTextArea = this.aiResponseTextArea;
        aiResponseDiv.onmousedown = function (event) {
            if (!event.altKey) {
                cancel(event);
            }
        };

        aiResponseDiv.addEventListener('mouseenter', () => {
            aiResponseDiv.style.userSelect = "text";
        });
        aiResponseDiv.addEventListener('mouseleave', () => {
            aiResponseDiv.style.userSelect = "none";
        });

        // Add a 'wheel' event listener
        aiResponseDiv.addEventListener('wheel', () => {
            // If the Shift key is not being held down, stop the event propagation
            if (!event.shiftKey) {
                event.stopPropagation();
            }
        }, { passive: false });

        let userHasScrolled = false;

        // Function to scroll to bottom
        const scrollToBottom = () => {
            if (!userHasScrolled) {
                setTimeout(() => {
                    aiResponseDiv.scrollTo({
                        top: aiResponseDiv.scrollHeight,
                        behavior: 'smooth'
                    });
                }, 0);
            }
        };

        // Call scrollToBottom whenever there's an input
        aiResponseTextArea.addEventListener('input', scrollToBottom);


        // Tolerance in pixels
        const epsilon = 5;

        // Function to handle scrolling
        const handleScroll = () => {
            if (Math.abs(aiResponseDiv.scrollTop + aiResponseDiv.clientHeight - aiResponseDiv.scrollHeight) > epsilon) {
                userHasScrolled = true;
            } else {
                userHasScrolled = false;
            }
        };

        // Event listener for scrolling
        aiResponseDiv.addEventListener('scroll', handleScroll);

        // Disable text highlighting when Alt key is down and re-enable when it's up
        document.addEventListener('keydown', (event) => {
            if (event.altKey) {
                aiResponseDiv.style.userSelect = 'none';
            }
        });

        document.addEventListener('keyup', (event) => {
            if (!event.altKey) {
                aiResponseDiv.style.userSelect = 'text';
            }
        });

        // ... other event listeners for aiResponseDiv ...
    }

    // Function to handle setup of aiResponseTextArea listener
    _setupAiResponseTextAreaListener() {
        const aiResponseTextArea = this.content.querySelector('[id^="LLMnoderesponse-"]');
        this.aiResponseTextArea = aiResponseTextArea;

        // Restore saved text content if available
        if (this.savedTextContent !== undefined) {
            aiResponseTextArea.value = this.savedTextContent;
        }

        // Function to save text content
        const saveTextContent = () => {
            this.savedTextContent = aiResponseTextArea.value;
        };

        // Attach debounced event listener
        aiResponseTextArea.addEventListener('input', debounce(saveTextContent, 300));
    }

    _setupAiNodePromptTextAreaListeners() {
        let promptTextArea = this.promptTextArea

        promptTextArea.onmousedown = cancel;  // Prevent dragging
        promptTextArea.addEventListener('input', autoGrow);
        promptTextArea.addEventListener('mouseenter', () => {
            promptTextArea.style.userSelect = "text";
        });
        promptTextArea.addEventListener('mouseleave', () => {
            promptTextArea.style.userSelect = "none";
        });
        promptTextArea.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendLLMNodeMessage(this);
            }
        });
        promptTextArea.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                if (e.shiftKey) {
                    // Allow the new line to be added
                } else {
                    e.preventDefault();
                    sendLLMNodeMessage(this);
                }
            }
        });

        // ... other event listeners for promptTextArea ...
    }

    _setupAiNodeSendButtonListeners() {
        let sendButton = this.sendButton;

        let haltCheckbox = this.haltCheckbox;

        sendButton.addEventListener('mouseover', function () {
            this.style.backgroundColor = '#293e34';
            this.style.color = '#222226';
        });

        sendButton.addEventListener('mouseout', function () {
            this.style.backgroundColor = '#222226';
            this.style.color = '#ddd';
        });
        sendButton.addEventListener('mousedown', function () {
            this.style.backgroundColor = '#45a049';
        });
        sendButton.addEventListener('mouseup', function () {
            this.style.backgroundColor = '#ddd';
        });

        sendButton.addEventListener("click", (e) => {
            e.preventDefault();

            // Reset the flag and uncheck the checkbox
            this.aiResponseHalted = false;

            if (haltCheckbox) {
                haltCheckbox.checked = false;
            }

            sendLLMNodeMessage(this);
        });

        if (haltCheckbox) {
            haltCheckbox.addEventListener('change', () => {
                this.aiResponseHalted = this.checked;
                if (this.checked) {
                    this.haltResponse();
                }
            });
        }
    }

    _setupAiNodeRegenerateButtonListeners() {
        let regenerateButton = this.regenerateButton;

        regenerateButton.addEventListener('mouseover', function () {
            this.style.backgroundColor = '#333';
        });
        regenerateButton.addEventListener('mouseout', function (){
            this.style.backgroundColor = '#222226';
        });
        regenerateButton.addEventListener('mousedown', function () {
            this.style.backgroundColor = '#45a049';
        });
        regenerateButton.addEventListener('mouseup', function () {
            this.style.backgroundColor = '#222226';
        });


        this.regenerateResponse = function () {
            if (!this.aiResponding) {
                // AI is not responding, so we want to regenerate
                this.removeLastResponse(); // Remove the last AI response
                this.promptTextArea.value = this.latestUserMessage; // Restore the last user message into the input prompt
                this.regenerateButton.innerHTML = `
    <svg width="24" height="24" class="icon">
        <use xlink:href="#refresh-icon"></use>
    </svg>`;
            }
        };

        regenerateButton.addEventListener("click", () => {
            if (this.aiResponding) {
                // If the AI is currently responding, halt the response
                this.haltResponse();
            } else {
                // Otherwise, regenerate the response
                this.regenerateResponse();
            }
        });
    }

    _setupAiNodeSettingsButtonListeners() {
        let aiNodeSettingsButton = this.content.querySelector('#aiNodeSettingsButton');
        let aiNodeSettingsContainer = this.content.querySelector('.ainode-settings-container');

        aiNodeSettingsButton.addEventListener('mouseover', function () {
            this.style.backgroundColor = this.isActive ? '#1e3751' : '#333';
        });
        aiNodeSettingsButton.addEventListener('mouseout', function () {
            this.style.backgroundColor = this.isActive ? '#1e3751' : '#222226';
        });
        aiNodeSettingsButton.addEventListener('mousedown', function () {
            this.style.backgroundColor = '#1e3751';
        });
        aiNodeSettingsButton.addEventListener('mouseup', function () {
            this.style.backgroundColor = this.isActive ? '#1e3751' : '#333';
        });
        aiNodeSettingsButton.addEventListener('click', function (event) {
            this.isActive = !this.isActive;  // Toggle the active state
            LLMNode._toggleSettings(event, aiNodeSettingsContainer);  // Call your existing function
            // Set the background color based on the new active state
            this.style.backgroundColor = this.isActive ? '#1e3751' : '#333';
        });

        // Add the listener for mousedown event
        aiNodeSettingsContainer.addEventListener('mousedown', LLMNode._conditionalStopPropagation, false);

        // Add the listener for dblclick event
        aiNodeSettingsContainer.addEventListener('dblclick', LLMNode._conditionalStopPropagation, false);
    }

    static _conditionalStopPropagation(event) {
        if (!altHeld) {
            event.stopPropagation();
        }
    }

    static _toggleSettings(event, settingsContainer) {
        event.stopPropagation();
        const display = settingsContainer.style.display;
        settingsContainer.style.display = display === 'none' || display === '' ? 'grid' : 'none';
    }

    _setupAiNodeLocalLLMDropdownListeners() {
        let selectElement = this.localLLMSelect;

        const localLLMCheckbox = document.getElementById("localLLM");

        localLLMCheckbox.addEventListener('change', () => {
            // Access the options from the selectElement
            const options = selectElement.options;

            for (let i = 0; i < options.length; i++) {
                let option = options[i];
                if (option.value === 'OpenAi' || option.value.startsWith('gpt-')) {
                    option.hidden = false;  // Always show
                } else {
                    option.hidden = !this.checked;  // Show or hide based on checkbox
                }
            }

            // Also update the visibility of custom options
            const customOptions = document.querySelectorAll('.options-replacer div');
            customOptions.forEach((customOption) => {
                const value = customOption.getAttribute('data-value');
                if (value === 'OpenAi' || value.startsWith('gpt-')) {
                    customOption.style.display = 'block';  // Always show
                } else {
                    customOption.style.display = this.checked ? 'block' : 'none';  // Show or hide based on checkbox
                }
            });
        });

        setupCustomDropdown(selectElement, true);
    }

    _setupAiNodeSliderListeners() {
        // Assuming 'this.content' is the main container of your node
        const sliders = this.content.querySelectorAll('input[type=range]');

        sliders.forEach(slider => {
            // Attach event listener to each slider
            slider.addEventListener('input',  () => {
                // Retrieve the associated label within the node
                const label = this.content.querySelector(`label[for='${slider.id}']`);
                if (label) {
                    // Extract the base label text (part before the colon)
                    const baseLabelText = label.innerText.split(':')[0];
                    label.innerText = `${baseLabelText}: ${slider.value}`;

                    setSliderBackground(slider);  // Assuming this is a predefined function
                }
                // Additional logic for each slider, if needed
            });

            // Trigger the input event to set initial state
            slider.dispatchEvent(new Event('input'));
        });

        this._setupContextSpecificSliderListeners();
    }

    _setupContextSpecificSliderListeners() {
        // Fetch default values from DOM elements and sliders
        const defaultTemperature = document.getElementById('model-temperature').value;
        const defaultMaxTokens = document.getElementById('max-tokens-slider').value;
        const defaultMaxContextSize = document.getElementById('max-context-size-slider').value;

        const temperatureSlider = this.content.querySelector('#node-temperature-' + this.index);
        const maxTokensSlider = this.content.querySelector('#node-max-tokens-' + this.index);
        const maxContextSizeSlider = this.content.querySelector('#node-max-context-' + this.index);

        // Set initial values and add event listeners
        if (temperatureSlider) {
            temperatureSlider.value = this.savedTemperature ?? defaultTemperature;
            temperatureSlider.dispatchEvent(new Event('input'));

            temperatureSlider.addEventListener('input', () => {
                this.savedTemperature = temperatureSlider.value;
            });
        }

        if (maxTokensSlider) {
            maxTokensSlider.value = this.savedMaxTokens ?? defaultMaxTokens;
            maxTokensSlider.dispatchEvent(new Event('input'));

            maxTokensSlider.addEventListener('input', () => {
                this.savedMaxTokens = maxTokensSlider.value;
            });
        }

        if (maxContextSizeSlider) {
            maxContextSizeSlider.value = this.savedMaxContextSize ?? defaultMaxContextSize;
            maxContextSizeSlider.dispatchEvent(new Event('input'));

            maxContextSizeSlider.addEventListener('input', () => {
                this.savedMaxContextSize = maxContextSizeSlider.value;
            });
        }


        // Event listener for maxContextSizeSlider
        if (maxContextSizeSlider) {
            maxContextSizeSlider.addEventListener('input', function () {
                const maxContextSizeLabel = this.content.querySelector(`label[for='node-max-context-${this.index}']`);
                if (maxContextSizeLabel) {
                    const maxContextValue = parseInt(this.value, 10);
                    const maxContextMax = parseInt(this.max, 10);
                    const ratio = Math.round((maxContextValue / maxContextMax) * 100);
                    maxContextSizeLabel.innerText = `Context: ${ratio}% (${maxContextValue} tokens)`;
                }
            });
        }

        // Handle synchronization if both sliders are present
        if (maxTokensSlider && maxContextSizeSlider) {
            autoContextTokenSync(maxTokensSlider, maxContextSizeSlider);
        }

        // Additional specific behaviors for other sliders can be added here
    }

    _setupAiNodeCheckBoxArrayListeners() {
        // Assuming each checkbox has a unique ID formatted as `${option.id}-checkbox-${llmNodeCount}`
        const checkboxes = this.content.querySelectorAll('.checkboxarray input[type="checkbox"]');

        checkboxes.forEach(checkbox => {
            // Check if savedCheckboxStates exists and then restore the saved state
            if (this.savedCheckboxStates && this.savedCheckboxStates.hasOwnProperty(checkbox.id)) {
                const savedState = this.savedCheckboxStates[checkbox.id];
                checkbox.checked = savedState;
            }

            // Attach event listener to save state on change
            checkbox.addEventListener('change', () => {
                if (!this.savedCheckboxStates) {
                    this.savedCheckboxStates = {};
                }
                this.savedCheckboxStates[checkbox.id] = checkbox.checked;
            });
        });
    }

    _setupAiNodeCustomInstructionsListeners() {
        // Fetch the custom instructions textarea
        const customInstructionsTextarea = this.content.querySelector(`#custom-instructions-textarea-${this.index}`);

        if (customInstructionsTextarea) {
            // Restore the saved value if it exists
            if (this.savedCustomInstructions !== undefined) {
                customInstructionsTextarea.value = this.savedCustomInstructions;
            }

            // Attach event listener to save value on input
            customInstructionsTextarea.addEventListener('input', () => {
                this.savedCustomInstructions = customInstructionsTextarea.value;
            });
        }
    }

    // save(){
    //     let node = super.save();
    //     let element = document.createElement("div")
    //     element.innerHTML = node.html;
    //     element.querySelectorAll('pre').forEach(pre => {
    //         pre.innerHTML = pre.innerHTML.replace(/\n/g, NEWLINE_PLACEHOLDER);
    //     });
    //     node.html = element.innerHTML;
    //     return node;
    // }

}

function createLLMNode(name = '', sx = undefined, sy = undefined, x = undefined, y = undefined) {
    return new LLMNode({
        name: name,
        sx: sx,
        sy: sy,
        x: x,
        y: y
    });
    // return new LLMNode(name, undefined, sx, sy, x, y);
}

class ImageNode extends WindowedNode {
    static DEFAULT_CONFIGURATION = {
        name: "",
        imageSrc: "",
        sx: undefined,
        sy: undefined,
        x: undefined,
        y: undefined,
        isUrl: false,
        saved: undefined,
        saveData: undefined,
    }
    static SAVE_PROPERTIES = ['imageUrl', 'imageBlob', 'isImageNode'];
    // constructor(name = '', content = undefined, imageSrc = '', sx = undefined, sy = undefined, x = undefined, y = undefined, isUrl = false){


    constructor(configuration = ImageNode.DEFAULT_CONFIGURATION){
        configuration = {...ImageNode.DEFAULT_CONFIGURATION, ...configuration}
        if (!configuration.saved) {// Create ImageNode
            if (configuration.isUrl) {
                super({ title: configuration.name, content: [ImageNode._getContentElement(configuration.imageSrc)], ...WindowedNode.getNaturalScaleParameters() });
            } else {
                if (!(configuration.imageSrc instanceof HTMLImageElement) || !configuration.imageSrc.src) {
                    console.error('createImageNode was called without a valid image element or src');
                    return null;
                }
                super({ title: configuration.name, content: [configuration.imageSrc], ...WindowedNode.getNaturalScaleParameters() });
            }
        } else {// Restore ImageNode
            configuration.imageSrc = configuration.saveData.json.imageUrl;
            super({title: configuration.name, content: [ImageNode._getContentElement(configuration.imageSrc)], scale: true, saved: true, saveData: configuration.saveData})
        }

        htmlnodes_parent.appendChild(this.content);
        registernode(this);
        this._initialize(configuration.name, configuration.imageSrc, configuration.isUrl, configuration.saved);
    }


    static _getContentElement(imageSrc){
        let img = document.createElement('img');
        img.src = imageSrc;
        return img;
    }



    get imageBlob() {
        return this._imageBlob;
    }

    set imageBlob(v) {
        if(v === null || !(v instanceof Blob)) return;
        const setProperty = () => {
            this._imageBlob = v;
            const imageSrc = this.innerContent.querySelector("img[src]");
            let reader = new FileReader();
            reader.onload = function (e) {
                // this.imageUrl = e.target.result;
                this.imageData = e.target.result;
                imageSrc.src = e.target.result;
            }
            reader.readAsDataURL(v);
            // this.imageUrl = URL.createObjectURL(v);
            //
            // imageSrc.src = this.imageUrl
            // convertImageToBase64(imageSrc, base64String => {
            //     this.imageData = base64String;
            //     this.imageUrl =  base64String;
            //     imageSrc.src = base64String;
            //
            //     console.log("Image converted to base64", base64String);
            // });
        }
        if(this.initialized){
            setProperty();
        } else {
            this.addAfterInitCallback(setProperty);
        }
    }

    setMainContentFile(filePath, fileName){
        this.files.push({ key: "imageBlob", path: filePath, name: fileName, autoLoad: false, autoSave: false})
    }

    _initialize(name, imageSrc, isUrl, saved){
        if(!saved){
            const setImageBlob = () => {
                fetch(this.innerContent.querySelector("img[src]").src)
                    .then(response => response.blob()
                        .then((blob) =>  this._imageBlob = blob));
            }
            if(isUrl){
                this.isImageNode = true;
                this.imageUrl = imageSrc;
                this._imageBlob = null;
                console.log("URL Found", this.imageUrl);
                // setImageBlob();
            }else{
                this.isImageNode = true;
                this.imageData = null; // Placeholder for base64 data
                this.imageUrl = null;
                // Determine whether the source is a blob URL or a Data URL (base64)
                if (imageSrc.src.startsWith('blob:')) {
                    // Convert blob URL to base64 because the OpenAI API cannot access blob URLs
                    convertImageToBase64(imageSrc.src, base64String => {
                        this.imageData = base64String;
                        console.log("Image converted to base64", base64String);
                        setImageBlob();
                    });
                } else {
                    // If it's not a blob, we can use the src directly (data URL or external URL)
                    // this.imageUrl = imageSrc.src;
                    this.imageData =  imageSrc.src;
                    console.log("Image URL or Data URL found", imageSrc.src);
                    setImageBlob();
                }
            }
        }
        this.afterInit();
    }

    afterInit() {
        super.afterInit();
    }


}

function createImageNode(imageSrc, title, isUrl = false) {
    return new ImageNode({
        name: title,
        imageSrc: imageSrc,
        isUrl: isUrl
    });
    // return new ImageNode(title, undefined, imageSrc, undefined,undefined,undefined,undefined, isUrl);
}

class AudioNode extends WindowedNode {
    static DEFAULT_CONFIGURATION = {
        name: "",
        audioUrl: "",
        blob: undefined,
        sx: undefined,
        sy: undefined,
        x: undefined,
        y: undefined,
        saved: undefined,
        saveData: undefined
    }
    static SAVE_PROPERTIES = ['audioUrl', 'audioBlob'];
    // constructor(name = '', content = undefined, imageSrc = '', sx = undefined, sy = undefined, x = undefined, y = undefined, isUrl = false){


    constructor(configuration = AudioNode.DEFAULT_CONFIGURATION){
        configuration = {...AudioNode.DEFAULT_CONFIGURATION, ...configuration}
        if (!configuration.saved) {// Create AudioNode
            super({ title: configuration.name, content: AudioNode._getContentElement(configuration.audioUrl, configuration.blob), ...WindowedNode.getNaturalScaleParameters() });
            this.followingMouse = 1;
        } else {// Restore AudioNode
            configuration.audioUrl = configuration.saveData.json.audioUrl;
            super({ title: configuration.name, content: AudioNode._getContentElement(configuration.audioUrl, configuration.blob), scale: true, saved: true, saveData: configuration.saveData })
        }


        htmlnodes_parent.appendChild(this.content);
        registernode(this);
        this._initialize(configuration.audioUrl, configuration.blob, configuration.saved);
    }

    get audioBlob() {
        return this._audioBlob;
    }

    set audioBlob(v) {
        if(v === null || !(v instanceof Blob)) return;
        if(this.initialized){
            this.audioUrl = URL.createObjectURL(v);
            this._audioBlob = v;
            this.innerContent.querySelector("audio[src]").src = this.audioUrl
        } else {
            this.addAfterInitCallback(() => {
                this.audioUrl = URL.createObjectURL(v);
                this._audioBlob = v;
                this.innerContent.querySelector("audio[src]").src = this.audioUrl
            })
        }
    }

    setMainContentFile(filePath, fileName){
        this.files.push({ key: "audioBlob", path: filePath, name: fileName, autoLoad: false, autoSave: false})
    }

    static _getContentElement(url, blob){
        if(!url) url = URL.createObjectURL(blob);
        const audio = new Audio();
        audio.setAttribute("controls", "");
        //let c = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        //c.setAttribute("viewBox","0 0 128 64");
        //let name = document.createElementNS("http://www.w3.org/2000/svg","text");
        //name.setAttribute("x","0");name.setAttribute("y","0");
        //name.appendChild(document.createTextNode(files[i].name));
        //c.appendChild(name);
        audio.style = "display: block";
        //div.appendChild(c);
        audio.src = url;
        return [ audio ];
    }


    _initialize(audioUrl, blob, saved){
        this.draw();
        if(!saved){
            if(audioUrl) {
                this.audioUrl = audioUrl;
                fetch(this.audioUrl).then(response =>
                    response.blob().then((extracted) =>
                        this._audioBlob = extracted));
            } else {
                this.audioUrl = this.innerContent.querySelector("audio[src]").src
                this._audioBlob = blob;
            }
        }

        this.mouseAnchor = toDZ(new vec2(0, -this.content.offsetHeight / 2 + 6));
        this.afterInit();
    }

    afterInit() {
        super.afterInit();
    }

}

function createAudioNode(name, blob=undefined, url=undefined){
    const configuration = {
        name: name,
    };
    if(blob) configuration.blob = blob
    if(url)  configuration.audioUrl = url;
    return new AudioNode(configuration)
}

class VideoNode extends WindowedNode {
    static DEFAULT_CONFIGURATION = {
        name: "",
        videoUrl: "",
        blob: undefined,
        sx: undefined,
        sy: undefined,
        x: undefined,
        y: undefined,
        saved: undefined,
        saveData: undefined,
    }
    static SAVE_PROPERTIES = ['videoUrl', 'videoBlob'];//, 'videoBlob'
    // constructor(name = '', content = undefined, imageSrc = '', sx = undefined, sy = undefined, x = undefined, y = undefined, isUrl = false){


    constructor(configuration = VideoNode.DEFAULT_CONFIGURATION){
        configuration = {...VideoNode.DEFAULT_CONFIGURATION, ...configuration}
        if (!configuration.saved) {// Create VideoNode
            super({ title: configuration.name, content: VideoNode._getContentElement(configuration.videoUrl, configuration.blob), ...WindowedNode.getNaturalScaleParameters() });
            this.followingMouse = 1;
        } else {// Restore VideoNode
            // configuration.videoUrl = configuration.saveData.json.videoUrl;
            super({ title: configuration.name, content: VideoNode._getContentElement(configuration.videoUrl, configuration.blob), scale: true, saved: true, saveData: configuration.saveData })
        }

        htmlnodes_parent.appendChild(this.content);
        registernode(this);
        this._initialize(configuration.videoUrl, configuration.blob, configuration.saved);
    }


    get videoBlob() {
        return this._videoBlob;
    }

    set videoBlob(v) {
        if(v === null || !(v instanceof Blob)) return;
        if(this.initialized){
            this.videoUrl = URL.createObjectURL(v);
            this._videoBlob = v;
            this.innerContent.querySelector("video[src]").src = this.videoUrl
            this.innerContent.querySelector("a[href]").href = this.videoUrl
        } else {
            this.addAfterInitCallback(() => {
                this.videoUrl = URL.createObjectURL(v);
                this._videoBlob = v;
                this.innerContent.querySelector("video[src]").src = this.videoUrl
                this.innerContent.querySelector("a[href]").href = this.videoUrl
            })
        }
    }

    setMainContentFile(filePath, fileName){
        this.files.push({ key: "videoBlob", path: filePath, name: fileName, autoLoad: false, autoSave: false})
    }

    static _getContentElement(url, blob){
        if(!url && blob) url = URL.createObjectURL(blob);
        if(!url) url = "";
        // Create a video element to play the blob
        const video = document.createElement('video');
        video.src = url;
        video.controls = true;
        video.style.width = '800px';  // Adjust as needed
        video.style.height = 'auto';  // This will maintain aspect ratio

        // Create a download link for the video
        const videoDownloadLink = document.createElement('a');
        videoDownloadLink.href = url;
        videoDownloadLink.download = "neuriderecord.webm";

        // Set fixed width and height for the button to create a square around the SVG
        videoDownloadLink.style.width = "40px";  // Width of the SVG + some padding
        videoDownloadLink.style.height = "40px";
        videoDownloadLink.style.display = "flex";  // Use flexbox to center the SVG
        videoDownloadLink.style.alignItems = "center";
        videoDownloadLink.style.justifyContent = "center";
        videoDownloadLink.style.borderRadius = "5px";  // Optional rounded corners
        videoDownloadLink.style.transition = "background-color 0.2s";  // Smooth transition for hover and active states
        videoDownloadLink.style.cursor = "pointer";  // Indicate it's clickable

        // Handle hover and active states using inline event listeners
        videoDownloadLink.onmouseover = function () {
            this.style.backgroundColor = "#e6e6e6";  // Lighter color on hover
        }
        videoDownloadLink.onmouseout = function () {
            this.style.backgroundColor = "";  // Reset on mouse out
        }
        videoDownloadLink.onmousedown = function () {
            this.style.backgroundColor = "#cccccc";  // Middle color on click (mousedown)
        }
        videoDownloadLink.onmouseup = function () {
            this.style.backgroundColor = "#e6e6e6";  // Back to hover color on mouse release
        }

        // Clone the SVG from the HTML
        const downloadSVG = document.querySelector('#download-icon').cloneNode(true);
        downloadSVG.style.display = "inline";  // Make the cloned SVG visible

        // Append the SVG to the download link and set link styles
        videoDownloadLink.appendChild(downloadSVG);
        videoDownloadLink.style.textDecoration = "none"; // to remove underline
        videoDownloadLink.style.color = "#000";  // Set color for SVG

        // Update the content array to include both the video and download link
        return [video, videoDownloadLink];
    }


    _initialize(videoUrl, blob, saved){
        this.draw();
        if(!saved){
            if(videoUrl) {
                this.videoUrl = videoUrl;
                fetch(this.videoUrl).then(response =>
                    response.blob().then((extracted) =>
                        this._videoBlob = extracted));
            } else {
                this.videoUrl = this.innerContent.querySelector("video[src]").src
                this._videoBlob = blob;
            }
        }
        this.mouseAnchor = toDZ(new vec2(0, -this.content.offsetHeight / 2 + 6));
        this.afterInit();
    }

    afterInit() {
        super.afterInit();
    }

}

function createVideoNode(name, blob=undefined, url=undefined){
    const configuration = {
        name: name,
    };
    if(blob) configuration.blob = blob
    if(url)  configuration.videoUrl = url;
    return new VideoNode(configuration)
}

class WolframNode extends WindowedNode {
    static DEFAULT_CONFIGURATION = {
        name: "",
        wolframData: "",
        sx: undefined,
        sy: undefined,
        x: undefined,
        y: undefined,
        saved: undefined,
        saveData: undefined
    }
    static SAVE_PROPERTIES = ['wolframData'];
    // constructor(name = '', content = undefined, imageSrc = '', sx = undefined, sy = undefined, x = undefined, y = undefined, isUrl = false){


    constructor(configuration = WolframNode.DEFAULT_CONFIGURATION){
        configuration = {...WolframNode.DEFAULT_CONFIGURATION, ...configuration}
        if (!configuration.saved) {// Create WolframNode
            if(!configuration.name) configuration.name = `${configuration.wolframData.reformulatedQuery} - Wolfram Alpha Result`;
            super({ title: configuration.name, content: WolframNode._getContentElement(configuration.wolframData), ...WindowedNode.getNaturalScaleParameters() });
            this.followingMouse = 1;
        } else {// Restore WolframNode
            configuration.wolframData = configuration.saveData.json.wolframData;
            super({ title: configuration.name, content: WolframNode._getContentElement(configuration.wolframData), scale: true, saved: true, saveData: configuration.saveData })
        }
        htmlnodes_parent.appendChild(this.content);
        registernode(this);
        this._initialize(configuration.wolframData, configuration.saved);
    }


    static _getContentElement(wolframData){
        const { pods, reformulatedQuery } = wolframData;
        const table = document.createElement("table");
        table.style = "width: 100%; border-collapse: collapse;";

        for (const pod of pods) {
            const row = document.createElement("tr");

            const titleCell = document.createElement("td");
            titleCell.textContent = pod.title;
            titleCell.style = "padding: 10px; background-color: #222226;";

            const imageCell = document.createElement("td");
            imageCell.style = "padding: 10px; text-align: center; background-color: white";

            for (let i = 0; i < pod.images.length; i++) {
                const imageUrl = pod.images[i];

                const img = document.createElement("img");
                img.alt = `${reformulatedQuery} - ${pod.title}`;
                img.style = "display: block; margin: auto; border: none;";
                img.src = imageUrl;

                imageCell.appendChild(img);
            }

            row.appendChild(titleCell);
            row.appendChild(imageCell);
            table.appendChild(row);
        }
        return [table];
    }


    _initialize(wolframData, saved){
        this.draw();
        if(!saved){
            this.wolframData = wolframData;
        }
        this.mouseAnchor = toDZ(new vec2(0, -this.content.offsetHeight / 2 + 6));
        this.afterInit();
    }

    afterInit() {
        super.afterInit();
    }

}

function createWolframNode(name, wolframData){
    return new WolframNode({ name, wolframData })
}


let workspaceExplorerNodeCount = 0;

class WorkspaceExplorerNode extends WindowedNode {
    static DEFAULT_CONFIGURATION = {
        name: "",
        sx: undefined,
        sy: undefined,
        x: undefined,
        y: undefined,
        saved: undefined,
        saveData: undefined
    }
    static SAVE_PROPERTIES = ['index', 'selectedFile'];
    // constructor(name = '', content = undefined, imageSrc = '', sx = undefined, sy = undefined, x = undefined, y = undefined, isUrl = false){


    constructor(configuration = WorkspaceExplorerNode.DEFAULT_CONFIGURATION){
        configuration = {...WorkspaceExplorerNode.DEFAULT_CONFIGURATION, ...configuration}
        if(!selectedWorkspacePath) throw new Error("Please load a workspace before creating a WorkspaceExplorerNode")
        if (!configuration.saved) {// Create WorkspaceExplorerNode
            configuration.index = workspaceExplorerNodeCount;
            super({ title: configuration.name, content: WorkspaceExplorerNode._getContentElement(selectedWorkspacePath, configuration.index), addFileButton:false, ...WindowedNode.getNaturalScaleParameters() });
            workspaceExplorerNodeCount++;
            this.followingMouse = 1;
        } else {// Restore WorkspaceExplorerNode
            configuration.index = configuration.saveData.json.index;
            super({ title: configuration.name, content: WorkspaceExplorerNode._getContentElement(selectedWorkspacePath, configuration.index), addFileButton:false, scale: true, saved: true, saveData: configuration.saveData })
        }

        htmlnodes_parent.appendChild(this.content);
        registernode(this);
        this._initialize(configuration.index, configuration.saved);
    }


    static _getContentElement(root, index){
        // Create the section container
        let sectionContainer = document.createElement('div')
        sectionContainer.className = 'header-content-footer';
        // Create a div element to show the root directory name
        const rootContainer = document.createElement('div');
        rootContainer.innerText = selectedWorkspacePath;
        rootContainer.className = "content-sticky-header"
        // Create a div element to host the filesystem tree
        const treeContainer = document.createElement('div');
        treeContainer.id = `workspaceExplorerContainer-${index}`;
        // Creates a div element for the footer
        const footerContainer = document.createElement('div');
        footerContainer.className = "content-sticky-footer"
        sectionContainer.append(rootContainer, treeContainer, footerContainer)
        return [sectionContainer];
    }

    _initialize(index, saved){
        this.anchorForce = 1;
        this.toggleWindowAnchored(true);
        // this.windowDiv.style.maxHeight =  "600px";

        this.draw();
        if(!saved){
            this.index = index;
            this.selectedFile = "";
        }
        this.setMinSize(420)
        // this.innerContent.style.minWidth = "400px"
        // this.innerContent.style.minHeight = "600px"
        // // this.windowDiv.style.height =  "600px";

        const footerContainer = this.innerContent.querySelector(".content-sticky-footer");

        let footerContainerLeftContainer = document.createElement("div");
        footerContainerLeftContainer.className = "footer-left-container";
        let footerContainerRightContainer = document.createElement("div");
        footerContainerRightContainer.className = "footer-right-container";

        let saveFileSelectionButton = document.createElement("button");
        saveFileSelectionButton.innerText = "→ SAVE";
        saveFileSelectionButton.className = "footer-button";
        saveFileSelectionButton.disabled = true;
        saveFileSelectionButton.onclick = this.onSaveFile.bind(this);
        let loadFileSelectionButton = document.createElement("button");
        loadFileSelectionButton.innerText = "LOAD →";
        loadFileSelectionButton.className = "footer-button";
        loadFileSelectionButton.disabled = true;
        loadFileSelectionButton.onclick = this.onLoadFile.bind(this);

        footerContainerLeftContainer.appendChild(saveFileSelectionButton);
        footerContainerRightContainer.appendChild(loadFileSelectionButton);
        footerContainer.appendChild(footerContainerLeftContainer);
        footerContainer.appendChild(footerContainerRightContainer);


        this.mouseAnchor = toDZ(new vec2(0, -this.content.offsetHeight / 2 + 6));
        const elementID = `workspaceExplorerContainer-${this.index}`
        let treeContainer = document.getElementById(elementID);
        WindowedNode.makeContentScrollable(treeContainer, true)
        treeContainer.style.height = "100%";
        this.innerContent.style.width = "100%";
        this.innerContent.style.height = "100%";

        createWorkspaceFSTree(elementID, function makeTreeScrollable(){
            for (let liElement of Object.values(this.liElementsById)) {
                WindowedNode.makeContentScrollable(liElement);
                let ulElement = liElement.querySelector("ul.treejs-nodes");
                if(ulElement) WindowedNode.makeContentScrollable(ulElement);
            }
        }).then((fileSystemTree) => {
            this.fileSystemTree = fileSystemTree;
            this.fileSystemTree.addEventListener("value", (selected, newSelection) => {
                console.log("Selected: ", selected, " newSelection: ", newSelection)
                if(selected.length === 0){
                    saveFileSelectionButton.disabled = true;
                    loadFileSelectionButton.disabled = true;
                    this.selectedFile = "";
                } else {
                    saveFileSelectionButton.disabled = false;
                    loadFileSelectionButton.disabled = false;
                    this.selectedFile = selected[0];
                }
            })
            this.afterInit();
        })
    }

    async readFileAndCreateTextNode(filePath, fileName){
        let file = await FileManagerAPI.loadBinary(filePath);
        createNodesFromFiles([file], (node) => {
            node.setMainContentFile(filePath, fileName);
            // node.files.push({ key: "text", path: filePath, binary: false, name: fileName, autoLoad: false, autoSave: false});
        })

        // let file = await FileManagerAPI.loadFile(filePath);
        // let textNode = createNodeFromWindow('', file.content, true)
        // textNode.files.push({ key: "text", path: filePath, binary: false, name: fileName, autoLoad: false, autoSave: false});
    }

    onLoadFile(){
        if(this.selectedFile !== ""){
            let fileName = this.fileSystemTree.nodesById[this.selectedFile].text
            this.readFileAndCreateTextNode(this.selectedFile, fileName).then(() => {});
        }
    }

    onSaveFile(){

    }

    afterInit() {
        super.afterInit();
    }

}


function createWorkspaceExplorerNode() {
    return new WorkspaceExplorerNode({ })
}


globalThis.nodeClasses = [TextNode, LinkNode, LLMNode, ImageNode, AudioNode, VideoNode, WolframNode, WorkspaceExplorerNode, WebEditorNode]

function restoreNode(saveData) {
    let classIndex = globalThis.nodeClasses.map((classObject) => classObject.name).indexOf(saveData.json.type);
    if(classIndex === -1){
        return new WindowedNode({title: saveData.title, scale: true, saved: true, saveData: saveData});
    }else{
        return new globalThis.nodeClasses[classIndex]({...globalThis.nodeClasses[classIndex].DEFAULT_CONFIGURATION, name: saveData.title, saved: true, saveData: saveData});
        // return new globalThis.nodeClasses[classIndex]({name: saveData.title, content: content, ...saveData});
    }
}
