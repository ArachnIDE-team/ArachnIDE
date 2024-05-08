
//Drag and Drop

let isDraggingIcon = false;
let initialMousePosition = null;

function makeIconDraggable(iconDiv) {
    iconDiv.addEventListener('mousedown', function (event) {
        if (!iconDiv.classList.contains('edges-icon')) {
            iconDiv.dataset.draggable = 'true';  // Set to draggable immediately on mousedown
            rootDiagram.mouseDown = true;
        }
    });

    iconDiv.addEventListener('mousemove', function (event) {
        if (rootDiagram.mouseDown && !isDraggingIcon && !iconDiv.classList.contains('edges-icon')) {
            iconDiv.setAttribute('draggable', 'true');
            isDraggingIcon = true;
        }
    });

    iconDiv.addEventListener('mouseup', function () {
        iconDiv.setAttribute('draggable', 'false');
        isDraggingIcon = false;
        rootDiagram.mouseDown = false;
        initialMousePosition = null;
    });

    iconDiv.addEventListener('dragstart', function (event) {
        const rect = iconDiv.getBoundingClientRect();
        const offsetX = event.clientX - rect.left;
        const offsetY = event.clientY - rect.top;

        event.dataTransfer.setDragImage(iconDiv, offsetX, offsetY);

        const draggableData = {
            type: 'icon',
            iconName: iconDiv.classList[1]
        };
        event.dataTransfer.setData('text/plain', JSON.stringify(draggableData));
    });

    // When dragging ends, make sure the div is non-draggable
    iconDiv.addEventListener('dragend', function () {
        iconDiv.setAttribute('draggable', 'false');
        isDraggingIcon = false;
        rootDiagram.mouseDown = false;
    });
}

const icons = document.querySelectorAll('.panel-icon');
icons.forEach(icon => {
    makeIconDraggable(icon);
});

function makeEdgesIconNotDraggable(iconDiv) {
    iconDiv.addEventListener('dragstart', function (event) {
        event.preventDefault();
    });
}

const edgesIcons = document.querySelectorAll('.edges-icon');
edgesIcons.forEach(icon => {
    makeEdgesIconNotDraggable(icon);
});


function handleIconDrop(event, iconName) {

    console.log(`Dropped icon: ${iconName}`);
    let node;
    switch (iconName) {
        case 'note-icon':
            // Default plain text node
            node = createNodeFromWindow(null, ``, ``, true); // The last parameter sets followMouse to true
            console.log('Handle drop for the note icon');
            break;
        case 'ai-icon':
            node = createLLMNode('', undefined, undefined, undefined, undefined);
            node.followingMouse = 1;
            node.draw();
            node.mouseAnchor = node.diagram.background.toDZ(new vec2(0, -node.content.offsetHeight / 2 + 6));
            console.log('Handle drop for the ai icon');
            break;
        case 'link-icon':
            let linkUrl = prompt("Enter a Link or Search Query", "");

            if (linkUrl) {
                processLinkInput(linkUrl);
            }
            break;
        case 'code-icon':
            node = createEditorNode();
            node.followingMouse = 1;
            node.draw();
            node.mouseAnchor = node.diagram.background.toDZ(new vec2(0, -node.content.offsetHeight / 2 + 6));
            console.log('Handle drop for the code icon');
            break;
        case 'edges-icon':
            console.log('Handle drop for the edges icon');
            break;
        default:
            console.warn(`No handler defined for icon: ${iconName}`);
            break;
    }

    event.stopPropagation();
    event.preventDefault();
}

function uploadHandler(file, contentType){
    let ev = {
        dataTransfer: {
            items: [
                {
                    kind: 'file',
                    getAsFile: () => file,

                }
            ]
        }
    }
}

function getFileBaseType(file) {
    let baseType;
    if (file.type && (!file.type.toLowerCase().startsWith("application") || file.type.toLowerCase().startsWith("application/pdf"))) {
        return file.type.split("/")[0];
    } else if (file.name.toLowerCase().endsWith(".md")) {
        return "markdown";
    } else {
        return "text";
    }
}

// function getFileBaseType(file) {
//     let baseType;
//     if (file.type) {
//         return file.type.split("/")[0];
//     } else if (file.name.toLowerCase().endsWith(".txt")) {
//         return "text";
//     } else if (file.name.toLowerCase().endsWith(".md")) {
//         return "markdown";
//     } else {
//         console.log("Unhandled file type:", file);
//         return "unknown";
//     }
// }

