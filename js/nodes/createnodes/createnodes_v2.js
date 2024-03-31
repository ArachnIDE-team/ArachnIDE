document.addEventListener('dblclick', function (e) {
    // Cancel the default behavior of the event
    cancel(e);

    if (nodeMode && e.altKey) {
        // Node mode (Shift) + Alt + double click behavior
        let node = createEditorNode();
        node.draw();
    } else if (e.altKey) {
        // Alt + double click behavior
        e.preventDefault();
        // Assuming that the createLLMNode function takes x, y coordinates
        let node = createLLMNode('', undefined, undefined, e.clientX, e.clientY);
        node.draw();
    } else if (nodeMode && !rootDiagram.prevNodeToConnect) {
        // Node mode (Shift) + double click behavior
        createNodeFromWindow();
    }
});

function getDefaultTitle() {
    const date = new Date();
    const year = String(date.getFullYear()).slice(-2); // Extracting last two digits of the year
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const day = String(date.getDate()).padStart(2, '0');
    const hour = String(date.getHours()).padStart(2, '0');
    const minute = String(date.getMinutes()).padStart(2, '0');
    const second = String(date.getSeconds()).padStart(2, '0');
    const milliseconds = String(date.getMilliseconds()).padStart(3, '0');
    const amPm = hour >= 12 ? 'PM' : 'AM';

    // Create a string in the format "YY-MM-DD HH:MM:SS.sss"
    const dateString = `${year}/${month}/${day} ${hour}:${minute}:${second}.${milliseconds}`;
    return dateString;
}

// Function to handle node creation from a window (double-click behavior)
function createNodeFromWindow(title = null, content = null, followMouse = false) {
    const defaultTitle = title || getDefaultTitle();
    nodefromWindow = true;
    // Set the followMouseFromWindow global flag if followMouse is true
    if (followMouse) {
        followMouseFromWindow = true;
    }
    addNodeTagToZettelkasten(defaultTitle, content);
    return rootDiagram.getNodeByTitle(defaultTitle);
}

function addNodeTagToZettelkasten(title, content = null) {
    const nodeTagLine = nodeTag + ' ' + title;
    let currentZettelkastenValue = noteInput.getValue();

    // Check if the content ends with a newline and add one or two newlines accordingly
    if (currentZettelkastenValue.endsWith('\n')) {
        currentZettelkastenValue += '\n' + nodeTagLine;
    } else {
        currentZettelkastenValue += '\n\n' + nodeTagLine;
    }

    // Add content if given
    if (content) {
        currentZettelkastenValue += '\n' + content;
    }

    // Set processAll to true
    processAll = true;

    noteInput.setValue(currentZettelkastenValue);
    noteInput.refresh();

    // Reset processAll to false
    processAll = false;
}