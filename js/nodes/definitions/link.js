
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
    static INTERFACE_CONFIGURATION = {
        insertable: true,
        iconID: "link-icon-symbol",
        name: "Web Link Node",
        defaultFavourite: 4
    }


    constructor(configuration = LinkNode.DEFAULT_CONFIGURATION) {
        configuration = {...LinkNode.DEFAULT_CONFIGURATION, ...configuration}
        configuration.content = [];
        if (!configuration.saved) {// Create LinkNode
            super({...configuration, title: configuration.name, ...WindowedNode.getNaturalScaleParameters()});
        } else {// Restore LinkNode
            configuration.text = configuration.saveData.json.linkText;
            configuration.link = configuration.saveData.json.linkUrl;
            super({...configuration, title: configuration.name, scale: true});
        }
        let [contentWrapper, linkWrapper] = LinkNode._getContentElement(configuration.name, configuration.text, configuration.link);
        this.diagram.addNode(this);
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

    static ondrop(){
        let linkUrl = prompt("Enter a Link or Search Query", "");
        if (linkUrl) {
            processLinkInput(linkUrl);
        }
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