function createPDFNodeFromFile(content, file) {
    let url = URL.createObjectURL(new Blob([content], {type: 'application/pdf'}));
    let node = createLinkNode(file.name, file.name, url); // Pass file name
    node.fileName = file.name; // Store file name in node
    htmlnodes_parent.appendChild(node.content);
    node.followingMouse = 1;
    node.draw();
    node.mouseAnchor = node.diagram.background.toDZ(new vec2(0, -node.content.offsetHeight / 2 + 6));
    return node;
}

function createMarkdownNodeFromFile(mdText, file) {
    let htmlContent = marked.parse(mdText, {mangle: false, headerIds: false});
    let node = createTextNode(file.name, '');

    let htmlContainer = document.createElement('div');
    htmlContainer.innerHTML = htmlContent;
    htmlContainer.style.maxWidth = '1000px';
    htmlContainer.style.overflow = 'auto';
    htmlContainer.style.height = '1400px';
    htmlContainer.style.backgroundColor = '#222226'; // Set background color

    // Check if there is a textarea being appended, if there is remove it.
    if (node.content.children[0].children[1].getElementsByTagName('textarea').length > 0) {
        node.content.children[0].children[1].removeChild(node.content.children[0].children[1].getElementsByTagName('textarea')[0]);
    }

    node.content.children[0].children[1].appendChild(htmlContainer);
    htmlnodes_parent.appendChild(node.content);
    return node;
}

function createTextNodeFromFile(text, file) {
    return createNodeFromWindow(null, file.name, text);  // Default plain text node
}

function createImageNodeFromFile(base64DataUrl, file, callback) {
    let imageElement = document.createElement('img');
    imageElement.src = base64DataUrl;

    // Once the image is loaded, create the node
    imageElement.onload = function () {
        let node = createImageNode(imageElement, file.name);
        // Append the node to the DOM here, as the image data is now ready
        htmlnodes_parent.appendChild(node.content);
        node.followingMouse = 1;
        node.draw();
        node.mouseAnchor = node.diagram.background.toDZ(new vec2(0, -node.content.offsetHeight / 2 + 6));
        callback(node)
    };
}

function createNodesFromFiles(files, callback=() => {}) {
    for (let i = 0; i < files.length; i++) {

        let reader = new FileReader();

        let baseType = getFileBaseType(files[i]);

        let url = URL.createObjectURL(files[i]);
        console.log("loading " + baseType);
        switch (baseType) {
            case "image":
                // We use a FileReader to read the dropped file and convert it to a Data URL (base64)
                reader = new FileReader();
                reader.onload = function (e) {
                    createImageNodeFromFile(e.target.result, files[i], callback);
                };
                reader.readAsDataURL(files[i]); // Read the file as a Data URL
                break;
            case "audio":
                callback(createAudioNode(files[i].name, undefined, url))
                break;
            case "video":
                callback(createVideoNode(files[i].name, undefined, url))
                break;
            case "text":
                reader = new FileReader();
                reader.onload = function (e) {
                    let text = e.target.result;
                    callback(createTextNodeFromFile(text, files[i]));
                }
                reader.readAsText(files[i]);
                break;
            case "markdown":
                let mdReader = new FileReader();
                mdReader.onload = function (e) {
                    callback(createMarkdownNodeFromFile(e.target.result, files[i]));
                }
                mdReader.readAsText(files[i]);
                break;
            case "application": // Handle PDF files
                if (files[i].type.endsWith("pdf")) {
                    reader = new FileReader();
                    reader.readAsArrayBuffer(files[i]);

                    reader.onload = function () {
                        callback(createPDFNodeFromFile(reader.result, files[i]));
                    };

                    reader.onerror = function (err) {
                        console.error('Error reading PDF file:', err);
                    };
                }
                break;
        }
    }
}

function dropHandler(ev) {
    ev.preventDefault();

    const data = ev.dataTransfer.getData('text');

    if (data && isJSON(data)) {
        const parsedData = JSON.parse(data);

        if (parsedData.type === 'icon') {
            // Handle the icon drop
            handleIconDrop(ev, parsedData.iconName);
            return;  // Exit the handler early
        }

        // Now only try destructuring if the data isn't an icon type
        let [title, content] = parsedData;
        // If this is one of the three specific types of divs, handle it here
        if (['AI Response', 'Prompt', 'Code Block'].includes(title)) {
            //console.log(`Dropped div "${title}": "${content}"`);

            if (title === 'Code Block') {
                // Split the content into lines
                let lines = content.split('\n');

                // Remove the second line (index 1 in a 0-indexed array)
                if (lines.length > 1) {
                    lines.splice(1, 1);
                }

                // Add the triple backticks at the start of the first line and at the end of the content
                // If the first line exists, add the backticks directly before it. If not, just start with backticks
                content = (lines[0] ? "```" + lines[0] : "```") + "\n" + lines.slice(1).join('\n') + "\n```";

                shouldAddCodeButton = true;
            }



            const defaultTitle = getDefaultTitle();
            const fullTitle = title + ' ' + defaultTitle;
            let node = createNodeFromWindow("markdown", fullTitle, content, true);

            // Stop the drop event from being handled further
            return;
        }
    }
    if(ev.dataTransfer.types.length > 0 && ev.dataTransfer.types[0] === "text/plain"){
        let node = createNodeFromWindow(null, null, data, true); // Default plain text node
        return
    }
    let files = [];
    if (ev.dataTransfer.items) {
        // Use DataTransferItemList interface to access the file(s)
        [...ev.dataTransfer.items].forEach((item, i) => {
            // If dropped items aren't files, reject them
            if (item.kind === 'file') {
                const file = item.getAsFile();
                files.push(file);
                console.log(`� file[${i}].name = ${file.name}`);
            }
        });
    } else {
        // Use DataTransfer interface to access the file(s)
        [...ev.dataTransfer.files].forEach((file, i) => {
            files.push(file)
            console.log(`� file[${i}].name = ${file.name}`);
        });
    }
    console.log(files);
    //https://stackoverflow.com/questions/3814231/loading-an-image-to-a-img-from-input-file
    if (FileReader && files && files.length) {
        createNodesFromFiles(files);
    } else {
        // fallback -- perhaps submit the input to an iframe and temporarily store
        // them on the server until the user's session ends.
        console.log("FileReader not supported or no files");
    }
}


function dragOverHandler(ev) {
    ev.preventDefault();
}


//Paste event listener...

addEventListener("paste", (event) => {
    console.log(event);
    let cd = (event.clipboardData || window.clipboardData);
    let pastedData = cd.getData("text");

    // Check if the pasted data is a URL or an iframe
    if (isUrl(pastedData)) {
        let node = createLinkNode(pastedData, pastedData, pastedData); // Use 'pastedData' instead of 'url'
        node.followingMouse = 1;
        node.draw();
        node.mouseAnchor = node.diagram.background.toDZ(new vec2(0, -node.content.offsetHeight / 2 + 6));
    } else if (isIframe(pastedData)) {
        let iframeUrl = getIframeUrl(pastedData);
        let node = createLinkNode(iframeUrl, iframeUrl, iframeUrl);
        node.followingMouse = 1;
        node.draw();
        node.mouseAnchor = node.diagram.background.toDZ(new vec2(0, -node.content.offsetHeight / 2 + 6));
    } else {
        let node = createNodeFromWindow(null, '', pastedData, true); // Default plain text node
        node.followingMouse = 1;
        node.draw();
        node.mouseAnchor = node.diagram.background.toDZ(new vec2(0, -node.content.offsetHeight / 2 + 6));
    }
});

addEventListener("paste", (event) => {
    let codeMirrorWrapper = window.myCodeMirror.getWrapperElement();
    if (codeMirrorWrapper.contains(event.target)) {
        //console.log('Paste detected in CodeMirror');

        // Use setTimeout to defer the execution until after the paste event
        setTimeout(() => {
            processAll = true;
            console.log('processAll set to true after paste in CodeMirror');

            // Simulate a minor change in content to trigger an input event
            const cursorPos = window.myCodeMirror.getCursor();
            window.myCodeMirror.replaceRange(' ', cursorPos); // Insert a temporary space
            window.myCodeMirror.replaceRange('', cursorPos, { line: cursorPos.line, ch: cursorPos.ch + 1 }); // Immediately remove it

            //console.log('Triggered input event in CodeMirror');

            // Additional logic as required
        }, 0);
        event.stopPropagation();
    } else {
        // Check for other textarea or input elements
        let targetTag = event.target.tagName.toLowerCase();
        if (targetTag === "textarea" || targetTag === "input") {
            event.stopPropagation();
            //console.log("Paste disabled for textarea and input");
        }
    }
}, true);